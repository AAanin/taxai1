import { z } from 'zod';

// Common validation patterns
export const emailSchema = z.string()
  .email('সঠিক ইমেইল ঠিকানা দিন')
  .min(1, 'ইমেইল প্রয়োজন');

export const passwordSchema = z.string()
  .min(8, 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'পাসওয়ার্ডে কমপক্ষে একটি ছোট হাতের অক্ষর, একটি বড় হাতের অক্ষর এবং একটি সংখ্যা থাকতে হবে');

export const phoneSchema = z.string()
  .regex(/^(\+88)?01[3-9]\d{8}$/, 'সঠিক বাংলাদেশী মোবাইল নম্বর দিন (যেমন: 01712345678)');

export const nameSchema = z.string()
  .min(2, 'নাম কমপক্ষে ২ অক্ষরের হতে হবে')
  .max(50, 'নাম সর্বোচ্চ ৫০ অক্ষরের হতে পারে')
  .regex(/^[a-zA-Zা-হ\s]+$/, 'নামে শুধুমাত্র অক্ষর এবং স্পেস থাকতে পারে');

export const dateSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'সঠিক তারিখ ফরম্যাট ব্যবহার করুন (YYYY-MM-DD)');

export const timeSchema = z.string()
  .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'সঠিক সময় ফরম্যাট ব্যবহার করুন (HH:MM)');

// User validation schemas
export const registerSchema = z.object({
  full_name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  phone: phoneSchema.optional(),
  date_of_birth: dateSchema.optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  terms: z.boolean().refine(val => val === true, {
    message: 'শর্তাবলী গ্রহণ করতে হবে'
  })
}).refine(data => data.password === data.confirmPassword, {
  message: 'পাসওয়ার্ড মিলছে না',
  path: ['confirmPassword']
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'পাসওয়ার্ড প্রয়োজন')
});

export const profileUpdateSchema = z.object({
  full_name: nameSchema,
  phone: phoneSchema.optional(),
  date_of_birth: dateSchema.optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  address: z.string().max(200, 'ঠিকানা সর্বোচ্চ ২০০ অক্ষরের হতে পারে').optional(),
  emergency_contact: phoneSchema.optional(),
  blood_group: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  allergies: z.string().max(500, 'অ্যালার্জির তথ্য সর্বোচ্চ ৫০০ অক্ষরের হতে পারে').optional(),
  medical_conditions: z.string().max(500, 'চিকিৎসা অবস্থার তথ্য সর্বোচ্চ ৫০০ অক্ষরের হতে পারে').optional()
});

// Medical record validation schemas
export const medicalRecordSchema = z.object({
  record_type: z.enum(['prescription', 'lab_report', 'imaging', 'consultation', 'surgery', 'vaccination', 'other'], {
    errorMap: () => ({ message: 'সঠিক রেকর্ড ধরন নির্বাচন করুন' })
  }),
  title: z.string().min(1, 'শিরোনাম প্রয়োজন').max(100, 'শিরোনাম সর্বোচ্চ ১০০ অক্ষরের হতে পারে'),
  description: z.string().max(1000, 'বর্ণনা সর্বোচ্চ ১০০০ অক্ষরের হতে পারে').optional(),
  doctor_name: nameSchema.optional(),
  hospital_name: z.string().max(100, 'হাসপাতালের নাম সর্বোচ্চ ১০০ অক্ষরের হতে পারে').optional(),
  date_recorded: dateSchema,
  tags: z.array(z.string()).optional()
});

// Appointment validation schemas
export const appointmentSchema = z.object({
  doctor_name: nameSchema,
  doctor_specialty: z.string().max(50, 'বিশেষত্ব সর্বোচ্চ ৫০ অক্ষরের হতে পারে').optional(),
  hospital_name: z.string().max(100, 'হাসপাতালের নাম সর্বোচ্চ ১০০ অক্ষরের হতে পারে').optional(),
  appointment_date: dateSchema,
  appointment_time: timeSchema,
  appointment_type: z.enum(['consultation', 'follow_up', 'emergency', 'routine_checkup']).optional(),
  symptoms: z.string().max(500, 'লক্ষণের বর্ণনা সর্বোচ্চ ৫০০ অক্ষরের হতে পারে').optional(),
  notes: z.string().max(500, 'নোট সর্বোচ্চ ৫০০ অক্ষরের হতে পারে').optional()
}).refine(data => {
  const appointmentDateTime = new Date(`${data.appointment_date}T${data.appointment_time}`);
  const now = new Date();
  return appointmentDateTime > now;
}, {
  message: 'অ্যাপয়েন্টমেন্টের সময় ভবিষ্যতে হতে হবে',
  path: ['appointment_date']
});

