import OpenAI from 'openai';
import { Language } from '../types';

class OpenAIService {
  private openai: OpenAI | null = null;

  constructor() {
    // API key will be set from environment or user input
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (apiKey && this.isValidApiKey(apiKey)) {
      this.initializeOpenAI(apiKey);
    }
  }

  private isValidApiKey(apiKey: string): boolean {
    return apiKey && 
           apiKey.trim() !== '' && 
           apiKey !== 'your-openai-api-key-here' && 
           !apiKey.startsWith('sk-xxx') &&
           apiKey.startsWith('sk-');
  }

  initializeOpenAI(apiKey: string) {
    try {
      if (!this.isValidApiKey(apiKey)) {
        console.warn('Invalid OpenAI API key provided');
        return;
      }
      
      this.openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // Note: In production, use a backend proxy
      });
      console.log('✅ OpenAI initialized successfully');
    } catch (error) {
      console.error('Failed to initialize OpenAI:', error);
    }
  }

  async generateMedicalResponse(prompt: string, language: Language): Promise<string> {
    if (!this.openai) {
      const errorMsg = language === 'bn' 
        ? 'OpenAI সেবা উপলব্ধ নেই। অনুগ্রহ করে API কী কনফিগার করুন।'
        : 'OpenAI service not available. Please configure API key.';
      throw new Error(errorMsg);
    }

    try {
      const systemPrompt = this.getMedicalSystemPrompt(language);
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
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
        max_tokens: 1000,
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content || 'No response generated';
    } catch (error: any) {
      console.error('OpenAI API error:', error);
      
      // Handle specific API errors
      if (error.message?.includes('API key')) {
        const errorMsg = language === 'bn'
          ? 'OpenAI API কী সমস্যা। অনুগ্রহ করে সঠিক API কী প্রদান করুন।'
          : 'OpenAI API key issue. Please provide a valid API key.';
        throw new Error(errorMsg);
      }
      
      if (error.status === 401) {
        const errorMsg = language === 'bn'
          ? 'OpenAI API কী অবৈধ বা মেয়াদ উত্তীর্ণ।'
          : 'OpenAI API key is invalid or expired.';
        throw new Error(errorMsg);
      }
      
      if (error.status === 429) {
        const errorMsg = language === 'bn'
          ? 'OpenAI সেবার ব্যবহার সীমা অতিক্রম হয়েছে। কিছুক্ষণ পর চেষ্টা করুন।'
          : 'OpenAI service rate limit exceeded. Please try again later.';
        throw new Error(errorMsg);
      }
      
      const errorMsg = language === 'bn'
        ? 'OpenAI থেকে উত্তর পেতে ব্যর্থ হয়েছে।'
        : 'Failed to get response from OpenAI.';
      throw new Error(errorMsg);
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
- উত্তর সংক্ষিপ্ত এবং বোধগম্য রাখুন
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
- Never provide definitive diagnosis, only suggest possible causes and advice
- Keep responses concise and understandable`;
    }
  }

  isInitialized(): boolean {
    return this.openai !== null;
  }
}

export default new OpenAIService();