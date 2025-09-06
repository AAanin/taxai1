import { Language } from '../types';

class DeepSeekService {
  private apiKey: string | null = null;
  private baseUrl = 'https://api.deepseek.com/v1';

  constructor() {
    // API key will be set from environment or user input
    const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
    if (apiKey) {
      this.initializeDeepSeek(apiKey);
    }
  }

  initializeDeepSeek(apiKey: string) {
    try {
      this.apiKey = apiKey;
      console.log('DeepSeek API initialized successfully');
    } catch (error) {
      console.error('Failed to initialize DeepSeek:', error);
      this.apiKey = null;
    }
  }

  isInitialized(): boolean {
    return this.apiKey !== null;
  }

  async generateResponse(prompt: string, language: Language = 'bn'): Promise<string> {
    if (!this.apiKey) {
      throw new Error('DeepSeek API key not initialized');
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt(language)
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'No response generated';
    } catch (error) {
      console.error('DeepSeek API call failed:', error);
      throw error;
    }
  }

  private getSystemPrompt(language: Language): string {
    const prompts = {
      bn: `আপনি একজন বিশেষজ্ঞ মেডিকেল AI সহায়ক "ডা. মিমু"। আপনার কাজ হল:

১. রোগীদের স্বাস্থ্য সমস্যা বুঝে সাহায্য করা
২. ওষুধের তথ্য ও পরামর্শ দেওয়া
৩. ডাক্তার অ্যাপয়েন্টমেন্ট বুকিং এ সহায়তা করা
৪. মেডিকেল রিপোর্ট বিশ্লেষণ করা
৫. স্বাস্থ্য টিপস ও পরামর্শ দেওয়া

আপনি সর্বদা বাংলায় উত্তর দেবেন এবং রোগীদের সাথে সহানুভূতিশীল ও পেশাদার আচরণ করবেন। জরুরি অবস্থায় দ্রুত ডাক্তারের কাছে যাওয়ার পরামর্শ দেবেন।`,
      en: `You are an expert medical AI assistant "Dr. Mimu". Your role is to:

1. Help patients understand their health problems
2. Provide medication information and advice
3. Assist with doctor appointment booking
4. Analyze medical reports
5. Give health tips and recommendations

Always respond in English and maintain an empathetic and professional demeanor with patients. Advise immediate medical attention for emergency situations.`
    };

    return prompts[language];
  }

  async getMedicalAdvice(symptoms: string, language: Language = 'bn'): Promise<string> {
    const prompt = language === 'bn' 
      ? `রোগীর লক্ষণ: ${symptoms}\n\nঅনুগ্রহ করে এই লক্ষণগুলির ভিত্তিতে প্রাথমিক পরামর্শ দিন এবং কোন ধরনের ডাক্তারের কাছে যেতে হবে তা বলুন।`
      : `Patient symptoms: ${symptoms}\n\nPlease provide initial advice based on these symptoms and suggest what type of doctor to consult.`;
    
    return this.generateResponse(prompt, language);
  }

  async getMedicineInfo(medicineName: string, language: Language = 'bn'): Promise<string> {
    const prompt = language === 'bn'
      ? `ওষুধের নাম: ${medicineName}\n\nএই ওষুধ সম্পর্কে বিস্তারিত তথ্য দিন - এর ব্যবহার, ডোজ, পার্শ্বপ্রতিক্রিয়া এবং সতর্কতা।`
      : `Medicine name: ${medicineName}\n\nProvide detailed information about this medicine - its uses, dosage, side effects, and precautions.`;
    
    return this.generateResponse(prompt, language);
  }

  async analyzeMedicalReport(reportData: string, language: Language = 'bn'): Promise<string> {
    const prompt = language === 'bn'
      ? `মেডিকেল রিপোর্ট: ${reportData}\n\nঅনুগ্রহ করে এই রিপোর্ট বিশ্লেষণ করে সহজ ভাষায় ব্যাখ্যা করুন এবং প্রয়োজনীয় পরামর্শ দিন।`
      : `Medical report: ${reportData}\n\nPlease analyze this report and explain it in simple terms with necessary recommendations.`;
    
    return this.generateResponse(prompt, language);
  }

  async generateMedicalResponse(prompt: string, language: Language): Promise<string> {
    if (!this.apiKey) {
      throw new Error('DeepSeek API key not initialized');
    }

    try {
      const systemPrompt = this.getSystemPrompt(language);
      const fullPrompt = `${systemPrompt}\n\nUser Query: ${prompt}`;
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'No response generated';
    } catch (error) {
      console.error('DeepSeek medical response error:', error);
      throw error;
    }
  }
}

const deepseekService = new DeepSeekService();
export default deepseekService;