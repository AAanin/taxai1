import { redisClient } from './redisService';
import { v4 as uuidv4 } from 'uuid';

// রিমাইন্ডার ইন্টারফেস
export interface ReminderData {
  id: string;
  type: 'medicine' | 'appointment' | 'test' | 'followup';
  title: string;
  description: string;
  userId: string;
  scheduledTime: Date;
  isRecurring: boolean;
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: Date;
  };
  isActive: boolean;
  isCompleted: boolean;
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
  notificationChannels?: ('push' | 'sms' | 'email' | 'websocket')[];
  priority?: 'high' | 'medium' | 'low';
}

// নোটিফিকেশন ডেটা ইন্টারফেস
export interface NotificationData {
  reminderId: string;
  userId: string;
  type: 'reminder';
  title: string;
  message: string;
  timestamp: Date;
  channels: ('push' | 'sms' | 'email' | 'websocket')[];
  priority: 'high' | 'medium' | 'low';
  metadata?: any;
}

// Redis রিমাইন্ডার সার্ভিস
export class RedisReminderService {
  private static instance: RedisReminderService;
  private isInitialized: boolean = false;

  private constructor() {}

  public static getInstance(): RedisReminderService {
    if (!RedisReminderService.instance) {
      RedisReminderService.instance = new RedisReminderService();
    }
    return RedisReminderService.instance;
  }

  /**
   * সার্ভিস ইনিশিয়ালাইজ করে
   */
  public async initialize(): Promise<void> {
    try {
      if (this.isInitialized) return;

      // Redis connection চেক করুন
      await redisClient.ping();
      console.log('✅ Redis Reminder Service initialized successfully');
      
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Failed to initialize Redis Reminder Service:', error);
      throw error;
    }
  }

