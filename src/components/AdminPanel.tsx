// React এবং প্রয়োজনীয় hooks ইমপোর্ট
import React, { useState, useEffect } from 'react';
// Lucide React থেকে বিভিন্ন আইকন ইমপোর্ট - অ্যাডমিন প্যানেলের UI এর জন্য
import { Settings, Users, MessageSquare, Package, UserCheck, Pill, Plus, BarChart3, Shield, Lock, UserPlus, Key, Clock, Database, Globe, Building2, Stethoscope, UserCog, Bot, FileText, Activity, HardDrive, AlertCircle } from 'lucide-react';
// অ্যাডমিন প্যানেলের অ্যানিমেশন স্টাইল
import '../styles/admin-animations.css';
// ব্যবহারকারী রিপোর্ট কম্পোনেন্ট
import UserReports from './UserReports';
// WhatsApp নোটিফিকেশন কম্পোনেন্ট
import WhatsAppNotification from './WhatsAppNotification';
// ওষুধের ব্র্যান্ড ম্যানেজমেন্ট কম্পোনেন্ট
import MedicineBrandManagement from './MedicineBrandManagement';
// ডাক্তারের বিভাগ ম্যানেজমেন্ট কম্পোনেন্ট
import DoctorCategoryManagement from './DoctorCategoryManagement';
// হাসপাতাল ম্যানেজমেন্ট কম্পোনেন্ট
import HospitalManagement from './HospitalManagement';
// ওষুধ ম্যানেজমেন্ট কম্পোনেন্ট
import MedicineManagement from './MedicineManagement';
// ডাক্তার ম্যানেজমেন্ট কম্পোনেন্ট
import DoctorManagement from './DoctorManagement';
// ব্যবহারকারী ম্যানেজমেন্ট কম্পোনেন্ট
import UserManagement from './UserManagement';
// AI এজেন্ট ম্যানেজমেন্ট কম্পোনেন্ট
import AIAgentManagement from './AIAgentManagement';
// AI এজেন্ট লগ কম্পোনেন্ট
import AIAgentLogs from './AIAgentLogs';
// AI এজেন্ট স্ট্যাটাস ম্যানেজার কম্পোনেন্ট
import AIAgentStatusManager from './AIAgentStatusManager';
// AI এজেন্ট ব্যাকআপ ও রিকভারি কম্পোনেন্ট
import AIAgentBackupRecovery from './AIAgentBackupRecovery';
// প্রম্পট ম্যানেজমেন্ট কম্পোনেন্ট
import PromptManagement from './PromptManagement';

// API কী সেটআপ কম্পোনেন্ট
import ApiKeySetup from './ApiKeySetup';
// LangChain AI সেবা
import langchainService from '../services/langchainService';

// অ্যাডমিন প্যানেল কম্পোনেন্টের props ইন্টারফেস
interface AdminPanelProps {
  onClose: () => void; // প্যানেল বন্ধ করার ফাংশন
}

// অ্যাডমিন প্যানেলের বিভিন্ন সেকশনের টাইপ ডেফিনিশন
type AdminSection = 
  | 'dashboard'                    // ড্যাশবোর্ড
  | 'userReports'                  // ব্যবহারকারী রিপোর্ট
  | 'whatsappNotification'         // WhatsApp নোটিফিকেশন
  | 'medicineBrandManagement'      // ওষুধের ব্র্যান্ড ম্যানেজমেন্ট
  | 'doctorCategoryManagement'     // ডাক্তারের বিভাগ ম্যানেজমেন্ট
  | 'hospitalManagement'           // হাসপাতাল ম্যানেজমেন্ট
  | 'medicineManagement'           // ওষুধ ম্যানেজমেন্ট
  | 'doctorManagement'             // ডাক্তার ম্যানেজমেন্ট
  | 'userManagement'               // ব্যবহারকারী ম্যানেজমেন্ট
  | 'aiAgentManagement'            // AI এজেন্ট ম্যানেজমেন্ট
  | 'aiAgentLogs'                  // AI এজেন্ট লগ
  | 'aiAgentStatus'                // AI এজেন্ট স্ট্যাটাস
  | 'aiAgentBackup'                // AI এজেন্ট ব্যাকআপ
  | 'promptManagement'             // প্রম্পট ম্যানেজমেন্ট

  | 'adminUsers'                   // অ্যাডমিন ব্যবহারকারী
  | 'systemSettings'               // সিস্টেম সেটিংস
  | 'apiKeySetup';                 // API কী সেটআপ

// অ্যাডমিন ব্যবহারকারীর ইন্টারফেস
interface AdminUser {
  id: string;                                        // ব্যবহারকারীর ID
  email: string;                                     // ইমেইল ঠিকানা
  name: string;                                      // নাম
  role: 'super_admin' | 'admin' | 'moderator';      // ভূমিকা (সুপার অ্যাডমিন/অ্যাডমিন/মডারেটর)
  permissions: string[];                             // অনুমতিসমূহ
  isActive: boolean;                                 // সক্রিয় কিনা
  createdAt: string;                                 // তৈরির তারিখ
  lastLogin?: string;                                // শেষ লগইনের তারিখ (ঐচ্ছিক)
}

// সিস্টেম সেটিংসের ইন্টারফেস
interface SystemSettings {
  maintenanceMode: boolean;                          // রক্ষণাবেক্ষণ মোড
  allowNewRegistrations: boolean;                    // নতুন নিবন্ধনের অনুমতি
  maxUsersPerDay: number;                            // দৈনিক সর্বোচ্চ ব্যবহারকারী
  backupFrequency: 'daily' | 'weekly' | 'monthly';  // ব্যাকআপের ফ্রিকোয়েন্সি
  logRetentionDays: number;                          // লগ সংরক্ষণের দিন
}

