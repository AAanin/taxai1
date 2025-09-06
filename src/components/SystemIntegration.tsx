// System Integration & Cross-Module Connectivity
import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  Settings, Users, Activity, Bell, Shield, Database,
  Wifi, WifiOff, Sync, AlertCircle, CheckCircle,
  Clock, BarChart3, TrendingUp, Globe, Smartphone,
  Monitor, Tablet, RefreshCw, Download, Upload,
  Link, Unlink, Eye, EyeOff, Lock, Unlock,
  MessageSquare, Phone, Video, Mail, Share2,
  Navigation, MapPin, Calendar, FileText, Image,
  Search, Filter, SortAsc, Plus, Edit3, Trash2,
  X, ChevronRight, ChevronDown, Info, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

// Types for System Integration
interface SystemModule {
  id: string;
  name: string;
  displayName: string;
  status: 'active' | 'inactive' | 'error' | 'maintenance';
  version: string;
  lastUpdated: Date;
  dependencies: string[];
  permissions: string[];
  dataConnections: DataConnection[];
  apiEndpoints: ApiEndpoint[];
  realTimeFeatures: RealTimeFeature[];
  healthCheck: HealthStatus;
}

interface DataConnection {
  id: string;
  sourceModule: string;
  targetModule: string;
  dataType: string;
  syncStatus: 'synced' | 'syncing' | 'error' | 'pending';
  lastSync: Date;
  recordCount: number;
  errorCount: number;
}

interface ApiEndpoint {
  id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  status: 'active' | 'inactive' | 'error';
  responseTime: number;
  requestCount: number;
  errorRate: number;
  lastCall: Date;
}

interface RealTimeFeature {
  id: string;
  name: string;
  type: 'notification' | 'chat' | 'sync' | 'tracking';
  status: 'connected' | 'disconnected' | 'error';
  connectionCount: number;
  messageCount: number;
  lastActivity: Date;
}

interface HealthStatus {
  overall: 'healthy' | 'warning' | 'critical';
  cpu: number;
  memory: number;
  storage: number;
  network: number;
  uptime: number;
  errors: SystemError[];
}

interface SystemError {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  module: string;
  timestamp: Date;
  resolved: boolean;
  details?: string;
}

interface CrossModuleNavigation {
  fromModule: string;
  toModule: string;
  action: string;
  data?: any;
  timestamp: Date;
}

interface SystemNotification {
  id: string;
  type: 'system' | 'user' | 'module' | 'security';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  module: string;
  timestamp: Date;
  read: boolean;
  actionRequired: boolean;
  actions?: NotificationAction[];
}

interface NotificationAction {
  id: string;
  label: string;
  action: string;
  type: 'primary' | 'secondary' | 'danger';
}

// System Integration Context
interface SystemIntegrationContextType {
  modules: SystemModule[];
  notifications: SystemNotification[];
  isOnline: boolean;
  systemHealth: 'healthy' | 'warning' | 'critical';
  navigateToModule: (moduleId: string, action?: string, data?: any) => void;
  shareData: (fromModule: string, toModule: string, data: any) => void;
  sendNotification: (notification: Omit<SystemNotification, 'id' | 'timestamp'>) => void;
  markNotificationRead: (notificationId: string) => void;
  refreshModule: (moduleId: string) => void;
  getModuleStatus: (moduleId: string) => SystemModule | null;
}

const SystemIntegrationContext = createContext<SystemIntegrationContextType | null>(null);

export const useSystemIntegration = () => {
  const context = useContext(SystemIntegrationContext);
  if (!context) {
    throw new Error('useSystemIntegration must be used within SystemIntegrationProvider');
  }
  return context;
};

