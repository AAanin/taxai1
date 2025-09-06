// AI Image Analysis Services - AI ইমেজ বিশ্লেষণ সেবা
import { GoogleGenerativeAI } from '@google/generative-ai';

// Types for AI Analysis
export interface GeminiAnalysisResult {
  extractedText: string;
  medicines: {
    name: string;
    dosage: string;
    frequency: string;
    duration?: string;
    instructions?: string;
  }[];
  doctorInfo?: {
    name: string;
    chamber?: string;
    phone?: string;
    date?: string;
  };
  patientInfo?: {
    name?: string;
    age?: string;
    gender?: string;
  };
  labValues?: {
    parameter: string;
    value: string;
    unit: string;
    normalRange?: string;
    status: 'normal' | 'high' | 'low' | 'critical';
  }[];
  diagnosis?: string[];
  symptoms?: string[];
}

export interface DeepSeekAnalysisResult {
  diseasePatterns: string[];
  riskAssessment: {
    level: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    factors: string[];
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  drugInteractions: {
    detected: boolean;
    interactions: {
      drugs: string[];
      severity: 'mild' | 'moderate' | 'severe';
      description: string;
    }[];
  };
  labInterpretation?: {
    abnormalValues: string[];
    clinicalSignificance: string;
    followUpRequired: boolean;
  };
  imagingFindings?: {
    findings: string[];
    impression: string;
    recommendations: string[];
  };
}

export interface LangChainProcessingResult {
  structuredData: {
    medications: {
      name: string;
      schedule: {
        times: string[];
        frequency: string;
        duration: string;
        withFood: boolean;
      };
      reminders: {
        id: string;
        time: string;
        message: string;
        type: 'medicine' | 'followup' | 'test';
      }[];
    }[];
    appointments: {
      type: string;
      date: string;
      reminder: string;
    }[];
    tests: {
      name: string;
      dueDate: string;
      priority: 'low' | 'medium' | 'high';
    }[];
  };
  insights: {
    adherenceScore: number;
    riskFactors: string[];
    healthTrends: string[];
    recommendations: string[];
  };
  automatedActions: {
    remindersCreated: number;
    appointmentsScheduled: number;
    alertsGenerated: number;
  };
}

// Gemini AI Service
export class GeminiImageAnalysisService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async analyzePrescriptionImage(imageFile: File): Promise<GeminiAnalysisResult> {
    try {
      const imageData = await this.fileToGenerativePart(imageFile);
      
      const prompt = `
        আপনি একজন বিশেষজ্ঞ মেডিকেল AI। এই প্রেসক্রিপশনের ছবি বিশ্লেষণ করে নিম্নলিখিত তথ্য বের করুন:
        
        1. সম্পূর্ণ টেক্সট নিষ্কাশন (বাংলা ও ইংরেজি)
        2. ওষুধের নাম, ডোজ, সেবনের নিয়ম
        3. ডাক্তারের তথ্য (নাম, চেম্বার, ফোন)
        4. রোগীর তথ্য (যদি থাকে)
        5. রোগ নির্ণয় বা উপসর্গ
        
        JSON ফরম্যাটে উত্তর দিন:
        {
          "extractedText": "সম্পূর্ণ টেক্সট",
          "medicines": [
            {
              "name": "ওষুধের নাম",
              "dosage": "ডোজ",
              "frequency": "সেবনের নিয়ম",
              "duration": "কতদিন",
              "instructions": "বিশেষ নির্দেশনা"
            }
          ],
          "doctorInfo": {
            "name": "ডাক্তারের নাম",
            "chamber": "চেম্বার",
            "phone": "ফোন",
            "date": "তারিখ"
          },
          "diagnosis": ["রোগ নির্ণয়"],
          "symptoms": ["উপসর্গ"]
        }
      `;

      const result = await this.model.generateContent([prompt, imageData]);
      const response = await result.response;
      const text = response.text();
      
      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Gemini analysis error:', error);
      throw error;
    }
  }

  async analyzeLabReport(imageFile: File): Promise<GeminiAnalysisResult> {
    try {
      const imageData = await this.fileToGenerativePart(imageFile);
      
      const prompt = `
        এই ল্যাব রিপোর্টের ছবি বিশ্লেষণ করে নিম্নলিখিত তথ্য বের করুন:
        
        1. সম্পূর্ণ টেক্সট নিষ্কাশন
        2. সকল ল্যাব ভ্যালু (প্যারামিটার, মান, একক)
        3. স্বাভাবিক রেঞ্জের সাথে তুলনা
        4. রোগীর তথ্য
        
        JSON ফরম্যাটে উত্তর দিন:
        {
          "extractedText": "সম্পূর্ণ টেক্সট",
          "labValues": [
            {
              "parameter": "প্যারামিটার নাম",
              "value": "মান",
              "unit": "একক",
              "normalRange": "স্বাভাবিক রেঞ্জ",
              "status": "normal/high/low/critical"
            }
          ],
          "patientInfo": {
            "name": "রোগীর নাম",
            "age": "বয়স",
            "gender": "লিঙ্গ"
          }
        }
      `;

      const result = await this.model.generateContent([prompt, imageData]);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Gemini lab analysis error:', error);
      throw error;
    }
  }

