import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Types for Supabase tables
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          phone: string | null
          avatar: string | null
          date_of_birth: string | null
          gender: string | null
          address: string | null
          emergency_contact: string | null
          blood_group: string | null
          allergies: string | null
          chronic_conditions: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          phone?: string | null
          avatar?: string | null
          date_of_birth?: string | null
          gender?: string | null
          address?: string | null
          emergency_contact?: string | null
          blood_group?: string | null
          allergies?: string | null
          chronic_conditions?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          phone?: string | null
          avatar?: string | null
          date_of_birth?: string | null
          gender?: string | null
          address?: string | null
          emergency_contact?: string | null
          blood_group?: string | null
          allergies?: string | null
          chronic_conditions?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // Add other table types as needed
    }
  }
}