// Prescription validation schemas
export const medicineSchema = z.object({
  name: z.string().min(1, 'ওষুধের নাম প্রয়োজন').max(100, 'ওষুধের নাম সর্বোচ্চ ১০০ অক্ষরের হতে পারে'),
  dosage: z.string().min(1, 'ডোজ প্রয়োজন').max(50, 'ডোজ সর্বোচ্চ ৫০ অক্ষরের হতে পারে'),
  frequency: z.enum([
    'once_daily', 'twice_daily', 'three_times_daily', 'four_times_daily',
    'every_6_hours', 'every_8_hours', 'every_12_hours', 'as_needed',
    'before_meals', 'after_meals', 'with_meals', 'at_bedtime'
  ], {
    errorMap: () => ({ message: 'সঠিক সেবনের নিয়ম নির্বাচন করুন' })
  }),
  duration: z.enum([
    '3_days', '5_days', '7_days', '10_days', '14_days', '21_days',
    '1_month', '2_months', '3_months', '6_months', 'ongoing', 'as_directed'
  ], {
    errorMap: () => ({ message: 'সঠিক সেবনের মেয়াদ নির্বাচন করুন' })
  }),
  instructions: z.string().max(200, 'নির্দেশনা সর্বোচ্চ ২০০ অক্ষরের হতে পারে').optional()
});

export const prescriptionSchema = z.object({
  doctor_name: nameSchema,
  doctor_specialty: z.string().max(50, 'বিশেষত্ব সর্বোচ্চ ৫০ অক্ষরের হতে পারে').optional(),
  hospital_name: z.string().max(100, 'হাসপাতালের নাম সর্বোচ্চ ১০০ অক্ষরের হতে পারে').optional(),
  prescription_date: dateSchema,
  diagnosis: z.string().max(200, 'রোগ নির্ণয় সর্বোচ্চ ২০০ অক্ষরের হতে পারে').optional(),
  notes: z.string().max(500, 'নোট সর্বোচ্চ ৫০০ অক্ষরের হতে পারে').optional(),
  medicines: z.array(medicineSchema).min(1, 'কমপক্ষে একটি ওষুধ যোগ করুন'),
  follow_up_date: dateSchema.optional()
}).refine(data => {
  if (data.follow_up_date) {
    const followUpDate = new Date(data.follow_up_date);
    const prescriptionDate = new Date(data.prescription_date);
    return followUpDate >= prescriptionDate;
  }
  return true;
}, {
  message: 'ফলো-আপের তারিখ প্রেসক্রিপশনের তারিখের পরে হতে হবে',
  path: ['follow_up_date']
});

// File validation
export const fileSchema = z.object({
  file: z.instanceof(File, { message: 'ফাইল নির্বাচন করুন' })
}).refine(data => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  return allowedTypes.includes(data.file.type);
}, {
  message: 'শুধুমাত্র JPG, PNG এবং PDF ফাইল আপলোড করা যাবে',
  path: ['file']
}).refine(data => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  return data.file.size <= maxSize;
}, {
  message: 'ফাইলের আকার সর্বোচ্চ ৫ MB হতে পারে',
  path: ['file']
});

// Validation helper functions
export const validateEmail = (email: string): boolean => {
  try {
    emailSchema.parse(email);
    return true;
  } catch {
    return false;
  }
};

export const validatePhone = (phone: string): boolean => {
  try {
    phoneSchema.parse(phone);
    return true;
  } catch {
    return false;
  }
};

export const validateDate = (date: string): boolean => {
  try {
    dateSchema.parse(date);
    return true;
  } catch {
    return false;
  }
};

export const validateTime = (time: string): boolean => {
  try {
    timeSchema.parse(time);
    return true;
  } catch {
    return false;
  }
};

// Format validation errors for display
export const formatValidationErrors = (error: z.ZodError): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  error.errors.forEach(err => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });
  
  return errors;
};

// Sanitize input data
export const sanitizeString = (input: string): string => {
  return input.trim().replace(/[<>"'&]/g, '');
};

export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
  const sanitized = { ...obj };
  
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeString(sanitized[key]);
    }
  });
  
  return sanitized;
};

// Age calculation helper
export const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Date formatting helpers
export const formatDateForDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatTimeForDisplay = (timeString: string): string => {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

// Blood group validation
export const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
export type BloodGroup = typeof bloodGroups[number];

// Gender validation
export const genders = ['male', 'female', 'other'] as const;
export type Gender = typeof genders[number];

// Record type validation
export const recordTypes = [
  'prescription', 'lab_report', 'imaging', 'consultation', 
  'surgery', 'vaccination', 'other'
] as const;
export type RecordType = typeof recordTypes[number];

// Appointment type validation
export const appointmentTypes = [
  'consultation', 'follow_up', 'emergency', 'routine_checkup'
] as const;
export type AppointmentType = typeof appointmentTypes[number];

// Appointment status validation
export const appointmentStatuses = [
  'scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled'
] as const;
export type AppointmentStatus = typeof appointmentStatuses[number];

// Medicine frequency validation
export const medicineFrequencies = [
  'once_daily', 'twice_daily', 'three_times_daily', 'four_times_daily',
  'every_6_hours', 'every_8_hours', 'every_12_hours', 'as_needed',
  'before_meals', 'after_meals', 'with_meals', 'at_bedtime'
] as const;
export type MedicineFrequency = typeof medicineFrequencies[number];

// Medicine duration validation
export const medicineDurations = [
  '3_days', '5_days', '7_days', '10_days', '14_days', '21_days',
  '1_month', '2_months', '3_months', '6_months', 'ongoing', 'as_directed'
] as const;
export type MedicineDuration = typeof medicineDurations[number];