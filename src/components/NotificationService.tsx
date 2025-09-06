import React, { useEffect, useState } from 'react';
import { Bell, BellOff, Check, X } from 'lucide-react';
import { requestNotificationPermission, onMessageListener } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { MedicationSchedule, MedicationDose, MedicationInfo, getUpcomingDoses, generateReminderMessage } from '../utils/medicineTracker';

interface NotificationServiceProps {
  currentLanguage: 'en' | 'bn';
  medicationSchedules?: MedicationSchedule[];
}

interface NotificationMessage {
  id: string;
  title: string;
  body: string;
  timestamp: Date;
  read: boolean;
}

const NotificationService: React.FC<NotificationServiceProps> = ({ currentLanguage, medicationSchedules = [] }) => {
  const { isAuthenticated, userInfo } = useAuth();
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [showNotifications, setShowNotifications] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [medicationReminderInterval, setMedicationReminderInterval] = useState<NodeJS.Timeout | null>(null);

  const texts = {
    en: {
      enableNotifications: 'Enable Notifications',
      disableNotifications: 'Disable Notifications',
      noNotifications: 'No notifications',
      markAllRead: 'Mark all as read',
      notificationPermissionDenied: 'Notification permission denied',
      notificationEnabled: 'Notifications enabled successfully',
      medicineReminder: 'Medicine Reminder',
      appointmentReminder: 'Appointment Reminder',
      newMessage: 'New Message'
    },
    bn: {
      enableNotifications: 'নোটিফিকেশন চালু করুন',
      disableNotifications: 'নোটিফিকেশন বন্ধ করুন',
      noNotifications: 'কোন নোটিফিকেশন নেই',
      markAllRead: 'সব পড়া হিসেবে চিহ্নিত করুন',
      notificationPermissionDenied: 'নোটিফিকেশনের অনুমতি প্রত্যাখ্যান করা হয়েছে',
      notificationEnabled: 'নোটিফিকেশন সফলভাবে চালু করা হয়েছে',
      medicineReminder: 'ওষুধের রিমাইন্ডার',
      appointmentReminder: 'অ্যাপয়েন্টমেন্ট রিমাইন্ডার',
      newMessage: 'নতুন বার্তা'
    }
  };

  useEffect(() => {
    // Check current notification permission
    setNotificationPermission(Notification.permission);

    // Load saved notifications from localStorage
    const savedNotifications = localStorage.getItem('medical-notifications');
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        setNotifications(parsed);
      } catch (error) {
        console.error('Error parsing saved notifications:', error);
      }
    }

    // Listen for foreground messages
    if (isAuthenticated && Notification.permission === 'granted') {
      onMessageListener()
        .then((payload: any) => {
          console.log('Received foreground message:', payload);
          addNotification(
            payload.notification?.title || texts[currentLanguage].newMessage,
            payload.notification?.body || ''
          );
        })
        .catch((err) => console.log('Failed to receive message:', err));
    }

    // Set up medication reminder interval
    if (isAuthenticated && medicationSchedules.length > 0 && notificationPermission === 'granted') {
      const interval = setInterval(checkMedicationReminders, 60000); // Check every minute
      setMedicationReminderInterval(interval);
      
      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    }
  }, [isAuthenticated, currentLanguage, medicationSchedules, notificationPermission]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (medicationReminderInterval) {
        clearInterval(medicationReminderInterval);
      }
    };
  }, [medicationReminderInterval]);

  const addNotification = (title: string, body: string) => {
    const newNotification: NotificationMessage = {
      id: Date.now().toString(),
      title,
      body,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, 50); // Keep only last 50 notifications
      localStorage.setItem('medical-notifications', JSON.stringify(updated));
      return updated;
    });

    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'medical-notification'
      });
    }
  };

  const checkMedicationReminders = () => {
    if (!medicationSchedules.length || notificationPermission !== 'granted') {
      return;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    medicationSchedules.forEach(schedule => {
      const upcomingDoses = getUpcomingDoses(schedule, now);
      
      upcomingDoses.forEach(dose => {
        const doseTime = new Date(dose.scheduledTime);
        const doseMinutes = doseTime.getHours() * 60 + doseTime.getMinutes();
        
        // Check if it's time for the dose (within 1 minute)
        if (Math.abs(currentTime - doseMinutes) <= 1 && !dose.taken) {
          const reminderMessage = generateReminderMessage(schedule.medication, dose, currentLanguage);
          addNotification(
            texts[currentLanguage].medicineReminder,
            reminderMessage
          );
        }
      });
    });
  };

  const enableNotifications = async () => {
    if (!isAuthenticated) {
      alert('Please login first to enable notifications');
      return;
    }

    try {
      const token = await requestNotificationPermission();
      if (token) {
        setFcmToken(token);
        setNotificationPermission('granted');
        
        // Save FCM token to user profile if needed
        if (userInfo) {
          const updatedUserInfo = { ...userInfo, fcmToken: token };
          localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
        }

        addNotification(
          texts[currentLanguage].notificationEnabled,
          'You will now receive medicine and appointment reminders'
        );
      } else {
        setNotificationPermission('denied');
        alert(texts[currentLanguage].notificationPermissionDenied);
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      alert(texts[currentLanguage].notificationPermissionDenied);
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem('medical-notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem('medical-notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="relative">
      {/* Notification Bell Icon */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
      >
        {notificationPermission === 'granted' ? (
          <Bell className="w-6 h-6" />
        ) : (
          <BellOff className="w-6 h-6" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showNotifications && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">
                {currentLanguage === 'en' ? 'Notifications' : 'নোটিফিকেশন'}
              </h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {notificationPermission !== 'granted' && (
              <button
                onClick={enableNotifications}
                className="mt-2 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                {texts[currentLanguage].enableNotifications}
              </button>
            )}
            
            {notifications.length > 0 && unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                {texts[currentLanguage].markAllRead}
              </button>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {texts[currentLanguage].noNotifications}
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 text-sm">
                        {notification.title}
                      </h4>
                      <p className="text-gray-600 text-xs mt-1">
                        {notification.body}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        {notification.timestamp.toLocaleString(currentLanguage === 'bn' ? 'bn-BD' : 'en-US')}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationService;