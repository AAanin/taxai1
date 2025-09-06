import { redisClient } from './redisService';
import { redisReminderService, NotificationData } from './redisReminderService';
import { EventEmitter } from 'events';

// ওয়ার্কার স্ট্যাটাস ইন্টারফেস
export interface WorkerStatus {
  id: string;
  isActive: boolean;
  lastHeartbeat: Date;
  processedCount: number;
  errorCount: number;
  currentTask?: string;
}

// স্কিডিউলার কনফিগারেশন
export interface SchedulerConfig {
  checkInterval: number; // মিলিসেকেন্ড
  batchSize: number;
  maxRetries: number;
  workerCount: number;
  deadLetterThreshold: number; // মিনিট
  enableMetrics: boolean;
}

// স্কিডিউলার মেট্রিক্স
export interface SchedulerMetrics {
  totalProcessed: number;
  totalErrors: number;
  averageProcessingTime: number;
  queueLength: number;
  activeWorkers: number;
  lastProcessedAt: Date;
}

// রিমাইন্ডার স্কিডিউলার
export class ReminderScheduler extends EventEmitter {
  private static instance: ReminderScheduler;
  private isRunning: boolean = false;
  private workers: Map<string, WorkerStatus> = new Map();
  private checkInterval: NodeJS.Timeout | null = null;
  private config: SchedulerConfig;
  private metrics: SchedulerMetrics;
  private isInitialized: boolean = false;

  private constructor(config?: Partial<SchedulerConfig>) {
    super();
    
    this.config = {
      checkInterval: 60000, // 1 মিনিট
      batchSize: 10,
      maxRetries: 3,
      workerCount: 3,
      deadLetterThreshold: 5, // 5 মিনিট
      enableMetrics: true,
      ...config
    };

    this.metrics = {
      totalProcessed: 0,
      totalErrors: 0,
      averageProcessingTime: 0,
      queueLength: 0,
      activeWorkers: 0,
      lastProcessedAt: new Date()
    };
  }

  public static getInstance(config?: Partial<SchedulerConfig>): ReminderScheduler {
    if (!ReminderScheduler.instance) {
      ReminderScheduler.instance = new ReminderScheduler(config);
    }
    return ReminderScheduler.instance;
  }

  /**
   * স্কিডিউলার ইনিশিয়ালাইজ করে
   */
  public async initialize(): Promise<void> {
    try {
      if (this.isInitialized) return;

      // Redis connection চেক করুন
      await redisClient.ping();
      
      // ReminderService ইনিশিয়ালাইজ করুন
      await redisReminderService.initialize();
      
      // ওয়ার্কার ইনিশিয়ালাইজ করুন
      await this.initializeWorkers();
      
      // ডেড লেটার কিউ ক্লিনআপ
      await this.cleanupDeadLetterQueue();
      
      console.log('✅ Reminder Scheduler initialized successfully');
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Failed to initialize Reminder Scheduler:', error);
      throw error;
    }
  }

  /**
   * স্কিডিউলার শুরু করে
   */
  public async start(): Promise<void> {
    try {
      if (this.isRunning) {
        console.log('⚠️ Scheduler is already running');
        return;
      }

      if (!this.isInitialized) {
        await this.initialize();
      }

      this.isRunning = true;
      
      // মূল স্কিডিউল চেকার শুরু করুন
      this.checkInterval = setInterval(() => {
        this.checkScheduledReminders().catch(error => {
          console.error('❌ Error in scheduled reminder check:', error);
          this.emit('error', error);
        });
      }, this.config.checkInterval);

      // ওয়ার্কার হার্টবিট চেকার
      setInterval(() => {
        this.checkWorkerHealth().catch(console.error);
      }, 30000); // 30 সেকেন্ড

      // মেট্রিক্স আপডেটার
      if (this.config.enableMetrics) {
        setInterval(() => {
          this.updateMetrics().catch(console.error);
        }, 60000); // 1 মিনিট
      }

      console.log('✅ Reminder Scheduler started');
      this.emit('started');
    } catch (error) {
      console.error('❌ Failed to start scheduler:', error);
      throw error;
    }
  }

  /**
   * স্কিডিউলার বন্ধ করে
   */
  public async stop(): Promise<void> {
    try {
      if (!this.isRunning) {
        console.log('⚠️ Scheduler is not running');
        return;
      }

      this.isRunning = false;
      
      if (this.checkInterval) {
        clearInterval(this.checkInterval);
        this.checkInterval = null;
      }

      // সব ওয়ার্কার বন্ধ করুন
      await this.stopAllWorkers();

      console.log('✅ Reminder Scheduler stopped');
      this.emit('stopped');
    } catch (error) {
      console.error('❌ Failed to stop scheduler:', error);
      throw error;
    }
  }

  /**
   * স্কিডিউল করা রিমাইন্ডার চেক করে
   */
  public async checkScheduledReminders(): Promise<void> {
    try {
      const now = new Date();
      const reminderIds = await redisReminderService.getScheduledReminders(now);
      
      if (reminderIds.length === 0) {
        return;
      }

      console.log(`📋 Found ${reminderIds.length} scheduled reminders to process`);
      
      // ব্যাচে প্রসেস করুন
      await this.processBatchReminders(reminderIds);
      
    } catch (error) {
      console.error('❌ Error checking scheduled reminders:', error);
      this.metrics.totalErrors++;
      throw error;
    }
  }

  /**
   * ব্যাচ রিমাইন্ডার প্রসেস করে
   */
  public async processBatchReminders(reminderIds: string[]): Promise<void> {
    try {
      const batches = this.createBatches(reminderIds, this.config.batchSize);
      
      // প্রতিটি ব্যাচ প্যারালেলে প্রসেস করুন
      const promises = batches.map((batch, index) => 
        this.processBatch(batch, `batch-${index}`)
      );
      
      await Promise.allSettled(promises);
      
      console.log(`✅ Processed ${reminderIds.length} reminders in ${batches.length} batches`);
    } catch (error) {
      console.error('❌ Error processing batch reminders:', error);
      throw error;
    }
  }

  /**
   * একটি ব্যাচ প্রসেস করে
   */
  private async processBatch(reminderIds: string[], batchId: string): Promise<void> {
    const startTime = Date.now();
    
    try {
      const worker = this.getAvailableWorker();
      if (!worker) {
        // কিউতে ফেরত পাঠান
        await this.requeueReminders(reminderIds);
        return;
      }

      worker.currentTask = batchId;
      worker.lastHeartbeat = new Date();
      
      // প্রতিটি রিমাইন্ডার প্রসেস করুন
      for (const reminderId of reminderIds) {
        try {
          await this.processReminder(reminderId, worker.id);
          worker.processedCount++;
          this.metrics.totalProcessed++;
        } catch (error) {
          console.error(`❌ Error processing reminder ${reminderId}:`, error);
          worker.errorCount++;
          this.metrics.totalErrors++;
          
          // ফেইল্ড রিমাইন্ডার হ্যান্ডল করুন
          await this.handleFailedReminder(reminderId, error as Error);
        }
      }
      
      worker.currentTask = undefined;
      
      // প্রসেসিং টাইম আপডেট করুন
      const processingTime = Date.now() - startTime;
      this.updateAverageProcessingTime(processingTime);
      
    } catch (error) {
      console.error(`❌ Error in batch ${batchId}:`, error);
      await this.requeueReminders(reminderIds);
      throw error;
    }
  }

  /**
   * একটি রিমাইন্ডার প্রসেস করে
   */
  private async processReminder(reminderId: string, workerId: string): Promise<void> {
    try {
      // স্কিডিউল থেকে রিমুভ করুন
      await redisClient.zrem('reminder:schedule', reminderId);
      
      // নোটিফিকেশন ট্রিগার করুন
      await redisReminderService.triggerNotification(reminderId);
      
      console.log(`✅ Processed reminder ${reminderId} by worker ${workerId}`);
      
    } catch (error) {
      console.error(`❌ Failed to process reminder ${reminderId}:`, error);
      throw error;
    }
  }

