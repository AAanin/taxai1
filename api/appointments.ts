import express from 'express';
import { supabase } from '../lib/supabase';
import { z } from 'zod';

const router = express.Router();

// Validation schemas
const createAppointmentSchema = z.object({
  doctor_name: z.string().min(1, 'ডাক্তারের নাম প্রয়োজন'),
  doctor_specialty: z.string().optional(),
  hospital_name: z.string().optional(),
  appointment_date: z.string().min(1, 'অ্যাপয়েন্টমেন্টের তারিখ প্রয়োজন'),
  appointment_time: z.string().min(1, 'অ্যাপয়েন্টমেন্টের সময় প্রয়োজন'),
  appointment_type: z.enum(['consultation', 'follow_up', 'emergency', 'routine_checkup']).optional(),
  symptoms: z.string().optional(),
  notes: z.string().optional(),
});

const updateAppointmentSchema = z.object({
  doctor_name: z.string().optional(),
  doctor_specialty: z.string().optional(),
  hospital_name: z.string().optional(),
  appointment_date: z.string().optional(),
  appointment_time: z.string().optional(),
  appointment_type: z.enum(['consultation', 'follow_up', 'emergency', 'routine_checkup']).optional(),
  status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled']).optional(),
  symptoms: z.string().optional(),
  notes: z.string().optional(),
  reminder_sent: z.boolean().optional(),
});

// Get appointments by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status, search } = req.query;
    
    const offset = (Number(page) - 1) * Number(limit);
    
    let query = supabase
      .from('appointments')
      .select('*')
      .eq('user_id', userId)
      .order('appointment_date', { ascending: false })
      .order('appointment_time', { ascending: false });
    
    // Apply status filter
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    // Apply search filter
    if (search) {
      query = query.or(`doctor_name.ilike.%${search}%,hospital_name.ilike.%${search}%,doctor_specialty.ilike.%${search}%`);
    }
    
    // Apply pagination
    query = query.range(offset, offset + Number(limit) - 1);
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Error fetching appointments:', error);
      return res.status(500).json({
        success: false,
        message: 'অ্যাপয়েন্টমেন্ট লোড করতে সমস্যা হয়েছে',
        error: error.message
      });
    }
    
    res.json({
      success: true,
      data: data || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error in get appointments by user:', error);
    res.status(500).json({
      success: false,
      message: 'সার্ভার এরর',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get appointment by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'অ্যাপয়েন্টমেন্ট পাওয়া যায়নি'
        });
      }
      
      console.error('Error fetching appointment:', error);
      return res.status(500).json({
        success: false,
        message: 'অ্যাপয়েন্টমেন্ট লোড করতে সমস্যা হয়েছে',
        error: error.message
      });
    }
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in get appointment by ID:', error);
    res.status(500).json({
      success: false,
      message: 'সার্ভার এরর',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create new appointment
router.post('/', async (req, res) => {
  try {
    const validatedData = createAppointmentSchema.parse(req.body);
    const { user_id } = req.body;
    
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'ইউজার আইডি প্রয়োজন'
      });
    }
    
    // Check if user exists
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user_id)
      .single();
    
    if (userError || !userData) {
      return res.status(404).json({
        success: false,
        message: 'ইউজার পাওয়া যায়নি'
      });
    }
    
    // Check for conflicting appointments
    const { data: existingAppointment, error: conflictError } = await supabase
      .from('appointments')
      .select('id')
      .eq('user_id', user_id)
      .eq('appointment_date', validatedData.appointment_date)
      .eq('appointment_time', validatedData.appointment_time)
      .eq('status', 'scheduled')
      .single();
    
    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'এই সময়ে আপনার ইতিমধ্যে একটি অ্যাপয়েন্টমেন্ট রয়েছে'
      });
    }
    
    const appointmentData = {
      ...validatedData,
      user_id,
      status: 'scheduled',
      reminder_sent: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointmentData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating appointment:', error);
      return res.status(500).json({
        success: false,
        message: 'অ্যাপয়েন্টমেন্ট তৈরি করতে সমস্যা হয়েছে',
        error: error.message
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'অ্যাপয়েন্টমেন্ট সফলভাবে তৈরি হয়েছে',
      data
    });
  } catch (error) {
    console.error('Error in create appointment:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'ভ্যালিডেশন এরর',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'সার্ভার এরর',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update appointment
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateAppointmentSchema.parse(req.body);
    
    // Check if appointment exists
    const { data: existingAppointment, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'অ্যাপয়েন্টমেন্ট পাওয়া যায়নি'
        });
      }
      
      console.error('Error fetching appointment for update:', fetchError);
      return res.status(500).json({
        success: false,
        message: 'অ্যাপয়েন্টমেন্ট আপডেট করতে সমস্যা হয়েছে',
        error: fetchError.message
      });
    }
    
    // Check for time conflicts if date/time is being updated
    if (validatedData.appointment_date || validatedData.appointment_time) {
      const checkDate = validatedData.appointment_date || existingAppointment.appointment_date;
      const checkTime = validatedData.appointment_time || existingAppointment.appointment_time;
      
      const { data: conflictingAppointment } = await supabase
        .from('appointments')
        .select('id')
        .eq('user_id', existingAppointment.user_id)
        .eq('appointment_date', checkDate)
        .eq('appointment_time', checkTime)
        .neq('id', id)
        .in('status', ['scheduled', 'confirmed'])
        .single();
      
      if (conflictingAppointment) {
        return res.status(400).json({
          success: false,
          message: 'এই সময়ে আপনার ইতিমধ্যে একটি অ্যাপয়েন্টমেন্ট রয়েছে'
        });
      }
    }
    
    const updateData = {
      ...validatedData,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating appointment:', error);
      return res.status(500).json({
        success: false,
        message: 'অ্যাপয়েন্টমেন্ট আপডেট করতে সমস্যা হয়েছে',
        error: error.message
      });
    }
    
    res.json({
      success: true,
      message: 'অ্যাপয়েন্টমেন্ট সফলভাবে আপডেট হয়েছে',
      data
    });
  } catch (error) {
    console.error('Error in update appointment:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'ভ্যালিডেশন এরর',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'সার্ভার এরর',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete appointment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if appointment exists
    const { data: existingAppointment, error: fetchError } = await supabase
      .from('appointments')
      .select('id')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'অ্যাপয়েন্টমেন্ট পাওয়া যায়নি'
        });
      }
      
      console.error('Error fetching appointment for deletion:', fetchError);
      return res.status(500).json({
        success: false,
        message: 'অ্যাপয়েন্টমেন্ট মুছতে সমস্যা হয়েছে',
        error: fetchError.message
      });
    }
    
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting appointment:', error);
      return res.status(500).json({
        success: false,
        message: 'অ্যাপয়েন্টমেন্ট মুছতে সমস্যা হয়েছে',
        error: error.message
      });
    }
    
    res.json({
      success: true,
      message: 'অ্যাপয়েন্টমেন্ট সফলভাবে মুছে ফেলা হয়েছে'
    });
  } catch (error) {
    console.error('Error in delete appointment:', error);
    res.status(500).json({
      success: false,
      message: 'সার্ভার এরর',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get upcoming appointments
router.get('/user/:userId/upcoming', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 5 } = req.query;
    
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', userId)
      .gte('appointment_date', today)
      .in('status', ['scheduled', 'confirmed'])
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true })
      .limit(Number(limit));
    
    if (error) {
      console.error('Error fetching upcoming appointments:', error);
      return res.status(500).json({
        success: false,
        message: 'আসন্ন অ্যাপয়েন্টমেন্ট লোড করতে সমস্যা হয়েছে',
        error: error.message
      });
    }
    
    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Error in get upcoming appointments:', error);
    res.status(500).json({
      success: false,
      message: 'সার্ভার এরর',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get appointment statistics
router.get('/user/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get total appointments
    const { count: totalAppointments, error: totalError } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (totalError) {
      console.error('Error fetching total appointments:', totalError);
      return res.status(500).json({
        success: false,
        message: 'পরিসংখ্যান লোড করতে সমস্যা হয়েছে',
        error: totalError.message
      });
    }
    
    // Get appointments by status
    const { data: statusData, error: statusError } = await supabase
      .from('appointments')
      .select('status')
      .eq('user_id', userId);
    
    if (statusError) {
      console.error('Error fetching appointment status data:', statusError);
      return res.status(500).json({
        success: false,
        message: 'পরিসংখ্যান লোড করতে সমস্যা হয়েছে',
        error: statusError.message
      });
    }
    
    // Count by status
    const statusCounts = (statusData || []).reduce((acc: Record<string, number>, appointment) => {
      acc[appointment.status] = (acc[appointment.status] || 0) + 1;
      return acc;
    }, {});
    
    // Get upcoming appointments count
    const today = new Date().toISOString().split('T')[0];
    const { count: upcomingCount, error: upcomingError } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('appointment_date', today)
      .in('status', ['scheduled', 'confirmed']);
    
    if (upcomingError) {
      console.error('Error fetching upcoming appointments count:', upcomingError);
      return res.status(500).json({
        success: false,
        message: 'পরিসংখ্যান লোড করতে সমস্যা হয়েছে',
        error: upcomingError.message
      });
    }
    
    res.json({
      success: true,
      data: {
        total: totalAppointments || 0,
        upcoming: upcomingCount || 0,
        byStatus: {
          scheduled: statusCounts.scheduled || 0,
          confirmed: statusCounts.confirmed || 0,
          completed: statusCounts.completed || 0,
          cancelled: statusCounts.cancelled || 0,
          rescheduled: statusCounts.rescheduled || 0
        }
      }
    });
  } catch (error) {
    console.error('Error in get appointment stats:', error);
    res.status(500).json({
      success: false,
      message: 'সার্ভার এরর',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;