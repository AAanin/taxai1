// Notifications Panel Component - নোটিফিকেশন প্যানেল কম্পোনেন্ট
// Displays user notifications and alerts

import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Clock, AlertCircle, Calendar, Pill, FileText, User } from 'lucide-react';

export interface Notification {
  id: string;
  type: 'appointment' | 'medicine' | 'report' | 'general';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications?: Notification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  isOpen,
  onClose,
  notifications: propNotifications,
  onMarkAsRead,
  onMarkAllAsRead
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  
  // Default notifications if none provided
  const [notifications, setNotifications] = useState<Notification[]>(propNotifications || [
    {
      id: '1',
      type: 'appointment',
      title: 'আগামীকাল অ্যাপয়েন্টমেন্ট',
      message: 'ডাঃ রহমানের সাথে আপনার অ্যাপয়েন্টমেন্ট আগামীকাল সকাল ১০টায়',
      time: '২ ঘন্টা আগে',
      isRead: false,
      priority: 'high'
    },
    {
      id: '2',
      type: 'medicine',
      title: 'ওষুধ খাওয়ার সময়',
      message: 'আপনার রক্তচাপের ওষুধ খাওয়ার সময় হয়েছে',
      time: '৩০ মিনিট আগে',
      isRead: false,
      priority: 'high'
    },
    {
      id: '3',
      type: 'report',
      title: 'রিপোর্ট প্রস্তুত',
      message: 'আপনার রক্ত পরীক্ষার রিপোর্ট প্রস্তুত হয়েছে',
      time: '১ দিন আগে',
      isRead: true,
      priority: 'medium'
    },
    {
      id: '4',
      type: 'general',
      title: 'স্বাস্থ্য টিপস',
      message: 'নিয়মিত ব্যায়াম করুন এবং পর্যাপ্ত পানি পান করুন',
      time: '২ দিন আগে',
      isRead: true,
      priority: 'low'
    }
  ]);

  useEffect(() => {
    if (propNotifications) {
      setNotifications(propNotifications);
    }
  }, [propNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return Calendar;
      case 'medicine':
        return Pill;
      case 'report':
        return FileText;
      default:
        return Bell;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 shadow-red-100';
      case 'medium':
        return 'text-amber-600 bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 shadow-amber-100';
      default:
        return 'text-blue-600 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 shadow-blue-100';
    }
  };

  const handleMarkAsRead = (id: string) => {
    if (onMarkAsRead) {
      onMarkAsRead(id);
    } else {
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      );
    }
  };

  const handleMarkAllAsRead = () => {
    if (onMarkAllAsRead) {
      onMarkAllAsRead();
    } else {
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile backdrop */}
      <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
      
      {/* Panel */}
      <div 
        ref={panelRef}
        className="fixed top-0 right-0 h-full w-full bg-white shadow-2xl lg:absolute lg:top-full lg:right-0 lg:mt-2 lg:h-auto lg:max-h-[85vh] lg:w-96 xl:w-[420px] lg:rounded-2xl lg:border lg:shadow-xl border-gray-200 transform transition-all duration-300 ease-out z-[9999] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 lg:p-5 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-purple-50/50 flex-shrink-0">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-md flex-shrink-0">
              <Bell className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 truncate">বিজ্ঞপ্তি</h2>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-500 truncate">{unreadCount}টি নতুন বার্তা</p>
              )}
            </div>
            {unreadCount > 0 && (
              <span className="px-2 py-1 text-xs font-bold bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full shadow-md animate-pulse flex-shrink-0">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="hidden sm:block text-xs lg:text-sm text-blue-600 hover:text-blue-700 font-medium px-2 sm:px-3 py-1.5 hover:bg-blue-50 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-200 whitespace-nowrap"
              >
                সব পড়া হয়েছে
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105 touch-manipulation flex-shrink-0"
              aria-label="বন্ধ করুন"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 overscroll-contain min-h-0">
          {notifications.length === 0 ? (
            <div className="p-6 sm:p-8 lg:p-12 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-gray-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">কোন বিজ্ঞপ্তি নেই</h3>
              <p className="text-sm text-gray-500">আপনার সব বিজ্ঞপ্তি এখানে দেখা যাবে</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {notifications.map((notification) => {
                const IconComponent = getNotificationIcon(notification.type);
                return (
                  <div
                    key={notification.id}
                    className={`p-3 sm:p-4 lg:p-5 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-200 cursor-pointer group touch-manipulation ${
                      !notification.isRead ? 'bg-gradient-to-r from-blue-50/70 to-purple-50/30 border-l-4 border-blue-400' : 'hover:border-l-4 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <div className={`p-2 sm:p-2.5 rounded-xl shadow-sm group-hover:shadow-md transition-all duration-200 flex-shrink-0 ${getPriorityColor(notification.priority)}`}>
                        <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1 gap-2">
                          <h3 className={`text-sm sm:text-base font-semibold leading-tight flex-1 min-w-0 ${
                            !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                              className="p-1 sm:p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100 flex-shrink-0"
                              title="পড়া হয়েছে চিহ্নিত করুন"
                            >
                              <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          )}
                        </div>
                        <p className={`text-sm sm:text-base leading-relaxed mb-2 sm:mb-3 break-words ${
                          !notification.isRead ? 'text-gray-700' : 'text-gray-500'
                        }`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-xs sm:text-sm text-gray-500 min-w-0 flex-1">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 flex-shrink-0" />
                            <span className="truncate">{notification.time}</span>
                          </div>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse flex-shrink-0 ml-2"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 sm:p-4 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
            <div className="flex items-center justify-between gap-2">
              {/* Mark all as read button for mobile */}
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllAsRead}
                  className="sm:hidden flex-1 text-center text-xs text-blue-600 hover:text-blue-700 font-medium py-2 px-3 hover:bg-blue-50 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-200 touch-manipulation"
                >
                  সব পড়া হয়েছে
                </button>
              )}
              <button className="flex-1 text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2.5 hover:bg-blue-50 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-200 touch-manipulation">
                সব বিজ্ঞপ্তি দেখুন
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationsPanel;