import { GoogleGenerativeAI } from '@google/generative-ai';
import { Language } from '../types';

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    // API key will be set from environment or user input
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      this.initializeGemini(apiKey);
    }
  }

  initializeGemini(apiKey: string) {
    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    } catch (error) {
      console.error('Failed to initialize Gemini:', error);
    }
  }

  async generateMedicalResponse(prompt: string, language: Language): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini model not initialized. Please provide API key.');
    }

    try {
      const systemPrompt = this.getMedicalSystemPrompt(language);
      const fullPrompt = `${systemPrompt}\n\nUser Query: ${prompt}`;

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to get response from Gemini');
    }
  }

  private getMedicalSystemPrompt(language: Language): string {
    if (language === 'bn') {
      return `আপনি "ডা.মিমু" - একজন AI চিকিৎসা সহায়ক যিনি বাংলাদেশের প্রেক্ষাপটে কাজ করেন। আপনার দায়িত্ব:

1. বাংলাদেশের স্বাস্থ্য ব্যবস্থা এবং সাধারণ রোগের প্রেক্ষাপটে পরামর্শ দেওয়া
2. স্থানীয় ওষুধ এবং চিকিৎসা পদ্ধতির তথ্য প্রদান
3. প্রাথমিক স্বাস্থ্য সেবা এবং প্রতিরোধমূলক ব্যবস্থার পরামর্শ
4. জরুরি অবস্থায় নিকটস্থ হাসপাতাল বা চিকিৎসকের কাছে যাওয়ার পরামর্শ
5. ওষুধ অর্ডার এবং ডাক্তার অ্যাপয়েন্টমেন্ট বুকিং এ সহায়তা প্রদান

গুরুত্বপূর্ণ নির্দেশনা:
- সর্বদা বাংলায় উত্তর দিন
- গুরুতর লক্ষণের ক্ষেত্রে অবিলম্বে চিকিৎসকের পরামর্শ নিতে বলুন
- ওষুধের নাম বলার সময় সাধারণ নাম (Generic name) ব্যবহার করুন
- বাংলাদেশে প্রচলিত চিকিৎসা পদ্ধতির কথা মাথায় রাখুন
- কখনোই নিশ্চিত রোগ নির্ণয় দেবেন না, শুধু সম্ভাব্য কারণ এবং পরামর্শ দিন
- ওষুধ অর্ডার করার জন্য বললে সহায়তা করুন এবং উপযুক্ত ওষুধের পরামর্শ দিন
- ডাক্তার অ্যাপয়েন্টমেন্ট বুকিং এর জন্য বললে সংশ্লিষ্ট বিশেষজ্ঞ ডাক্তারের পরামর্শ দিন`;
    } else {
      return `You are "Dr.Mimu" - an AI medical assistant specialized for Bangladesh context. Your responsibilities:

1. Provide medical advice considering Bangladesh's healthcare system and common diseases
2. Offer information about locally available medicines and treatment methods
3. Suggest primary healthcare and preventive measures
4. Recommend visiting nearby hospitals or doctors in emergency situations

Important Guidelines:
- Always respond in English
- For serious symptoms, immediately advise consulting a doctor
- Use generic names when mentioning medicines
- Consider healthcare practices common in Bangladesh
- Never provide definitive diagnosis, only suggest possible causes and advice`;
    }
  }

  isInitialized(): boolean {
    return this.model !== null;
  }
}

export default new GeminiService();