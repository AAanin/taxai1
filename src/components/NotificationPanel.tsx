// Notification Panel Component - নোটিফিকেশন প্যানেল কম্পোনেন্ট
import React, { useState } from 'react';
import { useNotification, Notification } from '../contexts/NotificationContext';
import { Bell, X, Check, CheckCheck, Trash2, Filter, Calendar, MessageCircle, AlertTriangle, Settings } from 'lucide-react';

interface NotificationPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen = true, onClose }) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    getNotificationsByCategory
  } = useNotification();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority'>('newest');

  const categories = [
    { id: 'all', label: 'সব নোটিফিকেশন', icon: Bell },
    { id: 'appointment', label: 'অ্যাপয়েন্টমেন্ট', icon: Calendar },
    { id: 'message', label: 'মেসেজ', icon: MessageCircle },
    { id: 'alert', label: 'সতর্কতা', icon: AlertTriangle },
    { id: 'system', label: 'সিস্টেম', icon: Settings }
  ];

  const getFilteredNotifications = () => {
    let filtered = selectedCategory === 'all' 
      ? notifications 
      : getNotificationsByCategory(selectedCategory);

    // Sort notifications
    switch (sortBy) {
      case 'newest':
        filtered = filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        break;
      case 'oldest':
        filtered = filtered.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        break;
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        filtered = filtered.sort((a, b) => {
          const aPriority = priorityOrder[a.priority || 'low'];
          const bPriority = priorityOrder[b.priority || 'low'];
          return bPriority - aPriority;
        });
        break;
    }

    return filtered;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-blue-500 bg-blue-50';
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'এখনই';
    if (minutes < 60) return `${minutes} মিনিট আগে`;
    if (hours < 24) return `${hours} ঘন্টা আগে`;
    return `${days} দিন আগে`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose || (() => {})} />
      
      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-medical-primary to-medical-secondary text-white">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <h2 className="text-lg font-semibold">নোটিফিকেশন</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose || (() => {})}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          {/* Category Filter */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">ক্যাটেগরি</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-medical-primary text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{category.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex items-center justify-between">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-medical-primary"
            >
              <option value="newest">নতুন প্রথমে</option>
              <option value="oldest">পুরাতন প্রথমে</option>
              <option value="priority">অগ্রাধিকার অনুযায়ী</option>
            </select>

            <div className="flex space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center space-x-1 text-xs text-medical-primary hover:text-medical-secondary transition-colors"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>সব পড়া হয়েছে</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="flex items-center space-x-1 text-xs text-red-600 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>সব মুছুন</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {getFilteredNotifications().length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Bell className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-center">
                {selectedCategory === 'all' 
                  ? 'কোনো নোটিফিকেশন নেই'
                  : `${categories.find(c => c.id === selectedCategory)?.label} এ কোনো নোটিফিকেশন নেই`
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {getFilteredNotifications().map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors border-l-4 ${
                    !notification.read ? 'bg-blue-50' : 'bg-white'
                  } ${getPriorityColor(notification.priority)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                        <h3 className={`font-medium ${
                          !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{formatTime(notification.timestamp)}</span>
                        {notification.category && (
                          <span className="bg-gray-200 px-2 py-1 rounded">
                            {categories.find(c => c.id === notification.category)?.label}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-1 ml-2">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                          title="পড়া হয়েছে চিহ্নিত করুন"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {notification.actionUrl && (
                    <button className="mt-2 text-xs text-medical-primary hover:text-medical-secondary transition-colors">
                      বিস্তারিত দেখুন →
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;