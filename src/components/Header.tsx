// Modern Header Component - Clean navigation with medical context
// Responsive design with mobile menu support and feature navigation

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, User, MessageCircle, Phone, Menu, Heart, ChevronDown, Search, Upload, History,
  Calendar, Stethoscope, Pill, FileText, Users, X, Bot, Activity, Shield, Clock,
  Zap, Brain, Camera, Smartphone, HeartHandshake, AlertTriangle
} from 'lucide-react';
import Lottie from 'lottie-react';
import heartAnimationData from '../w3MXReroGH.json';
import SearchInterface from './SearchInterface';
import NotificationsPanel from './NotificationsPanel';
import MedicalHistory from './MedicalHistory';
import AudioCallInterface from './AudioCallInterface';
import RealTimeNotificationSystem from './RealTimeNotificationSystem';
import LiveChatSystem from './LiveChatSystem';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  user?: {
    name: string;
    avatar?: string;
  };
  isLoggedIn?: boolean;
  onMenuClick?: () => void;
  onUserClick?: () => void;
  onLoginClick?: () => void;
  onFeatureClick?: (feature: string) => void;
  onChatClick?: () => void;
  onCallClick?: () => void;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
  className?: string;
  actions?: React.ReactNode;
  showMobileMenu?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title = 'Dr. Mimu',
  subtitle = 'আপনার স্বাস্থ্য সহায়ক',
  user,
  isLoggedIn = false,
  onMenuClick,
  onUserClick,
  onLoginClick,
  onFeatureClick,
  onChatClick,
  onCallClick,
  onNotificationClick,
  onProfileClick,
  className,
  actions,
  showMobileMenu = true,
}) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const [isMedicalHistoryOpen, setIsMedicalHistoryOpen] = useState(false);
  const [isAudioCallOpen, setIsAudioCallOpen] = useState(false);
  const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.services-dropdown')) {
        setIsServicesDropdownOpen(false);
      }
    };

    if (isServicesDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isServicesDropdownOpen]);

  const handleFeatureClick = (featureId: string) => {
    if (onFeatureClick) {
      onFeatureClick(featureId);
    }
    setIsMobileMenuOpen(false);
  };

  const handleLoginClick = () => {
    if (onLoginClick) {
      onLoginClick();
    }
  };

  return (
    <>
      <div className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm ${className || ''}`}>
        <div className="px-2 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto gap-1 sm:gap-2 lg:gap-4">
            {/* Left Section - Logo and Menu */}
            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3 min-w-0 flex-shrink-0">
              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-300 transform hover:scale-105 touch-target"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Logo Section */}
              <div 
                onClick={() => navigate('/')}
                className="flex items-center cursor-pointer"
              >
                <img 
                  src="/src/assets/logo.svg" 
                  alt="Dr. Mimu Logo" 
                  className="h-8 sm:h-10 lg:h-12 w-auto transform hover:scale-105 transition-all duration-300"
                />
              </div>
            </div>

            {/* Center Section - Navigation Menu (Desktop) */}
            <div className="hidden lg:flex items-center space-x-1">
              <div className="relative services-dropdown">
                <button 
                  onClick={() => setIsServicesDropdownOpen(!isServicesDropdownOpen)}
                  className="flex items-center space-x-1 px-4 py-2 text-neutral-700 hover:text-brand-blue hover:bg-neutral-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2"
                  aria-expanded={isServicesDropdownOpen}
                  aria-haspopup="true"
                  aria-label="সেবাসমূহ মেনু"
                >
                  <span className="font-medium">সেবাসমূহ</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isServicesDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Enhanced Services Dropdown */}
                {isServicesDropdownOpen && (
                  <div 
                    className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 animate-in slide-in-from-top-2 duration-200"
                    role="menu"
                    aria-label="সেবাসমূহ মেনু"
                  >
                    <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-secondary-50">
                      <h3 className="font-bold text-gray-900 text-lg">আমাদের সেবাসমূহ</h3>
                      <p className="text-sm text-gray-600 mt-1">সম্পূর্ণ স্বাস্থ্যসেবা সমাধান</p>
                    </div>
                    
                    {/* চিকিৎসা সেবা */}
                    <div className="py-2">
                      <div className="px-4 py-2">
                        <h4 className="text-sm font-semibold text-brand-blue uppercase tracking-wide">চিকিৎসা সেবা</h4>
                      </div>
                      <button 
                        onClick={() => {
                          handleFeatureClick('appointment');
                          setIsServicesDropdownOpen(false);
                        }}
                        className="w-full flex items-center px-4 py-3 text-left hover:bg-primary-50 transition-all duration-200 group focus:outline-none focus:bg-primary-50 focus:ring-2 focus:ring-brand-blue focus:ring-inset"
                        role="menuitem"
                        aria-label="অ্যাপয়েন্টমেন্ট বুকিং - বিশেষজ্ঞ ডাক্তারের সাথে সাক্ষাৎ"
                      >
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-primary-200 transition-colors">
                          <Calendar className="w-5 h-5 text-brand-blue" aria-hidden="true" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 group-hover:text-brand-blue">অ্যাপয়েন্টমেন্ট বুকিং</div>
                          <div className="text-sm text-gray-500">বিশেষজ্ঞ ডাক্তারের সাথে সাক্ষাৎ</div>
                        </div>
                      </button>
                      <button 
                        onClick={() => {
                          handleFeatureClick('telemedicine');
                          setIsServicesDropdownOpen(false);
                        }}
                        className="w-full flex items-center px-4 py-3 text-left hover:bg-accent-50 transition-all duration-200 group"
                      >
                        <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-accent-200 transition-colors">
                          <Stethoscope className="w-5 h-5 text-brand-teal" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 group-hover:text-brand-teal">টেলিমেডিসিন</div>
                          <div className="text-sm text-gray-500">অনলাইন ভিডিও পরামর্শ</div>
                        </div>
                      </button>
                      <button 
                        onClick={() => {
                          handleFeatureClick('emergency');
                          setIsServicesDropdownOpen(false);
                        }}
                        className="w-full flex items-center px-4 py-3 text-left hover:bg-medical-50 transition-all duration-200 group"
                      >
                        <div className="w-10 h-10 bg-medical-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-medical-200 transition-colors">
                          <AlertTriangle className="w-5 h-5 text-brand-coral" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 group-hover:text-brand-coral">জরুরি সেবা</div>
                          <div className="text-sm text-gray-500">২৪/৭ জরুরি চিকিৎসা সহায়তা</div>
                        </div>
                      </button>
                    </div>
                    
                    {/* স্বাস্থ্য তথ্য ও ব্যবস্থাপনা */}
                    <div className="py-2 border-t border-gray-100">
                      <div className="px-4 py-2">
                        <h4 className="text-sm font-semibold text-brand-navy uppercase tracking-wide">স্বাস্থ্য তথ্য ও ব্যবস্থাপনা</h4>
                      </div>
                      <button 
                        onClick={() => {
                          handleFeatureClick('medicine-order');
                          setIsServicesDropdownOpen(false);
                        }}
                        className="w-full flex items-center px-4 py-3 text-left hover:bg-secondary-50 transition-all duration-200 group"
                      >
                        <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-secondary-200 transition-colors">
                          <Pill className="w-5 h-5 text-brand-orange" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 group-hover:text-brand-orange">ওষুধ অর্ডার</div>
                          <div className="text-sm text-gray-500">ঘরে বসে ওষুধ ডেলিভারি</div>
                        </div>
                      </button>
                      <button 
                        onClick={() => {
                          handleFeatureClick('health-records');
                          setIsServicesDropdownOpen(false);
                        }}
                        className="w-full flex items-center px-4 py-3 text-left hover:bg-secondary-50 transition-all duration-200 group"
                      >
                        <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-secondary-200 transition-colors">
                          <FileText className="w-5 h-5 text-brand-orange" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 group-hover:text-brand-orange">স্বাস্থ্য রেকর্ড</div>
                          <div className="text-sm text-gray-500">ডিজিটাল মেডিকেল ইতিহাস</div>
                        </div>
                      </button>
                      <button 
                        onClick={() => {
                          handleFeatureClick('find-doctors');
                          setIsServicesDropdownOpen(false);
                        }}
                        className="w-full flex items-center px-4 py-3 text-left hover:bg-primary-50 transition-all duration-200 group"
                      >
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-primary-200 transition-colors">
                          <Users className="w-5 h-5 text-brand-blue" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 group-hover:text-brand-blue">ডাক্তার খুঁজুন</div>
                          <div className="text-sm text-gray-500">বিশেষজ্ঞ ডাক্তার ডিরেক্টরি</div>
                        </div>
                      </button>
                    </div>
                    
                    {/* AI চালিত সেবা */}
                    <div className="py-2 border-t border-gray-100">
                      <div className="px-4 py-2">
                        <h4 className="text-sm font-semibold text-brand-teal uppercase tracking-wide">AI চালিত সেবা</h4>
                      </div>
                      <button 
                        onClick={() => {
                          navigate('/chat');
                          setIsServicesDropdownOpen(false);
                        }}
                        className="w-full flex items-center px-4 py-3 text-left hover:bg-accent-50 transition-all duration-200 group"
                      >
                        <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-accent-200 transition-colors">
                          <Bot className="w-5 h-5 text-brand-teal" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 group-hover:text-brand-teal">AI চ্যাট সহায়ক</div>
                          <div className="text-sm text-gray-500">স্মার্ট স্বাস্থ্য পরামর্শ</div>
                        </div>
                      </button>
                      <button 
                        onClick={() => {
                          handleFeatureClick('prescription-processor');
                          setIsServicesDropdownOpen(false);
                        }}
                        className="w-full flex items-center px-4 py-3 text-left hover:bg-accent-50 transition-all duration-200 group"
                      >
                        <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-accent-200 transition-colors">
                          <Camera className="w-5 h-5 text-brand-teal" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 group-hover:text-brand-teal">প্রেসক্রিপশন প্রসেসর</div>
                          <div className="text-sm text-gray-500">ছবি থেকে ওষুধের তথ্য</div>
                        </div>
                      </button>
                      <button 
                        onClick={() => {
                          handleFeatureClick('health-analysis');
                          setIsServicesDropdownOpen(false);
                        }}
                        className="w-full flex items-center px-4 py-3 text-left hover:bg-accent-50 transition-all duration-200 group"
                      >
                        <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-accent-200 transition-colors">
                          <Activity className="w-5 h-5 text-brand-teal" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 group-hover:text-brand-teal">স্বাস্থ্য বিশ্লেষণ</div>
                          <div className="text-sm text-gray-500">AI ভিত্তিক রোগ নির্ণয়</div>
                        </div>
                      </button>
                    </div>
                    
                    {/* Quick Access Footer */}
                    <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">সব সেবা দেখুন</span>
                        <button 
                          onClick={() => {
                            handleFeatureClick('all-services');
                            setIsServicesDropdownOpen(false);
                          }}
                          className="text-xs text-brand-blue hover:text-brand-navy font-medium"
                        >
                          আরও →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Quick Action Buttons */}
              <div className="flex items-center space-x-2 ml-4">
                {/* Enhanced Chat Button - Quick Action */}
                <button
                  onClick={() => {
                    setIsLiveChatOpen(true);
                  }}
                  className="relative hidden lg:flex w-10 h-10 bg-gradient-to-r from-brand-blue to-brand-navy hover:from-primary-700 hover:to-primary-800 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 items-center justify-center focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 group"
                  title="Live Chat - Instant medical consultation"
                  aria-label="লাইভ চ্যাট - তাৎক্ষণিক চিকিৎসা পরামর্শ"
                >
                  <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" aria-hidden="true" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                </button>

                {/* Enhanced Emergency Call Button - Quick Action */}
                <button
                  onClick={() => {
                    if (onCallClick) {
                      onCallClick();
                    } else {
                      setIsAudioCallOpen(true);
                    }
                  }}
                  className="relative w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-brand-teal to-accent-600 hover:from-accent-700 hover:to-accent-700 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-brand-teal focus:ring-offset-2 group"
                  title="Emergency Call - 24/7 Medical Support"
                  aria-label="জরুরি কল - ২৪/৭ চিকিৎসা সহায়তা"
                >
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" aria-hidden="true" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand-coral rounded-full"></span>
                </button>

                {/* Real-time Notification System */}
                <RealTimeNotificationSystem />

                {/* Login Button */}
                <button
                  onClick={handleLoginClick}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-brand-navy to-primary-900 hover:from-primary-800 hover:to-primary-900 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 flex items-center justify-center text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-navy focus:ring-offset-2"
                  title="লগইন"
                  aria-label="লগইন করুন"
                >
                  লগইন
                </button>
              </div>
            </div>

            {/* Center Section - Mobile Title */}
            <div className="flex lg:hidden flex-1 justify-center min-w-0">
              {/* Title removed as requested */}
            </div>

            {/* Right Section - User Actions */}
            <div className="flex items-center space-x-0.5 sm:space-x-1 lg:space-x-2 flex-shrink-0">

              {/* Prescription and History Buttons - Desktop Only */}
              <div className="hidden lg:flex items-center space-x-2">
                {/* Prescription Button */}
                <button
                  onClick={() => handleFeatureClick('prescription-upload')}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200 text-green-600 hover:text-emerald-600 shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center border border-green-200 hover:border-emerald-300"
                  title="প্রেসক্রিপশন"
                  aria-label="প্রেসক্রিপশন আপলোড"
                >
                  <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>

                {/* History Button */}
                <button
                  onClick={() => setIsMedicalHistoryOpen(true)}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 hover:from-purple-200 hover:to-indigo-200 text-purple-600 hover:text-indigo-600 shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center border border-purple-200 hover:border-indigo-300"
                  title="ইতিহাস"
                  aria-label="মেডিকেল ইতিহাস"
                >
                  <History className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>

              {/* Enhanced Search Button - Mobile optimized */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="relative w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 hover:from-blue-200 hover:to-purple-200 text-blue-600 hover:text-purple-600 shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center border border-blue-200 hover:border-purple-300 touch-target focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 group"
                  title="Search medicines, doctors, hospitals"
                  aria-label="সার্চ করুন - ওষুধ, ডাক্তার, হাসপাতাল"
                >
                  <Search className="w-3 h-3 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" aria-hidden="true" />
                  {isSearchOpen && (
                    <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></span>
                  )}
                </button>
              </div>

              {/* Quick Action Buttons (Mobile) - Optimized */}
              <div className="lg:hidden flex items-center space-x-0.5 sm:space-x-1 ml-1 sm:ml-2 flex-shrink-0">
                {/* Chat Button - Hidden on mobile */}
                <button
                  onClick={() => {
                    navigate('/chat');
                  }}
                  className="hidden w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 flex items-center justify-center"
                  title="চ্যাট"
                >
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {/* Call Button */}
                <button
                  onClick={() => {
                    if (onCallClick) {
                      onCallClick();
                    } else {
                      setIsAudioCallOpen(true);
                    }
                  }}
                  className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 flex items-center justify-center touch-target"
                  title="কল"
                >
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {/* Notification Button with Panel */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsNotificationsOpen(!isNotificationsOpen);
                      if (onNotificationClick) {
                        onNotificationClick();
                      }
                    }}
                    className="relative w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 flex items-center justify-center touch-target"
                    title="বিজ্ঞপ্তি"
                  >
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full border border-white animate-pulse"></span>
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-md">
                      99+
                    </span>
                  </button>
                  
                  {/* Notifications Panel - Positioned directly under the button */}
                  <NotificationsPanel
                    isOpen={isNotificationsOpen}
                    onClose={() => setIsNotificationsOpen(false)}
                  />
                </div>

                {/* Login Button */}
                <button
                  onClick={handleLoginClick}
                  className="px-2 py-1.5 sm:px-3 sm:py-2 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 flex items-center justify-center text-xs sm:text-sm font-medium touch-target"
                  title="লগইন"
                >
                  লগইন
                </button>
              </div>




            </div>
          </div>
        </div>
      </div>



      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white/98 backdrop-blur-md border-t border-gray-200/50 shadow-2xl relative z-40">
          <div className="px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 max-h-[85vh] overflow-y-auto scrollbar-thin">
            {/* Enhanced Mobile Quick Actions */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 sm:p-4 border border-blue-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 text-center flex items-center justify-center">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-yellow-500" />
                দ্রুত অ্যাক্সেস
                <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">জনপ্রিয়</span>
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {/* AI Chat Button */}
                <button
                  onClick={() => {
                    navigate('/chat');
                    setIsMobileMenuOpen(false);
                  }}
                  className="relative flex flex-col items-center justify-center p-3 sm:p-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 touch-target min-h-[70px] sm:min-h-[80px] group"
                >
                  <div className="relative">
                    <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2 group-hover:scale-110 transition-transform" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  </div>
                  <span className="text-xs sm:text-sm font-medium">AI চ্যাট</span>
                  <span className="text-xs text-blue-100 mt-1">তাৎক্ষণিক পরামর্শ</span>
                </button>
                
                {/* Prescription Upload */}
                <button
                  onClick={() => {
                    handleFeatureClick('prescription-upload');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex flex-col items-center justify-center p-3 sm:p-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 touch-target min-h-[70px] sm:min-h-[80px] group"
                >
                  <Upload className="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs sm:text-sm font-medium">প্রেসক্রিপশন</span>
                  <span className="text-xs text-green-100 mt-1">AI প্রসেসর</span>
                </button>
                
                {/* Chat History */}
                <button
                  onClick={() => {
                    setIsMedicalHistoryOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex flex-col items-center justify-center p-3 sm:p-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 touch-target min-h-[70px] sm:min-h-[80px] group"
                >
                  <History className="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs sm:text-sm font-medium">ইতিহাস</span>
                  <span className="text-xs text-purple-100 mt-1">মেডিকেল রেকর্ড</span>
                </button>
                
                {/* Emergency Call Button */}
                <button
                  onClick={() => {
                    if (onCallClick) {
                      onCallClick();
                    } else {
                      setIsAudioCallOpen(true);
                    }
                    setIsMobileMenuOpen(false);
                  }}
                  className="relative flex flex-col items-center justify-center p-3 sm:p-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 touch-target min-h-[70px] sm:min-h-[80px] group"
                >
                  <div className="relative">
                    <Phone className="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2 group-hover:scale-110 transition-transform" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </div>
                  <span className="text-xs sm:text-sm font-medium">জরুরি কল</span>
                  <span className="text-xs text-red-100 mt-1">২৪/৭ সেবা</span>
                </button>
              </div>
            </div>
            
            {/* চিকিৎসা সেবা */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 sm:p-4 border border-blue-200">
              <h3 className="text-base sm:text-lg font-semibold text-blue-800 mb-3 sm:mb-4 text-center flex items-center justify-center">
                <Stethoscope className="w-5 h-5 mr-2" />
                চিকিৎসা সেবা
              </h3>
              <div className="space-y-2 sm:space-y-3">
                <button 
                  onClick={() => {
                    handleFeatureClick('appointment');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center p-2.5 sm:p-3 bg-white hover:bg-blue-50 rounded-lg transition-all duration-200 group border border-blue-200 shadow-sm hover:shadow-md touch-target"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200 transition-colors">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <div className="font-medium text-gray-900 group-hover:text-blue-600 text-sm sm:text-base truncate">অ্যাপয়েন্টমেন্ট বুকিং</div>
                    <div className="text-xs sm:text-sm text-gray-500 truncate">বিশেষজ্ঞ ডাক্তারের সাথে সাক্ষাৎ</div>
                  </div>
                </button>
                <button 
                  onClick={() => {
                    handleFeatureClick('telemedicine');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center p-2.5 sm:p-3 bg-white hover:bg-green-50 rounded-lg transition-all duration-200 group border border-green-200 shadow-sm hover:shadow-md touch-target"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-200 transition-colors">
                    <Stethoscope className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <div className="font-medium text-gray-900 group-hover:text-green-600 text-sm sm:text-base truncate">টেলিমেডিসিন</div>
                    <div className="text-xs sm:text-sm text-gray-500 truncate">অনলাইন ভিডিও পরামর্শ</div>
                  </div>
                </button>
                <button 
                  onClick={() => {
                    handleFeatureClick('emergency');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center p-2.5 sm:p-3 bg-white hover:bg-red-50 rounded-lg transition-all duration-200 group border border-red-200 shadow-sm hover:shadow-md touch-target"
                >
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-red-200 transition-colors">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <div className="font-medium text-gray-900 group-hover:text-red-600 text-sm sm:text-base truncate">জরুরি সেবা</div>
                    <div className="text-xs sm:text-sm text-gray-500 truncate">২৪/৭ জরুরি চিকিৎসা সহায়তা</div>
                  </div>
                </button>
              </div>
            </div>
            
            {/* স্বাস্থ্য তথ্য ও ব্যবস্থাপনা */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 sm:p-4 border border-purple-200">
              <h3 className="text-base sm:text-lg font-semibold text-purple-800 mb-3 sm:mb-4 text-center flex items-center justify-center">
                <FileText className="w-5 h-5 mr-2" />
                স্বাস্থ্য তথ্য ও ব্যবস্থাপনা
              </h3>
              <div className="space-y-2 sm:space-y-3">
                <button 
                  onClick={() => {
                    handleFeatureClick('medicine-order');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center p-2.5 sm:p-3 bg-white hover:bg-purple-50 rounded-lg transition-all duration-200 group border border-purple-200 shadow-sm hover:shadow-md touch-target"
                >
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-purple-200 transition-colors">
                    <Pill className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <div className="font-medium text-gray-900 group-hover:text-purple-600 text-sm sm:text-base truncate">ওষুধ অর্ডার</div>
                    <div className="text-xs sm:text-sm text-gray-500 truncate">ঘরে বসে ওষুধ ডেলিভারি</div>
                  </div>
                </button>
                <button 
                  onClick={() => {
                    handleFeatureClick('health-records');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center p-2.5 sm:p-3 bg-white hover:bg-orange-50 rounded-lg transition-all duration-200 group border border-orange-200 shadow-sm hover:shadow-md touch-target"
                >
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-orange-200 transition-colors">
                    <FileText className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <div className="font-medium text-gray-900 group-hover:text-orange-600 text-sm sm:text-base truncate">স্বাস্থ্য রেকর্ড</div>
                    <div className="text-xs sm:text-sm text-gray-500 truncate">ডিজিটাল মেডিকেল ইতিহাস</div>
                  </div>
                </button>
                <button 
                  onClick={() => {
                    handleFeatureClick('find-doctors');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center p-2.5 sm:p-3 bg-white hover:bg-indigo-50 rounded-lg transition-all duration-200 group border border-indigo-200 shadow-sm hover:shadow-md touch-target"
                >
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-indigo-200 transition-colors">
                    <Users className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <div className="font-medium text-gray-900 group-hover:text-indigo-600 text-sm sm:text-base truncate">ডাক্তার খুঁজুন</div>
                    <div className="text-xs sm:text-sm text-gray-500 truncate">বিশেষজ্ঞ ডাক্তার ডিরেক্টরি</div>
                  </div>
                </button>
              </div>
            </div>
            
            {/* AI চালিত সেবা */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-3 sm:p-4 border border-emerald-200">
              <h3 className="text-base sm:text-lg font-semibold text-emerald-800 mb-3 sm:mb-4 text-center flex items-center justify-center">
                <Bot className="w-5 h-5 mr-2" />
                AI চালিত সেবা
              </h3>
              <div className="space-y-2 sm:space-y-3">
                <button 
                  onClick={() => {
                    navigate('/chat');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center p-2.5 sm:p-3 bg-white hover:bg-emerald-50 rounded-lg transition-all duration-200 group border border-emerald-200 shadow-sm hover:shadow-md touch-target"
                >
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-emerald-200 transition-colors">
                    <Bot className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <div className="font-medium text-gray-900 group-hover:text-emerald-600 text-sm sm:text-base truncate">AI চ্যাট সহায়ক</div>
                    <div className="text-xs sm:text-sm text-gray-500 truncate">স্মার্ট স্বাস্থ্য পরামর্শ</div>
                  </div>
                </button>
                <button 
                  onClick={() => {
                    handleFeatureClick('prescription-processor');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center p-2.5 sm:p-3 bg-white hover:bg-cyan-50 rounded-lg transition-all duration-200 group border border-cyan-200 shadow-sm hover:shadow-md touch-target"
                >
                  <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-cyan-200 transition-colors">
                    <Camera className="w-4 h-4 text-cyan-600" />
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <div className="font-medium text-gray-900 group-hover:text-cyan-600 text-sm sm:text-base truncate">প্রেসক্রিপশন প্রসেসর</div>
                    <div className="text-xs sm:text-sm text-gray-500 truncate">ছবি থেকে ওষুধের তথ্য</div>
                  </div>
                </button>
                <button 
                  onClick={() => {
                    handleFeatureClick('health-analysis');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center p-2.5 sm:p-3 bg-white hover:bg-teal-50 rounded-lg transition-all duration-200 group border border-teal-200 shadow-sm hover:shadow-md touch-target"
                >
                  <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-teal-200 transition-colors">
                    <Activity className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <div className="font-medium text-gray-900 group-hover:text-teal-600 text-sm sm:text-base truncate">স্বাস্থ্য বিশ্লেষণ</div>
                    <div className="text-xs sm:text-sm text-gray-500 truncate">AI ভিত্তিক রোগ নির্ণয়</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Help & Support Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 sm:p-4 border border-blue-200">
              <h3 className="text-base sm:text-lg font-semibold text-blue-800 mb-3 sm:mb-4 text-center flex items-center justify-center">
                <HeartHandshake className="w-5 h-5 mr-2" />
                সহায়তা ও সাপোর্ট
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4">
                <button
                  onClick={() => {
                    handleFeatureClick('help-center');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex flex-col items-center p-2.5 sm:p-3 bg-white hover:bg-blue-50 rounded-lg border border-blue-200 hover:border-indigo-300 transition-all duration-200 group touch-target"
                >
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mb-1 sm:mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs sm:text-sm font-medium text-gray-700">সাহায্য কেন্দ্র</span>
                </button>
                <button
                  onClick={() => {
                    handleFeatureClick('faq');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex flex-col items-center p-2.5 sm:p-3 bg-white hover:bg-green-50 rounded-lg border border-green-200 hover:border-emerald-300 transition-all duration-200 group touch-target"
                >
                  <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mb-1 sm:mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs sm:text-sm font-medium text-gray-700">FAQ</span>
                </button>
              </div>
            </div>

            {/* Account & Settings Section */}
            <div className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl p-3 sm:p-4 border border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 text-center">অ্যাকাউন্ট ও সেটিংস</h3>
              <div className="space-y-2 sm:space-y-3">
                {/* Profile/Login */}
                <button 
                  onClick={() => {
                    handleLoginClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center p-3 bg-white hover:bg-gray-50 rounded-lg transition-colors group border border-gray-200 shadow-sm hover:shadow-md"
                >
                  <User className="w-5 h-5 text-gray-600 mr-3 group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900 group-hover:text-gray-600">প্রোফাইল</div>
                    <div className="text-sm text-gray-500">অ্যাকাউন্ট ম্যানেজমেন্ট</div>
                  </div>
                </button>
                
                {/* Emergency Contact */}
                <button 
                  onClick={() => {
                    if (onCallClick) {
                      onCallClick();
                    } else {
                      setIsAudioCallOpen(true);
                    }
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center p-3 bg-white hover:bg-red-50 rounded-lg transition-colors group border border-gray-200 shadow-sm hover:shadow-md"
                >
                  <Phone className="w-5 h-5 text-red-600 mr-3 group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900 group-hover:text-red-600">জরুরি যোগাযোগ</div>
                    <div className="text-sm text-gray-500">২৪/৭ সহায়তা</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Search Interface */}
      <SearchInterface
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={(query) => {
          console.log('Search query:', query);
          if (onFeatureClick) {
            onFeatureClick(`search:${query}`);
          }
        }}
      />
      
      {/* Medical History Modal */}
      {isMedicalHistoryOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <MedicalHistory
              language="bn"
              onClose={() => setIsMedicalHistoryOpen(false)}
            />
          </div>
        </div>
      )}
      
      {/* Audio Call Interface Modal */}
      {isAudioCallOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="w-full h-full">
            <AudioCallInterface
              isOpen={isAudioCallOpen}
              onClose={() => setIsAudioCallOpen(false)}
              language="bn"
            />
          </div>
        </div>
      )}

      {/* Live Chat System */}
      <LiveChatSystem 
        isOpen={isLiveChatOpen}
        onClose={() => setIsLiveChatOpen(false)}
      />
    </>
  );
};

export default Header;