// User Dashboard - ব্যবহারকারী ড্যাশবোর্ড
import React, { useState, useEffect } from 'react';
import { 
  Calendar, Heart, FileText, MessageCircle, Video, Bell, 
  Settings, User, Clock, MapPin, Star, Phone, Mail,
  Activity, TrendingUp, Shield, Download, Upload, 
  Pill, Stethoscope, Brain, Eye, Plus, Edit, Trash2,
  ChevronRight, AlertCircle, CheckCircle, X
} from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import langchainService from '../services/langchainService';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bloodGroup: string;
  address: string;
  emergencyContact: string;
  profilePicture?: string;
}

interface HealthRecord {
  id: string;
  date: Date;
  type: 'checkup' | 'prescription' | 'test-result' | 'vaccination' | 'surgery';
  title: string;
  description: string;
  doctor: string;
  hospital: string;
  attachments?: string[];
  medications?: string[];
  notes?: string;
}

interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: Date;
  time: string;
  duration: number;
  type: 'consultation' | 'follow-up' | 'telemedicine' | 'emergency';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  hospital: string;
  fee: number;
  symptoms?: string[];
  notes?: string;
}

interface Prescription {
  id: string;
  doctorName: string;
  date: Date;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[];
  diagnosis: string;
  followUpDate?: Date;
  notes?: string;
}

interface HealthMetric {
  id: string;
  type: 'blood-pressure' | 'weight' | 'blood-sugar' | 'heart-rate' | 'temperature';
  value: string;
  unit: string;
  date: Date;
  notes?: string;
}

const UserDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'health-records' | 'prescriptions' | 'health-tracking' | 'ai-health-assistant' | 'profile'>('overview');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [aiHealthInsights, setAiHealthInsights] = useState<string>('');
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showHealthMetricModal, setShowHealthMetricModal] = useState(false);
  const [newMetric, setNewMetric] = useState<Partial<HealthMetric>>({});
  
  const { showNotification } = useNotification();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
    generateAIHealthInsights();
  }, []);

  // Load user profile and health data
  const loadUserData = () => {
    // Mock user profile
    const mockProfile: UserProfile = {
      id: '1',
      name: 'আহমেদ হাসান',
      email: 'ahmed@email.com',
      phone: '01712345678',
      dateOfBirth: '1990-05-15',
      gender: 'male',
      bloodGroup: 'B+',
      address: 'ধানমন্ডি, ঢাকা',
      emergencyContact: '01798765432'
    };
    setUserProfile(mockProfile);

    // Mock appointments
    const mockAppointments: Appointment[] = [
      {
        id: '1',
        doctorId: '1',
        doctorName: 'ডা. রহিমা খাতুন',
        specialty: 'সাধারণ চিকিৎসক',
        date: new Date('2024-02-15'),
        time: '10:00',
        duration: 30,
        type: 'consultation',
        status: 'scheduled',
        hospital: 'ঢাকা মেডিকেল কলেজ হাসপাতাল',
        fee: 500,
        symptoms: ['মাথাব্যথা', 'জ্বর']
      },
      {
        id: '2',
        doctorId: '2',
        doctorName: 'ডা. করিম উদ্দিন',
        specialty: 'হৃদরোগ বিশেষজ্ঞ',
        date: new Date('2024-02-20'),
        time: '14:30',
        duration: 45,
        type: 'follow-up',
        status: 'confirmed',
        hospital: 'বারডেম হাসপাতাল',
        fee: 800
      }
    ];
    setAppointments(mockAppointments);

    // Mock health records
    const mockHealthRecords: HealthRecord[] = [
      {
        id: '1',
        date: new Date('2024-01-15'),
        type: 'checkup',
        title: 'বার্ষিক স্বাস্থ্য পরীক্ষা',
        description: 'সাধারণ স্বাস্থ্য পরীক্ষা সম্পন্ন',
        doctor: 'ডা. রহিমা খাতুন',
        hospital: 'ঢাকা মেডিকেল কলেজ হাসপাতাল',
        notes: 'সব কিছু স্বাভাবিক'
      },
      {
        id: '2',
        date: new Date('2024-01-10'),
        type: 'test-result',
        title: 'রক্ত পরীক্ষার রিপোর্ট',
        description: 'সম্পূর্ণ রক্ত পরীক্ষা (CBC)',
        doctor: 'ডা. করিম উদ্দিন',
        hospital: 'ল্যাব এইড',
        notes: 'হিমোগ্লোবিন কিছুটা কম'
      }
    ];
    setHealthRecords(mockHealthRecords);

    // Mock prescriptions
    const mockPrescriptions: Prescription[] = [
      {
        id: '1',
        doctorName: 'ডা. রহিমা খাতুন',
        date: new Date('2024-01-15'),
        medications: [
          {
            name: 'প্যারাসিটামল',
            dosage: '৫০০ মিগ্রা',
            frequency: 'দিনে ৩ বার',
            duration: '৫ দিন',
            instructions: 'খাবারের পরে'
          },
          {
            name: 'আইবুপ্রোফেন',
            dosage: '৪০০ মিগ্রা',
            frequency: 'দিনে ২ বার',
            duration: '৩ দিন',
            instructions: 'খাবারের সাথে'
          }
        ],
        diagnosis: 'ভাইরাল জ্বর',
        followUpDate: new Date('2024-01-22'),
        notes: 'প্রচুর পানি পান করুন'
      }
    ];
    setPrescriptions(mockPrescriptions);

    // Mock health metrics
    const mockMetrics: HealthMetric[] = [
      {
        id: '1',
        type: 'blood-pressure',
        value: '120/80',
        unit: 'mmHg',
        date: new Date('2024-01-15'),
        notes: 'স্বাভাবিক'
      },
      {
        id: '2',
        type: 'weight',
        value: '70',
        unit: 'kg',
        date: new Date('2024-01-15')
      },
      {
        id: '3',
        type: 'blood-sugar',
        value: '95',
        unit: 'mg/dL',
        date: new Date('2024-01-10'),
        notes: 'খালি পেটে'
      }
    ];
    setHealthMetrics(mockMetrics);
  };

  // Generate AI health insights
  const generateAIHealthInsights = async () => {
    setIsLoadingInsights(true);
    try {
      const healthData = {
        recentAppointments: appointments.length,
        healthRecords: healthRecords.length,
        prescriptions: prescriptions.length,
        lastCheckup: '১৫ জানুয়ারি, ২০২৪',
        upcomingAppointments: appointments.filter(a => a.date > new Date()).length
      };

      const insightPrompt = `ব্যবহারকারীর স্বাস্থ্য তথ্য বিশ্লেষণ:

- সাম্প্রতিক অ্যাপয়েন্টমেন্ট: ${healthData.recentAppointments}টি
- স্বাস্থ্য রেকর্ড: ${healthData.healthRecords}টি
- প্রেসক্রিপশন: ${healthData.prescriptions}টি
- শেষ চেকআপ: ${healthData.lastCheckup}
- আসন্ন অ্যাপয়েন্টমেন্ট: ${healthData.upcomingAppointments}টি

এই তথ্যের ভিত্তিতে ব্যবহারকারীর জন্য ব্যক্তিগতকৃত স্বাস্থ্য পরামর্শ, সতর্কতা এবং পরবর্তী পদক্ষেপের সুপারিশ প্রদান করুন। বাংলায় সহজ ভাষায় লিখুন।`;

      const insights = await langchainService.generateMedicalResponse(insightPrompt, 'bn');
      setAiHealthInsights(insights);
    } catch (error) {
      console.error('AI insights error:', error);
      setAiHealthInsights('AI স্বাস্থ্য পরামর্শ লোড করতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।');
    } finally {
      setIsLoadingInsights(false);
    }
  };

  // Add new health metric
  const addHealthMetric = () => {
    if (!newMetric.type || !newMetric.value) return;

    const metric: HealthMetric = {
      id: Date.now().toString(),
      type: newMetric.type as any,
      value: newMetric.value,
      unit: newMetric.unit || '',
      date: new Date(),
      notes: newMetric.notes
    };

    setHealthMetrics(prev => [metric, ...prev]);
    setNewMetric({});
    setShowHealthMetricModal(false);
    
    showNotification({
      type: 'success',
      title: 'সফল',
      message: 'স্বাস্থ্য মেট্রিক যোগ করা হয়েছে'
    });
  };

  // Get health metric icon
  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'blood-pressure': return Heart;
      case 'weight': return Activity;
      case 'blood-sugar': return TrendingUp;
      case 'heart-rate': return Heart;
      case 'temperature': return Activity;
      default: return Activity;
    }
  };

  // Get metric color
  const getMetricColor = (type: string) => {
    switch (type) {
      case 'blood-pressure': return 'text-brand-coral bg-medical-100';
      case 'weight': return 'text-brand-blue bg-primary-100';
      case 'blood-sugar': return 'text-brand-teal bg-accent-100';
      case 'heart-rate': return 'text-brand-navy bg-primary-100';
      case 'temperature': return 'text-brand-orange bg-secondary-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-primary-100 text-brand-blue';
      case 'confirmed': return 'bg-accent-100 text-brand-teal';
      case 'completed': return 'bg-gray-100 text-gray-600';
      case 'cancelled': return 'bg-medical-100 text-brand-coral';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const tabs = [
    { id: 'overview', label: 'ওভারভিউ', icon: Activity },
    { id: 'appointments', label: 'অ্যাপয়েন্টমেন্ট', icon: Calendar },
    { id: 'health-records', label: 'স্বাস্থ্য রেকর্ড', icon: FileText },
    { id: 'prescriptions', label: 'প্রেসক্রিপশন', icon: Pill },
    { id: 'health-tracking', label: 'স্বাস্থ্য ট্র্যাকিং', icon: TrendingUp },
    { id: 'ai-health-assistant', label: 'AI স্বাস্থ্য সহায়ক', icon: Brain },
    { id: 'profile', label: 'প্রোফাইল', icon: User }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Heart className="w-6 h-6 text-brand-coral" />
                <h1 className="text-xl font-semibold text-gray-900">আমার স্বাস্থ্য</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">2</span>
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-brand-blue to-brand-navy rounded-full flex items-center justify-center text-white font-medium">
                  {userProfile?.name ? userProfile.name.charAt(0) : 'ব'}
                </div>
                <span className="text-sm font-medium text-gray-700">{userProfile?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-brand-blue to-brand-navy text-white'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-brand-blue to-brand-navy rounded-lg p-6 text-white">
                  <h2 className="text-2xl font-bold mb-2">স্বাগতম, {userProfile?.name}!</h2>
                  <p className="text-primary-100">আপনার স্বাস্থ্য তথ্য এবং আসন্ন অ্যাপয়েন্টমেন্ট দেখুন</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-brand-blue" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">আসন্ন অ্যাপয়েন্টমেন্ট</p>
                        <p className="text-2xl font-bold text-gray-900">{appointments.filter(a => a.date > new Date()).length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-brand-teal" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">স্বাস্থ্য রেকর্ড</p>
                        <p className="text-2xl font-bold text-gray-900">{healthRecords.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                        <Pill className="w-6 h-6 text-brand-orange" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">প্রেসক্রিপশন</p>
                        <p className="text-2xl font-bold text-gray-900">{prescriptions.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                        <Activity className="w-6 h-6 text-brand-orange" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">স্বাস্থ্য মেট্রিক</p>
                        <p className="text-2xl font-bold text-gray-900">{healthMetrics.length}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activities */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Appointments */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">সাম্প্রতিক অ্যাপয়েন্টমেন্ট</h3>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {appointments.slice(0, 3).map((appointment) => (
                          <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{appointment.doctorName}</p>
                              <p className="text-sm text-gray-600">{appointment.specialty}</p>
                              <p className="text-sm text-gray-500">{formatDate(appointment.date)} - {appointment.time}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                              {appointment.status === 'scheduled' ? 'নির্ধারিত' : 
                               appointment.status === 'confirmed' ? 'নিশ্চিত' : 
                               appointment.status === 'completed' ? 'সম্পন্ন' : 'বাতিল'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* AI Health Insights */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center space-x-2">
                        <Brain className="w-5 h-5 text-brand-navy" />
                        <h3 className="text-lg font-semibold text-gray-900">AI স্বাস্থ্য পরামর্শ</h3>
                      </div>
                    </div>
                    <div className="p-6">
                      {isLoadingInsights ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        </div>
                      ) : (
                        <div className="prose prose-sm max-w-none">
                          <p className="text-gray-700 leading-relaxed">{aiHealthInsights}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appointments' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">আমার অ্যাপয়েন্টমেন্ট</h2>
                    <button className="bg-medical-primary text-white px-4 py-2 rounded-lg hover:bg-medical-secondary transition-colors flex items-center space-x-2">
                      <Plus className="w-4 h-4" />
                      <span>নতুন অ্যাপয়েন্টমেন্ট</span>
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <Stethoscope className="w-5 h-5 text-medical-primary" />
                              <h3 className="font-semibold text-gray-900">{appointment.doctorName}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                {appointment.status === 'scheduled' ? 'নির্ধারিত' : 
                                 appointment.status === 'confirmed' ? 'নিশ্চিত' : 
                                 appointment.status === 'completed' ? 'সম্পন্ন' : 'বাতিল'}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-1">{appointment.specialty}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(appointment.date)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{appointment.time}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-4 h-4" />
                                <span>{appointment.hospital}</span>
                              </div>
                            </div>
                            {appointment.symptoms && (
                              <div className="mt-2">
                                <p className="text-sm text-gray-600">লক্ষণ: {appointment.symptoms.join(', ')}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {appointment.type === 'telemedicine' && (
                              <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                <Video className="w-5 h-5" />
                              </button>
                            )}
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <MessageCircle className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                              <Edit className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'health-tracking' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-gray-900">স্বাস্থ্য ট্র্যাকিং</h2>
                      <button 
                        onClick={() => setShowHealthMetricModal(true)}
                        className="bg-medical-primary text-white px-4 py-2 rounded-lg hover:bg-medical-secondary transition-colors flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>নতুন মেট্রিক</span>
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {healthMetrics.map((metric) => {
                        const IconComponent = getMetricIcon(metric.type);
                        return (
                          <div key={metric.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getMetricColor(metric.type)}`}>
                                <IconComponent className="w-5 h-5" />
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-900">
                                  {metric.type === 'blood-pressure' ? 'রক্তচাপ' :
                                   metric.type === 'weight' ? 'ওজন' :
                                   metric.type === 'blood-sugar' ? 'রক্তের চিনি' :
                                   metric.type === 'heart-rate' ? 'হৃদস্পন্দন' :
                                   metric.type === 'temperature' ? 'তাপমাত্রা' : metric.type}
                                </h3>
                                <p className="text-sm text-gray-500">{formatDate(metric.date)}</p>
                              </div>
                            </div>
                            <div className="text-2xl font-bold text-gray-900 mb-1">
                              {metric.value} {metric.unit}
                            </div>
                            {metric.notes && (
                              <p className="text-sm text-gray-600">{metric.notes}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Add other tab contents here */}
          </div>
        </div>
      </div>

      {/* Health Metric Modal */}
      {showHealthMetricModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">নতুন স্বাস্থ্য মেট্রিক</h3>
              <button 
                onClick={() => setShowHealthMetricModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ধরন</label>
                <select 
                  value={newMetric.type || ''}
                  onChange={(e) => setNewMetric(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-medical-primary focus:border-transparent"
                >
                  <option value="">নির্বাচন করুন</option>
                  <option value="blood-pressure">রক্তচাপ</option>
                  <option value="weight">ওজন</option>
                  <option value="blood-sugar">রক্তের চিনি</option>
                  <option value="heart-rate">হৃদস্পন্দন</option>
                  <option value="temperature">তাপমাত্রা</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">মান</label>
                <input 
                  type="text"
                  value={newMetric.value || ''}
                  onChange={(e) => setNewMetric(prev => ({ ...prev, value: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-medical-primary focus:border-transparent"
                  placeholder="যেমন: 120/80, 70, 95"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">একক</label>
                <input 
                  type="text"
                  value={newMetric.unit || ''}
                  onChange={(e) => setNewMetric(prev => ({ ...prev, unit: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-medical-primary focus:border-transparent"
                  placeholder="যেমন: mmHg, kg, mg/dL"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">নোট (ঐচ্ছিক)</label>
                <textarea 
                  value={newMetric.notes || ''}
                  onChange={(e) => setNewMetric(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-medical-primary focus:border-transparent"
                  rows={3}
                  placeholder="অতিরিক্ত তথ্য..."
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button 
                onClick={() => setShowHealthMetricModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                বাতিল
              </button>
              <button 
                onClick={addHealthMetric}
                className="bg-medical-primary text-white px-4 py-2 rounded-lg hover:bg-medical-secondary transition-colors"
              >
                যোগ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;