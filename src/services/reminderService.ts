// Reminder Service - রিমাইন্ডার সেবা
import { toast } from 'sonner';

export interface Reminder {
  id: string;
  type: 'medicine' | 'appointment' | 'test' | 'followup';
  title: string;
  description: string;
  scheduledTime: Date;
  isRecurring: boolean;
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: Date;
  };
  isActive: boolean;
  isCompleted: boolean;
  patientId?: string;
  medicineInfo?: {
    name: string;
    dosage: string;
    instructions: string;
  };
  appointmentInfo?: {
    doctorName: string;
    location: string;
    phone?: string;
  };
  testInfo?: {
    testName: string;
    labName: string;
    preparation?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationSettings {
  enablePushNotifications: boolean;
  enableSoundAlerts: boolean;
  reminderAdvanceTime: number; // minutes before
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
  medicineReminders: boolean;
  appointmentReminders: boolean;
  testReminders: boolean;
}

class ReminderService {
  private reminders: Map<string, Reminder> = new Map();
  private activeTimers: Map<string, NodeJS.Timeout> = new Map();
  private notificationSettings: NotificationSettings;
  private notificationPermission: NotificationPermission = 'default';

  constructor() {
    this.notificationSettings = this.getDefaultSettings();
    this.loadReminders();
    this.requestNotificationPermission();
    this.startReminderChecker();
  }

  // Initialize notification permission
  private async requestNotificationPermission() {
    if ('Notification' in window) {
      this.notificationPermission = await Notification.requestPermission();
    }
  }

  // Default notification settings
  private getDefaultSettings(): NotificationSettings {
    const saved = localStorage.getItem('reminderSettings');
    if (saved) {
      return JSON.parse(saved);
    }
    
    return {
      enablePushNotifications: true,
      enableSoundAlerts: true,
      reminderAdvanceTime: 15,
      quietHours: {
        enabled: true,
        startTime: '22:00',
        endTime: '07:00'
      },
      medicineReminders: true,
      appointmentReminders: true,
      testReminders: true
    };
  }

  // Load reminders from localStorage
  private loadReminders() {
    const saved = localStorage.getItem('medicalReminders');
    if (saved) {
      const reminderData = JSON.parse(saved);
      reminderData.forEach((reminder: any) => {
        reminder.scheduledTime = new Date(reminder.scheduledTime);
        reminder.createdAt = new Date(reminder.createdAt);
        reminder.updatedAt = new Date(reminder.updatedAt);
        if (reminder.recurringPattern?.endDate) {
          reminder.recurringPattern.endDate = new Date(reminder.recurringPattern.endDate);
        }
        this.reminders.set(reminder.id, reminder);
      });
    }
  }

  // Save reminders to localStorage
  private saveReminders() {
    const reminderArray = Array.from(this.reminders.values());
    localStorage.setItem('medicalReminders', JSON.stringify(reminderArray));
  }

  // Create medicine reminder from prescription data
  createMedicineReminders(medicineData: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
    startDate?: Date;
  }): string[] {
    const reminderIds: string[] = [];
    const startDate = medicineData.startDate || new Date();
    const times = this.parseMedicationTimes(medicineData.frequency);
    const durationDays = this.parseDuration(medicineData.duration);
    
    times.forEach((time, index) => {
      const reminderId = this.generateId();
      const [hours, minutes] = time.split(':').map(Number);
      
      const scheduledTime = new Date(startDate);
      scheduledTime.setHours(hours, minutes, 0, 0);
      
      // If the time has passed today, start from tomorrow
      if (scheduledTime < new Date()) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }
      
      const reminder: Reminder = {
        id: reminderId,
        type: 'medicine',
        title: `${medicineData.name} সেবনের সময়`,
        description: `${medicineData.dosage} - ${medicineData.instructions}`,
        scheduledTime,
        isRecurring: true,
        recurringPattern: {
          frequency: 'daily',
          interval: 1,
          endDate: new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000)
        },
        isActive: true,
        isCompleted: false,
        medicineInfo: {
          name: medicineData.name,
          dosage: medicineData.dosage,
          instructions: medicineData.instructions
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      this.reminders.set(reminderId, reminder);
      this.scheduleReminder(reminder);
      reminderIds.push(reminderId);
    });
    
    this.saveReminders();
    return reminderIds;
  }

  // Create appointment reminder
  createAppointmentReminder(appointmentData: {
    doctorName: string;
    appointmentTime: Date;
    location: string;
    phone?: string;
    description?: string;
  }): string {
    const reminderId = this.generateId();
    
    const reminder: Reminder = {
      id: reminderId,
      type: 'appointment',
      title: `ডাক্তারের অ্যাপয়েন্টমেন্ট`,
      description: appointmentData.description || `ডাঃ ${appointmentData.doctorName} এর সাথে অ্যাপয়েন্টমেন্ট`,
      scheduledTime: new Date(appointmentData.appointmentTime.getTime() - this.notificationSettings.reminderAdvanceTime * 60 * 1000),
      isRecurring: false,
      isActive: true,
      isCompleted: false,
      appointmentInfo: {
        doctorName: appointmentData.doctorName,
        location: appointmentData.location,
        phone: appointmentData.phone
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.reminders.set(reminderId, reminder);
    this.scheduleReminder(reminder);
    this.saveReminders();
    
    return reminderId;
  }

  // Create test reminder
  createTestReminder(testData: {
    testName: string;
    testDate: Date;
    labName: string;
    preparation?: string;
  }): string {
    const reminderId = this.generateId();
    
    const reminder: Reminder = {
      id: reminderId,
      type: 'test',
      title: `ল্যাব টেস্ট রিমাইন্ডার`,
      description: `${testData.testName} - ${testData.labName}`,
      scheduledTime: new Date(testData.testDate.getTime() - 24 * 60 * 60 * 1000), // 1 day before
      isRecurring: false,
      isActive: true,
      isCompleted: false,
      testInfo: {
        testName: testData.testName,
        labName: testData.labName,
        preparation: testData.preparation
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.reminders.set(reminderId, reminder);
    this.scheduleReminder(reminder);
    this.saveReminders();
    
    return reminderId;
  }

  // Schedule a reminder
  private scheduleReminder(reminder: Reminder) {
    if (!reminder.isActive) return;
    
    const now = new Date();
    const timeUntilReminder = reminder.scheduledTime.getTime() - now.getTime();
    
    if (timeUntilReminder > 0) {
      const timer = setTimeout(() => {
        this.triggerReminder(reminder);
      }, timeUntilReminder);
      
      this.activeTimers.set(reminder.id, timer);
    } else if (reminder.isRecurring) {
      // If it's a recurring reminder and time has passed, schedule next occurrence
      this.scheduleNextOccurrence(reminder);
    }
  }

  // Trigger a reminder notification
  private triggerReminder(reminder: Reminder) {
    if (!this.shouldShowReminder(reminder)) return;
    
    // Show browser notification
    if (this.notificationSettings.enablePushNotifications && this.notificationPermission === 'granted') {
      this.showBrowserNotification(reminder);
    }
    
    // Show toast notification
    this.showToastNotification(reminder);
    
    // Play sound if enabled
    if (this.notificationSettings.enableSoundAlerts) {
      this.playNotificationSound();
    }
    
    // Schedule next occurrence if recurring
    if (reminder.isRecurring) {
      this.scheduleNextOccurrence(reminder);
    } else {
      // Mark as completed for non-recurring reminders
      reminder.isCompleted = true;
      reminder.updatedAt = new Date();
      this.saveReminders();
    }
  }

  // Check if reminder should be shown (considering quiet hours)
  private shouldShowReminder(reminder: Reminder): boolean {
    if (!this.notificationSettings.quietHours.enabled) return true;
    
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const startTime = this.notificationSettings.quietHours.startTime;
    const endTime = this.notificationSettings.quietHours.endTime;
    
    // Check if current time is within quiet hours
    if (startTime <= endTime) {
      return !(currentTime >= startTime && currentTime <= endTime);
    } else {
      // Quiet hours span midnight
      return !(currentTime >= startTime || currentTime <= endTime);
    }
  }

  // Show browser notification
  private showBrowserNotification(reminder: Reminder) {
    const notification = new Notification(reminder.title, {
      body: reminder.description,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: reminder.id,
      requireInteraction: true
    });
    
    notification.onclick = () => {
      window.focus();
      notification.close();
      // You can add navigation logic here
    };
    
    // Auto close after 10 seconds
    setTimeout(() => {
      notification.close();
    }, 10000);
  }

  // Show toast notification
  private showToastNotification(reminder: Reminder) {
    const actions = this.getReminderActions(reminder);
    
    toast(reminder.title, {
      description: reminder.description,
      duration: 10000,
      action: actions.primary ? {
        label: actions.primary.label,
        onClick: actions.primary.action
      } : undefined
    });
  }

  // Get reminder actions based on type
  private getReminderActions(reminder: Reminder) {
    switch (reminder.type) {
      case 'medicine':
        return {
          primary: {
            label: 'নিয়েছি',
            action: () => this.markReminderAsTaken(reminder.id)
          },
          secondary: {
            label: 'পরে নেব',
            action: () => this.snoozeReminder(reminder.id, 15)
          }
        };
      case 'appointment':
        return {
          primary: {
            label: 'ঠিক আছে',
            action: () => this.markReminderAsAcknowledged(reminder.id)
          }
        };
      case 'test':
        return {
          primary: {
            label: 'বুঝেছি',
            action: () => this.markReminderAsAcknowledged(reminder.id)
          }
        };
      default:
        return {};
    }
  }

  // Play notification sound
  private playNotificationSound() {
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.5;
      audio.play().catch(console.error);
    } catch (error) {
      console.error('Could not play notification sound:', error);
    }
  }

  // Schedule next occurrence for recurring reminders
  private scheduleNextOccurrence(reminder: Reminder) {
    if (!reminder.recurringPattern) return;
    
    const nextTime = new Date(reminder.scheduledTime);
    
    switch (reminder.recurringPattern.frequency) {
      case 'daily':
        nextTime.setDate(nextTime.getDate() + reminder.recurringPattern.interval);
        break;
      case 'weekly':
        nextTime.setDate(nextTime.getDate() + (reminder.recurringPattern.interval * 7));
        break;
      case 'monthly':
        nextTime.setMonth(nextTime.getMonth() + reminder.recurringPattern.interval);
        break;
    }
    
    // Check if we've reached the end date
    if (reminder.recurringPattern.endDate && nextTime > reminder.recurringPattern.endDate) {
      reminder.isActive = false;
      reminder.updatedAt = new Date();
      this.saveReminders();
      return;
    }
    
    reminder.scheduledTime = nextTime;
    reminder.updatedAt = new Date();
    this.scheduleReminder(reminder);
    this.saveReminders();
  }

  // Mark reminder as taken
  markReminderAsTaken(reminderId: string) {
    const reminder = this.reminders.get(reminderId);
    if (reminder) {
      // For medicine reminders, we don't mark as completed since they're recurring
      // Just log the action
      console.log(`Medicine taken: ${reminder.medicineInfo?.name}`);
      toast.success('ওষুধ সেবনের তথ্য সংরক্ষিত হয়েছে');
    }
  }

  // Mark reminder as acknowledged
  markReminderAsAcknowledged(reminderId: string) {
    const reminder = this.reminders.get(reminderId);
    if (reminder) {
      reminder.isCompleted = true;
      reminder.updatedAt = new Date();
      this.saveReminders();
      toast.success('রিমাইন্ডার স্বীকার করা হয়েছে');
    }
  }

  // Snooze reminder
  snoozeReminder(reminderId: string, minutes: number) {
    const reminder = this.reminders.get(reminderId);
    if (reminder) {
      // Clear existing timer
      const existingTimer = this.activeTimers.get(reminderId);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }
      
      // Schedule new time
      reminder.scheduledTime = new Date(Date.now() + minutes * 60 * 1000);
      reminder.updatedAt = new Date();
      this.scheduleReminder(reminder);
      this.saveReminders();
      
      toast.info(`রিমাইন্ডার ${minutes} মিনিট পরে আবার দেখানো হবে`);
    }
  }

  // Get all active reminders
  getActiveReminders(): Reminder[] {
    return Array.from(this.reminders.values())
      .filter(reminder => reminder.isActive && !reminder.isCompleted)
      .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());
  }

  // Get reminders for today
  getTodayReminders(): Reminder[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return this.getActiveReminders()
      .filter(reminder => 
        reminder.scheduledTime >= today && 
        reminder.scheduledTime < tomorrow
      );
  }

  // Update notification settings
  updateSettings(settings: Partial<NotificationSettings>) {
    this.notificationSettings = { ...this.notificationSettings, ...settings };
    localStorage.setItem('reminderSettings', JSON.stringify(this.notificationSettings));
  }

  // Delete reminder
  deleteReminder(reminderId: string) {
    const timer = this.activeTimers.get(reminderId);
    if (timer) {
      clearTimeout(timer);
      this.activeTimers.delete(reminderId);
    }
    
    this.reminders.delete(reminderId);
    this.saveReminders();
  }

  // Start periodic reminder checker (every minute)
  private startReminderChecker() {
    setInterval(() => {
      this.checkMissedReminders();
    }, 60000); // Check every minute
  }

  // Check for missed reminders
  private checkMissedReminders() {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    this.getActiveReminders().forEach(reminder => {
      if (reminder.scheduledTime <= now && reminder.scheduledTime >= fiveMinutesAgo) {
        // Trigger missed reminder
        this.triggerReminder(reminder);
      }
    });
  }

  // Parse medication frequency to times
  private parseMedicationTimes(frequency: string): string[] {
    const lowerFreq = frequency.toLowerCase();
    
    if (lowerFreq.includes('৩') || lowerFreq.includes('3') || lowerFreq.includes('তিন')) {
      return ['০৮:০০', '১৪:০০', '২০:০০'];
    } else if (lowerFreq.includes('২') || lowerFreq.includes('2') || lowerFreq.includes('দুই')) {
      return ['০৮:০০', '২০:০০'];
    } else if (lowerFreq.includes('৪') || lowerFreq.includes('4') || lowerFreq.includes('চার')) {
      return ['০৬:০০', '১২:০০', '১৮:০০', '২২:০০'];
    } else {
      return ['০৮:০০']; // Default to once daily
    }
  }

  // Parse duration string to days
  private parseDuration(duration: string): number {
    const lowerDuration = duration.toLowerCase();
    
    if (lowerDuration.includes('সপ্তাহ') || lowerDuration.includes('week')) {
      const weeks = parseInt(lowerDuration.match(/\d+/)?.[0] || '1');
      return weeks * 7;
    } else if (lowerDuration.includes('মাস') || lowerDuration.includes('month')) {
      const months = parseInt(lowerDuration.match(/\d+/)?.[0] || '1');
      return months * 30;
    } else {
      // Assume days
      return parseInt(lowerDuration.match(/\d+/)?.[0] || '7');
    }
  }

  // Generate unique ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }
}

// Export singleton instance
export const reminderService = new ReminderService();
export default reminderService;