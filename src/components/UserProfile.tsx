import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Language } from '../types';
import { User, LogOut, Settings, ChevronDown, ChevronUp, Edit } from 'lucide-react';
import UserInfoForm from './UserInfoForm';

interface UserProfileProps {
  language: Language;
}

const UserProfile: React.FC<UserProfileProps> = ({ language }) => {
  const { user, logout, userInfo, saveUserInfo } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showUserInfoForm, setShowUserInfoForm] = useState(false);

  if (!user) {
    return null;
  }

  const texts = {
    bn: {
      profile: 'প্রোফাইল',
      settings: 'সেটিংস',
      logout: 'লগআউট',
      welcome: 'স্বাগতম',
      logoutConfirm: 'আপনি কি নিশ্চিত যে লগআউট করতে চান?',
      cancel: 'বাতিল',
      confirm: 'নিশ্চিত',
      personalInfo: 'ব্যক্তিগত তথ্য',
      editProfile: 'প্রোফাইল সম্পাদনা',
    },
    en: {
      profile: 'Profile',
      settings: 'Settings',
      logout: 'Logout',
      welcome: 'Welcome',
      logoutConfirm: 'Are you sure you want to logout?',
      cancel: 'Cancel',
      confirm: 'Confirm',
      personalInfo: 'Personal Information',
      editProfile: 'Edit Profile',
    },
  };

  const currentTexts = texts[language];

  const handleLogout = () => {
    if (window.confirm(currentTexts.logoutConfirm)) {
      logout();
      setIsDropdownOpen(false);
    }
  };

  const handleUserInfoSubmit = async (userInfo: any) => {
    try {
      await saveUserInfo(userInfo);
      setShowUserInfoForm(false);
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Failed to save user info:', error);
    }
  };

  const handleEditProfile = () => {
    setShowUserInfoForm(true);
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative">
      {/* User Profile Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center justify-center p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200">
          {user.picture ? (
            <img
              src={user.picture}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsDropdownOpen(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-20 overflow-hidden">
            {/* User Info Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <button
                onClick={handleEditProfile}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
              >
                <Edit className="w-4 h-4 text-gray-500" />
                {currentTexts.personalInfo}
              </button>
              
              <button
                onClick={() => setIsDropdownOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
              >
                <Settings className="w-4 h-4 text-gray-500" />
                {currentTexts.settings}
              </button>
              
              <hr className="my-2 border-gray-100" />
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
              >
                <LogOut className="w-4 h-4" />
                {currentTexts.logout}
              </button>
            </div>
          </div>
        </>
      )}
      
      {/* User Info Form Modal */}
      <UserInfoForm
        isOpen={showUserInfoForm}
        onClose={() => setShowUserInfoForm(false)}
        onSubmit={handleUserInfoSubmit}
        currentLanguage={language}
      />
    </div>
  );
};

export default UserProfile;