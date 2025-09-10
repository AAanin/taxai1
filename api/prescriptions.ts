import express from 'express';
import { supabase } from '../lib/supabase';
import { z } from 'zod';

const router = express.Router();

// Validation schemas
const medicineSchema = z.object({
  name: z.string().min(1, 'ওষুধের নাম প্রয়োজন'),
  dosage: z.string().min(1, 'ডোজ প্রয়োজন'),
  frequency: z.string().min(1, 'সেবনের নিয়ম প্রয়োজন'),
  duration: z.string().min(1, 'সেবনের মেয়াদ প্রয়োজন'),
  instructions: z.string().optional(),
});

const createPrescriptionSchema = z.object({
  doctor_name: z.string().min(1, 'ডাক্তারের নাম প্রয়োজন'),
  doctor_specialty: z.string().optional(),
  hospital_name: z.string().optional(),
  prescription_date: z.string().min(1, 'প্রেসক্রিপশনের তারিখ প্রয়োজন'),
  diagnosis: z.string().optional(),
  notes: z.string().optional(),
  medicines: z.array(medicineSchema).min(1, 'কমপক্ষে একটি ওষুধ প্রয়োজন'),
  follow_up_date: z.string().optional(),
});

const updatePrescriptionSchema = z.object({
  doctor_name: z.string().optional(),
  doctor_specialty: z.string().optional(),
  hospital_name: z.string().optional(),
  prescription_date: z.string().optional(),
  diagnosis: z.string().optional(),
  notes: z.string().optional(),
  medicines: z.array(medicineSchema).optional(),
  follow_up_date: z.string().optional(),
});

