import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData?: any) => Promise<{ user: User | null; error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: any) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
      } else {
        setSession(session);
        setUser(session?.user ?? null);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle different auth events
        switch (event) {
          case 'SIGNED_IN':
            toast.success('সফলভাবে লগইন হয়েছে!');
            break;
          case 'SIGNED_OUT':
            toast.success('সফলভাবে লগআউট হয়েছে!');
            break;
          case 'PASSWORD_RECOVERY':
            toast.success('পাসওয়ার্ড রিসেট লিঙ্ক পাঠানো হয়েছে!');
            break;
          case 'USER_UPDATED':
            toast.success('প্রোফাইল আপডেট হয়েছে!');
            break;
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData || {}
        }
      });

      if (error) {
        toast.error(`রেজিস্ট্রেশন ব্যর্থ: ${error.message}`);
        return { user: null, error };
      }

      if (data.user && !data.user.email_confirmed_at) {
        toast.success('রেজিস্ট্রেশন সফল! আপনার ইমেইল যাচাই করুন।');
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      toast.error('রেজিস্ট্রেশনে সমস্যা হয়েছে');
      return { user: null, error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast.error(`লগইন ব্যর্থ: ${error.message}`);
        return { user: null, error };
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('লগইনে সমস্যা হয়েছে');
      return { user: null, error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(`লগআউট ব্যর্থ: ${error.message}`);
      }
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('লগআউটে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        toast.error(`পাসওয়ার্ড রিসেট ব্যর্থ: ${error.message}`);
        return { error };
      }

      toast.success('পাসওয়ার্ড রিসেট লিঙ্ক আপনার ইমেইলে পাঠানো হয়েছে');
      return { error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('পাসওয়ার্ড রিসেটে সমস্যা হয়েছে');
      return { error: error as AuthError };
    }
  };

  const updateProfile = async (updates: any) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser(updates);

      if (error) {
        toast.error(`প্রোফাইল আপডেট ব্যর্থ: ${error.message}`);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('প্রোফাইল আপডেটে সমস্যা হয়েছে');
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;