import React, { useState } from 'react';
import { Calendar, Clock, User, Phone, Mail, MapPin, CreditCard, CheckCircle, X, AlertCircle } from 'lucide-react';
import { Doctor, Appointment, Language } from '../types';

interface AppointmentBookingProps {
  doctor: Doctor;
  language: Language;
  onClose: () => void;
  onBookingComplete: (appointment: Appointment) => void;
}

const AppointmentBooking: React.FC<AppointmentBookingProps> = ({
  doctor,
  language,
  onClose,
  onBookingComplete
}) => {
  const [formData, setFormData] = useState({
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    appointmentDate: '',
    appointmentTime: '',
    consultationType: 'chamber' as 'chamber' | 'online',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30'
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.patientName.trim()) {
      newErrors.patientName = language === 'bn' ? 'রোগীর নাম প্রয়োজন' : 'Patient name is required';
    }

    if (!formData.patientPhone.trim()) {
      newErrors.patientPhone = language === 'bn' ? 'ফোন নম্বর প্রয়োজন' : 'Phone number is required';
    } else if (!/^[+]?[0-9]{10,15}$/.test(formData.patientPhone.replace(/[\s-]/g, ''))) {
      newErrors.patientPhone = language === 'bn' ? 'সঠিক ফোন নম্বর দিন' : 'Please enter a valid phone number';
    }

    if (formData.patientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.patientEmail)) {
      newErrors.patientEmail = language === 'bn' ? 'সঠিক ইমেইল ঠিকানা দিন' : 'Please enter a valid email address';
    }

    if (!formData.appointmentDate) {
      newErrors.appointmentDate = language === 'bn' ? 'তারিখ নির্বাচন করুন' : 'Please select a date';
    } else {
      const selectedDate = new Date(formData.appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.appointmentDate = language === 'bn' ? 'ভবিষ্যতের তারিখ নির্বাচন করুন' : 'Please select a future date';
      }
    }

    if (!formData.appointmentTime) {
      newErrors.appointmentTime = language === 'bn' ? 'সময় নির্বাচন করুন' : 'Please select a time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const appointment: Appointment = {
        id: Date.now().toString(),
        doctorId: doctor.id,
        patientName: formData.patientName,
        patientPhone: formData.patientPhone,
        patientEmail: formData.patientEmail,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        consultationType: formData.consultationType,
        status: 'pending',
        notes: formData.notes,
        createdAt: new Date()
      };

      onBookingComplete(appointment);
      setShowSuccess(true);
      
      // Auto close after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);

    } catch (error) {
      console.error('Booking failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {language === 'bn' ? 'অ্যাপয়েন্টমেন্ট সফল!' : 'Appointment Booked Successfully!'}
          </h3>
          <p className="text-gray-600 mb-4">
            {language === 'bn' 
              ? 'আপনার অ্যাপয়েন্টমেন্ট নিশ্চিত করা হয়েছে। ডাক্তার শীঘ্রই আপনার সাথে যোগাযোগ করবেন।'
              : 'Your appointment has been confirmed. The doctor will contact you soon.'
            }
          </p>
          <div className="bg-gray-50 rounded-lg p-4 text-left">
            <p><strong>{language === 'bn' ? 'ডাক্তার:' : 'Doctor:'}</strong> {language === 'bn' ? doctor.name : doctor.nameEn}</p>
            <p><strong>{language === 'bn' ? 'তারিখ:' : 'Date:'}</strong> {formData.appointmentDate}</p>
            <p><strong>{language === 'bn' ? 'সময়:' : 'Time:'}</strong> {formData.appointmentTime}</p>
            <p><strong>{language === 'bn' ? 'ধরন:' : 'Type:'}</strong> {formData.consultationType === 'chamber' ? (language === 'bn' ? 'চেম্বার' : 'Chamber') : (language === 'bn' ? 'অনলাইন' : 'Online')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            {language === 'bn' ? 'অ্যাপয়েন্টমেন্ট বুক করুন' : 'Book Appointment'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Doctor Info */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {language === 'bn' ? doctor.name : doctor.nameEn}
                </h3>
                <p className="text-blue-600">{language === 'bn' ? doctor.specialty : doctor.specialtyEn}</p>
                <p className="text-sm text-gray-600">{language === 'bn' ? doctor.hospital : doctor.hospitalEn}</p>
                <p className="text-lg font-semibold text-green-600 mt-1">
                  ৳{doctor.consultationFee} {language === 'bn' ? 'পরামর্শ ফি' : 'Consultation Fee'}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Information */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                {language === 'bn' ? 'রোগীর তথ্য' : 'Patient Information'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'bn' ? 'রোগীর নাম' : 'Patient Name'} *
                  </label>
                  <input
                    type="text"
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.patientName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.patientName}
                    onChange={(e) => handleInputChange('patientName', e.target.value)}
                    placeholder={language === 'bn' ? 'পূর্ণ নাম লিখুন' : 'Enter full name'}
                  />
                  {errors.patientName && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.patientName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'bn' ? 'ফোন নম্বর' : 'Phone Number'} *
                  </label>
                  <input
                    type="tel"
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.patientPhone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.patientPhone}
                    onChange={(e) => handleInputChange('patientPhone', e.target.value)}
                    placeholder={language === 'bn' ? '+880 1XXX-XXXXXX' : '+880 1XXX-XXXXXX'}
                  />
                  {errors.patientPhone && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.patientPhone}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address'} ({language === 'bn' ? 'ঐচ্ছিক' : 'Optional'})
                  </label>
                  <input
                    type="email"
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.patientEmail ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.patientEmail}
                    onChange={(e) => handleInputChange('patientEmail', e.target.value)}
                    placeholder={language === 'bn' ? 'example@email.com' : 'example@email.com'}
                  />
                  {errors.patientEmail && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.patientEmail}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Appointment Details */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                {language === 'bn' ? 'অ্যাপয়েন্টমেন্টের বিবরণ' : 'Appointment Details'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'bn' ? 'তারিখ' : 'Date'} *
                  </label>
                  <input
                    type="date"
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.appointmentDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.appointmentDate}
                    onChange={(e) => handleInputChange('appointmentDate', e.target.value)}
                    min={getMinDate()}
                  />
                  {errors.appointmentDate && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.appointmentDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'bn' ? 'সময়' : 'Time'} *
                  </label>
                  <select
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.appointmentTime ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.appointmentTime}
                    onChange={(e) => handleInputChange('appointmentTime', e.target.value)}
                  >
                    <option value="">{language === 'bn' ? 'সময় নির্বাচন করুন' : 'Select time'}</option>
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                  {errors.appointmentTime && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.appointmentTime}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Consultation Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {language === 'bn' ? 'পরামর্শের ধরন' : 'Consultation Type'}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  formData.consultationType === 'chamber' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}>
                  <input
                    type="radio"
                    name="consultationType"
                    value="chamber"
                    checked={formData.consultationType === 'chamber'}
                    onChange={(e) => handleInputChange('consultationType', e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">{language === 'bn' ? 'চেম্বারে পরামর্শ' : 'Chamber Consultation'}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {language === 'bn' ? doctor.chamberLocation || 'চেম্বার ঠিকানা' : doctor.chamberLocation || 'Chamber location'}
                    </p>
                  </div>
                </label>

                {doctor.onlineConsultation && (
                  <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.consultationType === 'online' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    <input
                      type="radio"
                      name="consultationType"
                      value="online"
                      checked={formData.consultationType === 'online'}
                      onChange={(e) => handleInputChange('consultationType', e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-5 h-5 text-green-600" />
                        <span className="font-medium">{language === 'bn' ? 'অনলাইন পরামর্শ' : 'Online Consultation'}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {language === 'bn' ? 'ভিডিও কল বা ফোন কলের মাধ্যমে' : 'Via video call or phone call'}
                      </p>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'bn' ? 'অতিরিক্ত তথ্য' : 'Additional Notes'} ({language === 'bn' ? 'ঐচ্ছিক' : 'Optional'})
              </label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder={language === 'bn' ? 'আপনার সমস্যা বা বিশেষ প্রয়োজন সম্পর্কে লিখুন...' : 'Describe your problem or special requirements...'}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {language === 'bn' ? 'বুক করা হচ্ছে...' : 'Booking...'}
                  </>
                ) : (
                  <>
                    <Calendar className="w-5 h-5" />
                    {language === 'bn' ? 'অ্যাপয়েন্টমেন্ট বুক করুন' : 'Book Appointment'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AppointmentBooking;