  /**
   * ফেইল্ড রিমাইন্ডার হ্যান্ডল করে
   */
  public async handleFailedReminder(reminderId: string, error: Error): Promise<void> {
    try {
      const retryKey = `reminder:retry:${reminderId}`;
      const retryCount = await redisClient.incr(retryKey);
      
      // TTL সেট করুন (1 ঘন্টা)
      await redisClient.expire(retryKey, 3600);
      
      if (retryCount <= this.config.maxRetries) {
        // রিট্রাই কিউতে যোগ করুন
        const retryTime = Date.now() + (retryCount * 60000); // প্রতি রিট্রাইতে 1 মিনিট বিলম্ব
        await redisClient.zadd('reminder:retry', retryTime, reminderId);
        
        console.log(`🔄 Retry scheduled for reminder ${reminderId} (attempt ${retryCount})`);
      } else {
        // ডেড লেটার কিউতে পাঠান
        await this.moveToDeadLetterQueue(reminderId, error);
        
        console.log(`💀 Moved reminder ${reminderId} to dead letter queue after ${retryCount} attempts`);
      }
    } catch (err) {
      console.error('❌ Error handling failed reminder:', err);
    }
  }

  /**
   * ডেড লেটার কিউতে পাঠায়
   */
  private async moveToDeadLetterQueue(reminderId: string, error: Error): Promise<void> {
    try {
      const deadLetterData = {
        reminderId,
        error: error.message,
        timestamp: new Date().toISOString(),
        attempts: this.config.maxRetries
      };
      
      await redisClient.lpush('reminder:dead_letter', JSON.stringify(deadLetterData));
      
      // রিট্রাই কাউন্ট ক্লিনআপ
      await redisClient.del(`reminder:retry:${reminderId}`);
      
    } catch (err) {
      console.error('❌ Error moving to dead letter queue:', err);
    }
  }

  /**
   * ডেড লেটার কিউ ক্লিনআপ করে
   */
  private async cleanupDeadLetterQueue(): Promise<void> {
    try {
      const threshold = Date.now() - (this.config.deadLetterThreshold * 60 * 1000);
      
      // পুরানো এন্ট্রি পান
      const deadLetters = await redisClient.lrange('reminder:dead_letter', 0, -1);
      
      for (const deadLetterStr of deadLetters) {
        try {
          const deadLetter = JSON.parse(deadLetterStr);
          const timestamp = new Date(deadLetter.timestamp).getTime();
          
          if (timestamp < threshold) {
            // পুরানো এন্ট্রি রিমুভ করুন
            await redisClient.lrem('reminder:dead_letter', 1, deadLetterStr);
            console.log(`🧹 Cleaned up old dead letter: ${deadLetter.reminderId}`);
          }
        } catch (parseError) {
          // ইনভ্যালিড এন্ট্রি রিমুভ করুন
          await redisClient.lrem('reminder:dead_letter', 1, deadLetterStr);
        }
      }
    } catch (error) {
      console.error('❌ Error cleaning up dead letter queue:', error);
    }
  }

  /**
   * রিমাইন্ডার রিকিউ করে
   */
  private async requeueReminders(reminderIds: string[]): Promise<void> {
    try {
      const requeueTime = Date.now() + 30000; // 30 সেকেন্ড পরে
      
      for (const reminderId of reminderIds) {
        await redisClient.zadd('reminder:schedule', requeueTime, reminderId);
      }
      
      console.log(`🔄 Requeued ${reminderIds.length} reminders`);
    } catch (error) {
      console.error('❌ Error requeuing reminders:', error);
    }
  }

  /**
   * ওয়ার্কার ইনিশিয়ালাইজ করে
   */
  private async initializeWorkers(): Promise<void> {
    try {
      for (let i = 0; i < this.config.workerCount; i++) {
        const workerId = `worker-${i + 1}`;
        const worker: WorkerStatus = {
          id: workerId,
          isActive: true,
          lastHeartbeat: new Date(),
          processedCount: 0,
          errorCount: 0
        };
        
        this.workers.set(workerId, worker);
      }
      
      console.log(`✅ Initialized ${this.config.workerCount} workers`);
    } catch (error) {
      console.error('❌ Error initializing workers:', error);
      throw error;
    }
  }

  /**
   * উপলব্ধ ওয়ার্কার পান
   */
  private getAvailableWorker(): WorkerStatus | null {
    for (const worker of this.workers.values()) {
      if (worker.isActive && !worker.currentTask) {
        return worker;
      }
    }
    return null;
  }

