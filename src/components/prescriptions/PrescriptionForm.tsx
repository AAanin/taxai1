import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Minus, Save, X, Pill, Calendar, User, FileText } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '../ui/LoadingSpinner';

interface Medicine {
  id?: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

interface Prescription {
  id?: string;
  user_id: string;
  doctor_name: string;
  doctor_specialty?: string;
  hospital_name?: string;
  prescription_date: string;
  diagnosis?: string;
  notes?: string;
  medicines: Medicine[];
  follow_up_date?: string;
  created_at?: string;
  updated_at?: string;
}

interface PrescriptionFormProps {
  prescription?: Prescription | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PrescriptionForm: React.FC<PrescriptionFormProps> = ({ 
  prescription, 
  onSuccess, 
  onCancel 
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Prescription>({
    user_id: user?.id || '',
    doctor_name: '',
    doctor_specialty: '',
    hospital_name: '',
    prescription_date: new Date().toISOString().split('T')[0],
    diagnosis: '',
    notes: '',
    medicines: [{
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    }],
    follow_up_date: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (prescription) {
      setFormData({
        ...prescription,
        prescription_date: prescription.prescription_date.split('T')[0],
        follow_up_date: prescription.follow_up_date ? prescription.follow_up_date.split('T')[0] : ''
      });
    }
  }, [prescription]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.doctor_name.trim()) {
      newErrors.doctor_name = 'ডাক্তারের নাম প্রয়োজন';
    }

    if (!formData.prescription_date) {
      newErrors.prescription_date = 'প্রেসক্রিপশনের তারিখ প্রয়োজন';
    }

    if (formData.medicines.length === 0) {
      newErrors.medicines = 'কমপক্ষে একটি ওষুধ যোগ করুন';
    }

    formData.medicines.forEach((medicine, index) => {
      if (!medicine.name.trim()) {
        newErrors[`medicine_${index}_name`] = 'ওষুধের নাম প্রয়োজন';
      }
      if (!medicine.dosage.trim()) {
        newErrors[`medicine_${index}_dosage`] = 'ডোজ প্রয়োজন';
      }
      if (!medicine.frequency.trim()) {
        newErrors[`medicine_${index}_frequency`] = 'সেবনের নিয়ম প্রয়োজন';
      }
      if (!medicine.duration.trim()) {
        newErrors[`medicine_${index}_duration`] = 'সেবনের মেয়াদ প্রয়োজন';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof Prescription, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleMedicineChange = (index: number, field: keyof Medicine, value: string) => {
    const updatedMedicines = [...formData.medicines];
    updatedMedicines[index] = {
      ...updatedMedicines[index],
      [field]: value
    };
    
    setFormData(prev => ({
      ...prev,
      medicines: updatedMedicines
    }));
    
    // Clear error when user starts typing
    const errorKey = `medicine_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const addMedicine = () => {
    setFormData(prev => ({
      ...prev,
      medicines: [
        ...prev.medicines,
        {
          name: '',
          dosage: '',
          frequency: '',
          duration: '',
          instructions: ''
        }
      ]
    }));
  };

  const removeMedicine = (index: number) => {
    if (formData.medicines.length > 1) {
      const updatedMedicines = formData.medicines.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        medicines: updatedMedicines
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('দয়া করে সব প্রয়োজনীয় তথ্য পূরণ করুন');
      return;
    }

    setLoading(true);

    try {
      const url = prescription 
        ? `/api/prescriptions/${prescription.id}`
        : '/api/prescriptions';
      
      const method = prescription ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(
          prescription 
            ? 'প্রেসক্রিপশন সফলভাবে আপডেট হয়েছে'
            : 'প্রেসক্রিপশন সফলভাবে সংরক্ষিত হয়েছে'
        );
        onSuccess?.();
      } else {
        toast.error(result.message || 'প্রেসক্রিপশন সংরক্ষণে সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Error saving prescription:', error);
      toast.error('প্রেসক্রিপশন সংরক্ষণে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const frequencyOptions = [
    { value: 'once_daily', label: 'দিনে একবার' },
    { value: 'twice_daily', label: 'দিনে দুইবার' },
    { value: 'three_times_daily', label: 'দিনে তিনবার' },
    { value: 'four_times_daily', label: 'দিনে চারবার' },
    { value: 'every_6_hours', label: 'প্রতি ৬ ঘন্টায়' },
    { value: 'every_8_hours', label: 'প্রতি ৮ ঘন্টায়' },
    { value: 'every_12_hours', label: 'প্রতি ১২ ঘন্টায়' },
    { value: 'as_needed', label: 'প্রয়োজনে' },
    { value: 'before_meals', label: 'খাবারের আগে' },
    { value: 'after_meals', label: 'খাবারের পরে' },
    { value: 'with_meals', label: 'খাবারের সাথে' },
    { value: 'at_bedtime', label: 'ঘুমানোর আগে' }
  ];

  const durationOptions = [
    { value: '3_days', label: '৩ দিন' },
    { value: '5_days', label: '৫ দিন' },
    { value: '7_days', label: '৭ দিন' },
    { value: '10_days', label: '১০ দিন' },
    { value: '14_days', label: '১৪ দিন' },
    { value: '21_days', label: '২১ দিন' },
    { value: '1_month', label: '১ মাস' },
    { value: '2_months', label: '২ মাস' },
    { value: '3_months', label: '৩ মাস' },
    { value: '6_months', label: '৬ মাস' },
    { value: 'ongoing', label: 'চলমান' },
    { value: 'as_directed', label: 'ডাক্তারের পরামর্শ অনুযায়ী' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Doctor Information */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <User className="w-5 h-5 mr-2" />
          ডাক্তারের তথ্য
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ডাক্তারের নাম *
            </label>
            <input
              type="text"
              value={formData.doctor_name}
              onChange={(e) => handleInputChange('doctor_name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.doctor_name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="ডাক্তারের নাম লিখুন"
            />
            {errors.doctor_name && (
              <p className="text-red-500 text-sm mt-1">{errors.doctor_name}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              বিশেষত্ব
            </label>
            <input
              type="text"
              value={formData.doctor_specialty || ''}
              onChange={(e) => handleInputChange('doctor_specialty', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="যেমন: কার্ডিওলজিস্ট"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              হাসপাতাল/ক্লিনিক
            </label>
            <input
              type="text"
              value={formData.hospital_name || ''}
              onChange={(e) => handleInputChange('hospital_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="হাসপাতাল বা ক্লিনিকের নাম"
            />
          </div>
        </div>
      </div>

      {/* Prescription Information */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          প্রেসক্রিপশনের তথ্য
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              প্রেসক্রিপশনের তারিখ *
            </label>
            <input
              type="date"
              value={formData.prescription_date}
              onChange={(e) => handleInputChange('prescription_date', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.prescription_date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.prescription_date && (
              <p className="text-red-500 text-sm mt-1">{errors.prescription_date}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ফলো-আপের তারিখ
            </label>
            <input
              type="date"
              value={formData.follow_up_date || ''}
              onChange={(e) => handleInputChange('follow_up_date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              রোগ নির্ণয়
            </label>
            <input
              type="text"
              value={formData.diagnosis || ''}
              onChange={(e) => handleInputChange('diagnosis', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="রোগের নাম বা বর্ণনা"
            />
          </div>
        </div>
      </div>

      {/* Medicines */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Pill className="w-5 h-5 mr-2" />
            ওষুধের তালিকা *
          </h3>
          <button
            type="button"
            onClick={addMedicine}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" />
            ওষুধ যোগ করুন
          </button>
        </div>
        
        {errors.medicines && (
          <p className="text-red-500 text-sm mb-4">{errors.medicines}</p>
        )}
        
        <div className="space-y-4">
          {formData.medicines.map((medicine, index) => (
            <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">ওষুধ #{index + 1}</h4>
                {formData.medicines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMedicine(index)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ওষুধের নাম *
                  </label>
                  <input
                    type="text"
                    value={medicine.name}
                    onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors[`medicine_${index}_name`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="যেমন: প্যারাসিটামল"
                  />
                  {errors[`medicine_${index}_name`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`medicine_${index}_name`]}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ডোজ *
                  </label>
                  <input
                    type="text"
                    value={medicine.dosage}
                    onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors[`medicine_${index}_dosage`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="যেমন: ৫০০ মিগ্রা"
                  />
                  {errors[`medicine_${index}_dosage`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`medicine_${index}_dosage`]}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    সেবনের নিয়ম *
                  </label>
                  <select
                    value={medicine.frequency}
                    onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors[`medicine_${index}_frequency`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">সেবনের নিয়ম নির্বাচন করুন</option>
                    {frequencyOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors[`medicine_${index}_frequency`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`medicine_${index}_frequency`]}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    সেবনের মেয়াদ *
                  </label>
                  <select
                    value={medicine.duration}
                    onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors[`medicine_${index}_duration`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">সেবনের মেয়াদ নির্বাচন করুন</option>
                    {durationOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors[`medicine_${index}_duration`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`medicine_${index}_duration`]}</p>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    বিশেষ নির্দেশনা
                  </label>
                  <textarea
                    value={medicine.instructions || ''}
                    onChange={(e) => handleMedicineChange(index, 'instructions', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="যেমন: খাবারের সাথে নিন, পানি দিয়ে গিলুন"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
          <FileText className="w-4 h-4 mr-2" />
          অতিরিক্ত নোট
        </label>
        <textarea
          value={formData.notes || ''}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="অতিরিক্ত পরামর্শ বা নির্দেশনা..."
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            disabled={loading}
          >
            <X className="w-4 h-4 mr-2" />
            বাতিল
          </button>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <LoadingSpinner size="sm" className="mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {loading ? 'সংরক্ষণ হচ্ছে...' : (prescription ? 'আপডেট করুন' : 'সংরক্ষণ করুন')}
        </button>
      </div>
    </form>
  );
};

export default PrescriptionForm;