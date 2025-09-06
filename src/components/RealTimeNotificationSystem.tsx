// Real-time Notification System - রিয়েল-টাইম নোটিফিকেশন সিস্টেম
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Bell, X, Check, AlertTriangle, Info, Heart, Calendar,
  MessageSquare, Phone, Video, Pill, FileText, Users,
  Clock, MapPin, Star, Settings, Volume2, VolumeX,
  Smartphone, Mail, MessageCircle, Zap, Shield,
  Activity, TrendingUp, Download, Share2, Filter
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

// Enhanced Types for Real-time Notifications
interface RealTimeNotification {
  id: string;
  type: 'medical' | 'appointment' | 'medication' | 'emergency' | 'system' | 'chat' | 'call' | 'reminder';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionRequired: boolean;
  actions?: NotificationAction[];
  data?: any;
  source: string;
  category: string;
  expiresAt?: Date;
  persistent: boolean;
  sound: boolean;
  vibration: boolean;
  channels: NotificationChannel[];
}

interface NotificationAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  action: () => void;
}

interface NotificationChannel {
  type: 'push' | 'email' | 'sms' | 'whatsapp' | 'in-app';
  enabled: boolean;
  settings: any;
}

interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  desktop: boolean;
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  categories: {
    [key: string]: {
      enabled: boolean;
      priority: 'low' | 'medium' | 'high' | 'critical';
    };
  };
}

interface NotificationStats {
  total: number;
  unread: number;
  today: number;
  thisWeek: number;
  byType: { [key: string]: number };
  byPriority: { [key: string]: number };
}

