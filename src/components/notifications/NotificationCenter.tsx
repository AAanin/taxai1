import React, { useState } from 'react';
import { useNotifications, Notification } from '../../hooks/useNotifications';
import { 
  Bell, 
  BellRing, 
  Check, 
  CheckCheck, 
  Trash2, 
  Settings, 
  X,
  Calendar,
  Pill,
  FileText,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '../ui/LoadingSpinner';

interface NotificationCenterProps {
  className?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ className = '' }) => {
  const {
    notifications,
    unreadCount,
    loading,
    settings,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    updateSettings,
    refreshNotifications
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'prescription':
        return <Pill className="w-4 h-4 text-green-600" />;
      case 'medical_record':
        return <FileText className="w-4 h-4 text-purple-600" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getNotificationBgColor = (type: Notification['type'], read: boolean) => {
    const baseColor = read ? 'bg-gray-50' : 'bg-white';
    const borderColor = read ? 'border-gray-200' : 'border-blue-200';
    
    return `${baseColor} ${borderColor}`;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'এখনই';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} মিনিট আগে`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} ঘন্টা আগে`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} দিন আগে`;
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    // Handle navigation based on notification type and data
    if (notification.data) {
      switch (notification.type) {
        case 'appointment':
          // Navigate to appointments page
          window.location.href = '/appointments';
          break;
        case 'prescription':
          // Navigate to prescriptions page
          window.location.href = '/prescriptions';
          break;
        case 'medical_record':
          // Navigate to medical records page
          window.location.href = '/medical-records';
          break;
        default:
          break;
      }
    }
  };

  const handleSettingsUpdate = async (key: keyof typeof settings, value: boolean) => {
    if (!settings) return;
    
    setSettingsLoading(true);
    try {
      await updateSettings({ [key]: value });
    } catch (error) {
      toast.error('সেটিংস আপডেট করতে সমস্যা হয়েছে');
    } finally {
      setSettingsLoading(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        title="নোটিফিকেশন"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-6 h-6" />
        ) : (
          <Bell className="w-6 h-6" />
        )}
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">নোটিফিকেশন</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1 text-gray-500 hover:text-gray-700 rounded transition-colors"
                title="সেটিংস"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-500 hover:text-gray-700 rounded transition-colors"
                title="বন্ধ করুন"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && settings && (
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h4 className="text-sm font-medium text-gray-900 mb-3">নোটিফিকেশন সেটিংস</h4>
              <div className="space-y-2">
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">পুশ নোটিফিকেশন</span>
                  <input
                    type="checkbox"
                    checked={settings.push_notifications}
                    onChange={(e) => handleSettingsUpdate('push_notifications', e.target.checked)}
                    disabled={settingsLoading}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">অ্যাপয়েন্টমেন্ট রিমাইন্ডার</span>
                  <input
                    type="checkbox"
                    checked={settings.appointment_reminders}
                    onChange={(e) => handleSettingsUpdate('appointment_reminders', e.target.checked)}
                    disabled={settingsLoading}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">ওষুধ রিমাইন্ডার</span>
                  <input
                    type="checkbox"
                    checked={settings.prescription_reminders}
                    onChange={(e) => handleSettingsUpdate('prescription_reminders', e.target.checked)}
                    disabled={settingsLoading}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">মেডিকেল রেকর্ড আপডেট</span>
                  <input
                    type="checkbox"
                    checked={settings.medical_record_updates}
                    onChange={(e) => handleSettingsUpdate('medical_record_updates', e.target.checked)}
                    disabled={settingsLoading}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Actions */}
          {!showSettings && notifications.length > 0 && (
            <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
              <button
                onClick={markAllAsRead}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                disabled={unreadCount === 0}
              >
                <CheckCheck className="w-4 h-4 mr-1" />
                সব পড়া হয়েছে
              </button>
              <button
                onClick={() => {
                  if (confirm('সব নোটিফিকেশন মুছে ফেলতে চান?')) {
                    clearAllNotifications();
                  }
                }}
                className="flex items-center text-sm text-red-600 hover:text-red-800 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                সব মুছুন
              </button>
            </div>
          )}

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <LoadingSpinner size="sm" text="লোড হচ্ছে..." />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">কোনো নোটিফিকেশন নেই</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 ${
                      notification.read ? 'border-transparent' : 'border-blue-500'
                    } ${getNotificationBgColor(notification.type, notification.read)}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${
                              notification.read ? 'text-gray-700' : 'text-gray-900'
                            }`}>
                              {notification.title}
                            </p>
                            <p className={`text-sm mt-1 ${
                              notification.read ? 'text-gray-500' : 'text-gray-700'
                            }`}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {formatTimeAgo(notification.created_at)}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-1 ml-2">
                            {!notification.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                                title="পড়া হয়েছে বলে চিহ্নিত করুন"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                              title="মুছে ফেলুন"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={refreshNotifications}
                className="w-full text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                রিফ্রেশ করুন
              </button>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationCenter;