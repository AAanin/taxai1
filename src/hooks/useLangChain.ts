import { useState, useCallback } from 'react';
import langchainService from '../services/langchainService';
import { Language } from '../types';

interface LangChainOptions {
  chainType?: 'medical_diagnosis' | 'conversation' | 'analysis';
  temperature?: number;
  maxTokens?: number;
  language?: Language;
}

interface LangChainResult {
  response: string;
  success: boolean;
  error?: string;
}

export const useLangChain = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processWithChain = useCallback(async (
    prompt: string,
    options: LangChainOptions = {}
  ): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      const {
        chainType = 'conversation',
        temperature = 0.7,
        maxTokens = 1000,
        language = 'bn'
      } = options;

      let result: string;

      switch (chainType) {
        case 'medical_diagnosis':
          // Use specialized medical diagnosis chain
          result = await langchainService.generateMedicalResponse(prompt, language);
          break;
        
        case 'analysis':
          // Use analysis chain for symptom analysis
          try {
            const analysisResult = await langchainService.analyzeSymptoms(prompt, language);
            result = typeof analysisResult === 'string' ? analysisResult : JSON.stringify(analysisResult);
          } catch (analysisError) {
            // Fallback to regular medical response
            result = await langchainService.generateMedicalResponse(prompt, language);
          }
          break;
        
        case 'conversation':
        default:
          // Use conversation chain
          result = await langchainService.generateMedicalResponse(prompt, language);
          break;
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('LangChain processing error:', err);
      
      // Enhanced error handling with user-friendly messages
      if (errorMessage.includes('API key') || errorMessage.includes('401')) {
        return language === 'bn' 
          ? 'AI সেবা সাময়িকভাবে অনুপলব্ধ। অনুগ্রহ করে পরে আবার চেষ্টা করুন অথবা সরাসরি ডাক্তারের পরামর্শ নিন।'
          : 'AI service is temporarily unavailable. Please try again later or consult a doctor directly.';
      }
      
      if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
        return language === 'bn' 
          ? 'AI সেবার ব্যবহার সীমা অতিক্রম হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন। জরুরি প্রয়োজনে ডাক্তারের সাথে যোগাযোগ করুন।'
          : 'AI service usage limit exceeded. Please try again in a few minutes. For urgent needs, contact a doctor.';
      }
      
      if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
        return language === 'bn' 
          ? 'ইন্টারনেট সংযোগে সমস্যা হচ্ছে। আপনার নেটওয়ার্ক চেক করে আবার চেষ্টা করুন।'
          : 'Internet connection issue. Please check your network and try again.';
      }
      
      // Generic fallback with helpful guidance
      return language === 'bn' 
        ? 'AI বিশ্লেষণ সেবা এখন উপলব্ধ নেই। সাধারণ পরামর্শ: পর্যাপ্ত পানি পান করুন, সুষম খাবার খান। কোনো গুরুতর লক্ষণ থাকলে অবিলম্বে ডাক্তারের পরামর্শ নিন। জরুরি সেবার জন্য: ৯৯৯'
        : 'AI analysis service is currently unavailable. General advice: drink plenty of water, eat balanced meals. For any serious symptoms, consult a doctor immediately. Emergency: 999';
    } finally {
      setIsLoading(false);
    }
  }, []);

  const analyzeMedicalData = useCallback(async (
    data: any,
    analysisType: 'symptoms' | 'medication' | 'reports' = 'symptoms',
    language: Language = 'bn'
  ): Promise<any> => {
    setIsLoading(true);
    setError(null);

    try {
      let result;
      
      switch (analysisType) {
        case 'symptoms':
          result = await langchainService.analyzeSymptoms(JSON.stringify(data), language);
          break;
        
        case 'medication':
          result = await langchainService.analyzeMedication(JSON.stringify(data), language);
          break;
        
        case 'reports':
          // For medical reports, use general medical response
          const reportPrompt = language === 'bn'
            ? `নিম্নলিখিত মেডিকেল রিপোর্ট বিশ্লেষণ করুন: ${JSON.stringify(data)}`
            : `Analyze the following medical report: ${JSON.stringify(data)}`;
          result = await langchainService.generateMedicalResponse(reportPrompt, language);
          break;
        
        default:
          throw new Error('Invalid analysis type');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
      console.error('Medical data analysis error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getDoctorRecommendations = useCallback(async (
    symptoms: string,
    language: Language = 'bn'
  ): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await langchainService.getDoctorRecommendations(symptoms);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Doctor recommendation failed';
      setError(errorMessage);
      console.error('Doctor recommendation error:', err);
      
      // Return fallback recommendations
      return language === 'bn'
        ? 'সাধারণ চিকিৎসা, কার্ডিওলজি, গ্যাস্ট্রোএন্টারোলজি'
        : 'General Medicine, Cardiology, Gastroenterology';
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    processWithChain,
    analyzeMedicalData,
    getDoctorRecommendations,
    isLoading,
    error,
    clearError
  };
};

export default useLangChain;