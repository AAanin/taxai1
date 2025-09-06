// Dedicated Chat Page - AI Health Assistant Chat Interface
// Separated from main page for better organization and user experience

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal, ModalHeader, ModalBody } from '../design-system';
import { ChatLayout } from '../layouts';
import { Header, ChatMessage, ChatInput, LoadingSpinner } from '../components';
import { 
  Heart, Stethoscope, Pill, Upload, FileText, History, 
  ClipboardList, UserCheck, Bell, Calendar, Apple, Activity, 
  AlertTriangle, Shield, MessageCircle, Search, Users, 
  MapPin, Phone, Syringe, Utensils, Dumbbell, Settings,
  Send, Mic, ShoppingCart, Building, Bot, User, X, Globe, Menu, Star, Clock, ArrowLeft
} from 'lucide-react';

// Import all necessary components
import AIChatInterface from '../components/AIChatInterface';
import AudioCallInterface from '../components/AudioCallInterface';
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
import ChatHistory from '../components/ChatHistory';

// Context and hooks
import { useAuth } from '../contexts/AuthContext';
import { useMedicalAI } from '../hooks/useMedicalAI';

// Types
import type { UserInfo } from '../components/UserInfoForm';
import { Message, Language, Doctor, Appointment } from '../types';
import { MedicationSchedule } from '../utils/medicineTracker';

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, userInfo, isAuthenticated, loading: authLoading, needsUserInfo, login, saveUserInfo } = useAuth();

  // Handle back navigation
  const handleBackClick = () => {
    navigate('/');
  };
  
  // Chat messages state - initial welcome message
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'আসসালামু আলাইকুম! আমি ডা.মিমু, আপনার AI চিকিৎসা সহায়ক। আমি বাংলা এবং ইংরেজি উভয় ভাষায় আপনাকে চিকিৎসা সংক্রান্ত পরামর্শ দিতে পারি। আপনার স্বাস্থ্য সমস্যা সম্পর্কে বলুন।',
      sender: 'bot',
      timestamp: new Date(),
      language: 'bn'
    }
  ]);
  
  // Input and language related state
  const [inputMessage, setInputMessage] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState<Language>('bn');
  const [isLoading, setIsLoading] = useState(false);
  
  // Modal and component display states
  const [showApiSetup, setShowApiSetup] = useState(false);
  const [showMedicalInfo, setShowMedicalInfo] = useState(false);
  const [showMedicineReminder, setShowMedicineReminder] = useState(false);
  const [showPrescriptionUpload, setShowPrescriptionUpload] = useState(false);
  const [showMedicalHistory, setShowMedicalHistory] = useState(false);
  const [showMedicineHistory, setShowMedicineHistory] = useState(false);
  const [showMedicalReport, setShowMedicalReport] = useState(false);
  const [showReportUpload, setShowReportUpload] = useState(false);
  
  // Directory and service related states
  const [showDoctorDirectory, setShowDoctorDirectory] = useState(false);
  const [showMedicineDirectory, setShowMedicineDirectory] = useState(false);
  const [showHospitalDirectory, setShowHospitalDirectory] = useState(false);
  const [showAppointmentBooking, setShowAppointmentBooking] = useState(false);
  const [showAIChatInterface, setShowAIChatInterface] = useState(false);
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
  
  // Audio call interface state
  const [showAudioCallInterface, setShowAudioCallInterface] = useState(false);
  
  // Chat history states
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Other states and references
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [medicationSchedules, setMedicationSchedules] = useState<MedicationSchedule[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Voice interaction state
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  
  // Medical AI hook
  const { sendMessage, loading, error, getAvailableProviders } = useMedicalAI();

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  }, [messages, isLoading]);

  // Header feature click handler
  const handleFeatureClick = (featureId: string) => {
    switch (featureId) {
      case 'mimu-call':
        setShowAudioCallInterface(true);
        break;
      case 'ai-chat':
        setShowAIChatInterface(true);
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
        setShowDietSuggestion(true);
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

  // Check if user info form should be shown
  useEffect(() => {
    if (isAuthenticated && needsUserInfo) {
      setShowUserInfoForm(true);
    }
  }, [isAuthenticated, needsUserInfo]);

  const handleUserInfoSubmit = async (userInfo: UserInfo) => {
    try {
      await saveUserInfo(userInfo);
      setShowUserInfoForm(false);
    } catch (error) {
      console.error('Failed to save user info:', error);
    }
  };

  // Quick actions for chat input
  const quickActions = [
    {
      label: currentLanguage === 'bn' ? 'মাথাব্যথা হচ্ছে' : 'I have a headache',
      value: currentLanguage === 'bn' ? 'আমার মাথাব্যথা হচ্ছে, কী করব?' : 'I have a headache, what should I do?',
      icon: <Heart className="w-4 h-4" />
    },
    {
      label: currentLanguage === 'bn' ? 'জ্বর হয়েছে' : 'I have fever',
      value: currentLanguage === 'bn' ? 'আমার জ্বর হয়েছে, কী ওষুধ খাব?' : 'I have fever, what medicine should I take?',
      icon: <Activity className="w-4 h-4" />
    },
    {
      label: currentLanguage === 'bn' ? 'ডাক্তার দরকার' : 'Need a doctor',
      value: currentLanguage === 'bn' ? 'আমার একজন ডাক্তারের প্রয়োজন' : 'I need to see a doctor',
      icon: <Stethoscope className="w-4 h-4" />
    }
  ];

  return (
    <>
      <ChatLayout
        header={
          <Header
            title="ডা. মিমু"
            subtitle={currentLanguage === 'bn' ? 'AI চিকিৎসা সহায়ক' : 'AI Medical Assistant'}
            user={user ? { name: userInfo?.name || user.displayName || 'User' } : undefined}
            onUserClick={() => setShowUserInfoForm(true)}
            onFeatureClick={handleFeatureClick}
            actions={
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/')}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  {currentLanguage === 'bn' ? 'মূল পাতা' : 'Home'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPrescriptionUpload(true)}
                  leftIcon={<Upload className="w-4 h-4" />}
                >
                  {currentLanguage === 'bn' ? 'প্রেসক্রিপশন' : 'Prescription'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowChatHistory(true)}
                  leftIcon={<History className="w-4 h-4" />}
                >
                  {currentLanguage === 'bn' ? 'চ্যাট ইতিহাস' : 'Chat History'}
                </Button>
                {!isAuthenticated && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowLoginModalState(true)}
                    leftIcon={<UserCheck className="w-4 h-4" />}
                    className="bg-black text-white border-black hover:bg-gray-800 hover:text-white"
                  >
                    {currentLanguage === 'bn' ? 'লগইন' : 'Login'}
                  </Button>
                )}
              </div>
            }
          />
        }
        footer={
          <ChatInput
            onSendMessage={async (message) => {
              const userMessage: Message = {
                id: Date.now().toString(),
                content: message,
                sender: 'user',
                timestamp: new Date(),
                language: currentLanguage
              };

              setMessages(prev => [...prev, userMessage]);
              setIsLoading(true);

              try {
                const result = await sendMessage(message, currentLanguage, user?.uid);
                
                const botMessage: Message = {
                  id: (Date.now() + 1).toString(),
                  content: result.response,
                  sender: 'bot',
                  timestamp: new Date(),
                  language: currentLanguage
                };
                setMessages(prev => [...prev, botMessage]);
              } catch (error) {
                const errorMessage: Message = {
                  id: (Date.now() + 1).toString(),
                  content: currentLanguage === 'bn' 
                    ? 'দুঃখিত, একটি ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
                    : 'Sorry, an error occurred. Please try again.',
                  sender: 'bot',
                  timestamp: new Date(),
                  language: currentLanguage
                };
                setMessages(prev => [...prev, errorMessage]);
              } finally {
                setIsLoading(false);
              }
            }}
            onFileUpload={(file) => {
              if (!isAuthenticated) {
                setShowLoginModalState(true);
                return;
              }
              setShowPrescriptionUpload(true);
            }}
            placeholder={currentLanguage === 'bn' ? 'আপনার স্বাস্থ্য সমস্যা লিখুন...' : 'Describe your health concern...'}
            isLoading={isLoading}
            quickActions={quickActions}
          />
        }
      >
        {/* Chat Messages Area - Mobile Optimized */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth main-content-scroll
                        h-full max-h-[calc(100vh-140px)] sm:max-h-[calc(100vh-160px)]
                        pb-24 sm:pb-28 md:pb-6
                        touch-pan-y overscroll-contain
                        -webkit-overflow-scrolling-touch">
          {/* Welcome Message */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <MessageCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              {currentLanguage === 'bn' ? 'ডা. মিমুর সাথে কথা বলুন' : 'Chat with Dr. Mimu'}
            </h2>
            <p className="text-neutral-600">
              {currentLanguage === 'bn' 
                ? 'আপনার স্বাস্থ্য সমস্যা নিয়ে আলোচনা করুন এবং তাৎক্ষণিক পরামর্শ পান'
                : 'Discuss your health concerns and get instant medical advice'
              }
            </p>
          </div>

          {/* Chat Messages */}
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message.content}
              isUser={message.sender === 'user'}
              timestamp={message.timestamp}
              userName={message.sender === 'user' ? (userInfo?.name || 'You') : 'Dr. Mimu'}
              messageType={message.sender === 'bot' ? 'text' : undefined}
            />
          ))}
          
          {/* Typing Indicator */}
          {isLoading && (
            <ChatMessage
              message=""
              isUser={false}
              isTyping={true}
              userName="Dr. Mimu"
            />
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ChatLayout>

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
        {showUserInfoForm && (
          <UserInfoForm
            isOpen={showUserInfoForm}
            onClose={() => setShowUserInfoForm(false)}
            onSubmit={handleUserInfoSubmit}
            currentLanguage={currentLanguage}
          />
        )}

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

        {/* Chat History Modal */}
        <Modal
          isOpen={showChatHistory}
          onClose={() => setShowChatHistory(false)}
          title={currentLanguage === 'bn' ? 'চ্যাট ইতিহাস' : 'Chat History'}
          size="xl"
        >
          <ModalBody>
            <ChatHistory
              onSessionSelect={(sessionId) => {
                setCurrentSessionId(sessionId);
                setShowChatHistory(false);
                // Load the selected session messages
                // This will be handled by AIChatInterface component
              }}
              currentSessionId={currentSessionId}
              className="h-96"
            />
          </ModalBody>
        </Modal>

        {/* AI Chat Interface Modal - মিমুর সাথে কথা বলুন */}
        {showAIChatInterface && (
          <AIChatInterface
            sessionId={currentSessionId}
            onSessionChange={(sessionId) => setCurrentSessionId(sessionId)}
            language={currentLanguage}
            onClose={() => setShowAIChatInterface(false)}
          />
        )}

        {/* Audio Call Interface Modal - মিমুর সাথে অডিও কল */}
        {showAudioCallInterface && (
          <AudioCallInterface
            isOpen={showAudioCallInterface}
            onClose={() => setShowAudioCallInterface(false)}
            language={currentLanguage}
          />
        )}
      </div>
    </>
  );
};

export default ChatPage;