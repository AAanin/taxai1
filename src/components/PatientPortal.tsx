// Patient Portal - রোগীর সম্পূর্ণ ড্যাশবোর্ড
import React, { useState, useEffect } from 'react';
import {
  User, Calendar, FileText, Pill, Activity, Heart, Phone,
  Mail, MapPin, Edit, Download, Upload, Bell, Settings,
  Clock, AlertTriangle, CheckCircle, Star, Plus, Search,
  Filter, RefreshCw, Eye, Trash2, Share2, BookOpen
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

// Types
interface PatientProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  bloodGroup: string;
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  insurance?: {
    provider: string;
    policyNumber: string;
    validUntil: Date;
  };
  preferences: {
    language: 'bn' | 'en';
    notifications: {
      email: boolean;
      sms: boolean;
      whatsapp: boolean;
    };
  };
}

interface MedicalRecord {
  id: string;
  date: Date;
  type: 'consultation' | 'test' | 'prescription' | 'vaccination' | 'surgery';
  doctor: {
    name: string;
    specialization: string;
    hospital: string;
  };
  diagnosis?: string;
  symptoms: string[];
  treatment: string;
  medications?: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
  testResults?: {
    name: string;
    value: string;
    normalRange: string;
    status: 'normal' | 'abnormal' | 'critical';
  }[];
  documents: {
    name: string;
    type: 'prescription' | 'report' | 'image' | 'document';
    url: string;
    uploadDate: Date;
  }[];
  followUp?: {
    date: Date;
    notes: string;
  };
}

interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  specialization: string;
  hospital: string;
  date: Date;
  time: string;
  duration: number;
  type: 'consultation' | 'follow-up' | 'telemedicine' | 'emergency';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  symptoms?: string[];
  notes?: string;
  fee: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
}

interface Medication {
  id: string;
  name: string;
  genericName: string;
  dosage: string;
  frequency: string;
  duration: string;
  startDate: Date;
  endDate: Date;
  prescribedBy: string;
  instructions: string;
  sideEffects: string[];
  status: 'active' | 'completed' | 'discontinued';
  reminders: {
    enabled: boolean;
    times: string[];
    method: 'notification' | 'sms' | 'whatsapp';
  };
}

interface HealthMetric {
  id: string;
  type: 'weight' | 'height' | 'bp' | 'sugar' | 'temperature' | 'pulse' | 'oxygen';
  value: string;
  unit: string;
  date: Date;
  notes?: string;
  recordedBy: 'self' | 'doctor' | 'device';
  status: 'normal' | 'abnormal' | 'critical';
}

const PatientPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'appointments' | 'medical-records' | 'medications' | 'health-metrics' | 'documents' | 'family' | 'insurance'>('dashboard');
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAddMetric, setShowAddMetric] = useState(false);
  
  const { user, userInfo } = useAuth();
  const { showNotification } = useNotification();

  // Initialize patient data
  useEffect(() => {
    if (user && userInfo) {
      // Load patient profile from userInfo
      const profile: PatientProfile = {
        id: user.uid,
        name: userInfo.name || user.displayName || 'নাম নেই',
        email: user.email || '',
        phone: userInfo.phone || '',
        dateOfBirth: userInfo.dateOfBirth ? new Date(userInfo.dateOfBirth) : new Date(),
        gender: userInfo.gender || 'male',
        bloodGroup: userInfo.bloodGroup || '',
        address: userInfo.address || '',
        emergencyContact: {
          name: userInfo.emergencyContact?.name || '',
          phone: userInfo.emergencyContact?.phone || '',
          relation: userInfo.emergencyContact?.relation || ''
        },
        preferences: {
          language: 'bn',
          notifications: {
            email: true,
            sms: true,
            whatsapp: true
          }
        }
      };
      setPatientProfile(profile);
      
      // Load sample data
      loadSampleData();
    }
  }, [user, userInfo]);

  const loadSampleData = () => {
    // Sample medical records
    const sampleRecords: MedicalRecord[] = [
      {
        id: '1',
        date: new Date('2024-01-15'),
        type: 'consultation',
        doctor: {
          name: 'ডা. আহমেদ হাসান',
          specialization: 'কার্ডিওলজি',
          hospital: 'ঢাকা মেডিকেল কলেজ হাসপাতাল'
        },
        diagnosis: 'উচ্চ রক্তচাপ',
        symptoms: ['মাথাব্যথা', 'বুক ধড়ফড়', 'শ্বাসকষ্ট'],
        treatment: 'ওষুধ ও জীবনযাত্রার পরিবর্তন',
        medications: [
          {
            name: 'এমলোডিপিন',
            dosage: '৫ মিগ্রা',
            frequency: 'দিনে ১ বার',
            duration: '৩ মাস'
          }
        ],
        documents: [
          {
            name: 'প্রেসক্রিপশন',
            type: 'prescription',
            url: '/documents/prescription-1.pdf',
            uploadDate: new Date('2024-01-15')
          }
        ],
        followUp: {
          date: new Date('2024-02-15'),
          notes: 'রক্তচাপ পরীক্ষা করতে হবে'
        }
      }
    ];

    // Sample appointments
    const sampleAppointments: Appointment[] = [
      {
        id: '1',
        doctorId: 'doc1',
        doctorName: 'ডা. ফাতেমা খান',
        specialization: 'গাইনোকোলজি',
        hospital: 'বারডেম হাসপাতাল',
        date: new Date('2024-02-20'),
        time: '10:00',
        duration: 30,
        type: 'consultation',
        status: 'scheduled',
        symptoms: ['পেটে ব্যথা'],
        fee: 800,
        paymentStatus: 'pending'
      }
    ];

    // Sample medications
    const sampleMedications: Medication[] = [
      {
        id: '1',
        name: 'এমলোডিপিন',
        genericName: 'Amlodipine',
        dosage: '৫ মিগ্রা',
        frequency: 'দিনে ১ বার',
        duration: '৩ মাস',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-04-15'),
        prescribedBy: 'ডা. আহমেদ হাসান',
        instructions: 'খাবারের পর সেবন করুন',
        sideEffects: ['মাথা ঘোরা', 'পা ফোলা'],
        status: 'active',
        reminders: {
          enabled: true,
          times: ['08:00'],
          method: 'notification'
        }
      }
    ];

    // Sample health metrics
    const sampleMetrics: HealthMetric[] = [
      {
        id: '1',
        type: 'bp',
        value: '140/90',
        unit: 'mmHg',
        date: new Date('2024-01-20'),
        recordedBy: 'self',
        status: 'abnormal'
      },
      {
        id: '2',
        type: 'weight',
        value: '70',
        unit: 'kg',
        date: new Date('2024-01-20'),
        recordedBy: 'self',
        status: 'normal'
      }
    ];

    setMedicalRecords(sampleRecords);
    setAppointments(sampleAppointments);
    setMedications(sampleMedications);
    setHealthMetrics(sampleMetrics);
  };

  // Dashboard stats calculation
  const getDashboardStats = () => {
    const upcomingAppointments = appointments.filter(apt => 
      apt.date > new Date() && apt.status === 'scheduled'
    ).length;
    
    const activeMedications = medications.filter(med => 
      med.status === 'active'
    ).length;
    
    const criticalMetrics = healthMetrics.filter(metric => 
      metric.status === 'critical'
    ).length;
    
    const recentRecords = medicalRecords.filter(record => 
      (new Date().getTime() - record.date.getTime()) / (1000 * 60 * 60 * 24) <= 30
    ).length;

    return {
      upcomingAppointments,
      activeMedications,
      criticalMetrics,
      recentRecords
    };
  };

  const stats = getDashboardStats();

  // Render dashboard overview
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">আসন্ন অ্যাপয়েন্টমেন্ট</p>
              <p className="text-2xl font-bold text-blue-800">{stats.upcomingAppointments}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">চলমান ওষুধ</p>
              <p className="text-2xl font-bold text-green-800">{stats.activeMedications}</p>
            </div>
            <Pill className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">গুরুত্বপূর্ণ সূচক</p>
              <p className="text-2xl font-bold text-red-800">{stats.criticalMetrics}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">সাম্প্রতিক রেকর্ড</p>
              <p className="text-2xl font-bold text-purple-800">{stats.recentRecords}</p>
            </div>
            <FileText className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">আসন্ন অ্যাপয়েন্টমেন্ট</h3>
            <button 
              onClick={() => setActiveTab('appointments')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              সব দেখুন
            </button>
          </div>
          <div className="space-y-3">
            {appointments.filter(apt => apt.date > new Date()).slice(0, 3).map(appointment => (
              <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{appointment.doctorName}</p>
                  <p className="text-sm text-gray-600">{appointment.specialization}</p>
                  <p className="text-sm text-gray-500">
                    {appointment.date.toLocaleDateString('bn-BD')} - {appointment.time}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {appointment.status === 'confirmed' ? 'নিশ্চিত' :
                     appointment.status === 'scheduled' ? 'নির্ধারিত' : appointment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Medications */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">চলমান ওষুধ</h3>
            <button 
              onClick={() => setActiveTab('medications')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              সব দেখুন
            </button>
          </div>
          <div className="space-y-3">
            {medications.filter(med => med.status === 'active').slice(0, 3).map(medication => (
              <div key={medication.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{medication.name}</p>
                  <p className="text-sm text-gray-600">{medication.dosage} - {medication.frequency}</p>
                  <p className="text-sm text-gray-500">শেষ: {medication.endDate.toLocaleDateString('bn-BD')}</p>
                </div>
                <div className="text-right">
                  {medication.reminders.enabled && (
                    <Bell className="w-4 h-4 text-blue-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Health Metrics Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">স্বাস্থ্য সূচক</h3>
          <button 
            onClick={() => setActiveTab('health-metrics')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            বিস্তারিত দেখুন
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {healthMetrics.slice(0, 4).map(metric => (
            <div key={metric.id} className="text-center p-3 bg-gray-50 rounded-lg">
              <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                metric.status === 'normal' ? 'bg-green-100' :
                metric.status === 'abnormal' ? 'bg-yellow-100' :
                'bg-red-100'
              }`}>
                <Activity className={`w-6 h-6 ${
                  metric.status === 'normal' ? 'text-green-600' :
                  metric.status === 'abnormal' ? 'text-yellow-600' :
                  'text-red-600'
                }`} />
              </div>
              <p className="text-sm font-medium text-gray-800">
                {metric.type === 'bp' ? 'রক্তচাপ' :
                 metric.type === 'weight' ? 'ওজন' :
                 metric.type === 'sugar' ? 'সুগার' :
                 metric.type === 'temperature' ? 'তাপমাত্রা' :
                 metric.type}
              </p>
              <p className="text-lg font-bold text-gray-900">{metric.value}</p>
              <p className="text-xs text-gray-500">{metric.unit}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Main render
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">রোগী পোর্টাল</h1>
                <p className="text-sm text-gray-600">{patientProfile?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: Activity },
              { id: 'profile', label: 'প্রোফাইল', icon: User },
              { id: 'appointments', label: 'অ্যাপয়েন্টমেন্ট', icon: Calendar },
              { id: 'medical-records', label: 'মেডিকেল রেকর্ড', icon: FileText },
              { id: 'medications', label: 'ওষুধ', icon: Pill },
              { id: 'health-metrics', label: 'স্বাস্থ্য সূচক', icon: Heart },
              { id: 'documents', label: 'ডকুমেন্ট', icon: Upload },
              { id: 'family', label: 'পরিবার', icon: User },
              { id: 'insurance', label: 'বীমা', icon: Shield }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'profile' && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">ব্যক্তিগত তথ্য</h2>
            <p className="text-gray-600">প্রোফাইল সম্পাদনা ফিচার শীঘ্রই আসছে...</p>
          </div>
        )}
        {/* Other tabs content will be implemented similarly */}
      </div>
    </div>
  );
};

export default PatientPortal;