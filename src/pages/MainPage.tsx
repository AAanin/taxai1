// Main Page - Health Assistant Features Overview
// Clean interface showing available features without chat functionality

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal, ModalHeader, ModalBody } from '../design-system';
import { MainLayout } from '../layouts';
import { Header, FeatureCard, LoadingSpinner } from '../components';
import { 
  Heart, Stethoscope, Pill, Upload, FileText, History, 
  ClipboardList, UserCheck, Bell, Calendar, Apple, Activity, 
  AlertTriangle, Shield, MessageCircle, Search, Users, 
  MapPin, Phone, Syringe, Utensils, Dumbbell, Settings,
  Send, Mic, ShoppingCart, Building, Bot, User, X, Globe, Menu, Star, Clock,
  Video, BarChart3, Zap
} from 'lucide-react';
import Lottie from 'lottie-react';
import heartAnimationData from '../w3MXReroGH.json';

// Import necessary components
import MedicineReminder from '../components/MedicineReminder';
import PrescriptionUpload from '../components/PrescriptionUpload';
import MedicalHistory from '../components/MedicalHistory';
import HealthTips from '../components/HealthTips';
import SymptomChecker from '../components/SymptomChecker';
import DietPlan from '../components/DietPlan';
import MedicineOrderSystem from '../components/MedicineOrderSystem';
import FitnessTracker from '../components/FitnessTracker';
import DoctorAppointment from '../components/DoctorAppointment';
import DoctorDirectory from '../components/DoctorDirectory';
import HospitalDirectory from '../components/HospitalDirectory';
import EmergencyContacts from '../components/EmergencyContacts';
import VaccinationSchedule from '../components/VaccinationSchedule';
import GoogleLogin from '../components/GoogleLogin';
import UserInfoForm from '../components/UserInfoForm';

// Data Management Components
import MedicalDataDashboard from '../components/MedicalDataDashboard';
import MedicalReportsManager from '../components/MedicalReportsManager';
import MedicineHistoryTracker from '../components/MedicineHistoryTracker';

// Context and hooks
import { useAuth } from '../contexts/AuthContext';

// Types

import { Language, Doctor } from '../types';
import { MedicationSchedule } from '../utils/medicineTracker';

