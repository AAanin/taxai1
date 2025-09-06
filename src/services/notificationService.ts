import { redisClient } from './redisService';
import { EventEmitter } from 'events';
import { Server as SocketIOServer } from 'socket.io';
import { NotificationData } from './redisReminderService';

// নোটিফিকেশন চ্যানেল ইন্টারফেস
export interface NotificationChannel {
  type: 'push' | 'sms' | 'email' | 'websocket';
  priority: 'high' | 'medium' | 'low';
  retryCount: number;
  maxRetries: number;
  lastAttempt?: Date;
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  errorMessage?: string;
}

// পুশ নোটিফিকেশন ডেটা
export interface PushNotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  actions?: {
    action: string;
    title: string;
    icon?: string;
  }[];
}

// SMS নোটিফিকেশন ডেটা
export interface SMSNotificationData {
  phone: string;
  message: string;
  sender?: string;
}

// ইমেইল নোটিফিকেশন ডেটা
export interface EmailNotificationData {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }[];
}

// WebSocket নোটিফিকেশন ডেটা
export interface WebSocketNotificationData {
  userId: string;
  event: string;
  data: any;
  room?: string;
}

// নোটিফিকেশন টেমপ্লেট
export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'reminder' | 'appointment' | 'medicine' | 'test';
  language: 'bn' | 'en';
  channels: {
    push?: {
      title: string;
      body: string;
      icon?: string;
    };
    sms?: {
      message: string;
    };
    email?: {
      subject: string;
      html: string;
      text?: string;
    };
    websocket?: {
      event: string;
      data: any;
    };
  };
}

// নোটিফিকেশন কনফিগারেশন
export interface NotificationConfig {
  enablePush: boolean;
  enableSMS: boolean;
  enableEmail: boolean;
  enableWebSocket: boolean;
  retryAttempts: number;
  retryDelay: number; // মিলিসেকেন্ড
  batchSize: number;
  processingInterval: number; // মিলিসেকেন্ড
  templates: NotificationTemplate[];
}

// নোটিফিকেশন স্ট্যাটিস্টিক্স
export interface NotificationStats {
  totalSent: number;
  totalFailed: number;
  channelStats: {
    push: { sent: number; failed: number; };
    sms: { sent: number; failed: number; };
    email: { sent: number; failed: number; };
    websocket: { sent: number; failed: number; };
  };
  lastProcessedAt: Date;
  queueLength: number;
}

// মাল্টি-চ্যানেল নোটিফিকেশন সার্ভিস
export class NotificationService extends EventEmitter {
  private static instance: NotificationService;
  private isInitialized: boolean = false;
  private isProcessing: boolean = false;
  private processingInterval: NodeJS.Timeout | null = null;
  private config: NotificationConfig;
  private stats: NotificationStats;
  private socketIO: SocketIOServer | null = null;
  private connectedUsers: Map<string, string[]> = new Map(); // userId -> socketIds

  private constructor(config?: Partial<NotificationConfig>) {
    super();
    
    this.config = {
      enablePush: true,
      enableSMS: true,
      enableEmail: true,
      enableWebSocket: true,
      retryAttempts: 3,
      retryDelay: 30000, // 30 সেকেন্ড
      batchSize: 10,
      processingInterval: 5000, // 5 সেকেন্ড
      templates: this.getDefaultTemplates(),
      ...config
    };

    this.stats = {
      totalSent: 0,
      totalFailed: 0,
      channelStats: {
        push: { sent: 0, failed: 0 },
        sms: { sent: 0, failed: 0 },
        email: { sent: 0, failed: 0 },
        websocket: { sent: 0, failed: 0 }
      },
      lastProcessedAt: new Date(),
      queueLength: 0
    };
  }