const RealTimeNotificationSystem: React.FC = () => {
  const [notifications, setNotifications] = useState<RealTimeNotification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    sound: true,
    vibration: true,
    desktop: true,
    email: true,
    sms: false,
    whatsapp: false,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    },
    categories: {
      medical: { enabled: true, priority: 'high' },
      appointment: { enabled: true, priority: 'medium' },
      medication: { enabled: true, priority: 'high' },
      emergency: { enabled: true, priority: 'critical' },
      system: { enabled: true, priority: 'low' },
      chat: { enabled: true, priority: 'medium' },
      call: { enabled: true, priority: 'high' },
      reminder: { enabled: true, priority: 'medium' }
    }
  });
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    today: 0,
    thisWeek: 0,
    byType: {},
    byPriority: {}
  });
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'settings'>('all');
  const [filter, setFilter] = useState<string>('all');
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const wsRef = useRef<WebSocket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize notification system
  useEffect(() => {
    initializeNotificationSystem();
    loadNotifications();
    setupWebSocketConnection();
    requestNotificationPermission();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Update stats when notifications change
  useEffect(() => {
    updateNotificationStats();
  }, [notifications]);

  const initializeNotificationSystem = () => {
    try {
      // Initialize audio for notification sounds with error handling
      audioRef.current = new Audio('/notification-sound.mp3');
      audioRef.current.volume = 0.5;
      
      // Add event listeners for audio loading
      audioRef.current.addEventListener('canplaythrough', () => {
        console.log('Notification sound loaded successfully');
      });
      
      audioRef.current.addEventListener('error', (e) => {
        console.warn('Notification sound failed to load:', e);
        // Fallback: disable sound notifications
        setSettings(prev => ({ ...prev, sound: false }));
      });
      
      audioRef.current.addEventListener('loadstart', () => {
        console.log('Loading notification sound...');
      });
      
      // Load settings from localStorage
      const savedSettings = localStorage.getItem('notificationSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Failed to initialize notification system:', error);
      // Fallback: disable sound notifications on error
      setSettings(prev => ({ ...prev, sound: false }));
    }
  };

  const setupWebSocketConnection = () => {
    try {
      // Simulate WebSocket connection for real-time notifications
      setConnectionStatus('connecting');
      
      // In a real implementation, this would connect to your WebSocket server
      setTimeout(() => {
        setConnectionStatus('connected');
        setIsConnected(true);
        
        // Simulate receiving real-time notifications
        simulateRealTimeNotifications();
      }, 2000);
      
    } catch (error) {
      console.error('WebSocket connection error:', error);
      setConnectionStatus('disconnected');
      setIsConnected(false);
    }
  };

  const simulateRealTimeNotifications = () => {
    // Simulate receiving notifications every 30 seconds
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance of receiving a notification
        const sampleNotifications = [
          {
            type: 'appointment' as const,
            priority: 'medium' as const,
            title: 'আগামীকাল অ্যাপয়েন্টমেন্ট',
            message: 'ডা. করিমের সাথে আগামীকাল সকাল ১০টায় অ্যাপয়েন্টমেন্ট রয়েছে',
            source: 'Appointment System',
            category: 'appointment'
          },
          {
            type: 'medication' as const,
            priority: 'high' as const,
            title: 'ওষুধ সেবনের সময়',
            message: 'প্যারাসিটামল ৫০০mg সেবন করার সময় হয়েছে',
            source: 'Medicine Reminder',
            category: 'medication'
          },
          {
            type: 'chat' as const,
            priority: 'medium' as const,
            title: 'নতুন মেসেজ',
            message: 'ডা. রহমান আপনাকে একটি মেসেজ পাঠিয়েছেন',
            source: 'Chat System',
            category: 'chat'
          },
          {
            type: 'medical' as const,
            priority: 'high' as const,
            title: 'ল্যাব রিপোর্ট প্রস্তুত',
            message: 'আপনার রক্ত পরীক্ষার রিপোর্ট প্রস্তুত হয়েছে',
            source: 'Lab System',
            category: 'medical'
          }
        ];
        
        const randomNotification = sampleNotifications[Math.floor(Math.random() * sampleNotifications.length)];
        addNotification(randomNotification);
      }
    }, 30000);
    
    return () => clearInterval(interval);
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          showNotification('ডেস্কটপ নোটিফিকেশন চালু করা হয়েছে', 'success');
        }
      } catch (error) {
        console.error('Notification permission error:', error);
      }
    }
  };

  const loadNotifications = () => {
    // Load sample notifications
    const sampleNotifications: RealTimeNotification[] = [
      {
        id: '1',
        type: 'appointment',
        priority: 'high',
        title: 'আজকের অ্যাপয়েন্টমেন্ট',
        message: 'ডা. আহমেদের সাথে আজ বিকাল ৩টায় অ্যাপয়েন্টমেন্ট রয়েছে',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: false,
        actionRequired: true,
        actions: [
          {
            id: 'confirm',
            label: 'নিশ্চিত করুন',
            type: 'primary',
            action: () => console.log('Appointment confirmed')
          },
          {
            id: 'reschedule',
            label: 'পুনঃনির্ধারণ',
            type: 'secondary',
            action: () => console.log('Reschedule appointment')
          }
        ],
        source: 'Appointment System',
        category: 'appointment',
        persistent: true,
        sound: true,
        vibration: true,
        channels: [
          { type: 'push', enabled: true, settings: {} },
          { type: 'email', enabled: true, settings: {} }
        ]
      },
      {
        id: '2',
        type: 'medication',
        priority: 'critical',
        title: 'ওষুধ সেবনের সময়',
        message: 'আপনার রক্তচাপের ওষুধ সেবন করার সময় হয়েছে',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        read: false,
        actionRequired: true,
        actions: [
          {
            id: 'taken',
            label: 'সেবন করেছি',
            type: 'primary',
            action: () => console.log('Medicine taken')
          },
          {
            id: 'snooze',
            label: '১০ মিনিট পর',
            type: 'secondary',
            action: () => console.log('Snooze 10 minutes')
          }
        ],
        source: 'Medicine Reminder',
        category: 'medication',
        persistent: true,
        sound: true,
        vibration: true,
        channels: [
          { type: 'push', enabled: true, settings: {} },
          { type: 'sms', enabled: true, settings: {} }
        ]
      },
      {
        id: '3',
        type: 'medical',
        priority: 'medium',
        title: 'নতুন ল্যাব রিপোর্ট',
        message: 'আপনার সিবিসি টেস্টের রিপোর্ট আপলোড করা হয়েছে',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        read: true,
        actionRequired: false,
        actions: [
          {
            id: 'view',
            label: 'রিপোর্ট দেখুন',
            type: 'primary',
            action: () => console.log('View report')
          }
        ],
        source: 'Lab System',
        category: 'medical',
        persistent: false,
        sound: false,
        vibration: false,
        channels: [
          { type: 'push', enabled: true, settings: {} },
          { type: 'email', enabled: true, settings: {} }
        ]
      },
      {
        id: '4',
        type: 'chat',
        priority: 'medium',
        title: 'নতুন মেসেজ',
        message: 'ডা. খান: "আপনার রিপোর্ট দেখেছি, সব স্বাভাবিক আছে"',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        read: false,
        actionRequired: false,
        actions: [
          {
            id: 'reply',
            label: 'উত্তর দিন',
            type: 'primary',
            action: () => console.log('Reply to message')
          }
        ],
        source: 'Chat System',
        category: 'chat',
        persistent: false,
        sound: true,
        vibration: true,
        channels: [
          { type: 'push', enabled: true, settings: {} }
        ]
      },
      {
        id: '5',
        type: 'emergency',
        priority: 'critical',
        title: 'জরুরি সতর্কতা',
        message: 'আপনার এলাকায় ডেঙ্গু প্রাদুর্ভাব বৃদ্ধি পেয়েছে। সতর্ক থাকুন।',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        read: true,
        actionRequired: true,
        actions: [
          {
            id: 'learn-more',
            label: 'আরো জানুন',
            type: 'primary',
            action: () => console.log('Learn more about dengue')
          }
        ],
        source: 'Health Alert System',
        category: 'emergency',
        persistent: true,
        sound: true,
        vibration: true,
        channels: [
          { type: 'push', enabled: true, settings: {} },
          { type: 'email', enabled: true, settings: {} },
          { type: 'sms', enabled: true, settings: {} }
        ]
      }
    ];

    setNotifications(sampleNotifications);
  };

  const addNotification = (notificationData: Partial<RealTimeNotification>) => {
    const newNotification: RealTimeNotification = {
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
      actionRequired: false,
      persistent: false,
      sound: settings.sound,
      vibration: settings.vibration,
      channels: [
        { type: 'push', enabled: true, settings: {} },
        { type: 'in-app', enabled: true, settings: {} }
      ],
      ...notificationData
    } as RealTimeNotification;

    setNotifications(prev => [newNotification, ...prev]);
    
    // Play notification sound with better error handling
    if (settings.sound && newNotification.sound && audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.warn('Failed to play notification sound:', error);
        // Try alternative notification method
        if ('vibrate' in navigator && settings.vibration) {
          navigator.vibrate([200, 100, 200]);
        }
      });
    }
    
    // Show desktop notification
    if (settings.desktop && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(newNotification.title, {
        body: newNotification.message,
        icon: '/favicon.ico',
        tag: newNotification.id
      });
    }
    
    // Vibrate if supported
    if (settings.vibration && newNotification.vibration && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
    
    // Show in-app notification
    showNotification(newNotification.title, 
      newNotification.priority === 'critical' ? 'error' :
      newNotification.priority === 'high' ? 'warning' :
      newNotification.priority === 'medium' ? 'info' : 'success'
    );
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const updateNotificationStats = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const stats: NotificationStats = {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      today: notifications.filter(n => n.timestamp >= today).length,
      thisWeek: notifications.filter(n => n.timestamp >= thisWeek).length,
      byType: {},
      byPriority: {}
    };
    
    notifications.forEach(notification => {
      stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
      stats.byPriority[notification.priority] = (stats.byPriority[notification.priority] || 0) + 1;
    });
    
    setStats(stats);
  };

  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(updatedSettings));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'medical': return <Heart className="w-5 h-5" />;
      case 'appointment': return <Calendar className="w-5 h-5" />;
      case 'medication': return <Pill className="w-5 h-5" />;
      case 'emergency': return <AlertTriangle className="w-5 h-5" />;
      case 'system': return <Settings className="w-5 h-5" />;
      case 'chat': return <MessageSquare className="w-5 h-5" />;
      case 'call': return <Phone className="w-5 h-5" />;
      case 'reminder': return <Clock className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'low': return 'text-gray-600 bg-gray-100 border-gray-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getConnectionStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'connecting': return 'text-yellow-600';
      case 'disconnected': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'unread' && notification.read) return false;
    if (filter !== 'all' && notification.type !== filter) return false;
    return true;
  });

  return (
    <>
      {/* Notification Bell Icon */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Bell className="w-6 h-6" />
          {stats.unread > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {stats.unread > 99 ? '99+' : stats.unread}
            </span>
          )}
          
          {/* Connection Status Indicator */}
          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
            connectionStatus === 'connected' ? 'bg-green-500' :
            connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
          }`}></div>
        </button>
      </div>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-[600px] overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">নোটিফিকেশন</h3>
              <div className="flex items-center space-x-2">
                <div className={`flex items-center space-x-1 text-xs ${getConnectionStatusColor(connectionStatus)}`}>
                  <div className={`w-2 h-2 rounded-full ${
                    connectionStatus === 'connected' ? 'bg-green-500' :
                    connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span>
                    {connectionStatus === 'connected' ? 'সংযুক্ত' :
                     connectionStatus === 'connecting' ? 'সংযোগ হচ্ছে' : 'সংযোগ বিচ্ছিন্ন'}
                  </span>
                </div>
                
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div>
                <div className="font-semibold text-gray-900">{stats.total}</div>
                <div className="text-gray-500">মোট</div>
              </div>
              <div>
                <div className="font-semibold text-red-600">{stats.unread}</div>
                <div className="text-gray-500">অপঠিত</div>
              </div>
              <div>
                <div className="font-semibold text-blue-600">{stats.today}</div>
                <div className="text-gray-500">আজকের</div>
              </div>
              <div>
                <div className="font-semibold text-green-600">{stats.thisWeek}</div>
                <div className="text-gray-500">সপ্তাহের</div>
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {[
              { id: 'all', label: 'সব', count: stats.total },
              { id: 'unread', label: 'অপঠিত', count: stats.unread },
              { id: 'settings', label: 'সেটিংস', count: null }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {tab.count !== null && tab.count > 0 && (
                  <span className="ml-1 bg-gray-200 text-gray-700 text-xs rounded-full px-2 py-0.5">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
          
          {activeTab !== 'settings' && (
            <>
              {/* Filter & Actions */}
              <div className="p-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="all">সব ধরনের</option>
                    <option value="medical">চিকিৎসা</option>
                    <option value="appointment">অ্যাপয়েন্টমেন্ট</option>
                    <option value="medication">ওষুধ</option>
                    <option value="emergency">জরুরি</option>
                    <option value="chat">চ্যাট</option>
                    <option value="reminder">রিমাইন্ডার</option>
                  </select>
                  
                  <div className="flex items-center space-x-2">
                    {stats.unread > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        সব পড়া হয়েছে
                      </button>
                    )}
                    
                    <button
                      onClick={clearAllNotifications}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      সব মুছুন
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p>কোনো নোটিফিকেশন নেই</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredNotifications.map(notification => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 transition-colors ${
                          !notification.read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${getPriorityColor(notification.priority)}`}>
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className={`text-sm font-medium ${
                                !notification.read ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {notification.title}
                              </h4>
                              
                              <div className="flex items-center space-x-1">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                                  {notification.priority === 'critical' ? 'জরুরি' :
                                   notification.priority === 'high' ? 'উচ্চ' :
                                   notification.priority === 'medium' ? 'মাঝারি' : 'নিম্ন'}
                                </span>
                                
                                <button
                                  onClick={() => deleteNotification(notification.id)}
                                  className="p-1 text-gray-400 hover:text-red-600 rounded"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>{notification.timestamp.toLocaleString('bn-BD')}</span>
                                <span>•</span>
                                <span>{notification.source}</span>
                              </div>
                              
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-xs text-blue-600 hover:text-blue-800"
                                >
                                  পড়া হয়েছে
                                </button>
                              )}
                            </div>
                            
                            {/* Actions */}
                            {notification.actions && notification.actions.length > 0 && (
                              <div className="flex items-center space-x-2 mt-3">
                                {notification.actions.map(action => (
                                  <button
                                    key={action.id}
                                    onClick={() => {
                                      action.action();
                                      markAsRead(notification.id);
                                    }}
                                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                      action.type === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                                      action.type === 'danger' ? 'bg-red-600 text-white hover:bg-red-700' :
                                      'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                  >
                                    {action.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
          
          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="space-y-4">
                {/* General Settings */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">সাধারণ সেটিংস</h4>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">নোটিফিকেশন চালু</span>
                      <input
                        type="checkbox"
                        checked={settings.enabled}
                        onChange={(e) => updateSettings({ enabled: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                    
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">সাউন্ড</span>
                      <input
                        type="checkbox"
                        checked={settings.sound}
                        onChange={(e) => updateSettings({ sound: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                    
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">ভাইব্রেশন</span>
                      <input
                        type="checkbox"
                        checked={settings.vibration}
                        onChange={(e) => updateSettings({ vibration: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                    
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">ডেস্কটপ নোটিফিকেশন</span>
                      <input
                        type="checkbox"
                        checked={settings.desktop}
                        onChange={(e) => updateSettings({ desktop: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                  </div>
                </div>
                
                {/* Channel Settings */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">চ্যানেল সেটিংস</h4>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">ইমেইল</span>
                      <input
                        type="checkbox"
                        checked={settings.email}
                        onChange={(e) => updateSettings({ email: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                    
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">SMS</span>
                      <input
                        type="checkbox"
                        checked={settings.sms}
                        onChange={(e) => updateSettings({ sms: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                    
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">WhatsApp</span>
                      <input
                        type="checkbox"
                        checked={settings.whatsapp}
                        onChange={(e) => updateSettings({ whatsapp: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                  </div>
                </div>
                
                {/* Quiet Hours */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">নিরব সময়</h4>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">নিরব সময় চালু</span>
                      <input
                        type="checkbox"
                        checked={settings.quietHours.enabled}
                        onChange={(e) => updateSettings({ 
                          quietHours: { ...settings.quietHours, enabled: e.target.checked }
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                    
                    {settings.quietHours.enabled && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">শুরু</label>
                          <input
                            type="time"
                            value={settings.quietHours.start}
                            onChange={(e) => updateSettings({ 
                              quietHours: { ...settings.quietHours, start: e.target.value }
                            })}
                            className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">শেষ</label>
                          <input
                            type="time"
                            value={settings.quietHours.end}
                            onChange={(e) => updateSettings({ 
                              quietHours: { ...settings.quietHours, end: e.target.value }
                            })}
                            className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}        
        </div>
      )}
    </>
  );
};

export default RealTimeNotificationSystem;