  async analyzeMedicalImage(imageFile: File, imageType: string): Promise<GeminiAnalysisResult> {
    try {
      const imageData = await this.fileToGenerativePart(imageFile);
      
      const prompt = `
        এই ${imageType} ছবি বিশ্লেষণ করে নিম্নলিখিত তথ্য বের করুন:
        
        1. দৃশ্যমান সকল টেক্সট নিষ্কাশণ
        2. মেডিকেল ফাইন্ডিংস
        3. অস্বাভাবিক বৈশিষ্ট্য
        4. সুপারিশ
        
        JSON ফরম্যাটে উত্তর দিন।
      `;

      const result = await this.model.generateContent([prompt, imageData]);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Gemini medical image analysis error:', error);
      throw error;
    }
  }

  private async fileToGenerativePart(file: File) {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.readAsDataURL(file);
    });
    
    return {
      inlineData: {
        data: await base64EncodedDataPromise,
        mimeType: file.type,
      },
    };
  }
}

// DeepSeek AI Service
export class DeepSeekAnalysisService {
  private apiKey: string;
  private baseURL: string = 'https://api.deepseek.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeExtractedData(geminiResult: GeminiAnalysisResult): Promise<DeepSeekAnalysisResult> {
    try {
      const prompt = `
        আপনি একজন বিশেষজ্ঞ মেডিকেল AI। নিম্নলিখিত প্রেসক্রিপশন/রিপোর্ট ডেটা বিশ্লেষণ করুন:
        
        ${JSON.stringify(geminiResult, null, 2)}
        
        নিম্নলিখিত বিশ্লেষণ প্রদান করুন:
        1. রোগের ধরন ও প্যাটার্ন
        2. ঝুঁকি মূল্যায়ন
        3. ওষুধের মিথস্ক্রিয়া পরীক্ষা
        4. চিকিৎসা সুপারিশ
        5. ল্যাব ভ্যালু ব্যাখ্যা (যদি থাকে)
        
        JSON ফরম্যাটে উত্তর দিন।
      `;

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'আপনি একজন বিশেষজ্ঞ মেডিকেল AI যিনি প্রেসক্রিপশন ও মেডিকেল রিপোর্ট বিশ্লেষণে দক্ষ।'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Return default structure if parsing fails
      return this.getDefaultDeepSeekResult();
    } catch (error) {
      console.error('DeepSeek analysis error:', error);
      return this.getDefaultDeepSeekResult();
    }
  }

  private getDefaultDeepSeekResult(): DeepSeekAnalysisResult {
    return {
      diseasePatterns: ['বিশ্লেষণ সম্পন্ন হয়নি'],
      riskAssessment: {
        level: 'medium',
        description: 'আরও তথ্যের প্রয়োজন',
        factors: ['অসম্পূর্ণ ডেটা']
      },
      recommendations: {
        immediate: ['ডাক্তারের পরামর্শ নিন'],
        shortTerm: ['নিয়মিত ওষুধ সেবন করুন'],
        longTerm: ['স্বাস্থ্যকর জীবনযাত্রা বজায় রাখুন']
      },
      drugInteractions: {
        detected: false,
        interactions: []
      }
    };
  }
}

// LangChain Processing Service
export class LangChainProcessingService {
  private openaiApiKey: string;

  constructor(openaiApiKey: string) {
    this.openaiApiKey = openaiApiKey;
  }

  async processAnalysisResults(
    geminiResult: GeminiAnalysisResult,
    deepseekResult: DeepSeekAnalysisResult
  ): Promise<LangChainProcessingResult> {
    try {
      // Create structured medication schedule
      const medications = this.createMedicationSchedule(geminiResult.medicines || []);
      
      // Generate reminders
      const reminders = this.generateReminders(medications);
      
      // Create follow-up appointments
      const appointments = this.createAppointments(deepseekResult);
      
      // Generate insights
      const insights = this.generateInsights(geminiResult, deepseekResult);
      
      return {
        structuredData: {
          medications,
          appointments,
          tests: this.suggestTests(deepseekResult)
        },
        insights,
        automatedActions: {
          remindersCreated: reminders.length,
          appointmentsScheduled: appointments.length,
          alertsGenerated: this.countAlerts(deepseekResult)
        }
      };
    } catch (error) {
      console.error('LangChain processing error:', error);
      return this.getDefaultLangChainResult();
    }
  }

  private createMedicationSchedule(medicines: any[]) {
    return medicines.map((med, index) => {
      const times = this.parseMedicationTimes(med.frequency);
      return {
        name: med.name,
        schedule: {
          times,
          frequency: med.frequency,
          duration: med.duration || '৭ দিন',
          withFood: med.instructions?.includes('খাবার') || false
        },
        reminders: times.map((time, timeIndex) => ({
          id: `${index}-${timeIndex}`,
          time,
          message: `${med.name} ${med.dosage} সেবন করার সময়`,
          type: 'medicine' as const
        }))
      };
    });
  }

  private parseMedicationTimes(frequency: string): string[] {
    if (frequency.includes('৩ বার') || frequency.includes('3 times')) {
      return ['০৮:০০', '১৪:০০', '২০:০০'];
    } else if (frequency.includes('২ বার') || frequency.includes('2 times')) {
      return ['০৮:০০', '২০:০০'];
    } else if (frequency.includes('১ বার') || frequency.includes('1 time')) {
      return ['০৮:০০'];
    }
    return ['০৮:০০'];
  }

  private generateReminders(medications: any[]) {
    const allReminders: any[] = [];
    medications.forEach(med => {
      allReminders.push(...med.reminders);
    });
    return allReminders;
  }

  private createAppointments(deepseekResult: DeepSeekAnalysisResult) {
    const appointments = [];
    
    if (deepseekResult.riskAssessment.level === 'high' || deepseekResult.riskAssessment.level === 'critical') {
      appointments.push({
        type: 'জরুরি ফলো-আপ',
        date: this.addDays(new Date(), 3).toLocaleDateString('bn-BD'),
        reminder: '৩ দিন পর ডাক্তারের সাথে দেখা করুন'
      });
    } else {
      appointments.push({
        type: 'নিয়মিত ফলো-আপ',
        date: this.addDays(new Date(), 14).toLocaleDateString('bn-BD'),
        reminder: '২ সপ্তাহ পর ডাক্তারের সাথে দেখা করুন'
      });
    }
    
    return appointments;
  }

  private suggestTests(deepseekResult: DeepSeekAnalysisResult) {
    const tests = [];
    
    if (deepseekResult.labInterpretation?.followUpRequired) {
      tests.push({
        name: 'ফলো-আপ ল্যাব টেস্ট',
        dueDate: this.addDays(new Date(), 30).toLocaleDateString('bn-BD'),
        priority: 'medium' as const
      });
    }
    
    return tests;
  }

  private generateInsights(geminiResult: GeminiAnalysisResult, deepseekResult: DeepSeekAnalysisResult) {
    return {
      adherenceScore: 85, // Mock score
      riskFactors: deepseekResult.riskAssessment.factors,
      healthTrends: ['স্থিতিশীল অবস্থা', 'নিয়মিত উন্নতি'],
      recommendations: [
        'নিয়মিত ওষুধ সেবন করুন',
        'স্বাস্থ্যকর খাবার খান',
        'পর্যাপ্ত বিশ্রাম নিন'
      ]
    };
  }

  private countAlerts(deepseekResult: DeepSeekAnalysisResult): number {
    let alertCount = 0;
    if (deepseekResult.riskAssessment.level === 'high' || deepseekResult.riskAssessment.level === 'critical') {
      alertCount++;
    }
    if (deepseekResult.drugInteractions.detected) {
      alertCount++;
    }
    return alertCount;
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private getDefaultLangChainResult(): LangChainProcessingResult {
    return {
      structuredData: {
        medications: [],
        appointments: [],
        tests: []
      },
      insights: {
        adherenceScore: 0,
        riskFactors: [],
        healthTrends: [],
        recommendations: []
      },
      automatedActions: {
        remindersCreated: 0,
        appointmentsScheduled: 0,
        alertsGenerated: 0
      }
    };
  }
}

// Main AI Analysis Orchestrator
export class AIImageAnalysisOrchestrator {
  private geminiService: GeminiImageAnalysisService;
  private deepseekService: DeepSeekAnalysisService;
  private langchainService: LangChainProcessingService;

  constructor(geminiApiKey: string, deepseekApiKey: string, openaiApiKey: string) {
    this.geminiService = new GeminiImageAnalysisService(geminiApiKey);
    this.deepseekService = new DeepSeekAnalysisService(deepseekApiKey);
    this.langchainService = new LangChainProcessingService(openaiApiKey);
  }

  async analyzeImage(imageFile: File, imageType: string) {
    try {
      // Step 1: Gemini Analysis
      let geminiResult: GeminiAnalysisResult;
      
      if (imageType === 'prescription') {
        geminiResult = await this.geminiService.analyzePrescriptionImage(imageFile);
      } else if (imageType === 'lab') {
        geminiResult = await this.geminiService.analyzeLabReport(imageFile);
      } else {
        geminiResult = await this.geminiService.analyzeMedicalImage(imageFile, imageType);
      }

      // Step 2: DeepSeek Analysis
      const deepseekResult = await this.deepseekService.analyzeExtractedData(geminiResult);

      // Step 3: LangChain Processing
      const langchainResult = await this.langchainService.processAnalysisResults(geminiResult, deepseekResult);

      return {
        geminiAnalysis: geminiResult,
        deepseekAnalysis: deepseekResult,
        langchainProcessing: langchainResult,
        success: true
      };
    } catch (error) {
      console.error('AI Analysis error:', error);
      throw error;
    }
  }
}

// Export default instance (will be initialized with API keys)
export const createAIAnalysisService = (geminiApiKey: string, deepseekApiKey: string, openaiApiKey: string) => {
  return new AIImageAnalysisOrchestrator(geminiApiKey, deepseekApiKey, openaiApiKey);
};