// Get prescriptions by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, search, doctor, date_from, date_to } = req.query;
    
    const offset = (Number(page) - 1) * Number(limit);
    
    let query = supabase
      .from('prescriptions')
      .select('*')
      .eq('user_id', userId)
      .order('prescription_date', { ascending: false })
      .order('created_at', { ascending: false });
    
    // Apply search filter
    if (search) {
      query = query.or(`doctor_name.ilike.%${search}%,hospital_name.ilike.%${search}%,diagnosis.ilike.%${search}%`);
    }
    
    // Apply doctor filter
    if (doctor) {
      query = query.ilike('doctor_name', `%${doctor}%`);
    }
    
    // Apply date range filter
    if (date_from) {
      query = query.gte('prescription_date', date_from);
    }
    if (date_to) {
      query = query.lte('prescription_date', date_to);
    }
    
    // Apply pagination
    query = query.range(offset, offset + Number(limit) - 1);
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Error fetching prescriptions:', error);
      return res.status(500).json({
        success: false,
        message: 'প্রেসক্রিপশন লোড করতে সমস্যা হয়েছে',
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
    console.error('Error in get prescriptions by user:', error);
    res.status(500).json({
      success: false,
      message: 'সার্ভার এরর',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get prescription by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'প্রেসক্রিপশন পাওয়া যায়নি'
        });
      }
      
      console.error('Error fetching prescription:', error);
      return res.status(500).json({
        success: false,
        message: 'প্রেসক্রিপশন লোড করতে সমস্যা হয়েছে',
        error: error.message
      });
    }
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error in get prescription by ID:', error);
    res.status(500).json({
      success: false,
      message: 'সার্ভার এরর',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create new prescription
router.post('/', async (req, res) => {
  try {
    const validatedData = createPrescriptionSchema.parse(req.body);
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
    
    const prescriptionData = {
      ...validatedData,
      user_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('prescriptions')
      .insert([prescriptionData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating prescription:', error);
      return res.status(500).json({
        success: false,
        message: 'প্রেসক্রিপশন তৈরি করতে সমস্যা হয়েছে',
        error: error.message
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'প্রেসক্রিপশন সফলভাবে তৈরি হয়েছে',
      data
    });
  } catch (error) {
    console.error('Error in create prescription:', error);
    
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

// Update prescription
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updatePrescriptionSchema.parse(req.body);
    
    // Check if prescription exists
    const { data: existingPrescription, error: fetchError } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'প্রেসক্রিপশন পাওয়া যায়নি'
        });
      }
      
      console.error('Error fetching prescription for update:', fetchError);
      return res.status(500).json({
        success: false,
        message: 'প্রেসক্রিপশন আপডেট করতে সমস্যা হয়েছে',
        error: fetchError.message
      });
    }
    
    const updateData = {
      ...validatedData,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('prescriptions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating prescription:', error);
      return res.status(500).json({
        success: false,
        message: 'প্রেসক্রিপশন আপডেট করতে সমস্যা হয়েছে',
        error: error.message
      });
    }
    
    res.json({
      success: true,
      message: 'প্রেসক্রিপশন সফলভাবে আপডেট হয়েছে',
      data
    });
  } catch (error) {
    console.error('Error in update prescription:', error);
    
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

// Delete prescription
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if prescription exists
    const { data: existingPrescription, error: fetchError } = await supabase
      .from('prescriptions')
      .select('id')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'প্রেসক্রিপশন পাওয়া যায়নি'
        });
      }
      
      console.error('Error fetching prescription for deletion:', fetchError);
      return res.status(500).json({
        success: false,
        message: 'প্রেসক্রিপশন মুছতে সমস্যা হয়েছে',
        error: fetchError.message
      });
    }
    
    const { error } = await supabase
      .from('prescriptions')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting prescription:', error);
      return res.status(500).json({
        success: false,
        message: 'প্রেসক্রিপশন মুছতে সমস্যা হয়েছে',
        error: error.message
      });
    }
    
    res.json({
      success: true,
      message: 'প্রেসক্রিপশন সফলভাবে মুছে ফেলা হয়েছে'
    });
  } catch (error) {
    console.error('Error in delete prescription:', error);
    res.status(500).json({
      success: false,
      message: 'সার্ভার এরর',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get recent prescriptions
router.get('/user/:userId/recent', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 5 } = req.query;
    
    const { data, error } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('user_id', userId)
      .order('prescription_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(Number(limit));
    
    if (error) {
      console.error('Error fetching recent prescriptions:', error);
      return res.status(500).json({
        success: false,
        message: 'সাম্প্রতিক প্রেসক্রিপশন লোড করতে সমস্যা হয়েছে',
        error: error.message
      });
    }
    
    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Error in get recent prescriptions:', error);
    res.status(500).json({
      success: false,
      message: 'সার্ভার এরর',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get prescription statistics
router.get('/user/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get total prescriptions
    const { count: totalPrescriptions, error: totalError } = await supabase
      .from('prescriptions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (totalError) {
      console.error('Error fetching total prescriptions:', totalError);
      return res.status(500).json({
        success: false,
        message: 'পরিসংখ্যান লোড করতে সমস্যা হয়েছে',
        error: totalError.message
      });
    }
    
    // Get prescriptions from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { count: recentCount, error: recentError } = await supabase
      .from('prescriptions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('prescription_date', thirtyDaysAgo.toISOString().split('T')[0]);
    
    if (recentError) {
      console.error('Error fetching recent prescriptions count:', recentError);
      return res.status(500).json({
        success: false,
        message: 'পরিসংখ্যান লোড করতে সমস্যা হয়েছে',
        error: recentError.message
      });
    }
    
    // Get unique doctors count
    const { data: doctorsData, error: doctorsError } = await supabase
      .from('prescriptions')
      .select('doctor_name')
      .eq('user_id', userId);
    
    if (doctorsError) {
      console.error('Error fetching doctors data:', doctorsError);
      return res.status(500).json({
        success: false,
        message: 'পরিসংখ্যান লোড করতে সমস্যা হয়েছে',
        error: doctorsError.message
      });
    }
    
    const uniqueDoctors = new Set((doctorsData || []).map(p => p.doctor_name)).size;
    
    // Get prescriptions with follow-up dates
    const today = new Date().toISOString().split('T')[0];
    const { count: followUpCount, error: followUpError } = await supabase
      .from('prescriptions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .not('follow_up_date', 'is', null)
      .gte('follow_up_date', today);
    
    if (followUpError) {
      console.error('Error fetching follow-up prescriptions count:', followUpError);
      return res.status(500).json({
        success: false,
        message: 'পরিসংখ্যান লোড করতে সমস্যা হয়েছে',
        error: followUpError.message
      });
    }
    
    res.json({
      success: true,
      data: {
        total: totalPrescriptions || 0,
        recent: recentCount || 0,
        uniqueDoctors,
        upcomingFollowUps: followUpCount || 0
      }
    });
  } catch (error) {
    console.error('Error in get prescription stats:', error);
    res.status(500).json({
      success: false,
      message: 'সার্ভার এরর',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get prescriptions by doctor
router.get('/user/:userId/doctor/:doctorName', async (req, res) => {
  try {
    const { userId, doctorName } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const offset = (Number(page) - 1) * Number(limit);
    
    const { data, error, count } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('user_id', userId)
      .ilike('doctor_name', `%${doctorName}%`)
      .order('prescription_date', { ascending: false })
      .range(offset, offset + Number(limit) - 1);
    
    if (error) {
      console.error('Error fetching prescriptions by doctor:', error);
      return res.status(500).json({
        success: false,
        message: 'ডাক্তারের প্রেসক্রিপশন লোড করতে সমস্যা হয়েছে',
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
    console.error('Error in get prescriptions by doctor:', error);
    res.status(500).json({
      success: false,
      message: 'সার্ভার এরর',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get prescriptions by date range
router.get('/user/:userId/date-range', async (req, res) => {
  try {
    const { userId } = req.params;
    const { start_date, end_date, page = 1, limit = 10 } = req.query;
    
    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'শুরু এবং শেষের তারিখ প্রয়োজন'
      });
    }
    
    const offset = (Number(page) - 1) * Number(limit);
    
    const { data, error, count } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('user_id', userId)
      .gte('prescription_date', start_date)
      .lte('prescription_date', end_date)
      .order('prescription_date', { ascending: false })
      .range(offset, offset + Number(limit) - 1);
    
    if (error) {
      console.error('Error fetching prescriptions by date range:', error);
      return res.status(500).json({
        success: false,
        message: 'নির্দিষ্ট সময়ের প্রেসক্রিপশন লোড করতে সমস্যা হয়েছে',
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
    console.error('Error in get prescriptions by date range:', error);
    res.status(500).json({
      success: false,
      message: 'সার্ভার এরর',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;