const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, userInfo, isAuthenticated, loading: authLoading, needsUserInfo, login, saveUserInfo } = useAuth();
  
  // Language and UI states
  const [currentLanguage, setCurrentLanguage] = useState<Language>('bn');
  
  // Modal and component display states
  const [showMedicineReminder, setShowMedicineReminder] = useState(false);
  const [showPrescriptionUpload, setShowPrescriptionUpload] = useState(false);
  const [showMedicalHistory, setShowMedicalHistory] = useState(false);
  
  // Directory and service related states
  const [showDoctorDirectory, setShowDoctorDirectory] = useState(false);
  const [showHospitalDirectory, setShowHospitalDirectory] = useState(false);
  const [showAppointmentBooking, setShowAppointmentBooking] = useState(false);
  const [showMedicineOrder, setShowMedicineOrder] = useState(false);
  const [showDoctorAppointment, setShowDoctorAppointment] = useState(false);
  const [showDietSuggestion, setShowDietSuggestion] = useState(false);
  const [showFitnessTracker, setShowFitnessTracker] = useState(false);
  const [showEmergencyContacts, setShowEmergencyContacts] = useState(false);
  const [showVaccinationSchedule, setShowVaccinationSchedule] = useState(false);
  
  // User management states
  const [showLoginModalState, setShowLoginModalState] = useState(false);
  const [showUserInfoForm, setShowUserInfoForm] = useState(false);
  
  // Health tips and symptom checker states
  const [showHealthTips, setShowHealthTips] = useState(false);
  const [showSymptomChecker, setShowSymptomChecker] = useState(false);
  const [showDietPlan, setShowDietPlan] = useState(false);
  

  
  // Navigation loading state
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Data Management states
  const [showMedicalDataDashboard, setShowMedicalDataDashboard] = useState(false);
  const [showMedicalReportsManager, setShowMedicalReportsManager] = useState(false);
  const [showMedicineHistoryTracker, setShowMedicineHistoryTracker] = useState(false);

  // Other states
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [medicationSchedules, setMedicationSchedules] = useState<MedicationSchedule[]>([]);

  // Chat navigation handler
  const handleChatNavigation = async () => {
    setIsNavigating(true);
    try {
      navigate('/chat');
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      setTimeout(() => setIsNavigating(false), 500);
    }
  };

  // Header feature click handler
  const handleFeatureClick = (featureId: string) => {
    switch (featureId) {
      case 'ai-chat':
        // Navigate to chat page
        handleChatNavigation();
        break;
      case 'symptom-checker':
        setShowSymptomChecker(true);
        break;
      case 'health-tips':
        setShowHealthTips(true);
        break;
      case 'medicine-reminder':
        if (!isAuthenticated) {
          setShowLoginModalState(true);
          return;
        }
        setShowMedicineReminder(true);
        break;
      case 'prescription-upload':
        if (!isAuthenticated) {
          setShowLoginModalState(true);
          return;
        }
        setShowPrescriptionUpload(true);
        break;
      case 'find-doctor':
        setShowDoctorDirectory(true);
        break;
      case 'appointment':
        if (!isAuthenticated) {
          setShowLoginModalState(true);
          return;
        }
        setShowDoctorAppointment(true);
        break;
      case 'find-hospital':
        setShowHospitalDirectory(true);
        break;
      case 'fitness-tracker':
        setShowFitnessTracker(true);
        break;
      case 'diet-plan':
        setShowDietPlan(true);
        break;
      case 'vaccination':
        setShowVaccinationSchedule(true);
        break;
      case 'emergency-contact':
        setShowEmergencyContacts(true);
        break;
      case 'medicine-order':
        setShowMedicineOrder(true);
        break;
      case 'medical-dashboard':
        if (!isAuthenticated) {
          setShowLoginModalState(true);
          return;
        }
        setShowMedicalDataDashboard(true);
        break;
      case 'medical-reports':
        if (!isAuthenticated) {
          setShowLoginModalState(true);
          return;
        }
        setShowMedicalReportsManager(true);
        break;
      case 'medicine-history':
        if (!isAuthenticated) {
          setShowLoginModalState(true);
          return;
        }
        setShowMedicineHistoryTracker(true);
        break;
      case 'telemedicine':
        navigate('/telemedicine');
        break;
      case 'health-analytics':
        navigate('/health-analytics');
        break;
      case 'image-upload':
        navigate('/image-upload');
        break;
      case 'emergency':
         navigate('/emergency');
         break;
       case 'production-enhancement':
         navigate('/production-enhancement');
         break;
       case 'user-dashboard':
         navigate('/user-dashboard');
         break;
       default:
         console.log('Feature not implemented:', featureId);
    }
  };

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <LoadingSpinner 
        fullScreen 
        variant="medical" 
        size="lg" 
        text={currentLanguage === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'} 
      />
    );
  }



  // Organized feature cards by category for better UX
  const featureGroups = [
    {
      title: currentLanguage === 'bn' ? '🩺 পরামর্শ ও নির্ণয়' : '🩺 Consultation & Diagnosis',
      description: currentLanguage === 'bn' ? 'AI চালিত স্বাস্থ্য পরামর্শ ও লক্ষণ বিশ্লেষণ' : 'AI-powered health advice and symptom analysis',
      cards: [
        {title: currentLanguage === 'bn' ? 'AI চ্যাট' : 'AI Chat',
          description: currentLanguage === 'bn' ? 'ডা. মিমুর সাথে কথা বলুন' : 'Chat with Dr. Mimu',
          icon: <MessageCircle className="w-6 h-6" />,
          onClick: () => handleChatNavigation(),
          variant: 'primary' as const,
          badge: currentLanguage === 'bn' ? 'জনপ্রিয়' : 'Popular'
        },
        {
          title: currentLanguage === 'bn' ? 'লক্ষণ পরীক্ষক' : 'Symptom Checker',
          description: currentLanguage === 'bn' ? 'আপনার লক্ষণ অনুযায়ী পরামর্শ' : 'Get advice based on your symptoms',
          icon: <Search className="w-6 h-6" />,
          onClick: () => setShowSymptomChecker(true),
          variant: 'primary' as const
        },
        {
          title: currentLanguage === 'bn' ? 'স্বাস্থ্য টিপস' : 'Health Tips',
          description: currentLanguage === 'bn' ? 'দৈনন্দিন স্বাস্থ্য পরামর্শ ও টিপস' : 'Daily health advice and tips',
          icon: <Apple className="w-6 h-6" />,
          onClick: () => setShowHealthTips(true),
          variant: 'primary' as const
        }
      ]
    },
    {
      title: currentLanguage === 'bn' ? '💊 ওষুধ ও চিকিৎসা' : '💊 Medicine & Treatment',
      description: currentLanguage === 'bn' ? 'ওষুধ ব্যবস্থাপনা ও অনলাইন অর্ডার' : 'Medicine management and online ordering',
      cards: [
        {
          title: currentLanguage === 'bn' ? 'ওষুধ রিমাইন্ডার' : 'Medicine Reminder',
          description: currentLanguage === 'bn' ? 'ওষুধ খাওয়ার সময় মনে রাখুন' : 'Remember your medication times',
          icon: <Pill className="w-6 h-6" />,
          onClick: () => setShowMedicineReminder(true),
          variant: 'secondary' as const,
          badge: currentLanguage === 'bn' ? 'প্রয়োজনীয়' : 'Essential'
        },
        {
          title: currentLanguage === 'bn' ? 'ওষুধ অর্ডার' : 'Order Medicine',
          description: currentLanguage === 'bn' ? 'অনলাইনে ওষুধ অর্ডার করুন' : 'Order medicines online',
          icon: <ShoppingCart className="w-6 h-6" />,
          onClick: () => setShowMedicineOrder(true),
          variant: 'secondary' as const
        }
      ]
    },
    {
      title: currentLanguage === 'bn' ? '🏥 ডাক্তার ও হাসপাতাল' : '🏥 Doctors & Hospitals',
      description: currentLanguage === 'bn' ? 'ডাক্তার খোঁজা ও অ্যাপয়েন্টমেন্ট বুকিং' : 'Find doctors and book appointments',
      cards: [
        {
          title: currentLanguage === 'bn' ? 'ডাক্তার ড্যাশবোর্ড' : 'Doctor Dashboard',
          description: currentLanguage === 'bn' ? 'ডাক্তারদের জন্য সম্পূর্ণ ব্যবস্থাপনা প্যানেল' : 'Complete management panel for doctors',
          icon: <Stethoscope className="w-6 h-6" />,
          onClick: () => navigate('/doctor'),
          variant: 'primary' as const,
          badge: currentLanguage === 'bn' ? 'প্রো' : 'Pro'
        },
        {
          title: currentLanguage === 'bn' ? 'ডাক্তার খুঁজুন' : 'Find Doctors',
          description: currentLanguage === 'bn' ? 'আপনার এলাকার ডাক্তার খুঁজুন' : 'Find doctors in your area',
          icon: <Users className="w-6 h-6" />,
          onClick: () => setShowDoctorDirectory(true),
          variant: 'primary' as const
        },
        {
          title: currentLanguage === 'bn' ? 'অ্যাপয়েন্টমেন্ট' : 'Book Appointment',
          description: currentLanguage === 'bn' ? 'ডাক্তারের সাথে অ্যাপয়েন্টমেন্ট বুক করুন' : 'Book appointment with doctors',
          icon: <Calendar className="w-6 h-6" />,
          onClick: () => setShowDoctorAppointment(true),
          variant: 'secondary' as const
        },
        {
          title: currentLanguage === 'bn' ? 'হাসপাতাল খুঁজুন' : 'Find Hospitals',
          description: currentLanguage === 'bn' ? 'নিকটস্থ হাসপাতাল খুঁজুন' : 'Find nearby hospitals',
          icon: <Building className="w-6 h-6" />,
          onClick: () => setShowHospitalDirectory(true),
          variant: 'primary' as const
        }
      ]
    },
    {
      title: currentLanguage === 'bn' ? '💪 স্বাস্থ্য ট্র্যাকিং' : '💪 Health Tracking',
      description: currentLanguage === 'bn' ? 'ফিটনেস ও ডায়েট পরিকল্পনা' : 'Fitness and diet planning',
      cards: [
        {
          title: currentLanguage === 'bn' ? 'ফিটনেস ট্র্যাকার' : 'Fitness Tracker',
          description: currentLanguage === 'bn' ? 'আপনার স্বাস্থ্য ও ফিটনেস ট্র্যাক করুন' : 'Track your health and fitness',
          icon: <Activity className="w-6 h-6" />,
          onClick: () => setShowFitnessTracker(true),
          variant: 'primary' as const
        },
        {
          title: currentLanguage === 'bn' ? 'ডায়েট প্ল্যান' : 'Diet Plan',
          description: currentLanguage === 'bn' ? 'AI চালিত ব্যক্তিগত ডায়েট পরামর্শ' : 'AI-powered personalized diet suggestions',
          icon: <Utensils className="w-6 h-6" />,
          onClick: () => setShowDietSuggestion(true),
          variant: 'primary' as const,
          badge: currentLanguage === 'bn' ? 'নতুন' : 'New'
        },
        {
          title: currentLanguage === 'bn' ? 'টিকাদান সূচি' : 'Vaccination Schedule',
          description: currentLanguage === 'bn' ? 'টিকার সময়সূচি দেখুন' : 'View vaccination schedules',
          icon: <Shield className="w-6 h-6" />,
          onClick: () => setShowVaccinationSchedule(true),
          variant: 'secondary' as const
        }
      ]
    },
    {
      title: currentLanguage === 'bn' ? '📊 ডেটা ব্যবস্থাপনা' : '📊 Data Management',
      description: currentLanguage === 'bn' ? 'আপনার স্বাস্থ্য ডেটা দেখুন ও বিশ্লেষণ করুন' : 'View and analyze your health data',
      cards: [
        {
          title: currentLanguage === 'bn' ? 'মেডিকেল ড্যাশবোর্ড' : 'Medical Dashboard',
          description: currentLanguage === 'bn' ? 'সমস্ত স্বাস্থ্য ডেটার সারসংক্ষেপ দেখুন' : 'View summary of all your health data',
          icon: <Activity className="w-6 h-6" />,
          onClick: () => handleFeatureClick('medical-dashboard'),
          variant: 'primary' as const,
          badge: currentLanguage === 'bn' ? 'নতুন' : 'New'
        },
        {
          title: currentLanguage === 'bn' ? 'মেডিকেল রিপোর্ট' : 'Medical Reports',
          description: currentLanguage === 'bn' ? 'আপনার সব রিপোর্ট এক জায়গায়' : 'All your reports in one place',
          icon: <FileText className="w-6 h-6" />,
          onClick: () => handleFeatureClick('medical-reports'),
          variant: 'secondary' as const
        },
        {
          title: currentLanguage === 'bn' ? 'ওষুধের ইতিহাস' : 'Medicine History',
          description: currentLanguage === 'bn' ? 'ওষুধের সম্পূর্ণ ইতিহাস ট্র্যাক করুন' : 'Track complete medicine history',
          icon: <History className="w-6 h-6" />,
          onClick: () => handleFeatureClick('medicine-history'),
          variant: 'secondary' as const
        }
      ]
    },
    {
      title: currentLanguage === 'bn' ? '🚨 জরুরি সেবা' : '🚨 Emergency Services',
      description: currentLanguage === 'bn' ? 'জরুরি অবস্থায় তাৎক্ষণিক সহায়তা' : 'Immediate help in emergency situations',
      cards: [
        {
          title: currentLanguage === 'bn' ? 'জরুরি যোগাযোগ' : 'Emergency Contacts',
          description: currentLanguage === 'bn' ? 'জরুরি অবস্থায় যোগাযোগ করুন' : 'Emergency contact numbers',
          icon: <Phone className="w-6 h-6" />,
          onClick: () => setShowEmergencyContacts(true),
          variant: 'emergency' as const,
          badge: currentLanguage === 'bn' ? '২৪/৭' : '24/7'
        },
        {
          title: currentLanguage === 'bn' ? 'Production Enhancement' : 'Production Enhancement',
          description: currentLanguage === 'bn' ? 'সিস্টেম উন্নতিকরণ ও AI ইন্টিগ্রেশন' : 'System improvement and AI integration',
          icon: <Zap className="w-6 h-6" />,
          onClick: () => handleFeatureClick('production-enhancement'),
          variant: 'primary' as const,
          badge: currentLanguage === 'bn' ? 'নতুন' : 'New'
        },
        {
          title: currentLanguage === 'bn' ? 'User Dashboard' : 'User Dashboard',
          description: currentLanguage === 'bn' ? 'ব্যবহারকারী ড্যাশবোর্ড ও স্বাস্থ্য ট্র্যাকিং' : 'User dashboard and health tracking',
          icon: <User className="w-6 h-6" />,
          onClick: () => handleFeatureClick('user-dashboard'),
          variant: 'primary' as const,
          badge: currentLanguage === 'bn' ? 'নতুন' : 'New'
        }
      ]
    }
  ];

  return (
    <>
      <MainLayout
        onFeatureClick={handleFeatureClick}
        header={
          <Header
            title="ডা. মিমু"
            subtitle={currentLanguage === 'bn' ? 'আপনার স্বাস্থ্য সহায়ক' : 'Your Health Assistant'}
            user={user ? { name: userInfo?.name || user.displayName || 'User' } : undefined}
            isLoggedIn={isAuthenticated}
            onUserClick={() => setShowUserInfoForm(true)}
            onLoginClick={() => setShowLoginModalState(true)}
            onFeatureClick={handleFeatureClick}
            actions={
              <div className="hidden lg:flex items-center space-x-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleChatNavigation}
                  leftIcon={<MessageCircle className="w-4 h-4" />}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                  disabled={isNavigating}
                >
                  {isNavigating ? (currentLanguage === 'bn' ? 'লোড হচ্ছে...' : 'Loading...') : (currentLanguage === 'bn' ? 'চ্যাট' : 'Chat')}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/doctor-login')}
                  leftIcon={<Stethoscope className="w-4 h-4" />}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                >
                  {currentLanguage === 'bn' ? 'ডাক্তার লগইন' : 'Doctor Login'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPrescriptionUpload(true)}
                  leftIcon={<Upload className="w-4 h-4" />}
                  className="hover:bg-blue-50 hover:text-blue-600 transition-all duration-300"
                >
                  {currentLanguage === 'bn' ? 'প্রেসক্রিপশন' : 'Prescription'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMedicalHistory(true)}
                  leftIcon={<History className="w-4 h-4" />}
                  className="hover:bg-blue-50 hover:text-blue-600 transition-all duration-300"
                >
                  {currentLanguage === 'bn' ? 'ইতিহাস' : 'History'}
                </Button>
              </div>
            }
          />
        }
      >
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-7xl">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-3xl mb-8 sm:mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
          <div className="relative px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
            <div className="text-center max-w-4xl mx-auto">

              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ডা. মিমুতে স্বাগতম
                </span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed">
                আপনার ব্যক্তিগত AI স্বাস্থ্য সহায়ক। ২৪/৭ স্বাস্থ্য পরামর্শ, ওষুধের তথ্য, ডাক্তার খোঁজা এবং আরও অনেক কিছু।
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                <Button
                  onClick={handleChatNavigation}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                  leftIcon={<MessageCircle className="w-5 h-5" />}
                  disabled={isNavigating}
                >
                  {isNavigating ? 'লোড হচ্ছে...' : 'এখনই চ্যাট শুরু করুন'}
                </Button>
                <Button
                  onClick={() => setShowSymptomChecker(true)}
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-600 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl hover:bg-blue-50 transition-all duration-300"
                  leftIcon={<Search className="w-5 h-5" />}
                >
                  লক্ষণ পরীক্ষা করুন
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200 mb-8 sm:mb-12">
          <div className="text-center mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                দ্রুত অ্যাক্সেস
              </span>
            </h3>
            <p className="text-sm text-gray-600">
              সবচেয়ে জনপ্রিয় সেবাসমূহ
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* AI Chat */}
            <button
              onClick={handleChatNavigation}
              className="group relative bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              disabled={isNavigating}
            >
              <div className="absolute top-2 right-2">
                <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                  জনপ্রিয়
                </span>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Bot className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-sm sm:text-base mb-1">AI চ্যাট</h4>
                <p className="text-xs opacity-90">তাৎক্ষণিক পরামর্শ</p>
              </div>
            </button>

            {/* Medicine Reminder */}
            <button
              onClick={() => setShowMedicineReminder(true)}
              className="group relative bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <div className="absolute top-2 right-2">
                <span className="bg-red-400 text-red-900 text-xs font-bold px-2 py-1 rounded-full">
                  প্রয়োজনীয়
                </span>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Bell className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-sm sm:text-base mb-1">মেডিসিন রিমাইন্ডার</h4>
                <p className="text-xs opacity-90">ওষুধের সময়সূচি</p>
              </div>
            </button>

            {/* Symptom Checker */}
            <button
              onClick={() => setShowSymptomChecker(true)}
              className="group bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Search className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-sm sm:text-base mb-1">লক্ষণ পরীক্ষক</h4>
                <p className="text-xs opacity-90">স্বাস্থ্য বিশ্লেষণ</p>
              </div>
            </button>

            {/* Diet Plan */}
            <button
              onClick={() => setShowDietPlan(true)}
              className="group relative bg-gradient-to-br from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <div className="absolute top-2 right-2">
                <span className="bg-green-400 text-green-900 text-xs font-bold px-2 py-1 rounded-full">
                  নতুন
                </span>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Utensils className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-sm sm:text-base mb-1">ডায়েট প্ল্যান</h4>
                <p className="text-xs opacity-90">পুষ্টি পরিকল্পনা</p>
              </div>
            </button>
          </div>
        </div>

        {/* Search Section - Mobile Only */}
        <div className="lg:hidden mb-6 sm:mb-8">
          <div className="flex justify-center">
            <button 
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 hover:from-blue-200 hover:to-purple-200 text-blue-600 hover:text-purple-600 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center border-2 border-blue-200 hover:border-purple-300 transform hover:-translate-y-0.5"
              title="খুঁজুন"
              onClick={() => setShowSymptomChecker(true)}
              aria-label="লক্ষণ পরীক্ষা করুন"
            >
              <Search className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Feature Groups */}
        <div className="space-y-8 sm:space-y-12">
          <div className="text-center mb-6 sm:mb-8">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                সেবাসমূহ
              </span>
            </h3>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
              আপনার স্বাস্থ্যসেবার জন্য প্রয়োজনীয় সকল সুবিধা এক জায়গায়
            </p>
          </div>
          {featureGroups.map((group, index) => (
            <div key={index} className="bg-white rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 p-4 sm:p-6 lg:p-8 border border-gray-100">
              <div className="text-center mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                  {group.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  {group.description}
                </p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                {group.cards.map((card, cardIndex) => (
                  <div key={cardIndex} className="group">
                    <FeatureCard
                      title={card.title}
                      description={card.description}
                      icon={React.cloneElement(card.icon, { 
                        className: "w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:scale-110" 
                      })}
                      onClick={card.onClick}
                      variant={card.variant}
                      badge={card.badge}
                      className="h-full transform hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-lg border-gray-200 hover:border-gray-300 bg-gradient-to-br from-white to-gray-50 hover:from-gray-50 hover:to-gray-100"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
          </div>
        </div>
      </MainLayout>

      {/* All Modals */}
      <div>
        {/* Medicine Reminder Modal */}
        <Modal
          isOpen={showMedicineReminder}
          onClose={() => setShowMedicineReminder(false)}
          title={currentLanguage === 'bn' ? 'ওষুধের রিমাইন্ডার' : 'Medicine Reminders'}
          size="xl"
        >
          <ModalBody>
            <MedicineReminder
              language={currentLanguage}
              schedules={medicationSchedules}
              onScheduleUpdate={setMedicationSchedules}
              userId={user?.uid}
            />
          </ModalBody>
        </Modal>
        
        {/* Prescription Upload Modal */}
        <Modal
          isOpen={showPrescriptionUpload}
          onClose={() => setShowPrescriptionUpload(false)}
          title={currentLanguage === 'bn' ? 'প্রেসক্রিপশন আপলোড' : 'Upload Prescription'}
          size="xl"
        >
          <ModalBody>
            <PrescriptionUpload
              language={currentLanguage}
              onClose={() => setShowPrescriptionUpload(false)}
              userId={user?.uid}
            />
          </ModalBody>
        </Modal>
        
        {/* Medical History Modal */}
        <Modal
          isOpen={showMedicalHistory}
          onClose={() => setShowMedicalHistory(false)}
          title={currentLanguage === 'bn' ? 'চিকিৎসা ইতিহাস' : 'Medical History'}
          size="xl"
        >
          <ModalBody>
            <MedicalHistory language={currentLanguage} />
          </ModalBody>
        </Modal>

        {/* Login Modal */}
        <Modal
          isOpen={showLoginModalState}
          onClose={() => setShowLoginModalState(false)}
          title={currentLanguage === 'bn' ? 'লগইন প্রয়োজন' : 'Login Required'}
          size="md"
        >
          <ModalBody>
            <div className="text-center">
              <p className="text-neutral-600 mb-6">
                {currentLanguage === 'bn' 
                  ? 'এই ফিচারটি ব্যবহার করতে আপনাকে লগইন করতে হবে।' 
                  : 'You need to login to use this feature.'}
              </p>
              <div className="space-y-4">
                <GoogleLogin
                  language={currentLanguage}
                  onLoginSuccess={(user) => {
                    login(user);
                    setShowLoginModalState(false);
                  }}
                  onLoginError={(error) => {
                    console.error('Login failed:', error);
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => setShowLoginModalState(false)}
                  className="w-full"
                >
                  {currentLanguage === 'bn' ? 'বাতিল' : 'Cancel'}
                </Button>
              </div>
            </div>
          </ModalBody>
        </Modal>

        {/* User Info Form Modal */}
        <Modal
          isOpen={showUserInfoForm}
          onClose={() => setShowUserInfoForm(false)}
          title={currentLanguage === 'bn' ? 'ব্যবহারকারীর তথ্য' : 'User Information'}
          size="md"
        >
          <ModalBody>
            <UserInfoForm
              language={currentLanguage}
              user={user}
              userInfo={userInfo}
              onSave={(info) => {
                saveUserInfo(info);
                setShowUserInfoForm(false);
              }}
              onClose={() => setShowUserInfoForm(false)}
            />
          </ModalBody>
        </Modal>



        {/* Health Tips Modal */}
        {showHealthTips && (
          <HealthTips
            language={currentLanguage}
            onClose={() => setShowHealthTips(false)}
          />
        )}

        {/* Symptom Checker Modal */}
        {showSymptomChecker && (
          <SymptomChecker
            language={currentLanguage}
            onClose={() => setShowSymptomChecker(false)}
            onDoctorBooking={(doctorId, specialty) => {
              console.log('Doctor booking requested:', { doctorId, specialty });
              setShowSymptomChecker(false);
              setShowDoctorAppointment(true);
            }}
          />
        )}

        {/* Diet Plan Modal */}
        {showDietSuggestion && (
          <DietPlan
            language={currentLanguage}
            onClose={() => setShowDietSuggestion(false)}
          />
        )}

        {/* Diet Plan Modal - Quick Access */}
        {showDietPlan && (
          <DietPlan
            language={currentLanguage}
            onClose={() => setShowDietPlan(false)}
          />
        )}

        {/* Medicine Order System Modal */}
        {showMedicineOrder && (
          <MedicineOrderSystem
            language={currentLanguage}
            onClose={() => setShowMedicineOrder(false)}
          />
        )}

        {/* Fitness Tracker Modal */}
        {showFitnessTracker && (
          <FitnessTracker
            language={currentLanguage}
            onClose={() => setShowFitnessTracker(false)}
          />
        )}

        {/* Doctor Appointment Modal */}
        {showDoctorAppointment && (
          <DoctorAppointment
            language={currentLanguage}
            onClose={() => setShowDoctorAppointment(false)}
          />
        )}

        {/* Doctor Directory Modal */}
        <Modal
          isOpen={showDoctorDirectory}
          onClose={() => setShowDoctorDirectory(false)}
          title={currentLanguage === 'bn' ? 'ডাক্তার ডিরেক্টরি' : 'Doctor Directory'}
          size="full"
        >
          <ModalBody>
            <DoctorDirectory
              language={currentLanguage}
              onBookAppointment={(doctor) => {
                setSelectedDoctor(doctor);
                setShowDoctorDirectory(false);
                setShowAppointmentBooking(true);
              }}
            />
          </ModalBody>
        </Modal>

        {/* Hospital Directory Modal */}
        {showHospitalDirectory && (
          <HospitalDirectory
            language={currentLanguage}
            onClose={() => setShowHospitalDirectory(false)}
          />
        )}

        {/* Emergency Contacts Modal */}
        {showEmergencyContacts && (
          <EmergencyContacts
            language={currentLanguage}
            onClose={() => setShowEmergencyContacts(false)}
          />
        )}

        {/* Vaccination Schedule Modal */}
        {showVaccinationSchedule && (
          <VaccinationSchedule
            language={currentLanguage}
            onClose={() => setShowVaccinationSchedule(false)}
          />
        )}





        {/* Medical Data Dashboard Modal */}
        <Modal
          isOpen={showMedicalDataDashboard}
          onClose={() => setShowMedicalDataDashboard(false)}
          title={currentLanguage === 'bn' ? 'মেডিকেল ডেটা ড্যাশবোর্ড' : 'Medical Data Dashboard'}
          size="full"
        >
          <ModalBody className="p-0">
            <MedicalDataDashboard 
              userId={user?.uid || 'default-user-id'}
              onClose={() => setShowMedicalDataDashboard(false)}
            />
          </ModalBody>
        </Modal>

        {/* Medical Reports Manager Modal */}
        <Modal
          isOpen={showMedicalReportsManager}
          onClose={() => setShowMedicalReportsManager(false)}
          title={currentLanguage === 'bn' ? 'মেডিকেল রিপোর্ট ব্যবস্থাপনা' : 'Medical Reports Management'}
          size="full"
        >
          <ModalBody className="p-0">
            <MedicalReportsManager 
              userId={user?.uid || 'default-user-id'}
              onClose={() => setShowMedicalReportsManager(false)}
            />
          </ModalBody>
        </Modal>

        {/* Medicine History Tracker Modal */}
        <Modal
          isOpen={showMedicineHistoryTracker}
          onClose={() => setShowMedicineHistoryTracker(false)}
          title={currentLanguage === 'bn' ? 'ওষুধের ইতিহাস ট্র্যাকার' : 'Medicine History Tracker'}
          size="full"
        >
          <ModalBody className="p-0">
            <MedicineHistoryTracker 
              userId={user?.uid || 'default-user-id'}
              onClose={() => setShowMedicineHistoryTracker(false)}
            />
          </ModalBody>
        </Modal>
      </div>
      

    </>
  );
};

export default MainPage;