const SystemIntegration: React.FC = () => {
  const [modules, setModules] = useState<SystemModule[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [dataConnections, setDataConnections] = useState<DataConnection[]>([]);
  const [systemErrors, setSystemErrors] = useState<SystemError[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activeTab, setActiveTab] = useState<'overview' | 'modules' | 'data' | 'notifications' | 'health'>('overview');
  const [selectedModule, setSelectedModule] = useState<SystemModule | null>(null);
  const [showModuleDetails, setShowModuleDetails] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  
  const { user } = useAuth();
  const { showNotification } = useNotification();

  // Initialize system data
  useEffect(() => {
    loadSystemModules();
    loadNotifications();
    loadDataConnections();
    setupNetworkMonitoring();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        refreshSystemData();
      }, refreshInterval * 1000);
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const loadSystemModules = () => {
    const sampleModules: SystemModule[] = [
      {
        id: 'patient-management',
        name: 'patient-management',
        displayName: 'রোগী ব্যবস্থাপনা',
        status: 'active',
        version: '2.1.0',
        lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000),
        dependencies: ['auth', 'notification'],
        permissions: ['read:patients', 'write:patients', 'delete:patients'],
        dataConnections: [],
        apiEndpoints: [
          {
            id: 'get-patients',
            path: '/api/patients',
            method: 'GET',
            status: 'active',
            responseTime: 120,
            requestCount: 1250,
            errorRate: 0.02,
            lastCall: new Date()
          }
        ],
        realTimeFeatures: [
          {
            id: 'patient-updates',
            name: 'রোগী আপডেট',
            type: 'notification',
            status: 'connected',
            connectionCount: 45,
            messageCount: 230,
            lastActivity: new Date()
          }
        ],
        healthCheck: {
          overall: 'healthy',
          cpu: 25,
          memory: 60,
          storage: 45,
          network: 95,
          uptime: 99.8,
          errors: []
        }
      },
      {
        id: 'doctor-system',
        name: 'doctor-system',
        displayName: 'ডাক্তার সিস্টেম',
        status: 'active',
        version: '1.8.5',
        lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000),
        dependencies: ['auth', 'patient-management'],
        permissions: ['read:doctors', 'write:prescriptions'],
        dataConnections: [],
        apiEndpoints: [],
        realTimeFeatures: [],
        healthCheck: {
          overall: 'healthy',
          cpu: 30,
          memory: 55,
          storage: 40,
          network: 98,
          uptime: 99.5,
          errors: []
        }
      },
      {
        id: 'medicine-system',
        name: 'medicine-system',
        displayName: 'ওষুধ সিস্টেম',
        status: 'active',
        version: '1.5.2',
        lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000),
        dependencies: ['auth'],
        permissions: ['read:medicines', 'write:orders'],
        dataConnections: [],
        apiEndpoints: [],
        realTimeFeatures: [],
        healthCheck: {
          overall: 'warning',
          cpu: 45,
          memory: 75,
          storage: 80,
          network: 92,
          uptime: 98.2,
          errors: [
            {
              id: 'med-001',
              level: 'warning',
              message: 'উচ্চ মেমরি ব্যবহার',
              module: 'medicine-system',
              timestamp: new Date(),
              resolved: false
            }
          ]
        }
      },
      {
        id: 'hospital-services',
        name: 'hospital-services',
        displayName: 'হাসপাতাল সেবা',
        status: 'active',
        version: '1.3.0',
        lastUpdated: new Date(Date.now() - 6 * 60 * 60 * 1000),
        dependencies: ['auth', 'notification'],
        permissions: ['read:hospitals', 'write:appointments'],
        dataConnections: [],
        apiEndpoints: [],
        realTimeFeatures: [],
        healthCheck: {
          overall: 'healthy',
          cpu: 20,
          memory: 40,
          storage: 35,
          network: 96,
          uptime: 99.9,
          errors: []
        }
      },
      {
        id: 'ai-services',
        name: 'ai-services',
        displayName: 'এআই সেবা',
        status: 'error',
        version: '0.9.1',
        lastUpdated: new Date(Date.now() - 12 * 60 * 60 * 1000),
        dependencies: ['auth'],
        permissions: ['read:ai', 'write:analysis'],
        dataConnections: [],
        apiEndpoints: [],
        realTimeFeatures: [],
        healthCheck: {
          overall: 'critical',
          cpu: 85,
          memory: 90,
          storage: 60,
          network: 45,
          uptime: 85.2,
          errors: [
            {
              id: 'ai-001',
              level: 'critical',
              message: 'API কানেকশন ব্যর্থ',
              module: 'ai-services',
              timestamp: new Date(),
              resolved: false,
              details: 'OpenAI API key configuration error'
            }
          ]
        }
      }
    ];

    setModules(sampleModules);
  };

  const loadNotifications = () => {
    const sampleNotifications: SystemNotification[] = [
      {
        id: 'notif-001',
        type: 'system',
        priority: 'high',
        title: 'সিস্টেম আপডেট',
        message: 'নতুন সিকিউরিটি আপডেট উপলব্ধ',
        module: 'system',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: false,
        actionRequired: true,
        actions: [
          { id: 'update', label: 'আপডেট করুন', action: 'system:update', type: 'primary' },
          { id: 'later', label: 'পরে', action: 'system:remind', type: 'secondary' }
        ]
      },
      {
        id: 'notif-002',
        type: 'module',
        priority: 'critical',
        title: 'এআই সেবা ত্রুটি',
        message: 'এআই সেবা কানেকশনে সমস্যা',
        module: 'ai-services',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        read: false,
        actionRequired: true,
        actions: [
          { id: 'fix', label: 'সমাধান করুন', action: 'ai:configure', type: 'primary' },
          { id: 'disable', label: 'নিষ্ক্রিয় করুন', action: 'ai:disable', type: 'danger' }
        ]
      },
      {
        id: 'notif-003',
        type: 'user',
        priority: 'medium',
        title: 'নতুন রোগী নিবন্ধন',
        message: '৫টি নতুন রোগী নিবন্ধিত হয়েছে',
        module: 'patient-management',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        read: true,
        actionRequired: false
      }
    ];

    setNotifications(sampleNotifications);
  };

  const loadDataConnections = () => {
    const sampleConnections: DataConnection[] = [
      {
        id: 'conn-001',
        sourceModule: 'patient-management',
        targetModule: 'doctor-system',
        dataType: 'patient-records',
        syncStatus: 'synced',
        lastSync: new Date(Date.now() - 5 * 60 * 1000),
        recordCount: 1250,
        errorCount: 0
      },
      {
        id: 'conn-002',
        sourceModule: 'doctor-system',
        targetModule: 'medicine-system',
        dataType: 'prescriptions',
        syncStatus: 'syncing',
        lastSync: new Date(Date.now() - 2 * 60 * 1000),
        recordCount: 450,
        errorCount: 2
      },
      {
        id: 'conn-003',
        sourceModule: 'patient-management',
        targetModule: 'hospital-services',
        dataType: 'appointments',
        syncStatus: 'error',
        lastSync: new Date(Date.now() - 30 * 60 * 1000),
        recordCount: 0,
        errorCount: 15
      }
    ];

    setDataConnections(sampleConnections);
  };

  const setupNetworkMonitoring = () => {
    const handleOnline = () => {
      setIsOnline(true);
      showNotification('ইন্টারনেট কানেকশন পুনরুদ্ধার হয়েছে', 'success');
    };

    const handleOffline = () => {
      setIsOnline(false);
      showNotification('ইন্টারনেট কানেকশন বিচ্ছিন্ন', 'error');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  };

  const refreshSystemData = () => {
    loadSystemModules();
    loadNotifications();
    loadDataConnections();
  };

  const getSystemHealth = (): 'healthy' | 'warning' | 'critical' => {
    const criticalModules = modules.filter(m => m.healthCheck.overall === 'critical');
    const warningModules = modules.filter(m => m.healthCheck.overall === 'warning');
    
    if (criticalModules.length > 0) return 'critical';
    if (warningModules.length > 0) return 'warning';
    return 'healthy';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'healthy':
      case 'synced':
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
      case 'syncing':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'error':
      case 'critical':
      case 'disconnected':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'inactive':
      case 'maintenance':
        return <Clock className="w-5 h-5 text-gray-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'healthy':
      case 'synced':
      case 'connected':
        return 'text-green-600 bg-green-100';
      case 'warning':
      case 'syncing':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
      case 'critical':
      case 'disconnected':
        return 'text-red-600 bg-red-100';
      case 'inactive':
      case 'maintenance':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

  const navigateToModule = (moduleId: string, action?: string, data?: any) => {
    // This would integrate with your routing system
    console.log(`Navigating to ${moduleId}`, { action, data });
    showNotification(`${moduleId} মডিউলে নেভিগেট করা হচ্ছে`, 'info');
  };

  const shareData = (fromModule: string, toModule: string, data: any) => {
    // This would handle cross-module data sharing
    console.log(`Sharing data from ${fromModule} to ${toModule}`, data);
    showNotification('ডেটা শেয়ার করা হয়েছে', 'success');
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
  };

  const refreshModule = (moduleId: string) => {
    setModules(prev => 
      prev.map(module => 
        module.id === moduleId 
          ? { ...module, lastUpdated: new Date() }
          : module
      )
    );
    showNotification(`${moduleId} মডিউল রিফ্রেশ করা হয়েছে`, 'success');
  };

  const unreadNotifications = notifications.filter(n => !n.read);
  const criticalNotifications = notifications.filter(n => n.priority === 'critical' && !n.read);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                getSystemHealth() === 'healthy' ? 'bg-green-600' :
                getSystemHealth() === 'warning' ? 'bg-yellow-600' : 'bg-red-600'
              }`}>
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">সিস্টেম ইন্টিগ্রেশন</h1>
                <p className="text-sm text-gray-600">ক্রস-মডিউল কানেক্টিভিটি ও ব্যবস্থাপনা</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Network Status */}
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                <span>{isOnline ? 'অনলাইন' : 'অফলাইন'}</span>
              </div>
              
              {/* Notifications */}
              <div className="relative">
                <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Bell className="w-5 h-5" />
                  {unreadNotifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadNotifications.length}
                    </span>
                  )}
                </button>
              </div>
              
              {/* Auto Refresh Toggle */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`p-2 rounded-lg transition-colors ${
                    autoRefresh 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                  title={autoRefresh ? 'অটো রিফ্রেশ বন্ধ করুন' : 'অটো রিফ্রেশ চালু করুন'}
                >
                  <RefreshCw className={`w-5 h-5 ${autoRefresh ? 'animate-spin' : ''}`} />
                </button>
                
                <button
                  onClick={refreshSystemData}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="ম্যানুয়াল রিফ্রেশ"
                >
                  <Sync className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Alerts */}
      {criticalNotifications.length > 0 && (
        <div className="bg-red-50 border-b border-red-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">
                  {criticalNotifications.length}টি জরুরি সমস্যা সমাধানের প্রয়োজন
                </p>
              </div>
              <button
                onClick={() => setActiveTab('notifications')}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                বিস্তারিত দেখুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'ওভারভিউ', icon: BarChart3 },
              { id: 'modules', label: 'মডিউল', icon: Settings, count: modules.length },
              { id: 'data', label: 'ডেটা সিঙ্ক', icon: Database, count: dataConnections.length },
              { id: 'notifications', label: 'নোটিফিকেশন', icon: Bell, count: unreadNotifications.length },
              { id: 'health', label: 'স্বাস্থ্য পরীক্ষা', icon: Activity }
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
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      tab.id === 'notifications' && unreadNotifications.length > 0
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* System Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">মোট মডিউল</p>
                    <p className="text-2xl font-bold text-gray-900">{modules.length}</p>
                  </div>
                  <Settings className="w-8 h-8 text-blue-600" />
                </div>
                <div className="mt-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-green-600">{modules.filter(m => m.status === 'active').length} সক্রিয়</span>
                    <span className="text-red-600">{modules.filter(m => m.status === 'error').length} ত্রুটি</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">ডেটা সিঙ্ক</p>
                    <p className="text-2xl font-bold text-gray-900">{dataConnections.length}</p>
                  </div>
                  <Database className="w-8 h-8 text-green-600" />
                </div>
                <div className="mt-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-green-600">{dataConnections.filter(c => c.syncStatus === 'synced').length} সিঙ্কড</span>
                    <span className="text-red-600">{dataConnections.filter(c => c.syncStatus === 'error').length} ত্রুটি</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">নোটিফিকেশন</p>
                    <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
                  </div>
                  <Bell className="w-8 h-8 text-yellow-600" />
                </div>
                <div className="mt-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-blue-600">{unreadNotifications.length} অপঠিত</span>
                    <span className="text-red-600">{criticalNotifications.length} জরুরি</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">সিস্টেম স্বাস্থ্য</p>
                    <p className={`text-2xl font-bold ${
                      getSystemHealth() === 'healthy' ? 'text-green-600' :
                      getSystemHealth() === 'warning' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {getSystemHealth() === 'healthy' ? 'সুস্থ' :
                       getSystemHealth() === 'warning' ? 'সতর্কতা' : 'সমস্যা'}
                    </p>
                  </div>
                  <Activity className={`w-8 h-8 ${
                    getSystemHealth() === 'healthy' ? 'text-green-600' :
                    getSystemHealth() === 'warning' ? 'text-yellow-600' : 'text-red-600'
                  }`} />
                </div>
                <div className="mt-4">
                  <div className="text-sm text-gray-600">
                    গড় আপটাইম: {(modules.reduce((acc, m) => acc + m.healthCheck.uptime, 0) / modules.length).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">দ্রুত কার্যক্রম</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'সব মডিউল রিফ্রেশ', action: () => refreshSystemData(), icon: RefreshCw },
                  { label: 'সিস্টেম ব্যাকআপ', action: () => showNotification('ব্যাকআপ শুরু হয়েছে', 'info'), icon: Download },
                  { label: 'লগ এক্সপোর্ট', action: () => showNotification('লগ এক্সপোর্ট করা হচ্ছে', 'info'), icon: Upload },
                  { label: 'সিকিউরিটি স্ক্যান', action: () => showNotification('সিকিউরিটি স্ক্যান শুরু', 'info'), icon: Shield }
                ].map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={action.action}
                      className="flex items-center space-x-2 p-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'modules' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">সিস্টেম মডিউল</h2>
              
              <div className="space-y-4">
                {modules.map(module => (
                  <div key={module.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(module.status)}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{module.displayName}</h3>
                          <p className="text-sm text-gray-600">v{module.version} • {module.name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(module.status)}`}>
                          {module.status === 'active' ? 'সক্রিয়' :
                           module.status === 'error' ? 'ত্রুটি' :
                           module.status === 'inactive' ? 'নিষ্ক্রিয়' : 'রক্ষণাবেক্ষণ'}
                        </span>
                        
                        <button
                          onClick={() => {
                            setSelectedModule(module);
                            setShowModuleDetails(true);
                          }}
                          className="px-3 py-1 text-blue-600 border border-blue-300 rounded hover:bg-blue-50 transition-colors text-sm"
                        >
                          বিস্তারিত
                        </button>
                        
                        <button
                          onClick={() => refreshModule(module.id)}
                          className="px-3 py-1 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm"
                        >
                          রিফ্রেশ
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">শেষ আপডেট:</span>
                        <p>{module.lastUpdated.toLocaleString('bn-BD')}</p>
                      </div>
                      <div>
                        <span className="font-medium">নির্ভরতা:</span>
                        <p>{module.dependencies.length}টি</p>
                      </div>
                      <div>
                        <span className="font-medium">API:</span>
                        <p>{module.apiEndpoints.length}টি</p>
                      </div>
                      <div>
                        <span className="font-medium">আপটাইম:</span>
                        <p>{module.healthCheck.uptime}%</p>
                      </div>
                    </div>
                    
                    {module.healthCheck.errors.length > 0 && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                        <div className="flex items-center space-x-2 text-red-800">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-sm font-medium">{module.healthCheck.errors.length}টি ত্রুটি</span>
                        </div>
                        <div className="mt-2 space-y-1">
                          {module.healthCheck.errors.slice(0, 2).map(error => (
                            <p key={error.id} className="text-sm text-red-700">
                              • {error.message}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'data' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">ডেটা সিঙ্ক্রোনাইজেশন</h2>
              
              <div className="space-y-4">
                {dataConnections.map(connection => (
                  <div key={connection.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(connection.syncStatus)}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {modules.find(m => m.id === connection.sourceModule)?.displayName} → {modules.find(m => m.id === connection.targetModule)?.displayName}
                          </h3>
                          <p className="text-sm text-gray-600">{connection.dataType}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(connection.syncStatus)}`}>
                          {connection.syncStatus === 'synced' ? 'সিঙ্কড' :
                           connection.syncStatus === 'syncing' ? 'সিঙ্ক হচ্ছে' :
                           connection.syncStatus === 'error' ? 'ত্রুটি' : 'অপেক্ষমান'}
                        </span>
                        
                        <button className="px-3 py-1 text-blue-600 border border-blue-300 rounded hover:bg-blue-50 transition-colors text-sm">
                          পুনরায় সিঙ্ক
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">শেষ সিঙ্ক:</span>
                        <p>{connection.lastSync.toLocaleString('bn-BD')}</p>
                      </div>
                      <div>
                        <span className="font-medium">রেকর্ড:</span>
                        <p>{connection.recordCount.toLocaleString('bn-BD')}</p>
                      </div>
                      <div>
                        <span className="font-medium">ত্রুটি:</span>
                        <p className={connection.errorCount > 0 ? 'text-red-600' : 'text-green-600'}>
                          {connection.errorCount}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">স্ট্যাটাস:</span>
                        <p>{connection.syncStatus}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">সিস্টেম নোটিফিকেশন</h2>
                <button
                  onClick={() => {
                    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                    showNotification('সব নোটিফিকেশন পড়া হিসেবে চিহ্নিত', 'success');
                  }}
                  className="px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                >
                  সব পড়া হিসেবে চিহ্নিত করুন
                </button>
              </div>
              
              <div className="space-y-4">
                {notifications.map(notification => (
                  <div key={notification.id} className={`p-4 border rounded-lg ${
                    notification.read ? 'border-gray-200 bg-white' : 'border-blue-200 bg-blue-50'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          notification.priority === 'critical' ? 'bg-red-600' :
                          notification.priority === 'high' ? 'bg-orange-600' :
                          notification.priority === 'medium' ? 'bg-yellow-600' : 'bg-blue-600'
                        }`} />
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              notification.priority === 'critical' ? 'bg-red-100 text-red-800' :
                              notification.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                              notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {notification.priority === 'critical' ? 'জরুরি' :
                               notification.priority === 'high' ? 'উচ্চ' :
                               notification.priority === 'medium' ? 'মাঝারি' : 'নিম্ন'}
                            </span>
                          </div>
                          
                          <p className="text-gray-700 mb-2">{notification.message}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>{notification.module}</span>
                            <span>{notification.timestamp.toLocaleString('bn-BD')}</span>
                            {!notification.read && (
                              <span className="text-blue-600 font-medium">নতুন</span>
                            )}
                          </div>
                          
                          {notification.actions && notification.actions.length > 0 && (
                            <div className="flex items-center space-x-2 mt-3">
                              {notification.actions.map(action => (
                                <button
                                  key={action.id}
                                  onClick={() => {
                                    console.log(`Action: ${action.action}`);
                                    markNotificationRead(notification.id);
                                  }}
                                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                    action.type === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                                    action.type === 'danger' ? 'bg-red-600 text-white hover:bg-red-700' :
                                    'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                  }`}
                                >
                                  {action.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => markNotificationRead(notification.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'health' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">সিস্টেম স্বাস্থ্য পরীক্ষা</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {modules.map(module => (
                  <div key={module.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{module.displayName}</h3>
                      {getStatusIcon(module.healthCheck.overall)}
                    </div>
                    
                    <div className="space-y-3">
                      {[
                        { label: 'CPU', value: module.healthCheck.cpu, color: module.healthCheck.cpu > 80 ? 'red' : module.healthCheck.cpu > 60 ? 'yellow' : 'green' },
                        { label: 'মেমরি', value: module.healthCheck.memory, color: module.healthCheck.memory > 80 ? 'red' : module.healthCheck.memory > 60 ? 'yellow' : 'green' },
                        { label: 'স্টোরেজ', value: module.healthCheck.storage, color: module.healthCheck.storage > 80 ? 'red' : module.healthCheck.storage > 60 ? 'yellow' : 'green' },
                        { label: 'নেটওয়ার্ক', value: module.healthCheck.network, color: module.healthCheck.network < 70 ? 'red' : module.healthCheck.network < 90 ? 'yellow' : 'green' }
                      ].map(metric => (
                        <div key={metric.label}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="font-medium text-gray-700">{metric.label}</span>
                            <span className={`font-medium ${
                              metric.color === 'red' ? 'text-red-600' :
                              metric.color === 'yellow' ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {metric.value}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                metric.color === 'red' ? 'bg-red-600' :
                                metric.color === 'yellow' ? 'bg-yellow-600' : 'bg-green-600'
                              }`}
                              style={{ width: `${metric.value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                      
                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-gray-700">আপটাইম</span>
                          <span className="font-medium text-green-600">{module.healthCheck.uptime}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Module Details Modal */}
      {showModuleDetails && selectedModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full mx-4 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedModule.displayName}</h2>
                <button
                  onClick={() => setShowModuleDetails(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">মডিউল তথ্য</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">নাম:</span> {selectedModule.name}</p>
                      <p><span className="font-medium">সংস্করণ:</span> {selectedModule.version}</p>
                      <p><span className="font-medium">স্ট্যাটাস:</span> {selectedModule.status}</p>
                      <p><span className="font-medium">শেষ আপডেট:</span> {selectedModule.lastUpdated.toLocaleString('bn-BD')}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">নির্ভরতা</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedModule.dependencies.map((dep, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {dep}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">অনুমতি</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                      {selectedModule.permissions.map((permission, index) => (
                        <li key={index}>{permission}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">API এন্ডপয়েন্ট</h3>
                    <div className="space-y-2">
                      {selectedModule.apiEndpoints.map(endpoint => (
                        <div key={endpoint.id} className="p-3 bg-gray-50 rounded">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{endpoint.method} {endpoint.path}</span>
                            {getStatusIcon(endpoint.status)}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            প্রতিক্রিয়া: {endpoint.responseTime}ms • অনুরোধ: {endpoint.requestCount}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">রিয়েল-টাইম ফিচার</h3>
                    <div className="space-y-2">
                      {selectedModule.realTimeFeatures.map(feature => (
                        <div key={feature.id} className="p-3 bg-gray-50 rounded">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{feature.name}</span>
                            {getStatusIcon(feature.status)}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            সংযোগ: {feature.connectionCount} • বার্তা: {feature.messageCount}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedModule.healthCheck.errors.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">ত্রুটি লগ</h3>
                  <div className="space-y-2">
                    {selectedModule.healthCheck.errors.map(error => (
                      <div key={error.id} className="p-3 bg-red-50 border border-red-200 rounded">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-red-800">{error.message}</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            error.level === 'critical' ? 'bg-red-200 text-red-800' :
                            error.level === 'error' ? 'bg-orange-200 text-orange-800' :
                            error.level === 'warning' ? 'bg-yellow-200 text-yellow-800' :
                            'bg-blue-200 text-blue-800'
                          }`}>
                            {error.level}
                          </span>
                        </div>
                        <div className="text-sm text-red-700 mt-1">
                          {error.timestamp.toLocaleString('bn-BD')}
                        </div>
                        {error.details && (
                          <div className="text-sm text-red-600 mt-2">
                            {error.details}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => refreshModule(selectedModule.id)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  রিফ্রেশ
                </button>
                
                <button
                  onClick={() => navigateToModule(selectedModule.id)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  মডিউলে যান
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemIntegration;