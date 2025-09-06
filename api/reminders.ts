import express, { Request, Response } from 'express';
import { redisReminderService, ReminderData } from '../src/services/redisReminderService';
import { reminderScheduler } from '../src/services/reminderScheduler';
import { notificationService } from '../src/services/notificationService';

const router = express.Router();

// রিকোয়েস্ট ইন্টারফেস
interface CreateReminderRequest {
  type: 'medicine' | 'appointment' | 'test' | 'followup';
  title: string;
  description: string;
  scheduledTime: string; // ISO 8601
  isRecurring: boolean;
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: string;
  };
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
  notificationChannels?: ('push' | 'sms' | 'email' | 'websocket')[];
  priority?: 'high' | 'medium' | 'low';
}

interface UpdateReminderRequest {
  title?: string;
  description?: string;
  scheduledTime?: string;
  isActive?: boolean;
  isCompleted?: boolean;
  notificationChannels?: ('push' | 'sms' | 'email' | 'websocket')[];
  priority?: 'high' | 'medium' | 'low';
}

interface SnoozeReminderRequest {
  duration: number; // minutes
}

interface GetRemindersQuery {
  type?: string;
  isActive?: string;
  startDate?: string;
  endDate?: string;
  limit?: string;
  offset?: string;
}

// অথেন্টিকেশন মিডলওয়্যার (ডেমো)
const authenticateUser = (req: Request, res: Response, next: any) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authorization token required'
    });
  }
  
  const token = authHeader.substring(7);
  
  // টোকেন ভেরিফাই করুন (আপনার অথ সিস্টেম অনুযায়ী)
  // const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // req.user = decoded;
  
  // ডেমো ইউজার
  req.user = {
    id: 'user123',
    email: 'user@example.com',
    name: 'Test User'
  };
  
  next();
};

// ভ্যালিডেশন মিডলওয়্যার
const validateCreateReminder = (req: Request, res: Response, next: any) => {
  const { type, title, description, scheduledTime } = req.body;
  
  if (!type || !['medicine', 'appointment', 'test', 'followup'].includes(type)) {
    return res.status(400).json({
      success: false,
      error: 'Valid reminder type is required (medicine, appointment, test, followup)'
    });
  }
  
  if (!title || title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Title is required'
    });
  }
  
  if (!description || description.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Description is required'
    });
  }
  
  if (!scheduledTime) {
    return res.status(400).json({
      success: false,
      error: 'Scheduled time is required'
    });
  }
  
  const scheduledDate = new Date(scheduledTime);
  if (isNaN(scheduledDate.getTime())) {
    return res.status(400).json({
      success: false,
      error: 'Invalid scheduled time format'
    });
  }
  
  if (scheduledDate <= new Date()) {
    return res.status(400).json({
      success: false,
      error: 'Scheduled time must be in the future'
    });
  }
  
  next();
};

/**
 * POST /api/reminders
 * নতুন রিমাইন্ডার তৈরি করে
 */
router.post('/', authenticateUser, validateCreateReminder, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const reminderData: CreateReminderRequest = req.body;
    
    // রিমাইন্ডার ডেটা প্রস্তুত করুন
    const reminder: Omit<ReminderData, 'id' | 'createdAt' | 'updatedAt'> = {
      type: reminderData.type,
      title: reminderData.title.trim(),
      description: reminderData.description.trim(),
      userId,
      scheduledTime: new Date(reminderData.scheduledTime),
      isRecurring: reminderData.isRecurring || false,
      recurringPattern: reminderData.recurringPattern ? {
        frequency: reminderData.recurringPattern.frequency,
        interval: reminderData.recurringPattern.interval,
        endDate: reminderData.recurringPattern.endDate ? 
          new Date(reminderData.recurringPattern.endDate) : undefined
      } : undefined,
      isActive: true,
      isCompleted: false,
      medicineInfo: reminderData.medicineInfo,
      appointmentInfo: reminderData.appointmentInfo,
      testInfo: reminderData.testInfo,
      notificationChannels: reminderData.notificationChannels || ['push', 'websocket'],
      priority: reminderData.priority || 'medium'
    };
    
    // রিমাইন্ডার তৈরি করুন
    const reminderId = await redisReminderService.createReminder(reminder);
    
    // পরবর্তী অকারেন্স গণনা করুন
    let nextOccurrence: string | undefined;
    if (reminder.isRecurring && reminder.recurringPattern) {
      const next = new Date(reminder.scheduledTime);
      switch (reminder.recurringPattern.frequency) {
        case 'daily':
          next.setDate(next.getDate() + reminder.recurringPattern.interval);
          break;
        case 'weekly':
          next.setDate(next.getDate() + (reminder.recurringPattern.interval * 7));
          break;
        case 'monthly':
          next.setMonth(next.getMonth() + reminder.recurringPattern.interval);
          break;
      }
      nextOccurrence = next.toISOString();
    }
    
    res.status(201).json({
      success: true,
      data: {
        reminderId,
        scheduledTime: reminder.scheduledTime.toISOString(),
        nextOccurrence
      },
      message: 'রিমাইন্ডার সফলভাবে তৈরি হয়েছে'
    });
    
  } catch (error) {
    console.error('❌ Error creating reminder:', error);
    res.status(500).json({
      success: false,
      error: 'রিমাইন্ডার তৈরি করতে ব্যর্থ হয়েছে'
    });
  }
});

/**
 * GET /api/reminders
 * ইউজারের রিমাইন্ডার তালিকা পান
 */
router.get('/', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const query: GetRemindersQuery = req.query;
    
    const options = {
      type: query.type,
      isActive: query.isActive ? query.isActive === 'true' : undefined,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      limit: query.limit ? parseInt(query.limit) : 50,
      offset: query.offset ? parseInt(query.offset) : 0
    };
    
    const result = await redisReminderService.getUserReminders(userId, options);
    
    res.json({
      success: true,
      data: {
        reminders: result.reminders,
        pagination: {
          total: result.total,
          limit: options.limit,
          offset: options.offset,
          hasMore: result.hasMore
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error getting reminders:', error);
    res.status(500).json({
      success: false,
      error: 'রিমাইন্ডার তালিকা পেতে ব্যর্থ হয়েছে'
    });
  }
});

/**
 * GET /api/reminders/:id
 * নির্দিষ্ট রিমাইন্ডার পান
 */
router.get('/:id', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const reminder = await redisReminderService.getReminder(id);
    
    if (!reminder) {
      return res.status(404).json({
        success: false,
        error: 'রিমাইন্ডার পাওয়া যায়নি'
      });
    }
    
    // ইউজার অথরাইজেশন চেক করুন
    if (reminder.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'এই রিমাইন্ডার অ্যাক্সেস করার অনুমতি নেই'
      });
    }
    
    res.json({
      success: true,
      data: reminder
    });
    
  } catch (error) {
    console.error('❌ Error getting reminder:', error);
    res.status(500).json({
      success: false,
      error: 'রিমাইন্ডার পেতে ব্যর্থ হয়েছে'
    });
  }
});

/**
 * PUT /api/reminders/:id
 * রিমাইন্ডার আপডেট করে
 */
router.put('/:id', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates: UpdateReminderRequest = req.body;
    
    // রিমাইন্ডার অস্তিত্ব এবং অথরাইজেশন চেক করুন
    const existingReminder = await redisReminderService.getReminder(id);
    
    if (!existingReminder) {
      return res.status(404).json({
        success: false,
        error: 'রিমাইন্ডার পাওয়া যায়নি'
      });
    }
    
    if (existingReminder.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'এই রিমাইন্ডার আপডেট করার অনুমতি নেই'
      });
    }
    
    // আপডেট ডেটা প্রস্তুত করুন
    const updateData: Partial<ReminderData> = {};
    
    if (updates.title !== undefined) {
      updateData.title = updates.title.trim();
    }
    
    if (updates.description !== undefined) {
      updateData.description = updates.description.trim();
    }
    
    if (updates.scheduledTime !== undefined) {
      const scheduledDate = new Date(updates.scheduledTime);
      if (isNaN(scheduledDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid scheduled time format'
        });
      }
      updateData.scheduledTime = scheduledDate;
    }
    
    if (updates.isActive !== undefined) {
      updateData.isActive = updates.isActive;
    }
    
    if (updates.isCompleted !== undefined) {
      updateData.isCompleted = updates.isCompleted;
    }
    
    if (updates.notificationChannels !== undefined) {
      updateData.notificationChannels = updates.notificationChannels;
    }
    
    if (updates.priority !== undefined) {
      updateData.priority = updates.priority;
    }
    
    // রিমাইন্ডার আপডেট করুন
    await redisReminderService.updateReminder(id, updateData);
    
    // আপডেট করা রিমাইন্ডার পান
    const updatedReminder = await redisReminderService.getReminder(id);
    
    res.json({
      success: true,
      data: updatedReminder,
      message: 'রিমাইন্ডার সফলভাবে আপডেট হয়েছে'
    });
    
  } catch (error) {
    console.error('❌ Error updating reminder:', error);
    res.status(500).json({
      success: false,
      error: 'রিমাইন্ডার আপডেট করতে ব্যর্থ হয়েছে'
    });
  }
});

/**
 * DELETE /api/reminders/:id
 * রিমাইন্ডার ডিলিট করে
 */
router.delete('/:id', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // রিমাইন্ডার অস্তিত্ব এবং অথরাইজেশন চেক করুন
    const existingReminder = await redisReminderService.getReminder(id);
    
    if (!existingReminder) {
      return res.status(404).json({
        success: false,
        error: 'রিমাইন্ডার পাওয়া যায়নি'
      });
    }
    
    if (existingReminder.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'এই রিমাইন্ডার ডিলিট করার অনুমতি নেই'
      });
    }
    
    // রিমাইন্ডার ডিলিট করুন
    await redisReminderService.deleteReminder(id);
    
    res.json({
      success: true,
      message: 'রিমাইন্ডার সফলভাবে ডিলিট হয়েছে'
    });
    
  } catch (error) {
    console.error('❌ Error deleting reminder:', error);
    res.status(500).json({
      success: false,
      error: 'রিমাইন্ডার ডিলিট করতে ব্যর্থ হয়েছে'
    });
  }
});

/**
 * POST /api/reminders/:id/snooze
 * রিমাইন্ডার স্নুজ করে
 */
router.post('/:id/snooze', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { duration }: SnoozeReminderRequest = req.body;
    
    if (!duration || duration <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid snooze duration (in minutes) is required'
      });
    }
    
    // রিমাইন্ডার অস্তিত্ব এবং অথরাইজেশন চেক করুন
    const existingReminder = await redisReminderService.getReminder(id);
    
    if (!existingReminder) {
      return res.status(404).json({
        success: false,
        error: 'রিমাইন্ডার পাওয়া যায়নি'
      });
    }
    
    if (existingReminder.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'এই রিমাইন্ডার স্নুজ করার অনুমতি নেই'
      });
    }
    
    if (!existingReminder.isActive) {
      return res.status(400).json({
        success: false,
        error: 'ইনঅ্যাক্টিভ রিমাইন্ডার স্নুজ করা যায় না'
      });
    }
    
    // রিমাইন্ডার স্নুজ করুন
    await redisReminderService.snoozeReminder(id, duration);
    
    // আপডেট করা রিমাইন্ডার পান
    const updatedReminder = await redisReminderService.getReminder(id);
    
    res.json({
      success: true,
      data: {
        reminderId: id,
        newScheduledTime: updatedReminder?.scheduledTime.toISOString(),
        snoozeDuration: duration
      },
      message: `রিমাইন্ডার ${duration} মিনিটের জন্য স্নুজ করা হয়েছে`
    });
    
  } catch (error) {
    console.error('❌ Error snoozing reminder:', error);
    res.status(500).json({
      success: false,
      error: 'রিমাইন্ডার স্নুজ করতে ব্যর্থ হয়েছে'
    });
  }
});

/**
 * POST /api/reminders/:id/complete
 * রিমাইন্ডার কমপ্লিট মার্ক করে
 */
router.post('/:id/complete', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // রিমাইন্ডার অস্তিত্ব এবং অথরাইজেশন চেক করুন
    const existingReminder = await redisReminderService.getReminder(id);
    
    if (!existingReminder) {
      return res.status(404).json({
        success: false,
        error: 'রিমাইন্ডার পাওয়া যায়নি'
      });
    }
    
    if (existingReminder.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'এই রিমাইন্ডার কমপ্লিট করার অনুমতি নেই'
      });
    }
    
    // রিমাইন্ডার কমপ্লিট মার্ক করুন
    await redisReminderService.updateReminder(id, {
      isCompleted: true,
      isActive: !existingReminder.isRecurring // রিকারিং না হলে ইনঅ্যাক্টিভ করুন
    });
    
    res.json({
      success: true,
      message: 'রিমাইন্ডার সফলভাবে সম্পন্ন হয়েছে'
    });
    
  } catch (error) {
    console.error('❌ Error completing reminder:', error);
    res.status(500).json({
      success: false,
      error: 'রিমাইন্ডার কমপ্লিট করতে ব্যর্থ হয়েছে'
    });
  }
});

/**
 * GET /api/reminders/stats
 * রিমাইন্ডার স্ট্যাটিস্টিক্স পান
 */
router.get('/stats/overview', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    
    // ইউজারের রিমাইন্ডার স্ট্যাটস পান
    const [activeReminders, completedReminders, upcomingReminders] = await Promise.all([
      redisReminderService.getUserReminders(userId, { isActive: true, limit: 1000 }),
      redisReminderService.getUserReminders(userId, { isActive: false, limit: 1000 }),
      redisReminderService.getUserReminders(userId, {
        isActive: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // পরবর্তী 7 দিন
        limit: 1000
      })
    ]);
    
    // টাইপ অনুযায়ী গ্রুপ করুন
    const remindersByType = activeReminders.reminders.reduce((acc, reminder) => {
      acc[reminder.type] = (acc[reminder.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // সিস্টেম স্ট্যাটস পান
    const systemStats = await redisReminderService.getStats();
    
    res.json({
      success: true,
      data: {
        user: {
          totalActive: activeReminders.total,
          totalCompleted: completedReminders.total,
          upcomingWeek: upcomingReminders.total,
          byType: remindersByType
        },
        system: systemStats
      }
    });
    
  } catch (error) {
    console.error('❌ Error getting reminder stats:', error);
    res.status(500).json({
      success: false,
      error: 'রিমাইন্ডার স্ট্যাটিস্টিক্স পেতে ব্যর্থ হয়েছে'
    });
  }
});

/**
 * GET /api/reminders/scheduler/status
 * স্কিডিউলার স্ট্যাটাস পান (অ্যাডমিন অনলি)
 */
router.get('/scheduler/status', authenticateUser, async (req: Request, res: Response) => {
  try {
    // অ্যাডমিন চেক (ডেমো)
    if (req.user.email !== 'admin@example.com') {
      return res.status(403).json({
        success: false,
        error: 'অ্যাডমিন অ্যাক্সেস প্রয়োজন'
      });
    }
    
    const schedulerStatus = reminderScheduler.getStatus();
    const notificationStatus = notificationService.getStatus();
    
    res.json({
      success: true,
      data: {
        scheduler: schedulerStatus,
        notification: notificationStatus
      }
    });
    
  } catch (error) {
    console.error('❌ Error getting scheduler status:', error);
    res.status(500).json({
      success: false,
      error: 'স্কিডিউলার স্ট্যাটাস পেতে ব্যর্থ হয়েছে'
    });
  }
});

/**
 * POST /api/reminders/scheduler/start
 * স্কিডিউলার শুরু করে (অ্যাডমিন অনলি)
 */
router.post('/scheduler/start', authenticateUser, async (req: Request, res: Response) => {
  try {
    // অ্যাডমিন চেক (ডেমো)
    if (req.user.email !== 'admin@example.com') {
      return res.status(403).json({
        success: false,
        error: 'অ্যাডমিন অ্যাক্সেস প্রয়োজন'
      });
    }
    
    await reminderScheduler.start();
    
    res.json({
      success: true,
      message: 'রিমাইন্ডার স্কিডিউলার শুরু হয়েছে'
    });
    
  } catch (error) {
    console.error('❌ Error starting scheduler:', error);
    res.status(500).json({
      success: false,
      error: 'স্কিডিউলার শুরু করতে ব্যর্থ হয়েছে'
    });
  }
});

/**
 * POST /api/reminders/scheduler/stop
 * স্কিডিউলার বন্ধ করে (অ্যাডমিন অনলি)
 */
router.post('/scheduler/stop', authenticateUser, async (req: Request, res: Response) => {
  try {
    // অ্যাডমিন চেক (ডেমো)
    if (req.user.email !== 'admin@example.com') {
      return res.status(403).json({
        success: false,
        error: 'অ্যাডমিন অ্যাক্সেস প্রয়োজন'
      });
    }
    
    await reminderScheduler.stop();
    
    res.json({
      success: true,
      message: 'রিমাইন্ডার স্কিডিউলার বন্ধ হয়েছে'
    });
    
  } catch (error) {
    console.error('❌ Error stopping scheduler:', error);
    res.status(500).json({
      success: false,
      error: 'স্কিডিউলার বন্ধ করতে ব্যর্থ হয়েছে'
    });
  }
});

// এরর হ্যান্ডলিং মিডলওয়্যার
router.use((error: any, req: Request, res: Response, next: any) => {
  console.error('❌ Reminder API Error:', error);
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: 'একটি অভ্যন্তরীণ ত্রুটি ঘটেছে'
  });
});

export default router;

// TypeScript ডিক্লারেশন
declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        email: string;
        name: string;
      };
    }
  }
}