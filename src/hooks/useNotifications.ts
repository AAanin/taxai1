import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'appointment' | 'prescription' | 'medical_record';
  read: boolean;
  data?: any;
  created_at: string;
  updated_at: string;
}

export interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  appointment_reminders: boolean;
  prescription_reminders: boolean;
  medical_record_updates: boolean;
  system_notifications: boolean;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  settings: NotificationSettings | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  sendNotification: (notification: Omit<Notification, 'id' | 'user_id' | 'read' | 'created_at' | 'updated_at'>) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Load notifications from database
  const loadNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading notifications:', error);
        return;
      }

      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load notification settings
  const loadSettings = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading notification settings:', error);
        return;
      }

      if (data) {
        setSettings(data);
      } else {
        // Create default settings if none exist
        const defaultSettings: NotificationSettings = {
          email_notifications: true,
          push_notifications: true,
          appointment_reminders: true,
          prescription_reminders: true,
          medical_record_updates: true,
          system_notifications: true
        };

        const { data: newSettings, error: createError } = await supabase
          .from('notification_settings')
          .insert([{ user_id: user.id, ...defaultSettings }])
          .select()
          .single();

        if (createError) {
          console.error('Error creating notification settings:', createError);
        } else {
          setSettings(newSettings);
        }
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  }, [user]);

  // Set up real-time subscription
  const setupRealtimeSubscription = useCallback(() => {
    if (!user) return;

    // Clean up existing channel
    if (channel) {
      supabase.removeChannel(channel);
    }

    // Create new channel for user notifications
    const newChannel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          
          // Add to notifications list
          setNotifications(prev => [newNotification, ...prev]);
          
          // Show toast notification if settings allow
          if (settings?.push_notifications !== false) {
            showNotificationToast(newNotification);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const updatedNotification = payload.new as Notification;
          
          setNotifications(prev => 
            prev.map(notification => 
              notification.id === updatedNotification.id 
                ? updatedNotification 
                : notification
            )
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const deletedNotification = payload.old as Notification;
          
          setNotifications(prev => 
            prev.filter(notification => notification.id !== deletedNotification.id)
          );
        }
      )
      .subscribe();

    setChannel(newChannel);
  }, [user, channel, settings]);

  // Show notification toast
  const showNotificationToast = (notification: Notification) => {
    const toastOptions = {
      duration: 5000,
      action: {
        label: 'দেখুন',
        onClick: () => {
          // Handle notification click - could navigate to relevant page
          markAsRead(notification.id);
        }
      }
    };

    switch (notification.type) {
      case 'success':
        toast.success(notification.message, toastOptions);
        break;
      case 'warning':
        toast.warning(notification.message, toastOptions);
        break;
      case 'error':
        toast.error(notification.message, toastOptions);
        break;
      case 'appointment':
        toast.info(`📅 ${notification.message}`, toastOptions);
        break;
      case 'prescription':
        toast.info(`💊 ${notification.message}`, toastOptions);
        break;
      case 'medical_record':
        toast.info(`📋 ${notification.message}`, toastOptions);
        break;
      default:
        toast.info(notification.message, toastOptions);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        toast.error('নোটিফিকেশন আপডেট করতে সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('নোটিফিকেশন আপডেট করতে সমস্যা হয়েছে');
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        toast.error('নোটিফিকেশন আপডেট করতে সমস্যা হয়েছে');
      } else {
        toast.success('সব নোটিফিকেশন পড়া হয়েছে বলে চিহ্নিত');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('নোটিফিকেশন আপডেট করতে সমস্যা হয়েছে');
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Error deleting notification:', error);
        toast.error('নোটিফিকেশন মুছতে সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('নোটিফিকেশন মুছতে সমস্যা হয়েছে');
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error clearing all notifications:', error);
        toast.error('নোটিফিকেশন মুছতে সমস্যা হয়েছে');
      } else {
        toast.success('সব নোটিফিকেশন মুছে ফেলা হয়েছে');
      }
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      toast.error('নোটিফিকেশন মুছতে সমস্যা হয়েছে');
    }
  };

  // Update notification settings
  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .update(newSettings)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating notification settings:', error);
        toast.error('সেটিংস আপডেট করতে সমস্যা হয়েছে');
      } else {
        setSettings(data);
        toast.success('নোটিফিকেশন সেটিংস আপডেট হয়েছে');
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast.error('সেটিংস আপডেট করতে সমস্যা হয়েছে');
    }
  };

  // Send notification (for admin or system use)
  const sendNotification = async (
    notification: Omit<Notification, 'id' | 'user_id' | 'read' | 'created_at' | 'updated_at'>
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .insert([{
          ...notification,
          user_id: user.id,
          read: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (error) {
        console.error('Error sending notification:', error);
        toast.error('নোটিফিকেশন পাঠাতে সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('নোটিফিকেশন পাঠাতে সমস্যা হয়েছে');
    }
  };

  // Refresh notifications
  const refreshNotifications = async () => {
    setLoading(true);
    await loadNotifications();
  };

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Initialize on mount and when user changes
  useEffect(() => {
    if (user) {
      loadNotifications();
      loadSettings();
    } else {
      setNotifications([]);
      setSettings(null);
      setLoading(false);
    }
  }, [user, loadNotifications, loadSettings]);

  // Set up real-time subscription when user and settings are available
  useEffect(() => {
    if (user && settings) {
      setupRealtimeSubscription();
    }

    // Cleanup on unmount
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user, settings, setupRealtimeSubscription]);

  return {
    notifications,
    unreadCount,
    loading,
    settings,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    updateSettings,
    sendNotification,
    refreshNotifications
  };
};

// Helper function to create appointment reminder notifications
export const createAppointmentReminder = async (
  userId: string,
  appointmentId: string,
  doctorName: string,
  appointmentDate: string,
  appointmentTime: string
) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        title: 'অ্যাপয়েন্টমেন্ট রিমাইন্ডার',
        message: `আগামীকাল ${appointmentTime} এ ডা. ${doctorName} এর সাথে আপনার অ্যাপয়েন্টমেন্ট রয়েছে।`,
        type: 'appointment',
        read: false,
        data: {
          appointment_id: appointmentId,
          doctor_name: doctorName,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

    if (error) {
      console.error('Error creating appointment reminder:', error);
    }
  } catch (error) {
    console.error('Error creating appointment reminder:', error);
  }
};

// Helper function to create prescription reminder notifications
export const createPrescriptionReminder = async (
  userId: string,
  prescriptionId: string,
  medicineName: string
) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        title: 'ওষুধ সেবনের রিমাইন্ডার',
        message: `${medicineName} ওষুধ সেবনের সময় হয়েছে।`,
        type: 'prescription',
        read: false,
        data: {
          prescription_id: prescriptionId,
          medicine_name: medicineName
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

    if (error) {
      console.error('Error creating prescription reminder:', error);
    }
  } catch (error) {
    console.error('Error creating prescription reminder:', error);
  }
};

export default useNotifications;