  public static getInstance(config?: Partial<NotificationConfig>): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService(config);
    }
    return NotificationService.instance;
  }

  /**
   * নোটিফিকেশন সার্ভিস ইনিশিয়ালাইজ করে
   */
  public async initialize(socketIO?: SocketIOServer): Promise<void> {
    try {
      if (this.isInitialized) return;

      // Redis connection চেক করুন
      await redisClient.ping();
      
      // Socket.IO সেটআপ
      if (socketIO) {
        this.socketIO = socketIO;
        this.setupSocketIO();
      }
      
      // নোটিফিকেশন প্রসেসর শুরু করুন
      await this.startProcessor();
      
      console.log('✅ Notification Service initialized successfully');
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Failed to initialize Notification Service:', error);
      throw error;
    }
  }

  /**
   * পুশ নোটিফিকেশন পাঠায়
   */
  public async sendPushNotification(
    userId: string, 
    data: PushNotificationData
  ): Promise<boolean> {
    try {
      if (!this.config.enablePush) {
        console.log('⚠️ Push notifications are disabled');
        return false;
      }

      // ব্রাউজার নোটিফিকেশন API ব্যবহার করুন (ক্লায়েন্ট সাইডে)
      const notificationPayload = {
        type: 'push',
        userId,
        data: {
          title: data.title,
          body: data.body,
          icon: data.icon || '/favicon.ico',
          badge: data.badge || '/favicon.ico',
          data: data.data,
          actions: data.actions,
          timestamp: new Date().toISOString()
        }
      };

      // WebSocket এর মাধ্যমে ক্লায়েন্টে পাঠান
      if (this.socketIO) {
        const socketIds = this.connectedUsers.get(userId) || [];
        for (const socketId of socketIds) {
          this.socketIO.to(socketId).emit('push-notification', notificationPayload.data);
        }
      }

      // Firebase Cloud Messaging (FCM) ইন্টিগ্রেশন এখানে যোগ করা যেতে পারে
      // await this.sendFCMNotification(userId, data);

      this.stats.channelStats.push.sent++;
      this.stats.totalSent++;
      
      console.log(`✅ Push notification sent to user: ${userId}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send push notification:', error);
      this.stats.channelStats.push.failed++;
      this.stats.totalFailed++;
      return false;
    }
  }

  /**
   * SMS নোটিফিকেশন পাঠায়
   */
  public async sendSMSNotification(
    phone: string, 
    message: string
  ): Promise<boolean> {
    try {
      if (!this.config.enableSMS) {
        console.log('⚠️ SMS notifications are disabled');
        return false;
      }

      // SMS গেটওয়ে ইন্টিগ্রেশন (Twilio, AWS SNS, ইত্যাদি)
      // এখানে আপনার SMS প্রোভাইডারের API কল করুন
      
      // ডেমো ইমপ্লিমেন্টেশন
      console.log(`📱 SMS to ${phone}: ${message}`);
      
      // বাস্তব ইমপ্লিমেন্টেশনের জন্য:
      // const result = await this.smsProvider.send(phone, message);
      
      this.stats.channelStats.sms.sent++;
      this.stats.totalSent++;
      
      console.log(`✅ SMS sent to: ${phone}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send SMS:', error);
      this.stats.channelStats.sms.failed++;
      this.stats.totalFailed++;
      return false;
    }
  }

  /**
   * ইমেইল নোটিফিকেশন পাঠায়
   */
  public async sendEmailNotification(
    email: string, 
    data: EmailNotificationData
  ): Promise<boolean> {
    try {
      if (!this.config.enableEmail) {
        console.log('⚠️ Email notifications are disabled');
        return false;
      }

      // ইমেইল সার্ভিস ইন্টিগ্রেশন (Nodemailer, SendGrid, AWS SES, ইত্যাদি)
      // এখানে আপনার ইমেইল প্রোভাইডারের API কল করুন
      
      // ডেমো ইমপ্লিমেন্টেশন
      console.log(`📧 Email to ${email}:`);
      console.log(`Subject: ${data.subject}`);
      console.log(`Body: ${data.text || 'HTML content'}`);
      
      // বাস্তব ইমপ্লিমেন্টেশনের জন্য:
      // const result = await this.emailProvider.send(data);
      
      this.stats.channelStats.email.sent++;
      this.stats.totalSent++;
      
      console.log(`✅ Email sent to: ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      this.stats.channelStats.email.failed++;
      this.stats.totalFailed++;
      return false;
    }
  }

  /**
   * WebSocket নোটিফিকেশন পাঠায়
   */
  public async sendWebSocketNotification(
    userId: string, 
    data: any
  ): Promise<boolean> {
    try {
      if (!this.config.enableWebSocket || !this.socketIO) {
        console.log('⚠️ WebSocket notifications are disabled or not configured');
        return false;
      }

      const socketIds = this.connectedUsers.get(userId) || [];
      
      if (socketIds.length === 0) {
        console.log(`⚠️ No active WebSocket connections for user: ${userId}`);
        return false;
      }

      // সব সক্রিয় সকেটে পাঠান
      for (const socketId of socketIds) {
        this.socketIO.to(socketId).emit('notification', {
          ...data,
          timestamp: new Date().toISOString()
        });
      }

      this.stats.channelStats.websocket.sent++;
      this.stats.totalSent++;
      
      console.log(`✅ WebSocket notification sent to user: ${userId}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send WebSocket notification:', error);
      this.stats.channelStats.websocket.failed++;
      this.stats.totalFailed++;
      return false;
    }
  }

  /**
   * মাল্টি-চ্যানেল নোটিফিকেশন পাঠায়
   */
  public async sendMultiChannelNotification(
    notificationData: NotificationData
  ): Promise<{ [channel: string]: boolean }> {
    const results: { [channel: string]: boolean } = {};
    
    try {
      // টেমপ্লেট পান
      const template = this.getTemplate(notificationData.type, 'bn'); // ডিফল্ট বাংলা
      
      // প্রতিটি চ্যানেলে পাঠান
      const promises = notificationData.channels.map(async (channel) => {
        switch (channel) {
          case 'push':
            if (template?.channels.push) {
              results[channel] = await this.sendPushNotification(
                notificationData.userId,
                {
                  title: this.interpolateTemplate(template.channels.push.title, notificationData),
                  body: this.interpolateTemplate(template.channels.push.body, notificationData),
                  icon: template.channels.push.icon,
                  data: notificationData.metadata
                }
              );
            }
            break;
            
          case 'sms':
            if (template?.channels.sms) {
              // ইউজারের ফোন নম্বর পান (ডেটাবেস থেকে)
              const phone = await this.getUserPhone(notificationData.userId);
              if (phone) {
                results[channel] = await this.sendSMSNotification(
                  phone,
                  this.interpolateTemplate(template.channels.sms.message, notificationData)
                );
              }
            }
            break;
            
          case 'email':
            if (template?.channels.email) {
              // ইউজারের ইমেইল পান (ডেটাবেস থেকে)
              const email = await this.getUserEmail(notificationData.userId);
              if (email) {
                results[channel] = await this.sendEmailNotification(
                  email,
                  {
                    to: email,
                    subject: this.interpolateTemplate(template.channels.email.subject, notificationData),
                    html: this.interpolateTemplate(template.channels.email.html, notificationData),
                    text: template.channels.email.text ? 
                      this.interpolateTemplate(template.channels.email.text, notificationData) : undefined
                  }
                );
              }
            }
            break;
            
          case 'websocket':
            results[channel] = await this.sendWebSocketNotification(
              notificationData.userId,
              {
                type: 'reminder',
                title: notificationData.title,
                message: notificationData.message,
                priority: notificationData.priority,
                metadata: notificationData.metadata
              }
            );
            break;
        }
      });
      
      await Promise.allSettled(promises);
      
      console.log(`✅ Multi-channel notification sent:`, results);
      return results;
    } catch (error) {
      console.error('❌ Failed to send multi-channel notification:', error);
      throw error;
    }
  }

  /**
   * নোটিফিকেশন প্রসেসর শুরু করে
   */
  private async startProcessor(): Promise<void> {
    try {
      if (this.isProcessing) return;
      
      this.isProcessing = true;
      
      this.processingInterval = setInterval(async () => {
        try {
          await this.processNotificationQueue();
        } catch (error) {
          console.error('❌ Error processing notification queue:', error);
        }
      }, this.config.processingInterval);
      
      console.log('✅ Notification processor started');
    } catch (error) {
      console.error('❌ Failed to start notification processor:', error);
      throw error;
    }
  }

  /**
   * নোটিফিকেশন কিউ প্রসেস করে
   */
  private async processNotificationQueue(): Promise<void> {
    try {
      // কিউ থেকে নোটিফিকেশন পান
      const notifications = await redisClient.lrange('notification:queue', 0, this.config.batchSize - 1);
      
      if (notifications.length === 0) {
        return;
      }
      
      // প্রসেস করা নোটিফিকেশন রিমুভ করুন
      await redisClient.ltrim('notification:queue', notifications.length, -1);
      
      // প্রতিটি নোটিফিকেশন প্রসেস করুন
      for (const notificationStr of notifications) {
        try {
          const notificationData: NotificationData = JSON.parse(notificationStr);
          await this.sendMultiChannelNotification(notificationData);
        } catch (parseError) {
          console.error('❌ Error parsing notification data:', parseError);
          // ইনভ্যালিড নোটিফিকেশন ফেইল্ড কিউতে পাঠান
          await redisClient.lpush('notification:failed', notificationStr);
        }
      }
      
      this.stats.lastProcessedAt = new Date();
      this.stats.queueLength = await redisClient.llen('notification:queue');
      
    } catch (error) {
      console.error('❌ Error processing notification queue:', error);
      throw error;
    }
  }

  /**
   * Socket.IO সেটআপ করে
   */
  private setupSocketIO(): void {
    if (!this.socketIO) return;
    
    this.socketIO.on('connection', (socket) => {
      console.log(`🔌 Socket connected: ${socket.id}`);
      
      // ইউজার অথেন্টিকেশন
      socket.on('authenticate', (data: { userId: string; token: string }) => {
        // টোকেন ভেরিফাই করুন (আপনার অথ সিস্টেম অনুযায়ী)
        if (this.verifyToken(data.token)) {
          // ইউজার ম্যাপিং আপডেট করুন
          const existingSockets = this.connectedUsers.get(data.userId) || [];
          existingSockets.push(socket.id);
          this.connectedUsers.set(data.userId, existingSockets);
          
          socket.join(`user:${data.userId}`);
          console.log(`✅ User ${data.userId} authenticated on socket ${socket.id}`);
        } else {
          socket.emit('auth-error', { message: 'Invalid token' });
          socket.disconnect();
        }
      });
      
      // সকেট ডিসকানেক্ট
      socket.on('disconnect', () => {
        console.log(`🔌 Socket disconnected: ${socket.id}`);
        
        // ইউজার ম্যাপিং থেকে রিমুভ করুন
        for (const [userId, socketIds] of this.connectedUsers.entries()) {
          const index = socketIds.indexOf(socket.id);
          if (index > -1) {
            socketIds.splice(index, 1);
            if (socketIds.length === 0) {
              this.connectedUsers.delete(userId);
            } else {
              this.connectedUsers.set(userId, socketIds);
            }
            break;
          }
        }
      });
      
      // নোটিফিকেশন অ্যাকনলেজমেন্ট
      socket.on('notification-ack', (data: { notificationId: string; action?: string }) => {
        console.log(`✅ Notification acknowledged: ${data.notificationId}`);
        // অ্যাকনলেজমেন্ট লগ করুন
        this.logNotificationAck(data.notificationId, data.action);
      });
    });
  }

  /**
   * টোকেন ভেরিফাই করে (ডেমো ইমপ্লিমেন্টেশন)
   */
  private verifyToken(token: string): boolean {
    // আপনার JWT বা অন্য টোকেন ভেরিফিকেশন লজিক এখানে
    return token && token.length > 0;
  }

  /**
   * নোটিফিকেশন অ্যাকনলেজমেন্ট লগ করে
   */
  private async logNotificationAck(notificationId: string, action?: string): Promise<void> {
    try {
      const ackData = {
        notificationId,
        action: action || 'viewed',
        timestamp: new Date().toISOString()
      };
      
      await redisClient.lpush('notification:acks', JSON.stringify(ackData));
    } catch (error) {
      console.error('❌ Error logging notification ack:', error);
    }
  }

  /**
   * ইউজারের ফোন নম্বর পান (ডেমো ইমপ্লিমেন্টেশন)
   */
  private async getUserPhone(userId: string): Promise<string | null> {
    try {
      // ডেটাবেস থেকে ইউজারের ফোন নম্বর পান
      // const user = await getUserById(userId);
      // return user?.phone || null;
      
      // ডেমো রিটার্ন
      return '+8801700000000';
    } catch (error) {
      console.error('❌ Error getting user phone:', error);
      return null;
    }
  }

  /**
   * ইউজারের ইমেইল পান (ডেমো ইমপ্লিমেন্টেশন)
   */
  private async getUserEmail(userId: string): Promise<string | null> {
    try {
      // ডেটাবেস থেকে ইউজারের ইমেইল পান
      // const user = await getUserById(userId);
      // return user?.email || null;
      
      // ডেমো রিটার্ন
      return 'user@example.com';
    } catch (error) {
      console.error('❌ Error getting user email:', error);
      return null;
    }
  }

  /**
   * টেমপ্লেট পান
   */
  private getTemplate(type: string, language: 'bn' | 'en'): NotificationTemplate | null {
    return this.config.templates.find(t => t.type === type && t.language === language) || null;
  }

  /**
   * টেমপ্লেট ইন্টারপোলেট করে
   */
  private interpolateTemplate(template: string, data: NotificationData): string {
    return template
      .replace(/{{title}}/g, data.title)
      .replace(/{{message}}/g, data.message)
      .replace(/{{userId}}/g, data.userId)
      .replace(/{{timestamp}}/g, data.timestamp.toLocaleString('bn-BD'));
  }

  /**
   * ডিফল্ট টেমপ্লেট পান
   */
  private getDefaultTemplates(): NotificationTemplate[] {
    return [
      {
        id: 'reminder-bn',
        name: 'রিমাইন্ডার টেমপ্লেট',
        type: 'reminder',
        language: 'bn',
        channels: {
          push: {
            title: '{{title}}',
            body: '{{message}}',
            icon: '/favicon.ico'
          },
          sms: {
            message: 'রিমাইন্ডার: {{message}}'
          },
          email: {
            subject: 'রিমাইন্ডার: {{title}}',
            html: '<h2>{{title}}</h2><p>{{message}}</p><p>সময়: {{timestamp}}</p>',
            text: '{{title}}\n\n{{message}}\n\nসময়: {{timestamp}}'
          }
        }
      }
    ];
  }

  /**
   * সার্ভিস স্ট্যাটাস পান
   */
  public getStatus(): {
    isInitialized: boolean;
    isProcessing: boolean;
    config: NotificationConfig;
    stats: NotificationStats;
    connectedUsers: number;
  } {
    return {
      isInitialized: this.isInitialized,
      isProcessing: this.isProcessing,
      config: this.config,
      stats: this.stats,
      connectedUsers: this.connectedUsers.size
    };
  }

  /**
   * সার্ভিস বন্ধ করে
   */
  public async stop(): Promise<void> {
    try {
      this.isProcessing = false;
      
      if (this.processingInterval) {
        clearInterval(this.processingInterval);
        this.processingInterval = null;
      }
      
      console.log('✅ Notification Service stopped');
    } catch (error) {
      console.error('❌ Error stopping Notification Service:', error);
      throw error;
    }
  }
}

// সিঙ্গেলটন ইনস্ট্যান্স এক্সপোর্ট
export const notificationService = NotificationService.getInstance();