  /**
   * ওয়ার্কার হেলথ চেক করে
   */
  private async checkWorkerHealth(): Promise<void> {
    try {
      const now = new Date();
      const healthThreshold = 5 * 60 * 1000; // 5 মিনিট
      
      for (const worker of this.workers.values()) {
        const timeSinceHeartbeat = now.getTime() - worker.lastHeartbeat.getTime();
        
        if (timeSinceHeartbeat > healthThreshold) {
          console.log(`⚠️ Worker ${worker.id} appears unhealthy, restarting...`);
          
          // ওয়ার্কার রিস্টার্ট করুন
          worker.isActive = true;
          worker.lastHeartbeat = now;
          worker.currentTask = undefined;
        }
      }
    } catch (error) {
      console.error('❌ Error checking worker health:', error);
    }
  }

  /**
   * সব ওয়ার্কার বন্ধ করে
   */
  private async stopAllWorkers(): Promise<void> {
    try {
      for (const worker of this.workers.values()) {
        worker.isActive = false;
        worker.currentTask = undefined;
      }
      
      console.log('✅ All workers stopped');
    } catch (error) {
      console.error('❌ Error stopping workers:', error);
    }
  }

  /**
   * ব্যাচ তৈরি করে
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    
    return batches;
  }

  /**
   * গড় প্রসেসিং টাইম আপডেট করে
   */
  private updateAverageProcessingTime(processingTime: number): void {
    const alpha = 0.1; // EMA smoothing factor
    this.metrics.averageProcessingTime = 
      (alpha * processingTime) + ((1 - alpha) * this.metrics.averageProcessingTime);
  }

  /**
   * মেট্রিক্স আপডেট করে
   */
  private async updateMetrics(): Promise<void> {
    try {
      this.metrics.queueLength = await redisClient.zcard('reminder:schedule');
      this.metrics.activeWorkers = Array.from(this.workers.values())
        .filter(w => w.isActive).length;
      this.metrics.lastProcessedAt = new Date();
      
      // মেট্রিক্স ইভেন্ট এমিট করুন
      this.emit('metrics', this.metrics);
    } catch (error) {
      console.error('❌ Error updating metrics:', error);
    }
  }

  /**
   * স্কিডিউলার স্ট্যাটাস পান
   */
  public getStatus(): {
    isRunning: boolean;
    isInitialized: boolean;
    config: SchedulerConfig;
    metrics: SchedulerMetrics;
    workers: WorkerStatus[];
  } {
    return {
      isRunning: this.isRunning,
      isInitialized: this.isInitialized,
      config: this.config,
      metrics: this.metrics,
      workers: Array.from(this.workers.values())
    };
  }

  /**
   * কনফিগারেশন আপডেট করে
   */
  public updateConfig(newConfig: Partial<SchedulerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // ইন্টারভাল আপডেট করুন
    if (newConfig.checkInterval && this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = setInterval(() => {
        this.checkScheduledReminders().catch(error => {
          console.error('❌ Error in scheduled reminder check:', error);
          this.emit('error', error);
        });
      }, this.config.checkInterval);
    }
    
    console.log('✅ Scheduler config updated');
  }

  /**
   * ডেড লেটার কিউ পান
   */
  public async getDeadLetterQueue(): Promise<any[]> {
    try {
      const deadLetters = await redisClient.lrange('reminder:dead_letter', 0, -1);
      return deadLetters.map(dl => {
        try {
          return JSON.parse(dl);
        } catch {
          return { raw: dl, error: 'Invalid JSON' };
        }
      });
    } catch (error) {
      console.error('❌ Error getting dead letter queue:', error);
      throw error;
    }
  }

  /**
   * ডেড লেটার কিউ ক্লিয়ার করে
   */
  public async clearDeadLetterQueue(): Promise<void> {
    try {
      await redisClient.del('reminder:dead_letter');
      console.log('✅ Dead letter queue cleared');
    } catch (error) {
      console.error('❌ Error clearing dead letter queue:', error);
      throw error;
    }
  }
}

// সিঙ্গেলটন ইনস্ট্যান্স এক্সপোর্ট
export const reminderScheduler = ReminderScheduler.getInstance();