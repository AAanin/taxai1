// Doctor Dashboard - ডাক্তার ড্যাশবোর্ড
import React, { useState, useEffect } from 'react';
import { 
  Calendar, Users, FileText, MessageCircle, Video, BarChart3, 
  Settings, Bell, Search, Plus, Edit, Trash2, Eye, Clock, 
  Stethoscope, Pill, Activity, Heart, Brain, User, Phone,
  Mail, MapPin, Star, Download, Upload, Filter, RefreshCw, X, LogOut, ChevronDown
} from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import GlobalSearchComponent from './GlobalSearchComponent';
import NotificationPanel from './NotificationPanel';
import ContentManagementSystem from './ContentManagementSystem';
import AIPrescriptionSystem from './AIPrescriptionSystem';
import PrescriptionProcessor from './PrescriptionProcessor';
import langchainService from '../services/langchainService';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  phone: string;
  email: string;
  address: string;
  bloodGroup: string;
  emergencyContact: string;
  medicalHistory: string[];
  allergies: string[];
  currentMedications: string[];
  lastVisit: Date;
  nextAppointment?: Date;
  riskLevel: 'low' | 'medium' | 'high';
  avatar?: string;
}

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: Date;
  time: string;
  duration: number;
  type: 'consultation' | 'follow-up' | 'emergency' | 'telemedicine';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  symptoms?: string[];
  diagnosis?: string;
  prescription?: string[];
  followUpRequired?: boolean;
}

interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  date: Date;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[];
  diagnosis: string;
  notes?: string;
  followUpDate?: Date;
}

interface DoctorStats {
  totalPatients: number;
  todayAppointments: number;
  pendingReports: number;
  revenue: number;
  patientSatisfaction: number;
  consultationHours: number;
}

interface DoctorProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  bmdcNumber: string;
  specialization: string;
  experience: string;
  qualification: string;
  workplace: string;
  workplaceAddress: string;
  consultationFee: string;
  type: string;
  verified: boolean;
  profilePicture?: string | null;
}

const DoctorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'appointments' | 'prescriptions' | 'ai-prescription' | 'prescription-processor' | 'reports' | 'communication' | 'content' | 'settings'>('overview');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('today');
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{[key: string]: string}>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
  
  const { showNotification } = useNotification();
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Load doctor profile and mock data initialization
  useEffect(() => {
    // Load demo doctor profile from localStorage
    const demoDoctor = localStorage.getItem('demoDoctor');
    if (demoDoctor) {
      try {
        const profile = JSON.parse(demoDoctor);
        setDoctorProfile(profile);
      } catch (error) {
        console.error('Error parsing demo doctor profile:', error);
      }
    }
    
    // Initialize with sample data
    const samplePatients: Patient[] = [
      {
        id: '1',
        name: 'রহিমা খাতুন',
        age: 45,
        gender: 'female',
        phone: '01712345678',
        email: 'rahima@email.com',
        address: 'ধানমন্ডি, ঢাকা',
        bloodGroup: 'B+',
        emergencyContact: '01798765432',
        medicalHistory: ['ডায়াবেটিস', 'উচ্চ রক্তচাপ'],
        allergies: ['পেনিসিলিন'],
        currentMedications: ['মেটফরমিন', 'এমলোডিপিন'],
        lastVisit: new Date('2024-01-15'),
        nextAppointment: new Date('2024-02-15'),
        riskLevel: 'medium'
      },
      {
        id: '2',
        name: 'করিম উদ্দিন',
        age: 32,
        gender: 'male',
        phone: '01887654321',
        email: 'karim@email.com',
        address: 'গুলশান, ঢাকা',
        bloodGroup: 'A+',
        emergencyContact: '01712345678',
        medicalHistory: ['অ্যাজমা'],
        allergies: [],
        currentMedications: ['ইনহেলার'],
        lastVisit: new Date('2024-01-20'),
        riskLevel: 'low'
      }
    ];

    const sampleAppointments: Appointment[] = [
      {
        id: '1',
        patientId: '1',
        patientName: 'রহিমা খাতুন',
        date: new Date(),
        time: '10:00',
        duration: 30,
        type: 'consultation',
        status: 'scheduled',
        symptoms: ['মাথাব্যথা', 'জ্বর']
      },
      {
        id: '2',
        patientId: '2',
        patientName: 'করিম উদ্দিন',
        date: new Date(),
        time: '11:30',
        duration: 20,
        type: 'follow-up',
        status: 'confirmed'
      }
    ];

    setPatients(samplePatients);
    setAppointments(sampleAppointments);
  }, []);

  // Calculate stats
  const getStats = (): DoctorStats => {
    const today = new Date();
    const todayAppointments = appointments.filter(apt => 
      apt.date.toDateString() === today.toDateString()
    ).length;

    return {
      totalPatients: patients.length,
      todayAppointments,
      pendingReports: 5,
      revenue: 45000,
      patientSatisfaction: 4.8,
      consultationHours: 8
    };
  };

  const stats = getStats();

  // Filter appointments by date
  const getFilteredAppointments = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() + 7);

    return appointments.filter(apt => {
      switch (dateFilter) {
        case 'today':
          return apt.date.toDateString() === today.toDateString();
        case 'tomorrow':
          return apt.date.toDateString() === tomorrow.toDateString();
        case 'week':
          return apt.date >= today && apt.date <= thisWeek;
        default:
          return true;
      }
    });
  };

  // Search patients
  const getFilteredPatients = () => {
    if (!searchQuery) return patients;
    return patients.filter(patient => 
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone.includes(searchQuery) ||
      patient.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // AI-powered patient analysis
  const analyzePatientWithAI = async (patient: Patient) => {
    setIsAnalyzing(true);
    try {
      const analysisPrompt = `রোগীর তথ্য বিশ্লেষণ করুন:
নাম: ${patient.name}
বয়স: ${patient.age}
লিঙ্গ: ${patient.gender}
মেডিকেল ইতিহাস: ${patient.medicalHistory.join(', ')}
এলার্জি: ${patient.allergies.join(', ')}
বর্তমান ওষুধ: ${patient.currentMedications.join(', ')}
ঝুঁকির মাত্রা: ${patient.riskLevel}

এই রোগীর জন্য চিকিৎসা পরামর্শ এবং সতর্কতা প্রদান করুন।`;
      
      const analysis = await langchainService.generateMedicalResponse(analysisPrompt, 'bn');
      setAiAnalysis(prev => ({ ...prev, [patient.id]: analysis }));
      
      showNotification({
        type: 'success',
        title: 'AI বিশ্লেষণ সম্পন্ন',
        message: `${patient.name} এর জন্য AI বিশ্লেষণ তৈরি হয়েছে`
      });
    } catch (error) {
      console.error('AI analysis error:', error);
      showNotification({
        type: 'error',
        title: 'বিশ্লেষণে সমস্যা',
        message: 'AI বিশ্লেষণ করতে সমস্যা হয়েছে'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate AI recommendations for daily practice
  const generateDailyRecommendations = async () => {
    try {
      const todayAppointments = getFilteredAppointments();
      const highRiskPatients = patients.filter(p => p.riskLevel === 'high');
      
      const recommendationPrompt = `আজকের অ্যাপয়েন্টমেন্ট: ${todayAppointments.length}টি
উচ্চ ঝুঁকিপূর্ণ রোগী: ${highRiskPatients.length}জন
মোট রোগী: ${patients.length}জন

আজকের জন্য ডাক্তারের কাজের পরিকল্পনা এবং গুরুত্বপূর্ণ সুপারিশ প্রদান করুন।`;
      
      const recommendations = await langchainService.generateMedicalResponse(recommendationPrompt, 'bn');
      setAiRecommendations(recommendations.split('\n').filter(r => r.trim()));
    } catch (error) {
      console.error('Recommendations error:', error);
    }
  };

  // Load AI recommendations on component mount
  useEffect(() => {
    generateDailyRecommendations();
  }, [patients, appointments]);

  // Create new prescription
  const createPrescription = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    const newPrescription: Prescription = {
      id: Date.now().toString(),
      patientId,
      patientName: patient.name,
      date: new Date(),
      medications: [],
      diagnosis: '',
      notes: ''
    };

    setSelectedPatient(patient);
    setShowPrescriptionModal(true);
  };

  // Update appointment status
  const updateAppointmentStatus = (appointmentId: string, status: Appointment['status']) => {
    setAppointments(prev => prev.map(apt => 
      apt.id === appointmentId ? { ...apt, status } : apt
    ));
    
    showNotification({
      type: 'success',
      title: 'আপডেট সফল',
      message: 'অ্যাপয়েন্টমেন্ট স্ট্যাটাস আপডেট করা হয়েছে'
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-600';
      case 'confirmed': return 'bg-green-100 text-green-600';
      case 'completed': return 'bg-gray-100 text-gray-600';
      case 'cancelled': return 'bg-red-100 text-red-600';
      case 'no-show': return 'bg-yellow-100 text-yellow-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // Get risk level color
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-600';
      case 'medium': return 'bg-yellow-100 text-yellow-600';
      case 'high': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // Format time
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('bn-BD', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Handle logout
  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  // Confirm logout
  const confirmLogout = () => {
    // Clear doctor-specific data
    localStorage.removeItem('demoDoctor');
    localStorage.removeItem('doctorSession');
    
    // Call AuthContext logout
    logout();
    
    // Show success notification
    showNotification({
      type: 'success',
      title: 'লগআউট সফল',
      message: 'সফলভাবে লগআউট হয়েছে'
    });
    
    // Redirect to doctor login
    navigate('/doctor-login');
  };

  // Cancel logout
  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const tabs = [
    { id: 'overview', label: 'ওভারভিউ', icon: BarChart3 },
    { id: 'patients', label: 'রোগী', icon: Users },
    { id: 'appointments', label: 'অ্যাপয়েন্টমেন্ট', icon: Calendar },
    { id: 'prescriptions', label: 'প্রেসক্রিপশন', icon: FileText },
    { id: 'ai-prescription', label: 'এআই প্রেসক্রিপশন', icon: Brain },
    { id: 'prescription-processor', label: 'প্রেসক্রিপশন প্রসেসর', icon: Upload },
    { id: 'reports', label: 'রিপোর্ট', icon: Activity },
    { id: 'communication', label: 'যোগাযোগ', icon: MessageCircle },
    { id: 'content', label: 'কন্টেন্ট', icon: Edit },
    { id: 'settings', label: 'সেটিংস', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Stethoscope className="w-6 h-6 text-medical-primary" />
                <h1 className="text-xl font-semibold text-gray-900">ডাক্তার ড্যাশবোর্ড</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Global Search */}
              <div className="hidden md:block">
                <GlobalSearchComponent />
              </div>
              
              {/* Quick Actions */}
              <button className="flex items-center space-x-1 bg-medical-primary text-white px-3 py-2 rounded-lg hover:bg-medical-secondary transition-colors">
                <Plus className="w-4 h-4" />
                <span>নতুন অ্যাপয়েন্টমেন্ট</span>
              </button>
              
              <button 
                onClick={() => setShowNotificationPanel(!showNotificationPanel)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">3</span>
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-medical-primary rounded-full flex items-center justify-center text-white font-medium">
                    {doctorProfile?.fullName ? doctorProfile.fullName.charAt(0) : 'ড'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">
                      {doctorProfile?.fullName || 'ডাঃ মোহাম্মদ রহিম'}
                    </span>
                    {doctorProfile?.specialization && (
                      <span className="text-xs text-gray-500">
                        {doctorProfile.specialization}
                      </span>
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                
                {/* Profile Dropdown */}
                {showProfileDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {doctorProfile?.fullName || 'ডাঃ মোহাম্মদ রহিম'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {doctorProfile?.email || 'doctor@test.com'}
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => {
                        setActiveTab('settings');
                        setShowProfileDropdown(false);
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>সেটিংস</span>
                    </button>
                    
                    <button 
                      onClick={() => {
                        handleLogout();
                        setShowProfileDropdown(false);
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>লগআউট</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-medical-primary text-medical-primary bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'মোট রোগী', value: stats.totalPatients, icon: Users, color: 'bg-blue-500' },
                { label: 'আজকের অ্যাপয়েন্টমেন্ট', value: stats.todayAppointments, icon: Calendar, color: 'bg-green-500' },
                { label: 'অপেক্ষমাণ রিপোর্ট', value: stats.pendingReports, icon: FileText, color: 'bg-yellow-500' },
                { label: 'মাসিক আয়', value: `৳${stats.revenue.toLocaleString()}`, icon: BarChart3, color: 'bg-purple-500' }
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                      <div className={`p-3 rounded-lg ${stat.color} text-white mr-4`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{stat.label}</p>
                        <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Today's Schedule */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">আজকের সময়সূচী</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {getFilteredAppointments().slice(0, 5).map((appointment) => (
                    <div key={appointment.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{appointment.patientName}</h4>
                          <p className="text-sm text-gray-600">{appointment.time} • {appointment.duration} মিনিট</p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(appointment.status)}`}>
                            {appointment.status === 'scheduled' ? 'নির্ধারিত' :
                             appointment.status === 'confirmed' ? 'নিশ্চিত' :
                             appointment.status === 'completed' ? 'সম্পন্ন' :
                             appointment.status === 'cancelled' ? 'বাতিল' : 'অনুপস্থিত'}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                            <Video className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Patients */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">সাম্প্রতিক রোগী</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {patients.slice(0, 5).map((patient) => (
                    <div key={patient.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-500" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{patient.name}</h4>
                            <p className="text-sm text-gray-600">{patient.age} বছর • {patient.bloodGroup}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${getRiskColor(patient.riskLevel)}`}>
                          {patient.riskLevel === 'low' ? 'কম ঝুঁকি' :
                           patient.riskLevel === 'medium' ? 'মাঝারি ঝুঁকি' : 'উচ্চ ঝুঁকি'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Patients Tab */}
        {activeTab === 'patients' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="রোগীর নাম, ফোন বা ইমেইল দিয়ে খুঁজুন..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
                  />
                </div>
                <button className="flex items-center space-x-1 bg-medical-primary text-white px-4 py-2 rounded-lg hover:bg-medical-secondary transition-colors">
                  <Plus className="w-4 h-4" />
                  <span>নতুন রোগী</span>
                </button>
              </div>
            </div>

            {/* Patients Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredPatients().map((patient) => (
                <div key={patient.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-500" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{patient.name}</h3>
                          <p className="text-sm text-gray-600">{patient.age} বছর • {patient.gender === 'male' ? 'পুরুষ' : 'মহিলা'}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getRiskColor(patient.riskLevel)}`}>
                        {patient.riskLevel === 'low' ? 'কম ঝুঁকি' :
                         patient.riskLevel === 'medium' ? 'মাঝারি ঝুঁকি' : 'উচ্চ ঝুঁকি'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>{patient.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Heart className="w-4 h-4" />
                        <span>{patient.bloodGroup}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>শেষ ভিজিট: {formatDate(patient.lastVisit)}</span>
                      </div>
                    </div>
                    
                    {patient.medicalHistory.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-1">চিকিৎসা ইতিহাস:</p>
                        <div className="flex flex-wrap gap-1">
                          {patient.medicalHistory.slice(0, 2).map((condition, index) => (
                            <span key={index} className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded">
                              {condition}
                            </span>
                          ))}
                          {patient.medicalHistory.length > 2 && (
                            <span className="text-xs text-gray-500">+{patient.medicalHistory.length - 2}</span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedPatient(patient);
                          setShowPatientModal(true);
                        }}
                        className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        বিস্তারিত
                      </button>
                      <button
                        onClick={() => createPrescription(patient.id)}
                        className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700 transition-colors"
                      >
                        প্রেসক্রিপশন
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            {/* Date Filter */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  {[
                    { id: 'today', label: 'আজ' },
                    { id: 'tomorrow', label: 'আগামীকাল' },
                    { id: 'week', label: 'এই সপ্তাহ' },
                    { id: 'all', label: 'সব' }
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setDateFilter(filter.id)}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                        dateFilter === filter.id
                          ? 'bg-medical-primary text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
                <button className="flex items-center space-x-1 bg-medical-primary text-white px-4 py-2 rounded-lg hover:bg-medical-secondary transition-colors">
                  <Plus className="w-4 h-4" />
                  <span>নতুন অ্যাপয়েন্টমেন্ট</span>
                </button>
              </div>
            </div>

            {/* Appointments List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="divide-y divide-gray-200">
                {getFilteredAppointments().map((appointment) => (
                  <div key={appointment.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="font-medium text-gray-900">{appointment.patientName}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(appointment.status)}`}>
                            {appointment.status === 'scheduled' ? 'নির্ধারিত' :
                             appointment.status === 'confirmed' ? 'নিশ্চিত' :
                             appointment.status === 'completed' ? 'সম্পন্ন' :
                             appointment.status === 'cancelled' ? 'বাতিল' : 'অনুপস্থিত'}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-600 mb-2">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(appointment.date)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{appointment.time} ({appointment.duration} মিনিট)</span>
                          </div>
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {appointment.type === 'consultation' ? 'পরামর্শ' :
                             appointment.type === 'follow-up' ? 'ফলো-আপ' :
                             appointment.type === 'emergency' ? 'জরুরি' : 'টেলিমেডিসিন'}
                          </span>
                        </div>
                        
                        {appointment.symptoms && appointment.symptoms.length > 0 && (
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-xs text-gray-500">লক্ষণ:</span>
                            <div className="flex flex-wrap gap-1">
                              {appointment.symptoms.map((symptom, index) => (
                                <span key={index} className="bg-yellow-100 text-yellow-600 text-xs px-2 py-1 rounded">
                                  {symptom}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {appointment.status === 'scheduled' && (
                          <button
                            onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                          >
                            নিশ্চিত করুন
                          </button>
                        )}
                        {appointment.status === 'confirmed' && (
                          <button
                            onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                          >
                            সম্পন্ন
                          </button>
                        )}
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <Video className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Prescriptions Tab */}
        {activeTab === 'prescriptions' && (
          <div className="space-y-6">
            {/* Prescription Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">প্রেসক্রিপশন ম্যানেজমেন্ট</h2>
                  <p className="text-gray-600">রোগীদের জন্য প্রেসক্রিপশন তৈরি ও পরিচালনা করুন</p>
                </div>
                <button 
                  onClick={() => setShowPrescriptionModal(true)}
                  className="flex items-center space-x-2 bg-medical-primary text-white px-4 py-2 rounded-lg hover:bg-medical-secondary transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন প্রেসক্রিপশন</span>
                </button>
              </div>
            </div>

            {/* Prescription Templates */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">প্রেসক্রিপশন টেমপ্লেট</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {[
                  { name: 'সাধারণ জ্বর', medicines: ['প্যারাসিটামল', 'অ্যান্টিহিস্টামিন'], color: 'bg-blue-100 text-blue-600' },
                  { name: 'ডায়াবেটিস', medicines: ['মেটফরমিন', 'ইনসুলিন'], color: 'bg-green-100 text-green-600' },
                  { name: 'উচ্চ রক্তচাপ', medicines: ['এমলোডিপিন', 'লসার্টান'], color: 'bg-red-100 text-red-600' },
                  { name: 'অ্যাজমা', medicines: ['ইনহেলার', 'মন্টেলুকাস্ট'], color: 'bg-purple-100 text-purple-600' }
                ].map((template, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-3 ${template.color}`}>
                      {template.name}
                    </div>
                    <div className="space-y-1">
                      {template.medicines.map((medicine, idx) => (
                        <div key={idx} className="text-sm text-gray-600 flex items-center space-x-2">
                          <Pill className="w-3 h-3" />
                          <span>{medicine}</span>
                        </div>
                      ))}
                    </div>
                    <button className="mt-3 w-full bg-gray-100 text-gray-700 py-2 rounded text-sm hover:bg-gray-200 transition-colors">
                      ব্যবহার করুন
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Prescriptions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">সাম্প্রতিক প্রেসক্রিপশন</h3>
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <Filter className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {[
                  {
                    id: 'P001',
                    patientName: 'রহিমা খাতুন',
                    date: '২০২৪-০১-১৫',
                    diagnosis: 'সাধারণ জ্বর ও মাথাব্যথা',
                    medicines: ['প্যারাসিটামল ৫০০mg', 'অ্যান্টিহিস্টামিন'],
                    status: 'active'
                  },
                  {
                    id: 'P002',
                    patientName: 'করিম উদ্দিন',
                    date: '২০২৪-০১-২০',
                    diagnosis: 'অ্যাজমা নিয়ন্ত্রণ',
                    medicines: ['ইনহেলার', 'মন্টেলুকাস্ট ১০mg'],
                    status: 'completed'
                  }
                ].map((prescription, index) => (
                  <div key={index} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">{prescription.patientName}</h4>
                          <span className="text-sm text-gray-500">#{prescription.id}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            prescription.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {prescription.status === 'active' ? 'সক্রিয়' : 'সম্পন্ন'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{prescription.diagnosis}</p>
                        <div className="flex flex-wrap gap-2">
                          {prescription.medicines.map((medicine, idx) => (
                            <span key={idx} className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded">
                              {medicine}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">তারিখ: {prescription.date}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="দেখুন">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-green-600 transition-colors" title="ডাউনলোড">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-yellow-600 transition-colors" title="সম্পাদনা">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Reports Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">রিপোর্ট ও বিশ্লেষণ</h2>
                  <p className="text-gray-600">আপনার প্র্যাকটিসের পারফরম্যান্স ও পরিসংখ্যান দেখুন</p>
                </div>
                <div className="flex space-x-2">
                  <button className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                    <Download className="w-4 h-4" />
                    <span>PDF এক্সপোর্ট</span>
                  </button>
                  <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <BarChart3 className="w-4 h-4" />
                    <span>Excel এক্সপোর্ট</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { 
                  title: 'মোট রোগী', 
                  value: '১২৫', 
                  change: '+১২%', 
                  trend: 'up', 
                  icon: Users, 
                  color: 'bg-blue-500',
                  bgColor: 'bg-blue-50'
                },
                { 
                  title: 'মাসিক অ্যাপয়েন্টমেন্ট', 
                  value: '৮৯', 
                  change: '+৮%', 
                  trend: 'up', 
                  icon: Calendar, 
                  color: 'bg-green-500',
                  bgColor: 'bg-green-50'
                },
                { 
                  title: 'মাসিক আয়', 
                  value: '৳৪৫,০০০', 
                  change: '+১৫%', 
                  trend: 'up', 
                  icon: BarChart3, 
                  color: 'bg-purple-500',
                  bgColor: 'bg-purple-50'
                },
                { 
                  title: 'রোগী সন্তুষ্টি', 
                  value: '৪.৮/৫', 
                  change: '+০.২', 
                  trend: 'up', 
                  icon: Star, 
                  color: 'bg-yellow-500',
                  bgColor: 'bg-yellow-50'
                }
              ].map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <div key={index} className={`${metric.bgColor} rounded-lg p-6 border border-gray-200`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg ${metric.color} text-white`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={`text-sm font-medium ${
                        metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {metric.change}
                      </span>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
                      <p className="text-sm text-gray-600">{metric.title}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Revenue Chart */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">মাসিক আয়ের চার্ট</h3>
                </div>
                <div className="p-6">
                  <div className="h-64 flex items-end justify-between space-x-2">
                    {[
                      { month: 'জান', amount: 35000, height: '60%' },
                      { month: 'ফেব', amount: 42000, height: '72%' },
                      { month: 'মার', amount: 38000, height: '65%' },
                      { month: 'এপ্র', amount: 45000, height: '77%' },
                      { month: 'মে', amount: 52000, height: '89%' },
                      { month: 'জুন', amount: 48000, height: '82%' }
                    ].map((data, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg mb-2 transition-all duration-300 hover:from-blue-600 hover:to-blue-400"
                          style={{ height: data.height }}
                          title={`৳${data.amount.toLocaleString()}`}
                        ></div>
                        <span className="text-xs text-gray-600">{data.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Patient Demographics */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">রোগীর ধরন অনুযায়ী বিশ্লেষণ</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {[
                      { condition: 'ডায়াবেটিস', patients: 45, percentage: 36, color: 'bg-red-500' },
                      { condition: 'উচ্চ রক্তচাপ', patients: 38, percentage: 30, color: 'bg-orange-500' },
                      { condition: 'হৃদরোগ', patients: 25, percentage: 20, color: 'bg-purple-500' },
                      { condition: 'অ্যাজমা', patients: 17, percentage: 14, color: 'bg-blue-500' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded ${item.color}`}></div>
                          <span className="text-sm font-medium text-gray-900">{item.condition}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${item.color}`}
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-12 text-right">{item.patients} জন</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Reports */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">বিস্তারিত রিপোর্ট</h3>
                  <div className="flex space-x-2">
                    <select className="border border-gray-300 rounded px-3 py-1 text-sm">
                      <option>এই মাস</option>
                      <option>গত মাস</option>
                      <option>গত ৩ মাস</option>
                      <option>এই বছর</option>
                    </select>
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">তারিখ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">অ্যাপয়েন্টমেন্ট</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">নতুন রোগী</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">আয়</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[
                      { date: '২০২৪-০১-১৫', appointments: 12, newPatients: 3, revenue: 6000, status: 'সম্পন্ন' },
                      { date: '২০২৪-০১-১৬', appointments: 15, newPatients: 5, revenue: 7500, status: 'সম্পন্ন' },
                      { date: '২০২৪-০১-১৭', appointments: 10, newPatients: 2, revenue: 5000, status: 'সম্পন্ন' },
                      { date: '২০২৪-০১-১৮', appointments: 18, newPatients: 7, revenue: 9000, status: 'চলমান' }
                    ].map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.appointments}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.newPatients}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">৳{row.revenue.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            row.status === 'সম্পন্ন' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'communication' && (
          <div className="space-y-6">
            {/* Communication Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">যোগাযোগ কেন্দ্র</h2>
                  <p className="text-gray-600">রোগীদের সাথে যোগাযোগ ও নোটিফিকেশন পরিচালনা করুন</p>
                </div>
                <div className="flex space-x-2">
                  <button className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span>নতুন বার্তা</span>
                  </button>
                  <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <Bell className="w-4 h-4" />
                    <span>রিমাইন্ডার পাঠান</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Communication Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { title: 'আজকের বার্তা', value: '২৪', icon: MessageCircle, color: 'bg-blue-500', bgColor: 'bg-blue-50' },
                { title: 'পেন্ডিং রিমাইন্ডার', value: '৮', icon: Bell, color: 'bg-yellow-500', bgColor: 'bg-yellow-50' },
                { title: 'ভিডিও কল', value: '৫', icon: Video, color: 'bg-green-500', bgColor: 'bg-green-50' },
                { title: 'ইমেইল পাঠানো', value: '১২', icon: Mail, color: 'bg-purple-500', bgColor: 'bg-purple-50' }
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className={`${stat.bgColor} rounded-lg p-6 border border-gray-200`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                      <p className="text-sm text-gray-600">{stat.title}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Communication Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'messages', label: 'বার্তা', icon: MessageCircle },
                    { id: 'reminders', label: 'রিমাইন্ডার', icon: Bell },
                    { id: 'templates', label: 'টেমপ্লেট', icon: FileText },
                    { id: 'video-calls', label: 'ভিডিও কল', icon: Video }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        className="flex items-center space-x-2 py-4 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors"
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Messages Section */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Message List */}
                  <div className="lg:col-span-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">সাম্প্রতিক বার্তা</h3>
                    <div className="space-y-3">
                      {[
                        {
                          patient: 'রহিমা খাতুন',
                          message: 'ডাক্তার সাহেব, আমার ওষুধ শেষ হয়ে গেছে...',
                          time: '১০ মিনিট আগে',
                          unread: true
                        },
                        {
                          patient: 'করিম উদ্দিন',
                          message: 'আগামীকালের অ্যাপয়েন্টমেন্ট কনফার্ম করছি',
                          time: '৩০ মিনিট আগে',
                          unread: false
                        },
                        {
                          patient: 'ফাতেমা বেগম',
                          message: 'রিপোর্টের ফলাফল কেমন?',
                          time: '১ ঘন্টা আগে',
                          unread: true
                        }
                      ].map((msg, index) => (
                        <div key={index} className={`p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors ${
                          msg.unread ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{msg.patient}</h4>
                            {msg.unread && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                          </div>
                          <p className="text-sm text-gray-600 mb-1 truncate">{msg.message}</p>
                          <p className="text-xs text-gray-500">{msg.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Message Templates */}
                  <div className="lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">বার্তা টেমপ্লেট</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        {
                          title: 'অ্যাপয়েন্টমেন্ট রিমাইন্ডার',
                          content: 'আগামীকাল আপনার অ্যাপয়েন্টমেন্ট রয়েছে। সময়মতো আসবেন।',
                          type: 'reminder',
                          color: 'bg-blue-100 text-blue-600'
                        },
                        {
                          title: 'ওষুধ সেবনের নির্দেশনা',
                          content: 'নির্ধারিত সময়ে ওষুধ সেবন করুন। কোনো সমস্যা হলে জানান।',
                          type: 'medication',
                          color: 'bg-green-100 text-green-600'
                        },
                        {
                          title: 'রিপোর্ট প্রস্তুত',
                          content: 'আপনার টেস্ট রিপোর্ট প্রস্তুত। ক্লিনিক থেকে নিয়ে যেতে পারেন।',
                          type: 'report',
                          color: 'bg-purple-100 text-purple-600'
                        },
                        {
                          title: 'ফলো-আপ প্রয়োজন',
                          content: 'আপনার চিকিৎসার অগ্রগতি দেখার জন্য ফলো-আপ প্রয়োজন।',
                          type: 'followup',
                          color: 'bg-yellow-100 text-yellow-600'
                        }
                      ].map((template, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-3 ${template.color}`}>
                            {template.title}
                          </div>
                          <p className="text-sm text-gray-600 mb-4">{template.content}</p>
                          <div className="flex space-x-2">
                            <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors">
                              ব্যবহার করুন
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Appointment Reminders */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">অ্যাপয়েন্টমেন্ট রিমাইন্ডার</h3>
                  <button className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                    <Bell className="w-4 h-4" />
                    <span>সব রোগীকে রিমাইন্ডার পাঠান</span>
                  </button>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {[
                  {
                    patient: 'রহিমা খাতুন',
                    appointment: 'আগামীকাল ১০:০০ AM',
                    phone: '01712345678',
                    status: 'pending',
                    lastSent: 'এখনো পাঠানো হয়নি'
                  },
                  {
                    patient: 'করিম উদ্দিন',
                    appointment: 'আগামীকাল ১১:৩০ AM',
                    phone: '01887654321',
                    status: 'sent',
                    lastSent: '২ ঘন্টা আগে'
                  }
                ].map((reminder, index) => (
                  <div key={index} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">{reminder.patient}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            reminder.status === 'sent' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                          }`}>
                            {reminder.status === 'sent' ? 'পাঠানো হয়েছে' : 'অপেক্ষমাণ'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{reminder.appointment}</p>
                        <p className="text-sm text-gray-500">{reminder.phone} • {reminder.lastSent}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-2 text-gray-400 hover:text-green-600 transition-colors" title="SMS পাঠান">
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="কল করুন">
                          <Phone className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors" title="ইমেইল পাঠান">
                          <Mail className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <ContentManagementSystem />
        )}

        {/* AI Prescription Tab */}
        {activeTab === 'ai-prescription' && (
          <div className="space-y-6">
            <AIPrescriptionSystem />
          </div>
        )}

        {/* Prescription Processor Tab */}
        {activeTab === 'prescription-processor' && (
          <div className="space-y-6">
            <PrescriptionProcessor />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Settings Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">সেটিংস</h2>
                  <p className="text-gray-600">আপনার প্রোফাইল ও অ্যাকাউন্ট সেটিংস পরিচালনা করুন</p>
                </div>
                <button className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>পরিবর্তন সংরক্ষণ</span>
                </button>
              </div>
            </div>

            {/* Settings Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'profile', label: 'প্রোফাইল', icon: User },
                    { id: 'clinic', label: 'ক্লিনিক তথ্য', icon: MapPin },
                    { id: 'schedule', label: 'সময়সূচী', icon: Clock },
                    { id: 'notifications', label: 'নোটিফিকেশন', icon: Bell },
                    { id: 'security', label: 'নিরাপত্তা', icon: Settings }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        className="flex items-center space-x-2 py-4 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors"
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Profile Settings */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">ব্যক্তিগত তথ্য</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-10 h-10 text-gray-500" />
                        </div>
                        <div>
                          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                            ছবি আপলোড করুন
                          </button>
                          <p className="text-xs text-gray-500 mt-1">JPG, PNG ফরম্যাট, সর্বোচ্চ ২MB</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">পূর্ণ নাম</label>
                          <input
                            type="text"
                            defaultValue={doctorProfile?.fullName || 'ডাঃ মোহাম্মদ রহিম'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">ইমেইল</label>
                          <input
                            type="email"
                            defaultValue={doctorProfile?.email || 'doctor@test.com'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">ফোন নম্বর</label>
                          <input
                            type="tel"
                            defaultValue={doctorProfile?.phone || '01712345678'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">BMDC নম্বর</label>
                          <input
                            type="text"
                            defaultValue={doctorProfile?.bmdcNumber || '12345'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">বিশেষত্ব</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary">
                          <option>কার্ডিওলজি</option>
                          <option>নিউরোলজি</option>
                          <option>অর্থোপেডিক্স</option>
                          <option>গাইনোকোলজি</option>
                          <option>পেডিয়াট্রিক্স</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">অভিজ্ঞতা</label>
                        <input
                          type="text"
                          defaultValue={doctorProfile?.experience || '১০ বছর'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">যোগ্যতা</label>
                        <textarea
                          defaultValue={doctorProfile?.qualification || 'MBBS, MD (কার্ডিওলজি)'}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Clinic Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">ক্লিনিক/চেম্বার তথ্য</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ক্লিনিক/হাসপাতালের নাম</label>
                        <input
                          type="text"
                          defaultValue={doctorProfile?.workplace || 'ঢাকা মেডিকেল কলেজ হাসপাতাল'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ঠিকানা</label>
                        <textarea
                          defaultValue={doctorProfile?.workplaceAddress || 'বকশীবাজার, ঢাকা-১০০০'}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">পরামর্শ ফি</label>
                        <input
                          type="text"
                          defaultValue={doctorProfile?.consultationFee || '৫০০ টাকা'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">চেম্বারের ধরন</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary">
                          <option>ব্যক্তিগত চেম্বার</option>
                          <option>হাসপাতাল</option>
                          <option>ক্লিনিক</option>
                          <option>ডায়াগনস্টিক সেন্টার</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Appointment Schedule */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">অ্যাপয়েন্টমেন্ট সময়সূচী</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { day: 'রবিবার', time: '৯:০০ AM - ৫:০০ PM', active: true },
                      { day: 'সোমবার', time: '৯:০০ AM - ৫:০০ PM', active: true },
                      { day: 'মঙ্গলবার', time: '৯:০০ AM - ৫:০০ PM', active: true },
                      { day: 'বুধবার', time: '৯:০০ AM - ৫:০০ PM', active: true },
                      { day: 'বৃহস্পতিবার', time: '৯:০০ AM - ৫:০০ PM', active: true },
                      { day: 'শুক্রবার', time: 'বন্ধ', active: false },
                      { day: 'শনিবার', time: '১০:০০ AM - ২:০০ PM', active: true }
                    ].map((schedule, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{schedule.day}</h4>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked={schedule.active} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        <input
                          type="text"
                          defaultValue={schedule.time}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-medical-primary"
                          disabled={!schedule.active}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notification Preferences */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">নোটিফিকেশন সেটিংস</h3>
                  <div className="space-y-4">
                    {[
                      { title: 'নতুন অ্যাপয়েন্টমেন্ট', description: 'নতুন অ্যাপয়েন্টমেন্ট বুকিং এর জন্য নোটিফিকেশন', enabled: true },
                      { title: 'অ্যাপয়েন্টমেন্ট রিমাইন্ডার', description: 'আগামীকালের অ্যাপয়েন্টমেন্ট এর রিমাইন্ডার', enabled: true },
                      { title: 'রোগীর বার্তা', description: 'রোগীদের থেকে আসা নতুন বার্তার নোটিফিকেশন', enabled: true },
                      { title: 'পেমেন্ট আপডেট', description: 'পেমেন্ট সংক্রান্ত আপডেট', enabled: false },
                      { title: 'সিস্টেম আপডেট', description: 'সিস্টেম ও ফিচার আপডেট', enabled: true }
                    ].map((notification, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{notification.title}</h4>
                          <p className="text-sm text-gray-600">{notification.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked={notification.enabled} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Security Settings */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">নিরাপত্তা সেটিংস</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">বর্তমান পাসওয়ার্ড</label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">নতুন পাসওয়ার্ড</label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">পাসওয়ার্ড নিশ্চিত করুন</label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-primary"
                        />
                      </div>
                      <button className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors">
                        পাসওয়ার্ড পরিবর্তন করুন
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">দুই-ধাপ যাচাইকরণ</h4>
                        <p className="text-sm text-gray-600 mb-3">অতিরিক্ত নিরাপত্তার জন্য দুই-ধাপ যাচাইকরণ চালু করুন</p>
                        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
                          চালু করুন
                        </button>
                      </div>
                      
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">লগইন হিস্টরি</h4>
                        <p className="text-sm text-gray-600 mb-3">সাম্প্রতিক লগইন কার্যক্রম দেখুন</p>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                          দেখুন
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Patient Details Modal */}
      {showPatientModal && selectedPatient && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowPatientModal(false)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">রোগীর বিস্তারিত তথ্য</h2>
                <button
                  onClick={() => setShowPatientModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Patient Info */}
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{selectedPatient.name}</h3>
                    <p className="text-gray-600">{selectedPatient.age} বছর • {selectedPatient.gender === 'male' ? 'পুরুষ' : 'মহিলা'}</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${getRiskColor(selectedPatient.riskLevel)}`}>
                      {selectedPatient.riskLevel === 'low' ? 'কম ঝুঁকি' :
                       selectedPatient.riskLevel === 'medium' ? 'মাঝারি ঝুঁকি' : 'উচ্চ ঝুঁকি'}
                    </span>
                  </div>
                </div>
                
                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ফোন</label>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{selectedPatient.phone}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ইমেইল</label>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{selectedPatient.email}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ঠিকানা</label>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{selectedPatient.address}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">রক্তের গ্রুপ</label>
                    <div className="flex items-center space-x-2">
                      <Heart className="w-4 h-4 text-gray-400" />
                      <span>{selectedPatient.bloodGroup}</span>
                    </div>
                  </div>
                </div>
                
                {/* Medical History */}
                {selectedPatient.medicalHistory.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">চিকিৎসা ইতিহাস</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedPatient.medicalHistory.map((condition, index) => (
                        <span key={index} className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm">
                          {condition}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Allergies */}
                {selectedPatient.allergies.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">অ্যালার্জি</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedPatient.allergies.map((allergy, index) => (
                        <span key={index} className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-sm">
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Current Medications */}
                {selectedPatient.currentMedications.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">বর্তমান ওষুধ</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedPatient.currentMedications.map((medication, index) => (
                        <span key={index} className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
                          {medication}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 p-4 border-t border-gray-200">
                <button
                  onClick={() => setShowPatientModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  বন্ধ করুন
                </button>
                <button className="bg-medical-primary text-white px-4 py-2 rounded-lg hover:bg-medical-secondary transition-colors">
                  সম্পাদনা করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Panel */}
      {showNotificationPanel && (
        <div className="fixed top-16 right-4 z-50 w-80">
          <NotificationPanel onClose={() => setShowNotificationPanel(false)} />
        </div>
      )}
      
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <LogOut className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">লগআউট নিশ্চিতকরণ</h3>
                <p className="text-sm text-gray-500">আপনি কি নিশ্চিত যে আপনি লগআউট করতে চান?</p>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>সতর্কতা:</strong> লগআউট করলে আপনার সকল unsaved কাজ হারিয়ে যাবে।
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={cancelLogout}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                বাতিল
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>লগআউট</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;