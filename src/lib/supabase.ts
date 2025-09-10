import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please check your environment variables.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Database types (will be generated from Supabase)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone?: string;
          date_of_birth?: string;
          gender?: string;
          address?: string;
          emergency_contact?: string;
          blood_group?: string;
          allergies?: string;
          medical_conditions?: string;
          avatar_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name: string;
          phone?: string;
          date_of_birth?: string;
          gender?: string;
          address?: string;
          emergency_contact?: string;
          blood_group?: string;
          allergies?: string;
          medical_conditions?: string;
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          phone?: string;
          date_of_birth?: string;
          gender?: string;
          address?: string;
          emergency_contact?: string;
          blood_group?: string;
          allergies?: string;
          medical_conditions?: string;
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      medical_records: {
        Row: {
          id: string;
          user_id: string;
          record_type: string;
          title: string;
          description?: string;
          file_url?: string;
          doctor_name?: string;
          hospital_name?: string;
          date_recorded: string;
          tags?: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          record_type: string;
          title: string;
          description?: string;
          file_url?: string;
          doctor_name?: string;
          hospital_name?: string;
          date_recorded: string;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          record_type?: string;
          title?: string;
          description?: string;
          file_url?: string;
          doctor_name?: string;
          hospital_name?: string;
          date_recorded?: string;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          user_id: string;
          doctor_name: string;
          doctor_specialty?: string;
          hospital_name?: string;
          appointment_date: string;
          appointment_time: string;
          appointment_type?: string;
          status: string;
          symptoms?: string;
          notes?: string;
          reminder_sent: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          doctor_name: string;
          doctor_specialty?: string;
          hospital_name?: string;
          appointment_date: string;
          appointment_time: string;
          appointment_type?: string;
          status?: string;
          symptoms?: string;
          notes?: string;
          reminder_sent?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          doctor_name?: string;
          doctor_specialty?: string;
          hospital_name?: string;
          appointment_date?: string;
          appointment_time?: string;
          appointment_type?: string;
          status?: string;
          symptoms?: string;
          notes?: string;
          reminder_sent?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      prescriptions: {
        Row: {
          id: string;
          user_id: string;
          doctor_name: string;
          doctor_specialty?: string;
          hospital_name?: string;
          prescription_date: string;
          diagnosis?: string;
          notes?: string;
          medicines: any; // JSON array
          follow_up_date?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          doctor_name: string;
          doctor_specialty?: string;
          hospital_name?: string;
          prescription_date: string;
          diagnosis?: string;
          notes?: string;
          medicines: any; // JSON array
          follow_up_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          doctor_name?: string;
          doctor_specialty?: string;
          hospital_name?: string;
          prescription_date?: string;
          diagnosis?: string;
          notes?: string;
          medicines?: any; // JSON array
          follow_up_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Helper functions
export const getUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  return user;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) {
    console.error('Error signing in:', error);
    throw error;
  }
  
  return data;
};

export const signUpWithEmail = async (email: string, password: string, userData: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  });
  
  if (error) {
    console.error('Error signing up:', error);
    throw error;
  }
  
  return data;
};

export default supabase;