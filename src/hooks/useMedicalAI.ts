import { useState, useCallback, useEffect } from 'react';
import medicalAIService from '../services/medicalAIService';
import { Language } from '../types';
import { MedicationSchedule } from '../utils/medicineTracker';

export const useMedicalAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load API keys from admin panel on initialization
  useEffect(() => {
    const loadAdminApiKeys = () => {
      try {
        const adminApiKeys = localStorage.getItem('adminApiKeys');
        if (adminApiKeys) {
          const keys = JSON.parse(adminApiKeys);
          medicalAIService.setApiKeys(keys.gemini, keys.openai, keys.deepseek);
        }
      } catch (error) {
        console.error('Error loading admin API keys:', error);
      }
    };

    loadAdminApiKeys();
    
    // Listen for storage changes to update API keys when admin changes them
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'adminApiKeys') {
        loadAdminApiKeys();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const sendMessage = useCallback(async (
    message: string, 
    language: Language, 
    userId?: string
  ): Promise<{ response: string; medicationReminder?: MedicationSchedule }> => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if any API keys are available - if not, show admin message
      if (!medicalAIService.hasAnyApiKey()) {
        const errorMsg = language === 'bn' 
          ? 'দুঃখিত, AI সেবা ব্যবহার করতে অ্যাডমিন প্যানেল থেকে API কী কনফিগার করা প্রয়োজন। অনুগ্রহ করে অ্যাডমিনের সাথে যোগাযোগ করুন।'
          : 'Sorry, API keys need to be configured from the admin panel to use AI services. Please contact the administrator.';
        return { response: errorMsg };
      }

      const result = await medicalAIService.getCombinedMedicalResponse(message, language, userId);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      
      const fallbackMsg = language === 'bn' 
        ? 'দুঃখিত, একটি ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
        : 'Sorry, an error occurred. Please try again.';
      
      return { response: fallbackMsg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setApiKeys = useCallback((geminiKey?: string, openaiKey?: string, deepseekKey?: string) => {
    medicalAIService.setApiKeys(geminiKey, openaiKey, deepseekKey);
  }, []);

  const getAvailableProviders = useCallback(() => {
    return medicalAIService.getAvailableProviders();
  }, []);

  return {
    sendMessage,
    setApiKeys,
    getAvailableProviders,
    isLoading,
    error
  };
};