// অ্যাডমিন প্যানেল কম্পোনেন্ট
const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  // localStorage থেকে অ্যাডমিন সেশন ডেটা পাওয়া
  const adminSession = JSON.parse(localStorage.getItem('adminSession') || '{}');
  const user = { email: adminSession.username || 'admin@drmimu.com' };
  
  // বর্তমানে সক্রিয় সেকশন ট্র্যাক করার জন্য state
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  
  // অ্যাডমিন ব্যবহারকারীদের তালিকা
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  
  // সিস্টেম সেটিংস state
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    maintenanceMode: false,        // রক্ষণাবেক্ষণ মোড বন্ধ
    allowNewRegistrations: true,   // নতুন নিবন্ধনের অনুমতি
    maxUsersPerDay: 1000,         // দৈনিক সর্বোচ্চ ১০০০ ব্যবহারকারী
    backupFrequency: 'daily',     // দৈনিক ব্যাকআপ
    logRetentionDays: 30          // ৩০ দিন লগ সংরক্ষণ
  });
  
  // নতুন অ্যাডমিন যোগ করার মোডাল দেখানোর state
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  
  // নতুন অ্যাডমিনের ইমেইল
  const [newAdminEmail, setNewAdminEmail] = useState('');
  
  // নতুন অ্যাডমিনের ভূমিকা
  const [newAdminRole, setNewAdminRole] = useState<'admin' | 'moderator'>('admin');
  
  // AI-powered analytics states
  const [systemAnalytics, setSystemAnalytics] = useState<string>('');
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);

  // ভূমিকা-ভিত্তিক অ্যাক্সেস সহ উন্নত অ্যাডমিন চেক
  const getAdminRole = (email: string): 'super_admin' | 'admin' | 'moderator' | null => {
    // সুপার অ্যাডমিন ইমেইলগুলো (নিরাপত্তার জন্য হার্ডকোড করা)
    const superAdmins = ['admin@drmimu.com', 'superadmin@drmimu.com'];
    if (superAdmins.includes(email)) return 'super_admin';
    
    // সংরক্ষিত অ্যাডমিন ব্যবহারকারীদের বিপরীতে চেক করা
    const adminUser = adminUsers.find(admin => admin.email === email && admin.isActive);
    if (adminUser) return adminUser.role;
    
    // ডেভেলপমেন্টের জন্য ফলব্যাক
    if (email?.includes('admin') || email === 'admin@example.com') return 'admin';
    
    return null;
  };

  // ব্যবহারকারীর ভূমিকা নির্ধারণ
  const userRole = user ? getAdminRole(user.email) : null;
  const isAdmin = userRole !== null;              // অ্যাডমিন কিনা চেক
  const isSuperAdmin = userRole === 'super_admin'; // সুপার অ্যাডমিন কিনা চেক

  // অ্যাডমিন ব্যবহারকারী এবং সেটিংস লোড করা
  useEffect(() => {
    loadAdminUsers();     // অ্যাডমিন ব্যবহারকারী লোড
    loadSystemSettings(); // সিস্টেম সেটিংস লোড
    generateSystemAnalytics(); // AI সিস্টেম বিশ্লেষণ
  }, []);

  // AI-powered system analytics
  const generateSystemAnalytics = async () => {
    setIsAnalyzing(true);
    try {
      // Mock system data for analysis
      const systemData = {
        totalUsers: 1250,
        activeUsers: 890,
        totalDoctors: 45,
        activeDoctors: 38,
        totalAppointments: 2340,
        completedAppointments: 2100,
        systemUptime: '99.8%',
        averageResponseTime: '1.2s',
        errorRate: '0.2%'
      };
      
      const analyticsPrompt = `সিস্টেম পারফরম্যান্স বিশ্লেষণ:

ব্যবহারকারী পরিসংখ্যান:
- মোট ব্যবহারকারী: ${systemData.totalUsers}
- সক্রিয় ব্যবহারকারী: ${systemData.activeUsers}
- মোট ডাক্তার: ${systemData.totalDoctors}
- সক্রিয় ডাক্তার: ${systemData.activeDoctors}

অ্যাপয়েন্টমেন্ট পরিসংখ্যান:
- মোট অ্যাপয়েন্টমেন্ট: ${systemData.totalAppointments}
- সম্পন্ন অ্যাপয়েন্টমেন্ট: ${systemData.completedAppointments}

সিস্টেম পারফরম্যান্স:
- আপটাইম: ${systemData.systemUptime}
- গড় রেসপন্স টাইম: ${systemData.averageResponseTime}
- এরর রেট: ${systemData.errorRate}

এই ডেটার ভিত্তিতে সিস্টেমের স্বাস্থ্য, সমস্যা এবং উন্নতির সুপারিশ প্রদান করুন।`;
      
      const analysis = await langchainService.generateMedicalResponse(analyticsPrompt, 'bn');
      setSystemAnalytics(analysis);
      
      // Generate specific recommendations
      const recommendationPrompt = `উপরের সিস্টেম বিশ্লেষণের ভিত্তিতে অ্যাডমিনের জন্য ৫টি গুরুত্বপূর্ণ কর্মপরিকল্পনা এবং সুপারিশ প্রদান করুন।`;
      const recommendations = await langchainService.generateMedicalResponse(recommendationPrompt, 'bn');
      setAiRecommendations(recommendations.split('\n').filter(r => r.trim() && r.includes('.')));
      
      setPerformanceMetrics(systemData);
    } catch (error) {
      console.error('Analytics generation error:', error);
      setSystemAnalytics('AI বিশ্লেষণ তৈরি করতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate AI-powered user behavior insights
  const generateUserInsights = async () => {
    try {
      const insightPrompt = `ব্যবহারকারীর আচরণ বিশ্লেষণ:
- দৈনিক গড় লগইন: 450
- সবচেয়ে জনপ্রিয় ফিচার: অ্যাপয়েন্টমেন্ট বুকিং (65%)
- গড় সেশন সময়: 12 মিনিট
- মোবাইল ব্যবহারকারী: 78%
- ডেস্কটপ ব্যবহারকারী: 22%

এই তথ্যের ভিত্তিতে ব্যবহারকারীর অভিজ্ঞতা উন্নতির জন্য সুপারিশ দিন।`;
      
      const insights = await langchainService.generateMedicalResponse(insightPrompt, 'bn');
      return insights;
    } catch (error) {
      console.error('User insights error:', error);
      return 'ব্যবহারকারীর তথ্য বিশ্লেষণ করতে সমস্যা হয়েছে।';
    }
  };

  // অ্যাডমিন ব্যবহারকারী লোড করার ফাংশন
  const loadAdminUsers = () => {
    // বাস্তব অ্যাপে এটি একটি API কল হবে
    const savedAdmins = localStorage.getItem('admin_users');
    if (savedAdmins) {
      try {
        setAdminUsers(JSON.parse(savedAdmins));
      } catch (error) {
        console.error('Error loading admin users:', error);
      }
    } else {
      // ডিফল্ট অ্যাডমিন ব্যবহারকারী
      const defaultAdmins: AdminUser[] = [
        {
          id: '1',                                    // অ্যাডমিন ID
          email: 'admin@drmimu.com',                  // ইমেইল ঠিকানা
          name: 'Super Admin',                        // নাম
          role: 'super_admin',                        // সুপার অ্যাডমিন ভূমিকা
          permissions: ['all'],                       // সব অনুমতি
          isActive: true,                             // সক্রিয় অবস্থা
          createdAt: new Date().toISOString(),        // তৈরির তারিখ
          lastLogin: new Date().toISOString()         // শেষ লগইনের তারিখ
        }
      ];
      setAdminUsers(defaultAdmins);
      localStorage.setItem('admin_users', JSON.stringify(defaultAdmins));
    }
  };

  // সিস্টেম সেটিংস লোড করার ফাংশন
  const loadSystemSettings = () => {
    const savedSettings = localStorage.getItem('system_settings');
    if (savedSettings) {
      try {
        setSystemSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading system settings:', error);
      }
    }
  };

  // অ্যাডমিন ব্যবহারকারী সংরক্ষণ করার ফাংশন
  const saveAdminUsers = (users: AdminUser[]) => {
    setAdminUsers(users);
    localStorage.setItem('admin_users', JSON.stringify(users));
  };

  // সিস্টেম সেটিংস সংরক্ষণ করার ফাংশন
  const saveSystemSettings = (settings: SystemSettings) => {
    setSystemSettings(settings);
    localStorage.setItem('system_settings', JSON.stringify(settings));
  };

  // নতুন অ্যাডমিন ব্যবহারকারী যোগ করার ফাংশন
  const addAdminUser = () => {
    if (!newAdminEmail || !isSuperAdmin) return; // ইমেইল এবং সুপার অ্যাডমিন অনুমতি চেক
    
    const newAdmin: AdminUser = {
      id: Date.now().toString(),                    // ইউনিক ID তৈরি
      email: newAdminEmail,                         // ইমেইল ঠিকানা
      name: newAdminEmail.split('@')[0],            // ইমেইল থেকে নাম নেওয়া
      role: newAdminRole,                           // নির্বাচিত ভূমিকা
      permissions: newAdminRole === 'admin' ? ['users', 'reports', 'medicine', 'hospital'] : ['reports'], // ভূমিকা অনুযায়ী অনুমতি
      isActive: true,                               // সক্রিয় অবস্থা
      createdAt: new Date().toISOString()           // তৈরির তারিখ
    };
    
    saveAdminUsers([...adminUsers, newAdmin]);      // নতুন অ্যাডমিন তালিকায় যোগ
    setNewAdminEmail('');                           // ইমেইল ফিল্ড রিসেট
    setShowAddAdminModal(false);                    // মোডাল বন্ধ
  };

  // অ্যাডমিনের সক্রিয়তা টগল করার ফাংশন
  const toggleAdminStatus = (adminId: string) => {
    if (!isSuperAdmin) return; // শুধু সুপার অ্যাডমিন এই কাজ করতে পারবে
    
    const updatedAdmins = adminUsers.map(admin => 
      admin.id === adminId ? { ...admin, isActive: !admin.isActive } : admin
    );
    saveAdminUsers(updatedAdmins);
  };

  // অ্যাডমিন ব্যবহারকারী মুছে ফেলার ফাংশন
  const removeAdminUser = (adminId: string) => {
    if (!isSuperAdmin) return; // শুধু সুপার অ্যাডমিন এই কাজ করতে পারবে
    
    const updatedAdmins = adminUsers.filter(admin => admin.id !== adminId);
    saveAdminUsers(updatedAdmins);
  };

  // অ্যাডমিন নয় এমন ব্যবহারকারীদের জন্য অ্যাক্সেস নিষেধ UI
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-center mb-4">অ্যাক্সেস নিষিদ্ধ</h2>
          <p className="text-gray-600 text-center mb-6">
            আপনার এডমিন প্যানেল অ্যাক্সেস করার অনুমতি নেই। শুধুমাত্র অনুমোদিত এডমিনরা এই প্যানেল ব্যবহার করতে পারবেন।
          </p>
          <div className="text-sm text-gray-500 text-center mb-4">
            আপনার ইমেইল: {user?.email}
          </div>
          <button
            onClick={onClose}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    );
  }

  // অ্যাডমিন প্যানেলের মেনু আইটেমগুলো
  const menuItems = [
    {
      id: 'dashboard' as AdminSection,
      label: 'ড্যাশবোর্ড',
      icon: BarChart3,
      description: 'সামগ্রিক পরিসংখ্যান ও ওভারভিউ'
    },
    {
      id: 'userReports' as AdminSection,
      label: 'ইউজার রিপোর্ট',
      icon: Users,
      description: 'ব্যবহারকারীর কার্যকলাপ ও বিশ্লেষণ'
    },
    {
      id: 'whatsappNotification' as AdminSection,
      label: 'হোয়াটসঅ্যাপ নোটিফিকেশন',
      icon: MessageSquare,
      description: 'বার্তা পাঠানো ও যোগাযোগ'
    },
    {
      id: 'medicineBrandManagement' as AdminSection,
      label: 'মেডিসিন ব্র্যান্ড',
      icon: Package,
      description: 'ওষুধের ব্র্যান্ড ম্যানেজমেন্ট'
    },
    {
      id: 'doctorCategoryManagement' as AdminSection,
      label: 'ডাক্তার ক্যাটাগরি',
      icon: UserCheck,
      description: 'চিকিৎসকের বিশেষজ্ঞতা ম্যানেজমেন্ট'
    },
    {
      id: 'hospitalManagement' as AdminSection,
      label: 'হাসপাতাল ম্যানেজমেন্ট',
      icon: Building2,
      description: 'হাসপাতালের তথ্য ও পরিচালনা'
    },
    {
      id: 'medicineManagement' as AdminSection,
      label: 'মেডিসিন ম্যানেজমেন্ট',
      icon: Pill,
      description: 'ওষুধের ডাটাবেস ও তথ্য'
    },
    {
      id: 'doctorManagement' as AdminSection,
      label: 'ডাক্তার ম্যানেজমেন্ট',
      icon: Stethoscope,
      description: 'ডাক্তারদের তথ্য ও ব্যবস্থাপনা'
    },
    {
      id: 'userManagement' as AdminSection,
      label: 'ইউজার ম্যানেজমেন্ট',
      icon: UserCog,
      description: 'ব্যবহারকারীদের তথ্য নিয়ন্ত্রণ'
    },
    {
      id: 'aiAgentManagement' as AdminSection,
      label: 'AI এজেন্ট ম্যানেজমেন্ট',
      icon: Bot,
      description: 'AI চ্যাটবট ও এজেন্ট নিয়ন্ত্রণ'
    },
    {
      id: 'aiAgentLogs' as AdminSection,
      label: 'এজেন্ট লগ ও অডিট',
      icon: FileText,
      description: 'এজেন্ট কার্যকলাপ লগ এবং অডিট ট্রেইল দেখুন'
    },
    {
      id: 'aiAgentStatus' as AdminSection,
      label: 'এজেন্ট স্ট্যাটাস ম্যানেজার',
      icon: Activity,
      description: 'AI এজেন্ট স্ট্যাটাস মনিটরিং এবং কন্ট্রোল'
    },
    {
      id: 'aiAgentBackup' as AdminSection,
      label: 'এজেন্ট ব্যাকআপ ও রিকভারি',
      icon: HardDrive,
      description: 'এজেন্ট ডেটা ব্যাকআপ এবং রিকভারি সিস্টেম'
    },
    {
      id: 'promptManagement' as AdminSection,
      label: 'প্রমট ম্যানেজমেন্ট',
      icon: MessageSquare,
      description: 'প্রমট তৈরি, সম্পাদনা এবং ব্যবস্থাপনা সিস্টেম'
    },

  ];

  // শুধুমাত্র সুপার অ্যাডমিনের জন্য মেনু আইটেম যোগ করা
  if (isSuperAdmin) {
    menuItems.push(
      {
        id: 'adminUsers' as AdminSection,
        label: 'এডমিন ইউজার',
        icon: UserPlus,
        description: 'প্রশাসক ব্যবহারকারী নিয়ন্ত্রণ'
      },
      {
        id: 'systemSettings' as AdminSection,
        label: 'সিস্টেম সেটিংস',
        icon: Settings,
        description: 'সিস্টেম কনফিগারেশন ও নিয়ন্ত্রণ'
      }
    );
  }

  // সক্রিয় সেকশন অনুযায়ী কন্টেন্ট রেন্ডার করার ফাংশন
  const renderContent = () => {
    switch (activeSection) {
      case 'userReports':
        return <UserReports />;                              // ব্যবহারকারী রিপোর্ট
      case 'whatsappNotification':
        return <WhatsAppNotification />;                     // WhatsApp নোটিফিকেশন
      case 'medicineBrandManagement':
        return <MedicineBrandManagement />;                  // ওষুধের ব্র্যান্ড ম্যানেজমেন্ট
      case 'doctorCategoryManagement':
        return <DoctorCategoryManagement />;                 // ডাক্তারের বিভাগ ম্যানেজমেন্ট
      case 'hospitalManagement':
        return <HospitalManagement />;                       // হাসপাতাল ম্যানেজমেন্ট
      case 'medicineManagement':
        return <MedicineManagement />;                       // ওষুধ ম্যানেজমেন্ট
      case 'doctorManagement':
        return <DoctorManagement language="bn" />;           // ডাক্তার ম্যানেজমেন্ট
      case 'userManagement':
        return <UserManagement language="bn" />;             // ব্যবহারকারী ম্যানেজমেন্ট
      case 'aiAgentManagement':
         return <AIAgentManagement language="bn" />;         // AI এজেন্ট ম্যানেজমেন্ট
      case 'aiAgentLogs':
        return <AIAgentLogs language="bn" />;                // AI এজেন্ট লগ
      case 'aiAgentStatus':
        return <AIAgentStatusManager language="bn" />;       // AI এজেন্ট স্ট্যাটাস
      case 'aiAgentBackup':
        return <AIAgentBackupRecovery language="bn" />;      // AI এজেন্ট ব্যাকআপ
      case 'promptManagement':
        return <PromptManagement language="bn" />;           // প্রম্পট ম্যানেজমেন্ট

      case 'adminUsers':
        // শুধুমাত্র সুপার অ্যাডমিন এই সেকশন দেখতে পারবে
        if (!isSuperAdmin) return null;
        return (
          <div className="p-6 space-y-6">
            {/* এডমিন ইউজার ম্যানেজমেন্ট হেডার */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">এডমিন ইউজার ম্যানেজমেন্ট</h1>
              {/* নতুন এডমিন যোগ করার বাটন */}
              <button
                onClick={() => setShowAddAdminModal(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
              >
                <UserPlus className="h-4 w-4" />
                <span>নতুন এডমিন যোগ করুন</span>
              </button>
            </div>

            {/* এডমিন ইউজারদের তালিকা টেবিল */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                {/* টেবিল হেডার */}
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ইমেইল</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">নাম</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ভূমিকা</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">স্ট্যাটাস</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">তৈরি হয়েছে</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">অ্যাকশন</th>
                  </tr>
                </thead>
                {/* টেবিল বডি - এডমিন ইউজারদের তথ্য */}
                <tbody className="bg-white divide-y divide-gray-200">
                  {adminUsers.map((admin) => (
                    <tr key={admin.id}>
                      {/* এডমিনের ইমেইল */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{admin.email}</td>
                      {/* এডমিনের নাম */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{admin.name}</td>
                      {/* এডমিনের ভূমিকা (রোল) */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          admin.role === 'super_admin' ? 'bg-red-100 text-red-800' :
                          admin.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {admin.role === 'super_admin' ? 'সুপার এডমিন' :
                           admin.role === 'admin' ? 'এডমিন' : 'মডারেটর'}
                        </span>
                      </td>
                      {/* এডমিনের স্ট্যাটাস (সক্রিয়/নিষ্ক্রিয়) */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          admin.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {admin.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                        </span>
                      </td>
                      {/* এডমিন তৈরির তারিখ */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(admin.createdAt).toLocaleDateString('bn-BD')}
                      </td>
                      {/* এডমিনের জন্য অ্যাকশন বাটন */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {/* সুপার এডমিন ছাড়া অন্যদের জন্য অ্যাকশন বাটন */}
                        {admin.role !== 'super_admin' && (
                          <>
                            {/* স্ট্যাটাস টগল বাটন */}
                            <button
                              onClick={() => toggleAdminStatus(admin.id)}
                              className={`${admin.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                            >
                              {admin.isActive ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                            </button>
                            {/* এডমিন মুছে ফেলার বাটন */}
                            <button
                              onClick={() => removeAdminUser(admin.id)}
                              className="text-red-600 hover:text-red-900 ml-2"
                            >
                              মুছুন
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'systemSettings':
        // শুধুমাত্র সুপার অ্যাডমিন সিস্টেম সেটিংস দেখতে পারবে
        if (!isSuperAdmin) return null;
        return (
          <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">সিস্টেম সেটিংস</h1>
            
            {/* সেটিংস গ্রিড লেআউট */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* সাধারণ সেটিংস কার্ড */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">সাধারণ সেটিংস</h2>
                <div className="space-y-4">
                  {/* রক্ষণাবেক্ষণ মোড সেটিং */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">রক্ষণাবেক্ষণ মোড</label>
                      <p className="text-xs text-gray-500">সিস্টেম রক্ষণাবেক্ষণের জন্য বন্ধ করুন</p>
                    </div>
                    {/* রক্ষণাবেক্ষণ মোড টগল সুইচ */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={systemSettings.maintenanceMode}
                        onChange={(e) => saveSystemSettings({...systemSettings, maintenanceMode: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* নতুন রেজিস্ট্রেশন অনুমতি সেটিং */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">নতুন রেজিস্ট্রেশন অনুমতি</label>
                      <p className="text-xs text-gray-500">নতুন ইউজার রেজিস্ট্রেশন চালু/বন্ধ</p>
                    </div>
                    {/* রেজিস্ট্রেশন অনুমতি টগল সুইচ */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={systemSettings.allowNewRegistrations}
                        onChange={(e) => saveSystemSettings({...systemSettings, allowNewRegistrations: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* দৈনিক সর্বোচ্চ ইউজার সেটিং */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">দৈনিক সর্বোচ্চ ইউজার</label>
                    <input
                      type="number"
                      value={systemSettings.maxUsersPerDay}
                      onChange={(e) => saveSystemSettings({...systemSettings, maxUsersPerDay: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* ব্যাকআপ সেটিংস কার্ড */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">ব্যাকআপ সেটিংস</h2>
                <div className="space-y-4">
                  {/* ব্যাকআপ ফ্রিকোয়েন্সি সেটিং */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ব্যাকআপ ফ্রিকোয়েন্সি</label>
                    {/* ব্যাকআপ ফ্রিকোয়েন্সি সিলেক্ট ড্রপডাউন */}
                    <select
                      value={systemSettings.backupFrequency}
                      onChange={(e) => saveSystemSettings({...systemSettings, backupFrequency: e.target.value as 'daily' | 'weekly' | 'monthly'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="daily">দৈনিক</option>
                      <option value="weekly">সাপ্তাহিক</option>
                      <option value="monthly">মাসিক</option>
                    </select>
                  </div>

                  {/* লগ রিটেনশন সেটিং */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">লগ রিটেনশন (দিন)</label>
                    <input
                      type="number"
                      value={systemSettings.logRetentionDays}
                      onChange={(e) => saveSystemSettings({...systemSettings, logRetentionDays: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* AI API সেটিংস কার্ড */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">AI API সেটিংস</h2>
                <div className="space-y-4">
                  {/* API কী কনফিগারেশন সেকশন */}
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">AI API কী কনফিগারেশন</label>
                      <p className="text-xs text-gray-500">Google Gemini এবং OpenAI API কী সেটআপ করুন</p>
                    </div>
                    {/* API কী সেটআপ বাটন */}
                    <button
                      onClick={() => setActiveSection('apiKeySetup' as AdminSection)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Key className="h-4 w-4" />
                      <span>API কী সেটআপ</span>
                    </button>
                  </div>
                  
                  {/* গুরুত্বপূর্ণ তথ্য সতর্কতা বক্স */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800">গুরুত্বপূর্ণ তথ্য</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          API কীগুলি শুধুমাত্র আপনার ব্রাউজারে সংরক্ষিত হয় এবং কোথাও পাঠানো হয় না।
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'apiKeySetup':
        return <ApiKeySetup />;                                  // API কী সেটআপ কম্পোনেন্ট
      default:
        // ডিফল্ট ড্যাশবোর্ড ভিউ
        return (
          <div className="p-4 md:p-6 min-h-screen">
            <div className="max-w-7xl mx-auto">
              {/* স্বাগতম হেডার সেকশন */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-6 md:p-8 mb-8 text-white relative overflow-hidden">
                {/* ব্যাকগ্রাউন্ড ডেকোরেটিভ এলিমেন্ট */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -ml-12 -mb-12" />
                <div className="relative z-10">
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">স্বাগতম, এডমিন প্যানেলে!</h1>
                  <p className="text-blue-100 text-sm md:text-base">
                    আজ {new Date().toLocaleDateString('bn-BD')} • সিস্টেমের সকল বিভাগ পরিচালনা করুন
                  </p>
                  {/* সিস্টেম স্ট্যাটাস ইন্ডিকেটর */}
                  <div className="mt-4 flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-sm">সিস্টেম চালু</span>
                    </div>
                    <div className="text-sm opacity-75">
                      শেষ আপডেট: {new Date().toLocaleTimeString('bn-BD')}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* পরিসংখ্যান গ্রিড */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                {/* মোট ইউজার কার্ড */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 card-hover">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">মোট ইউজার</p>
                      <p className="text-2xl font-bold text-gray-900">১,২৩৪</p>
                      <p className="text-xs text-green-600 mt-1">↗ +১২% এই মাসে</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>
                
                {/* আজকের বার্তা কার্ড */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 card-hover">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">আজকের বার্তা</p>
                      <p className="text-2xl font-bold text-gray-900">৫৬৭</p>
                      <p className="text-xs text-green-600 mt-1">↗ +৮% গতকাল থেকে</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <MessageSquare className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>
                
                {/* হাসপাতাল কার্ড */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 card-hover">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">হাসপাতাল</p>
                      <p className="text-2xl font-bold text-gray-900">৮৯</p>
                      <p className="text-xs text-blue-600 mt-1">↗ +৩ নতুন যোগ</p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-full">
                      <Building2 className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </div>
                
                {/* ওষুধের তথ্য কার্ড */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 card-hover">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">ওষুধের তথ্য</p>
                      <p className="text-2xl font-bold text-gray-900">২,৪৫৬</p>
                      <p className="text-xs text-orange-600 mt-1">↗ +১৫ নতুন এন্ট্রি</p>
                    </div>
                    <div className="bg-orange-100 p-3 rounded-full">
                      <Pill className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* দ্রুত অ্যাক্সেস সেকশন */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                  দ্রুত অ্যাক্সেস
                </h3>
                {/* প্রথম ৬টি মেনু আইটেমের গ্রিড */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {menuItems.slice(0, 6).map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveSection(item.id);                    // সক্রিয় সেকশন সেট করা
                          if (isMobile) setSidebarOpen(false);          // মোবাইলে সাইডবার বন্ধ করা
                        }}
                        className="flex flex-col items-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-indigo-100 rounded-xl transition-all duration-300 border border-gray-200 hover:border-blue-300 hover:shadow-md group btn-animate"
                        style={{ animationDelay: `${index * 100}ms` }}  // অ্যানিমেশন ডিলে
                      >
                        {/* আইকন কন্টেইনার */}
                        <div className="bg-white p-3 rounded-full shadow-sm group-hover:shadow-md transition-shadow mb-3">
                          <Icon className="h-6 w-6 text-gray-600 group-hover:text-blue-600 transition-colors" />
                        </div>
                        {/* মেনু লেবেল */}
                        <span className="text-sm font-medium text-gray-700 text-center group-hover:text-blue-700 transition-colors">
                          {item.label}
                        </span>
                        {/* মেনু বিবরণ */}
                        <span className="text-xs text-gray-500 text-center mt-1 group-hover:text-blue-500 transition-colors">
                          {item.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* সাম্প্রতিক কার্যকলাপ ও সিস্টেম ওভারভিউ */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* সাম্প্রতিক কার্যকলাপ কার্ড */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-green-600" />
                    সাম্প্রতিক কার্যকলাপ
                  </h3>
                  {/* কার্যকলাপের তালিকা */}
                  <div className="space-y-3">
                    {[
                      { action: 'নতুন ইউজার নিবন্ধন', time: '৫ মিনিট আগে', type: 'user' },
                      { action: 'হাসপাতালের তথ্য আপডেট', time: '১৫ মিনিট আগে', type: 'hospital' },
                      { action: 'ওষুধের তথ্য যোগ', time: '৩০ মিনিট আগে', type: 'medicine' },
                      { action: 'হোয়াটসঅ্যাপ বার্তা পাঠানো', time: '১ ঘন্টা আগে', type: 'message' }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        {/* কার্যকলাপের ধরন অনুযায়ী রঙিন ডট */}
                        <div className={`w-2 h-2 rounded-full ${
                          activity.type === 'user' ? 'bg-blue-500' :
                          activity.type === 'hospital' ? 'bg-purple-500' :
                          activity.type === 'medicine' ? 'bg-orange-500' : 'bg-green-500'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* সিস্টেম স্ট্যাটাস কার্ড */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Database className="h-5 w-5 mr-2 text-purple-600" />
                    সিস্টেম স্ট্যাটাস
                  </h3>
                  {/* সিস্টেম কম্পোনেন্টের স্ট্যাটাস তালিকা */}
                  <div className="space-y-4">
                    {[
                      { label: 'ডাটাবেস সংযোগ', status: 'সক্রিয়', color: 'green' },
                      { label: 'API সার্ভিস', status: 'চালু', color: 'green' },
                      { label: 'ব্যাকআপ সিস্টেম', status: 'স্বাভাবিক', color: 'blue' },
                      { label: 'নিরাপত্তা', status: 'সুরক্ষিত', color: 'green' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">{item.label}</span>
                        {/* স্ট্যাটাস ব্যাজ */}
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          item.color === 'green' ? 'bg-green-100 text-green-800' :
                          item.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  // সাইডবার এবং মোবাইল রেসপন্সিভ স্টেট
  const [sidebarOpen, setSidebarOpen] = useState(true);        // সাইডবার খোলা/বন্ধ অবস্থা
  const [isMobile, setIsMobile] = useState(false);             // মোবাইল ডিভাইস চেক

  // মোবাইল ডিভাইস চেক এবং সাইডবার অটো-হাইড
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);                     // ৭৬৮px এর নিচে মোবাইল
      if (window.innerWidth < 768) {
        setSidebarOpen(false);                                  // মোবাইলে সাইডবার বন্ধ রাখা
      }
    };
    
    checkMobile();                                            // প্রাথমিক চেক
    window.addEventListener('resize', checkMobile);           // রিসাইজ ইভেন্ট লিসেনার
    return () => window.removeEventListener('resize', checkMobile);  // ক্লিনআপ
  }, []);

  return (
    // মূল অ্যাডমিন প্যানেল কন্টেইনার
    <div className="fixed inset-0 bg-black bg-opacity-50 flex z-50">
      <div className="bg-white w-full h-full flex relative">
        {/* মোবাইল ওভারলে - সাইডবার বন্ধ করার জন্য */}
        {isMobile && sidebarOpen && (
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 z-10 md:hidden"
            onClick={() => setSidebarOpen(false)}                // ওভারলে ক্লিক করলে সাইডবার বন্ধ
          />
        )}
        
        {/* সাইডবার নেভিগেশন */}
        <div className={`${
          isMobile 
            ? `absolute left-0 top-0 h-full z-20 transform transition-transform duration-300 ease-in-out ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'  // মোবাইলে স্লাইড অ্যানিমেশন
              }`
            : sidebarOpen ? 'w-64' : 'w-16'                        // ডেস্কটপে প্রস্থ পরিবর্তন
        } bg-gradient-to-b from-blue-50 to-indigo-100 border-r border-gray-200 flex flex-col shadow-lg transition-all duration-300`}>
          {/* সাইডবার হেডার */}
          <div className="p-4 border-b border-gray-200 bg-white bg-opacity-80 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              {/* সাইডবার খোলা অবস্থায় বা মোবাইলে পূর্ণ হেডার */}
              {(!isMobile && sidebarOpen) || isMobile ? (
                <>
                  <div>
                    <h1 className="text-xl font-bold text-gray-800">এডমিন প্যানেল</h1>
                    <p className="text-sm text-gray-600 mt-1 truncate">{user?.email}</p>
                    {/* ইউজার রোল প্রদর্শন */}
                    <div className="text-xs text-blue-600 font-medium mt-1">
                      {userRole === 'super_admin' ? 'সুপার এডমিন' : userRole === 'admin' ? 'এডমিন' : 'মডারেটর'}
                    </div>
                  </div>
                  {/* প্যানেল বন্ধ করার বোতাম */}
                  <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 text-xl font-bold hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                  >
                    ×
                  </button>
                </>
              ) : (
                // সাইডবার বন্ধ অবস্থায় শুধু আইকন
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-white hover:bg-opacity-50 transition-colors"
                >
                  <Settings className="h-5 w-5" />
                </button>
              )}
            </div>
            {/* ডেস্কটপে সাইডবার টগল বোতাম */}
            {!isMobile && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="mt-2 text-gray-500 hover:text-gray-700 text-sm flex items-center space-x-1 hover:bg-white hover:bg-opacity-50 rounded px-2 py-1 transition-colors"
              >
                <span>{sidebarOpen ? '◀' : '▶'}</span>
                {sidebarOpen && <span>সংকুচিত করুন</span>}
              </button>
            )}
          </div>
          
          {/* নেভিগেশন মেনু */}
          <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
            <ul className="space-y-1">
              {/* মেনু আইটেমগুলো ম্যাপ করা */}
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;              // বর্তমান সক্রিয় সেকশন চেক
                return (
                  <li key={item.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-fade-in">
                    <button
                      onClick={() => {
                        setActiveSection(item.id);                   // সেকশন পরিবর্তন
                        if (isMobile) setSidebarOpen(false);         // মোবাইলে সাইডবার বন্ধ
                      }}
                      className={`w-full flex items-center px-3 py-3 rounded-xl text-left transition-all duration-200 group relative overflow-hidden ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105'  // সক্রিয় মেনু স্টাইল
                          : 'text-gray-700 hover:bg-white hover:bg-opacity-70 hover:shadow-md hover:transform hover:scale-102'  // নিষ্ক্রিয় মেনু স্টাইল
                      }`}
                      title={!sidebarOpen && !isMobile ? item.label : ''}  // টুলটিপ শুধু সংকুচিত অবস্থায়
                    >
                      {/* সক্রিয় মেনুর জন্য অ্যানিমেটেড ব্যাকগ্রাউন্ড */}
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-20 animate-pulse" />
                      )}
                      {/* মেনু আইকন */}
                      <Icon className={`h-5 w-5 ${sidebarOpen || isMobile ? 'mr-3' : 'mx-auto'} relative z-10 transition-colors ${
                        isActive ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'
                      }`} />
                      {/* মেনু লেবেল ও বিবরণ (সাইডবার খোলা অবস্থায়) */}
                      {(sidebarOpen || isMobile) && (
                        <div className="relative z-10">
                          <span className="text-sm font-medium">{item.label}</span>
                          <p className="text-xs opacity-75 mt-0.5">{item.description}</p>
                        </div>
                      )}
                      {/* সক্রিয় ইন্ডিকেটর */}
                      {isActive && (sidebarOpen || isMobile) && (
                        <div className="ml-auto relative z-10">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        </div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
          
          {/* সাইডবার ফুটার */}
          <div className="p-4 border-t border-gray-200 bg-white bg-opacity-50">
            <div className={`flex items-center ${sidebarOpen || isMobile ? 'justify-between' : 'justify-center'}`}>
              {/* ইউজার প্রোফাইল তথ্য (সাইডবার খোলা অবস্থায়) */}
              {(sidebarOpen || isMobile) && (
                <div className="flex items-center">
                  {/* প্রোফাইল ছবি বা ইনিশিয়াল */}
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'A'}  {/* ইউজারের নামের প্রথম অক্ষর */}
                      </span>
                    </div>
                  )}
                </div>
              )}
              {/* সংকুচিত অবস্থায় শুধু প্রোফাইল ছবি */}
              {!(sidebarOpen || isMobile) && (
                <div className="flex justify-center">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'A'}  {/* ইউজারের নামের প্রথম অক্ষর */}
                      </span>
                    </div>
                  )}
                </div>
              )}
              {/* লগআউট বোতাম */}
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-red-600 transition-colors p-1 rounded"
                title="বন্ধ করুন"
              >
                <Shield className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* মূল কন্টেন্ট এলাকা */}
        <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-blue-50 relative">
          {/* মোবাইল হেডার */}
          {isMobile && (
            <div className="bg-white shadow-sm border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-10">
              {/* মোবাইলে সাইডবার খোলার বোতাম */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Settings className="h-5 w-5" />
              </button>
              {/* বর্তমান সেকশনের শিরোনাম */}
              <h1 className="text-lg font-semibold text-gray-800">
                {menuItems.find(item => item.id === activeSection)?.label || 'ড্যাশবোর্ড'}
              </h1>
              {/* প্যানেল বন্ধ করার বোতাম */}
              <button
                onClick={onClose}
                className="text-gray-600 hover:text-red-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ×
              </button>
            </div>
          )}
          
          {/* অ্যানিমেশন সহ কন্টেন্ট */}
          <div className="animate-fade-in-up">
            {renderContent()}  {/* বর্তমান সেকশনের কন্টেন্ট রেন্ডার */}
          </div>
          
          {/* মোবাইলের জন্য ফ্লোটিং অ্যাকশন বোতাম */}
          {isMobile && activeSection === 'dashboard' && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 z-20"
            >
              <Plus className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>
      
      {/* এডমিন যোগ করার মোডাল */}
      {showAddAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">নতুন এডমিন যোগ করুন</h2>
            <div className="space-y-4">
              {/* ইমেইল ইনপুট ফিল্ড */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ইমেইল</label>
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="admin@example.com"
                />
              </div>
              {/* ভূমিকা নির্বাচন ড্রপডাউন */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ভূমিকা</label>
                <select
                  value={newAdminRole}
                  onChange={(e) => setNewAdminRole(e.target.value as 'admin' | 'moderator')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="admin">এডমিন</option>
                  <option value="moderator">মডারেটর</option>
                </select>
              </div>
            </div>
            {/* মোডাল অ্যাকশন বোতামসমূহ */}
            <div className="flex space-x-3 mt-6">
              {/* এডমিন যোগ করার বোতাম */}
              <button
                onClick={addAdminUser}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              >
                যোগ করুন
              </button>
              {/* মোডাল বাতিল করার বোতাম */}
              <button
                onClick={() => setShowAddAdminModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;