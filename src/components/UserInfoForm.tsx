import React, { useState } from 'react';
import { X, Phone, MapPin, MessageCircle } from 'lucide-react';

interface UserInfoFormProps {
  language: 'en' | 'bn';
  user: any;
  userInfo: any;
  onSave: (userInfo: UserInfo) => void;
  onClose: () => void;
}

interface UserInfo {
  whatsappNumber: string;
  mobileNumber: string;
  address: string;
  emergencyContact: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  enableWhatsappNotifications: boolean;
  enableFirebaseNotifications: boolean;
}

const UserInfoForm: React.FC<UserInfoFormProps> = ({
  language,
  user,
  userInfo: existingUserInfo,
  onSave,
  onClose
}) => {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    whatsappNumber: '',
    mobileNumber: '',
    address: '',
    emergencyContact: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    enableWhatsappNotifications: true,
    enableFirebaseNotifications: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSave(userInfo);
      onClose();
    } catch (error) {
      console.error('Error submitting user info:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof UserInfo, value: string | boolean) => {
    setUserInfo(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">
            {language === 'bn' ? 'ব্যক্তিগত তথ্য' : 'Personal Information'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="text-sm text-gray-600 mb-4">
            {language === 'bn' 
              ? 'আপনার তথ্য সংরক্ষণ করুন যাতে আমরা আপনাকে গুরুত্বপূর্ণ স্বাস্থ্য সংক্রান্ত নোটিফিকেশন পাঠাতে পারি।'
              : 'Save your information so we can send you important health-related notifications.'}
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              {language === 'bn' ? 'যোগাযোগের তথ্য' : 'Contact Information'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MessageCircle className="w-4 h-4 inline mr-1" />
                  {language === 'bn' ? 'হোয়াটসঅ্যাপ নম্বর' : 'WhatsApp Number'}
                </label>
                <input
                  type="tel"
                  value={userInfo.whatsappNumber}
                  onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                  placeholder={language === 'bn' ? '+৮৮০১৭xxxxxxxx' : '+8801xxxxxxxxx'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  {language === 'bn' ? 'মোবাইল নম্বর' : 'Mobile Number'}
                </label>
                <input
                  type="tel"
                  value={userInfo.mobileNumber}
                  onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                  placeholder={language === 'bn' ? '+৮৮০১৭xxxxxxxx' : '+8801xxxxxxxxx'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                {language === 'bn' ? 'ঠিকানা' : 'Address'}
              </label>
              <textarea
                value={userInfo.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder={language === 'bn' ? 'আপনার সম্পূর্ণ ঠিকানা লিখুন' : 'Enter your complete address'}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'bn' ? 'জরুরি যোগাযোগ' : 'Emergency Contact'}
              </label>
              <input
                type="tel"
                value={userInfo.emergencyContact}
                onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                placeholder={language === 'bn' ? 'জরুরি অবস্থায় যোগাযোগের নম্বর' : 'Emergency contact number'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">
              {language === 'bn' ? 'ব্যক্তিগত তথ্য' : 'Personal Details'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'bn' ? 'জন্ম তারিখ' : 'Date of Birth'}
                </label>
                <input
                  type="date"
                  value={userInfo.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'bn' ? 'লিঙ্গ' : 'Gender'}
                </label>
                <select
                  value={userInfo.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{language === 'bn' ? 'নির্বাচন করুন' : 'Select'}</option>
                  <option value="male">{language === 'bn' ? 'পুরুষ' : 'Male'}</option>
                  <option value="female">{language === 'bn' ? 'মহিলা' : 'Female'}</option>
                  <option value="other">{language === 'bn' ? 'অন্যান্য' : 'Other'}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'bn' ? 'রক্তের গ্রুপ' : 'Blood Group'}
                </label>
                <select
                  value={userInfo.bloodGroup}
                  onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{language === 'bn' ? 'নির্বাচন করুন' : 'Select'}</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">
              {language === 'bn' ? 'নোটিফিকেশন সেটিংস' : 'Notification Settings'}
            </h3>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={userInfo.enableWhatsappNotifications}
                  onChange={(e) => handleInputChange('enableWhatsappNotifications', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  {language === 'bn' 
                    ? 'হোয়াটসঅ্যাপে নোটিফিকেশন পেতে চাই' 
                    : 'Enable WhatsApp notifications'}
                </span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={userInfo.enableFirebaseNotifications}
                  onChange={(e) => handleInputChange('enableFirebaseNotifications', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  {language === 'bn' 
                    ? 'অ্যাপে নোটিফিকেশন পেতে চাই' 
                    : 'Enable app notifications'}
                </span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !userInfo.mobileNumber || !userInfo.address}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting 
                ? (language === 'bn' ? 'সংরক্ষণ করা হচ্ছে...' : 'Saving...') 
                : (language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Information')}
            </button>
          </div>
        </form>
    </div>
  );
};

export default UserInfoForm;
export type { UserInfo };