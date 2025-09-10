import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Clock, User, Building, Stethoscope, FileText, Save } from 'lucide-react';
import { toast } from 'sonner';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital_name?: string;
  consultation_fee?: number;
}

interface AppointmentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [formData, setFormData] = useState({
    doctorName: '',
    doctorSpecialty: '',
    hospitalName: '',
    appointmentDate: '',
    appointmentTime: '',
    appointmentType: 'consultation',
    symptoms: '',
    notes: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Load doctors data
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const response = await fetch('/api/doctors');
        if (response.ok) {
          const data = await response.json();
          setDoctors(data.data || []);
        }
      } catch (error) {
        console.error('Error loading doctors:', error);
      }
    };

    loadDoctors();
  }, []);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.doctorName.trim()) {
      newErrors.doctorName = 'ডাক্তারের নাম প্রয়োজন';
    }

    if (!formData.appointmentDate) {
      newErrors.appointmentDate = 'অ্যাপয়েন্টমেন্টের তারিখ প্রয়োজন';
    } else {
      const selectedDate = new Date(formData.appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.appointmentDate = 'অতীতের তারিখ নির্বাচন করা যাবে না';
      }
    }

    if (!formData.appointmentTime) {
      newErrors.appointmentTime = 'অ্যাপয়েন্টমেন্টের সময় প্রয়োজন';
    }

    if (!formData.appointmentType) {
      newErrors.appointmentType = 'অ্যাপয়েন্টমেন্টের ধরন নির্বাচন করুন';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!user) {
      toast.error('লগইন করুন');
      return;
    }

    setLoading(true);

    try {
      const appointmentData = {
        userId: user.id,
        doctorName: formData.doctorName,
        doctorSpecialty: formData.doctorSpecialty,
        hospitalName: formData.hospitalName,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        appointmentType: formData.appointmentType,
        symptoms: formData.symptoms,
        notes: formData.notes
      };

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('অ্যাপয়েন্টমেন্ট সফলভাবে বুক হয়েছে!');
        onSuccess?.();
      } else {
        toast.error(result.error || 'অ্যাপয়েন্টমেন্ট বুক করতে সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('অ্যাপয়েন্টমেন্ট বুক করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-fill doctor specialty and hospital when doctor is selected
    if (name === 'doctorName') {
      const selectedDoctor = doctors.find(doctor => doctor.name === value);
      if (selectedDoctor) {
        setFormData(prev => ({
          ...prev,
          doctorSpecialty: selectedDoctor.specialty,
          hospitalName: selectedDoctor.hospital_name || ''
        }));
      }
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const appointmentTypes = [
    { value: 'consultation', label: 'পরামর্শ' },
    { value: 'follow_up', label: 'ফলো-আপ' },
    { value: 'emergency', label: 'জরুরি' },
    { value: 'routine_checkup', label: 'নিয়মিত চেকআপ' }
  ];

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Calendar className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">অ্যাপয়েন্টমেন্ট বুক করুন</h2>
        <p className="text-gray-600">ডাক্তারের সাথে অ্যাপয়েন্টমেন্ট নিন</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Doctor Name */}
          <div>
            <label htmlFor="doctorName" className="block text-sm font-medium text-gray-700 mb-2">
              ডাক্তারের নাম *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="doctorName"
                name="doctorName"
                type="text"
                list="doctors"
                value={formData.doctorName}
                onChange={handleInputChange}
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.doctorName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="ডাক্তারের নাম লিখুন"
                disabled={loading}
              />
              <datalist id="doctors">
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.name}>
                    {doctor.name} - {doctor.specialty}
                  </option>
                ))}
              </datalist>
            </div>
            {errors.doctorName && (
              <p className="mt-1 text-sm text-red-600">{errors.doctorName}</p>
            )}
          </div>

          {/* Doctor Specialty */}
          <div>
            <label htmlFor="doctorSpecialty" className="block text-sm font-medium text-gray-700 mb-2">
              বিশেষত্ব
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Stethoscope className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="doctorSpecialty"
                name="doctorSpecialty"
                type="text"
                value={formData.doctorSpecialty}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="ডাক্তারের বিশেষত্ব"
                disabled={loading}
              />
            </div>
          </div>

          {/* Hospital Name */}
          <div>
            <label htmlFor="hospitalName" className="block text-sm font-medium text-gray-700 mb-2">
              হাসপাতাল/ক্লিনিক
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="hospitalName"
                name="hospitalName"
                type="text"
                value={formData.hospitalName}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="হাসপাতাল বা ক্লিনিকের নাম"
                disabled={loading}
              />
            </div>
          </div>

          {/* Appointment Type */}
          <div>
            <label htmlFor="appointmentType" className="block text-sm font-medium text-gray-700 mb-2">
              অ্যাপয়েন্টমেন্টের ধরন *
            </label>
            <select
              id="appointmentType"
              name="appointmentType"
              value={formData.appointmentType}
              onChange={handleInputChange}
              className={`block w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.appointmentType ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              disabled={loading}
            >
              <option value="">ধরন নির্বাচন করুন</option>
              {appointmentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.appointmentType && (
              <p className="mt-1 text-sm text-red-600">{errors.appointmentType}</p>
            )}
          </div>

          {/* Appointment Date */}
          <div>
            <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700 mb-2">
              তারিখ *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="appointmentDate"
                name="appointmentDate"
                type="date"
                value={formData.appointmentDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.appointmentDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={loading}
              />
            </div>
            {errors.appointmentDate && (
              <p className="mt-1 text-sm text-red-600">{errors.appointmentDate}</p>
            )}
          </div>

          {/* Appointment Time */}
          <div>
            <label htmlFor="appointmentTime" className="block text-sm font-medium text-gray-700 mb-2">
              সময় *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="appointmentTime"
                name="appointmentTime"
                type="time"
                value={formData.appointmentTime}
                onChange={handleInputChange}
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.appointmentTime ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={loading}
              />
            </div>
            {errors.appointmentTime && (
              <p className="mt-1 text-sm text-red-600">{errors.appointmentTime}</p>
            )}
          </div>
        </div>

        {/* Symptoms */}
        <div>
          <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-2">
            লক্ষণ বা সমস্যা
          </label>
          <textarea
            id="symptoms"
            name="symptoms"
            rows={3}
            value={formData.symptoms}
            onChange={handleInputChange}
            className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
            placeholder="আপনার লক্ষণ বা স্বাস্থ্য সমস্যা বর্ণনা করুন"
            disabled={loading}
          />
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            অতিরিক্ত নোট
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3 pointer-events-none">
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleInputChange}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
              placeholder="অতিরিক্ত তথ্য বা বিশেষ নির্দেশনা"
              disabled={loading}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                বুক করা হচ্ছে...
              </div>
            ) : (
              <div className="flex items-center">
                <Save className="w-4 h-4 mr-2" />
                অ্যাপয়েন্টমেন্ট বুক করুন
              </div>
            )}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              বাতিল
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;