  /**
   * নতুন রিমাইন্ডার তৈরি করে
   */
  public async createReminder(reminderData: Omit<ReminderData, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const reminderId = uuidv4();
      const now = new Date();
      
      const reminder: ReminderData = {
        ...reminderData,
        id: reminderId,
        createdAt: now,
        updatedAt: now
      };

      // Redis hash এ রিমাইন্ডার স্টোর করুন
      const reminderKey = `reminder:${reminderId}`;
      await redisClient.hset(reminderKey, {
        id: reminder.id,
        type: reminder.type,
        title: reminder.title,
        description: reminder.description,
        userId: reminder.userId,
        scheduledTime: reminder.scheduledTime.toISOString(),
        isRecurring: reminder.isRecurring.toString(),
        recurringPattern: reminder.recurringPattern ? JSON.stringify(reminder.recurringPattern) : '',
        isActive: reminder.isActive.toString(),
        isCompleted: reminder.isCompleted.toString(),
        medicineInfo: reminder.medicineInfo ? JSON.stringify(reminder.medicineInfo) : '',
        appointmentInfo: reminder.appointmentInfo ? JSON.stringify(reminder.appointmentInfo) : '',
        testInfo: reminder.testInfo ? JSON.stringify(reminder.testInfo) : '',
        createdAt: reminder.createdAt.toISOString(),
        updatedAt: reminder.updatedAt.toISOString(),
        notificationChannels: reminder.notificationChannels ? JSON.stringify(reminder.notificationChannels) : '',
        priority: reminder.priority || 'medium'
      });

      // TTL সেট করুন (30 দিন)
      await redisClient.expire(reminderKey, 30 * 24 * 60 * 60);

      // ইনডেক্স আপডেট করুন
      await this.updateIndexes(reminder);

      // রিমাইন্ডার স্কিডিউল করুন
      await this.scheduleReminder(reminderId);

      console.log(`✅ Reminder created: ${reminderId}`);
      return reminderId;
    } catch (error) {
      console.error('❌ Failed to create reminder:', error);
      throw error;
    }
  }

  /**
   * রিমাইন্ডার আপডেট করে
   */
  public async updateReminder(reminderId: string, updates: Partial<ReminderData>): Promise<void> {
    try {
      const reminderKey = `reminder:${reminderId}`;
      const exists = await redisClient.exists(reminderKey);
      
      if (!exists) {
        throw new Error(`Reminder not found: ${reminderId}`);
      }

      // বর্তমান ডেটা পান
      const currentData = await this.getReminder(reminderId);
      if (!currentData) {
        throw new Error(`Failed to get current reminder data: ${reminderId}`);
      }

      // আপডেট করা ডেটা
      const updatedReminder: ReminderData = {
        ...currentData,
        ...updates,
        updatedAt: new Date()
      };

      // Redis hash আপডেট করুন
      const updateFields: Record<string, string> = {};
      
      Object.keys(updates).forEach(key => {
        const value = (updatedReminder as any)[key];
        if (value !== undefined) {
          if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
            updateFields[key] = JSON.stringify(value);
          } else if (value instanceof Date) {
            updateFields[key] = value.toISOString();
          } else {
            updateFields[key] = value.toString();
          }
        }
      });

      updateFields.updatedAt = updatedReminder.updatedAt.toISOString();

      await redisClient.hset(reminderKey, updateFields);

      // ইনডেক্স আপডেট করুন
      await this.updateIndexes(updatedReminder);

      // যদি scheduledTime আপডেট হয়, রি-স্কিডিউল করুন
      if (updates.scheduledTime || updates.isActive !== undefined) {
        await this.scheduleReminder(reminderId);
      }

      console.log(`✅ Reminder updated: ${reminderId}`);
    } catch (error) {
      console.error('❌ Failed to update reminder:', error);
      throw error;
    }
  }

  /**
   * রিমাইন্ডার পান
   */
  public async getReminder(reminderId: string): Promise<ReminderData | null> {
    try {
      const reminderKey = `reminder:${reminderId}`;
      const data = await redisClient.hgetall(reminderKey);
      
      if (!data || Object.keys(data).length === 0) {
        return null;
      }

      return this.parseReminderData(data);
    } catch (error) {
      console.error('❌ Failed to get reminder:', error);
      throw error;
    }
  }

  /**
   * ইউজারের রিমাইন্ডার তালিকা পান
   */
  public async getUserReminders(
    userId: string, 
    options: {
      type?: string;
      isActive?: boolean;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ reminders: ReminderData[]; total: number; hasMore: boolean }> {
    try {
      const userReminderKey = `user:${userId}:reminders`;
      const reminderIds = await redisClient.smembers(userReminderKey);
      
      let filteredIds = reminderIds;
      
      // ফিল্টার প্রয়োগ করুন
      if (options.type || options.isActive !== undefined || options.startDate || options.endDate) {
        const reminders = await Promise.all(
          reminderIds.map(id => this.getReminder(id))
        );
        
        const filtered = reminders.filter(reminder => {
          if (!reminder) return false;
          
          if (options.type && reminder.type !== options.type) return false;
          if (options.isActive !== undefined && reminder.isActive !== options.isActive) return false;
          if (options.startDate && reminder.scheduledTime < options.startDate) return false;
          if (options.endDate && reminder.scheduledTime > options.endDate) return false;
          
          return true;
        });
        
        filteredIds = filtered.map(r => r!.id);
      }

      const total = filteredIds.length;
      const limit = options.limit || 50;
      const offset = options.offset || 0;
      
      const paginatedIds = filteredIds.slice(offset, offset + limit);
      const reminders = await Promise.all(
        paginatedIds.map(id => this.getReminder(id))
      );
      
      const validReminders = reminders.filter(r => r !== null) as ReminderData[];
      
      return {
        reminders: validReminders,
        total,
        hasMore: offset + limit < total
      };
    } catch (error) {
      console.error('❌ Failed to get user reminders:', error);
      throw error;
    }
  }

  /**
   * রিমাইন্ডার ডিলিট করে
   */
  public async deleteReminder(reminderId: string): Promise<void> {
    try {
      const reminder = await this.getReminder(reminderId);
      if (!reminder) {
        throw new Error(`Reminder not found: ${reminderId}`);
      }

      // Redis hash ডিলিট করুন
      const reminderKey = `reminder:${reminderId}`;
      await redisClient.del(reminderKey);

      // ইনডেক্স থেকে রিমুভ করুন
      await this.removeFromIndexes(reminder);

      // স্কিডিউল থেকে রিমুভ করুন
      await redisClient.zrem('reminder:schedule', reminderId);

      console.log(`✅ Reminder deleted: ${reminderId}`);
    } catch (error) {
      console.error('❌ Failed to delete reminder:', error);
      throw error;
    }
  }

  /**
   * রিমাইন্ডার স্কিডিউল করে
   */
  public async scheduleReminder(reminderId: string): Promise<void> {
    try {
      const reminder = await this.getReminder(reminderId);
      if (!reminder || !reminder.isActive) {
        // ইনঅ্যাক্টিভ রিমাইন্ডার স্কিডিউল থেকে রিমুভ করুন
        await redisClient.zrem('reminder:schedule', reminderId);
        return;
      }

      const timestamp = reminder.scheduledTime.getTime();
      await redisClient.zadd('reminder:schedule', timestamp, reminderId);
      
      console.log(`✅ Reminder scheduled: ${reminderId} at ${reminder.scheduledTime.toISOString()}`);
    } catch (error) {
      console.error('❌ Failed to schedule reminder:', error);
      throw error;
    }
  }

  /**
   * নোটিফিকেশন ট্রিগার করে
   */
  public async triggerNotification(reminderId: string): Promise<void> {
    try {
      const reminder = await this.getReminder(reminderId);
      if (!reminder || !reminder.isActive) {
        return;
      }

      const notificationData: NotificationData = {
        reminderId: reminder.id,
        userId: reminder.userId,
        type: 'reminder',
        title: reminder.title,
        message: reminder.description,
        timestamp: new Date(),
        channels: reminder.notificationChannels || ['push', 'websocket'],
        priority: reminder.priority || 'medium',
        metadata: {
          reminderType: reminder.type,
          medicineInfo: reminder.medicineInfo,
          appointmentInfo: reminder.appointmentInfo,
          testInfo: reminder.testInfo
        }
      };

      // নোটিফিকেশন কিউতে যোগ করুন
      await redisClient.lpush('notification:queue', JSON.stringify(notificationData));
      
      // রিকারিং রিমাইন্ডার হ্যান্ডল করুন
      if (reminder.isRecurring && reminder.recurringPattern) {
        await this.handleRecurringReminder(reminderId);
      } else {
        // নন-রিকারিং রিমাইন্ডার কমপ্লিট মার্ক করুন
        await this.updateReminder(reminderId, { isCompleted: true, isActive: false });
      }

      console.log(`✅ Notification triggered for reminder: ${reminderId}`);
    } catch (error) {
      console.error('❌ Failed to trigger notification:', error);
      throw error;
    }
  }

  /**
   * রিকারিং রিমাইন্ডার হ্যান্ডল করে
   */
  public async handleRecurringReminder(reminderId: string): Promise<void> {
    try {
      const reminder = await this.getReminder(reminderId);
      if (!reminder || !reminder.isRecurring || !reminder.recurringPattern) {
        return;
      }

      const { frequency, interval, endDate } = reminder.recurringPattern;
      const nextTime = new Date(reminder.scheduledTime);

      // পরবর্তী সময় গণনা করুন
      switch (frequency) {
        case 'daily':
          nextTime.setDate(nextTime.getDate() + interval);
          break;
        case 'weekly':
          nextTime.setDate(nextTime.getDate() + (interval * 7));
          break;
        case 'monthly':
          nextTime.setMonth(nextTime.getMonth() + interval);
          break;
      }

      // এন্ড ডেট চেক করুন
      if (endDate && nextTime > endDate) {
        await this.updateReminder(reminderId, { isActive: false, isCompleted: true });
        return;
      }

      // পরবর্তী অকারেন্স স্কিডিউল করুন
      await this.updateReminder(reminderId, { scheduledTime: nextTime });
      
      console.log(`✅ Recurring reminder scheduled for next occurrence: ${reminderId}`);
    } catch (error) {
      console.error('❌ Failed to handle recurring reminder:', error);
      throw error;
    }
  }

  /**
   * রিমাইন্ডার স্নুজ করে
   */
  public async snoozeReminder(reminderId: string, durationMinutes: number): Promise<void> {
    try {
      const reminder = await this.getReminder(reminderId);
      if (!reminder) {
        throw new Error(`Reminder not found: ${reminderId}`);
      }

      const newTime = new Date(Date.now() + durationMinutes * 60 * 1000);
      await this.updateReminder(reminderId, { scheduledTime: newTime });
      
      console.log(`✅ Reminder snoozed: ${reminderId} for ${durationMinutes} minutes`);
    } catch (error) {
      console.error('❌ Failed to snooze reminder:', error);
      throw error;
    }
  }

  /**
   * স্কিডিউল করা রিমাইন্ডার পান
   */
  public async getScheduledReminders(beforeTime: Date): Promise<string[]> {
    try {
      const timestamp = beforeTime.getTime();
      const reminderIds = await redisClient.zrangebyscore('reminder:schedule', 0, timestamp);
      return reminderIds;
    } catch (error) {
      console.error('❌ Failed to get scheduled reminders:', error);
      throw error;
    }
  }

  /**
   * ইনডেক্স আপডেট করে
   */
  private async updateIndexes(reminder: ReminderData): Promise<void> {
    try {
      // ইউজার ইনডেক্স
      await redisClient.sadd(`user:${reminder.userId}:reminders`, reminder.id);
      
      // টাইপ ইনডেক্স
      await redisClient.sadd(`reminder:type:${reminder.type}`, reminder.id);
      
      // স্ট্যাটাস ইনডেক্স
      if (reminder.isActive) {
        await redisClient.sadd('reminder:active', reminder.id);
        await redisClient.srem('reminder:inactive', reminder.id);
      } else {
        await redisClient.sadd('reminder:inactive', reminder.id);
        await redisClient.srem('reminder:active', reminder.id);
      }
    } catch (error) {
      console.error('❌ Failed to update indexes:', error);
      throw error;
    }
  }

  /**
   * ইনডেক্স থেকে রিমুভ করে
   */
  private async removeFromIndexes(reminder: ReminderData): Promise<void> {
    try {
      await redisClient.srem(`user:${reminder.userId}:reminders`, reminder.id);
      await redisClient.srem(`reminder:type:${reminder.type}`, reminder.id);
      await redisClient.srem('reminder:active', reminder.id);
      await redisClient.srem('reminder:inactive', reminder.id);
    } catch (error) {
      console.error('❌ Failed to remove from indexes:', error);
      throw error;
    }
  }

  /**
   * Redis ডেটা পার্স করে
   */
  private parseReminderData(data: Record<string, string>): ReminderData {
    return {
      id: data.id,
      type: data.type as ReminderData['type'],
      title: data.title,
      description: data.description,
      userId: data.userId,
      scheduledTime: new Date(data.scheduledTime),
      isRecurring: data.isRecurring === 'true',
      recurringPattern: data.recurringPattern ? JSON.parse(data.recurringPattern) : undefined,
      isActive: data.isActive === 'true',
      isCompleted: data.isCompleted === 'true',
      medicineInfo: data.medicineInfo ? JSON.parse(data.medicineInfo) : undefined,
      appointmentInfo: data.appointmentInfo ? JSON.parse(data.appointmentInfo) : undefined,
      testInfo: data.testInfo ? JSON.parse(data.testInfo) : undefined,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      notificationChannels: data.notificationChannels ? JSON.parse(data.notificationChannels) : undefined,
      priority: (data.priority as ReminderData['priority']) || 'medium'
    };
  }

  /**
   * সার্ভিস রেডি কিনা চেক করে
   */
  public isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * সার্ভিস স্ট্যাটাস পান
   */
  public async getStats(): Promise<{
    totalReminders: number;
    activeReminders: number;
    scheduledReminders: number;
    completedReminders: number;
    remindersByType: Record<string, number>;
  }> {
    try {
      const [activeCount, inactiveCount, scheduleCount] = await Promise.all([
        redisClient.scard('reminder:active'),
        redisClient.scard('reminder:inactive'), 
        redisClient.zcard('reminder:schedule')
      ]);

      const remindersByType: Record<string, number> = {};
      const types = ['medicine', 'appointment', 'test', 'followup'];
      
      for (const type of types) {
        remindersByType[type] = await redisClient.scard(`reminder:type:${type}`);
      }

      return {
        totalReminders: activeCount + inactiveCount,
        activeReminders: activeCount,
        scheduledReminders: scheduleCount,
        completedReminders: inactiveCount,
        remindersByType
      };
    } catch (error) {
      console.error('❌ Failed to get stats:', error);
      throw error;
    }
  }
}

// সিঙ্গেলটন ইনস্ট্যান্স এক্সপোর্ট
export const redisReminderService = RedisReminderService.getInstance();