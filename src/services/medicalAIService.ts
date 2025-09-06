import geminiService from './geminiService';
import openaiService from './openaiService';
import deepseekService from './deepseekService';
import langchainService from './langchainService';
import { Language, CombinedAIResponse, AIProvider } from '../types';
import { extractMedicationInfo, generateMedicationSchedule, MedicationInfo, MedicationSchedule } from '../utils/medicineTracker';

class MedicalAIService {
  private geminiApiKey: string = '';
  private openaiApiKey: string = '';
  private deepseekApiKey: string = '';

  constructor() {
    // Auto-load API keys from environment variables and admin configuration
    this.loadEnvironmentApiKeys();
    this.loadAdminApiKeys();
  }

  private loadEnvironmentApiKeys() {
    try {
      // Load API keys from environment variables
      const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
      const geminiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY;
      const deepseekKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
      
      if (openaiKey || geminiKey || deepseekKey) {
        console.log('🔑 Loading API keys from environment variables...');
        this.setApiKeys(geminiKey, openaiKey, deepseekKey);
      }
    } catch (error) {
      console.error('Error loading environment API keys:', error);
    }
  }

  private loadAdminApiKeys() {
    try {
      const adminApiKeys = localStorage.getItem('adminApiKeys');
      if (adminApiKeys) {
        const keys = JSON.parse(adminApiKeys);
        // Admin keys override environment keys
        this.setApiKeys(keys.gemini, keys.openai, keys.deepseek || keys.anthropic);
      }
    } catch (error) {
      console.error('Error loading admin API keys:', error);
    }
  }

  // Method to refresh API keys from admin panel
  refreshAdminApiKeys() {
    this.loadAdminApiKeys();
  }

  setApiKeys(geminiKey?: string, openaiKey?: string, deepseekKey?: string) {
    let successCount = 0;
    const errors: string[] = [];

    if (geminiKey && geminiKey.trim()) {
      try {
        this.geminiApiKey = geminiKey.trim();
        geminiService.initializeGemini(this.geminiApiKey);
        langchainService.initializeGemini(this.geminiApiKey);
        console.log('✅ Gemini API key set successfully');
        successCount++;
      } catch (error) {
        console.error('❌ Failed to set Gemini API key:', error);
        errors.push('Gemini: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    }
    
    if (openaiKey && openaiKey.trim()) {
      try {
        this.openaiApiKey = openaiKey.trim();
        openaiService.initializeOpenAI(this.openaiApiKey);
        langchainService.initializeOpenAI(this.openaiApiKey);
        console.log('✅ OpenAI API key set successfully');
        successCount++;
      } catch (error) {
        console.error('❌ Failed to set OpenAI API key:', error);
        errors.push('OpenAI: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    }
    
    if (deepseekKey && deepseekKey.trim()) {
      try {
        this.deepseekApiKey = deepseekKey.trim();
        deepseekService.initializeDeepSeek(this.deepseekApiKey);
        console.log('✅ DeepSeek API key set successfully');
        successCount++;
      } catch (error) {
        console.error('❌ Failed to set DeepSeek API key:', error);
        errors.push('DeepSeek: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    }

    if (successCount === 0 && errors.length > 0) {
      console.warn('⚠️ No API keys were successfully initialized');
      console.warn('Errors:', errors);
    } else if (successCount > 0) {
      console.log(`✅ ${successCount} API provider(s) initialized successfully`);
    }
  }

  // LangChain integration temporarily disabled due to import issues
  // async getAdvancedMedicalResponse method commented out

  async getCombinedMedicalResponse(prompt: string, language: Language, userId?: string): Promise<{ response: string; medicationReminder?: MedicationSchedule }> {
    const responses: AIProvider[] = [];
    const errors: string[] = [];
    let medicationReminder: MedicationSchedule | undefined;

    // Check if the message is about setting medication reminder
    const reminderInfo = this.detectMedicationReminder(prompt, language);
    if (reminderInfo && userId) {
      medicationReminder = this.createMedicationSchedule(reminderInfo, userId);
    }

    // Try to get response from both AI providers
    const promises = [];

    // Gemini response
    if (geminiService.isInitialized()) {
      promises.push(
        geminiService.generateMedicalResponse(prompt, language)
          .then(response => {
            responses.push({
              name: 'gemini',
              response,
              confidence: this.calculateConfidence(response)
            });
          })
          .catch(error => {
            console.error('Gemini error:', error);
            errors.push('Gemini: ' + error.message);
          })
      );
    }

    // OpenAI response
    if (openaiService.isInitialized()) {
      promises.push(
        openaiService.generateMedicalResponse(prompt, language)
          .then(response => {
            responses.push({
              name: 'gpt',
              response,
              confidence: this.calculateConfidence(response)
            });
          })
          .catch(error => {
            console.error('OpenAI error:', error);
            errors.push('OpenAI: ' + error.message);
          })
      );
    }

    // DeepSeek response
    if (deepseekService.isInitialized()) {
      promises.push(
        deepseekService.generateMedicalResponse(prompt, language)
          .then(response => {
            responses.push({
              name: 'deepseek',
              response,
              confidence: this.calculateConfidence(response)
            });
          })
          .catch(error => {
            console.error('DeepSeek error:', error);
            errors.push('DeepSeek: ' + error.message);
          })
      );
    }

    // Wait for all promises to complete
    await Promise.allSettled(promises);

    // If no responses, return error message
    if (responses.length === 0) {
      const errorMsg = language === 'bn' 
        ? `দুঃখিত, AI সেবা বর্তমানে উপলব্ধ নেই। অনুগ্রহ করে API কী সেট করুন অথবা পরে আবার চেষ্টা করুন.\n\nত্রুটি: ${errors.join(', ')}`
        : `Sorry, AI services are currently unavailable. Please set API keys or try again later.\n\nErrors: ${errors.join(', ')}`;
      return { response: errorMsg, medicationReminder };
    }

    let finalResponse: string;
    // If only one response, return it
    if (responses.length === 1) {
      finalResponse = this.formatSingleResponse(responses[0], language);
    } else {
      // If multiple responses, combine them intelligently
      finalResponse = this.combineResponses(responses, language);
    }

    // Add medication reminder confirmation to response if created
    if (medicationReminder) {
      const confirmationMsg = language === 'bn'
        ? `\n\n✅ ওষুধের রিমাইন্ডার সফলভাবে সেট করা হয়েছে! আপনি মেডিসিন রিমাইন্ডার সেকশনে এটি দেখতে পাবেন।`
        : `\n\n✅ Medication reminder has been set successfully! You can view it in the Medicine Reminder section.`;
      finalResponse += confirmationMsg;
    }

    return { response: finalResponse, medicationReminder };
  }

  private calculateConfidence(response: string): number {
    // Simple confidence calculation based on response length and medical keywords
    const medicalKeywords = [
      'symptom', 'diagnosis', 'treatment', 'medicine', 'doctor', 'hospital',
      'লক্ষণ', 'রোগ', 'চিকিৎসা', 'ওষুধ', 'ডাক্তার', 'হাসপাতাল'
    ];
    
    let score = Math.min(response.length / 200, 1); // Length factor
    
    // Medical keyword factor
    const keywordCount = medicalKeywords.filter(keyword => 
      response.toLowerCase().includes(keyword.toLowerCase())
    ).length;
    
    score += keywordCount * 0.1;
    
    return Math.min(score, 1);
  }

  private formatSingleResponse(provider: AIProvider, language: Language): string {
    const prefix = language === 'bn' 
      ? `**ডা. মিমু এর পরামর্শ:**\n\n`
      : `**Dr. Mimu's Advice:**\n\n`;
    
    return prefix + provider.response;
  }

  private combineResponses(responses: AIProvider[], language: Language): string {
    // Sort by confidence
    responses.sort((a, b) => b.confidence - a.confidence);
    
    const header = language === 'bn' 
      ? '**ডা. মিমু এর বিশেষজ্ঞ পরামর্শ:**\n\n'
      : '**Dr. Mimu\'s Expert Advice:**\n\n';
    
    let combinedResponse = header;
    
    // Check for consensus
    const consensus = this.checkConsensus(responses);
    
    if (consensus) {
      const consensusMsg = language === 'bn' 
        ? '✅ **বিশেষজ্ঞ মতামত:**\n\n'
        : '✅ **Expert Opinion:**\n\n';
      combinedResponse += consensusMsg + responses[0].response;
    } else {
      // Show both responses with labels
      responses.forEach((provider, index) => {
        const label = language === 'bn' 
          ? `**বিশ্লেষণ ${index + 1} (${Math.round(provider.confidence * 100)}% নির্ভরযোগ্যতা):**\n\n`
          : `**Analysis ${index + 1} (${Math.round(provider.confidence * 100)}% confidence):**\n\n`;
        
        combinedResponse += label + provider.response;
        
        if (index < responses.length - 1) {
          combinedResponse += '\n\n---\n\n';
        }
      });
      
      // Add recommendation
      const recommendation = language === 'bn' 
        ? '\n\n**সুপারিশ:** উভয় পরামর্শ বিবেচনা করুন এবং একজন যোগ্য চিকিৎসকের সাথে পরামর্শ করুন।'
        : '\n\n**Recommendation:** Consider both pieces of advice and consult with a qualified medical professional.';
      
      combinedResponse += recommendation;
    }
    
    return combinedResponse;
  }

  private checkConsensus(responses: AIProvider[]): boolean {
    if (responses.length < 2) return false;
    
    // Simple consensus check - if responses are similar in key medical terms
    const response1 = responses[0].response.toLowerCase();
    const response2 = responses[1].response.toLowerCase();
    
    // Extract key medical terms and compare
    const medicalTerms1 = this.extractMedicalTerms(response1);
    const medicalTerms2 = this.extractMedicalTerms(response2);
    
    const commonTerms = medicalTerms1.filter(term => medicalTerms2.includes(term));
    
    // If more than 50% of terms are common, consider it consensus
    return commonTerms.length > Math.max(medicalTerms1.length, medicalTerms2.length) * 0.5;
  }

  private extractMedicalTerms(text: string): string[] {
    const medicalKeywords = [
      'fever', 'headache', 'cough', 'cold', 'flu', 'pain', 'infection',
      'জ্বর', 'মাথাব্যথা', 'কাশি', 'সর্দি', 'ব্যথা', 'সংক্রমণ'
    ];
    
    return medicalKeywords.filter(keyword => text.includes(keyword));
  }

  private isSymptomQuery(prompt: string): boolean {
    const symptomKeywords = [
      'symptom', 'fever', 'headache', 'cough', 'pain', 'ache', 'hurt', 'sick', 'ill',
      'লক্ষণ', 'জ্বর', 'মাথাব্যথা', 'কাশি', 'ব্যথা', 'অসুস্থ', 'অসুখ'
    ];
    return symptomKeywords.some(keyword => prompt.toLowerCase().includes(keyword.toLowerCase()));
  }

  private isMedicationQuery(prompt: string): boolean {
    const medicationKeywords = [
      'medicine', 'medication', 'drug', 'tablet', 'capsule', 'syrup', 'dose', 'dosage',
      'ওষুধ', 'ঔষধ', 'ট্যাবলেট', 'ক্যাপসুল', 'সিরাপ', 'ডোজ'
    ];
    return medicationKeywords.some(keyword => prompt.toLowerCase().includes(keyword.toLowerCase()));
  }

  hasAnyApiKey(): boolean {
    return geminiService.isInitialized() || openaiService.isInitialized() || deepseekService.isInitialized() || langchainService.isInitialized();
  }

  getAvailableProviders(): string[] {
    const providers = [];
    if (geminiService.isInitialized()) providers.push('Gemini');
    if (openaiService.isInitialized()) providers.push('OpenAI GPT');
    if (deepseekService.isInitialized()) providers.push('DeepSeek');
    if (langchainService.isInitialized()) providers.push('LangChain');
    return providers;
  }

  // Detect if user message is about setting medication reminder
  private detectMedicationReminder(message: string, language: Language): MedicationInfo | null {
    const lowerMessage = message.toLowerCase();
    
    // Bengali patterns
    const bnPatterns = [
      /রিমাইন্ডার.*সেট/,
      /ওষুধ.*মনে.*করিয়ে/,
      /ওষুধ.*রিমাইন্ডার/,
      /মেডিসিন.*রিমাইন্ডার/,
      /ওষুধ.*খাওয়ার.*সময়/,
      /ওষুধ.*নেওয়ার.*সময়/
    ];
    
    // English patterns
    const enPatterns = [
      /set.*reminder/,
      /medicine.*reminder/,
      /medication.*reminder/,
      /remind.*medicine/,
      /remind.*medication/,
      /pill.*reminder/
    ];
    
    const patterns = language === 'bn' ? bnPatterns : enPatterns;
    const isReminderRequest = patterns.some(pattern => pattern.test(lowerMessage));
    
    if (!isReminderRequest) return null;
    
    // Extract medication information from the message
    return this.extractMedicationFromMessage(message, language);
  }
  
  // Extract medication information from user message
  private extractMedicationFromMessage(message: string, language: Language): MedicationInfo | null {
    try {
      // Use existing extractMedicationInfo function
      const medications = extractMedicationInfo(message);
      if (medications.length > 0) {
        return medications[0]; // Return first medication found
      }
      
      // If no medication found by existing function, try manual parsing
      return this.manualMedicationParsing(message, language);
    } catch (error) {
      console.error('Error extracting medication info:', error);
      return null;
    }
  }
  
  // Manual parsing for simple medication reminders
  private manualMedicationParsing(message: string, language: Language): MedicationInfo | null {
    const lowerMessage = message.toLowerCase();
    
    // Try to extract medicine name (look for common patterns)
    let medicineName = '';
    let frequency = 'OD';
    let duration = 7; // Default 7 days
    
    // Extract medicine name patterns
    const medicinePatterns = [
      /(?:ওষুধ|মেডিসিন|medicine|medication)\s*[:\-]?\s*([a-zA-Z0-9\s]+?)(?:\s|$|,|\.)/i,
      /([a-zA-Z]+(?:\s+[a-zA-Z]+)*)\s*(?:ট্যাবলেট|tablet|ক্যাপসুল|capsule)/i,
      /([a-zA-Z]+(?:\s+[0-9]+mg)?)/i
    ];
    
    for (const pattern of medicinePatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        medicineName = match[1].trim();
        break;
      }
    }
    
    // Extract frequency
    if (lowerMessage.includes('দিনে দুইবার') || lowerMessage.includes('twice daily') || lowerMessage.includes('bd')) {
      frequency = 'BD';
    } else if (lowerMessage.includes('দিনে তিনবার') || lowerMessage.includes('three times') || lowerMessage.includes('tid')) {
      frequency = 'TID';
    } else if (lowerMessage.includes('দিনে চারবার') || lowerMessage.includes('four times') || lowerMessage.includes('qid')) {
      frequency = 'QID';
    }
    
    // Extract duration
    const durationMatch = message.match(/(\d+)\s*(?:দিন|days?)/i);
    if (durationMatch) {
      duration = parseInt(durationMatch[1]);
    }
    
    if (!medicineName) return null;
    
    return {
      id: Date.now().toString(),
      name: medicineName,
      strength: '1 tablet',
      form: 'tablet',
      frequency: frequency,
      frequencyPerDay: frequency === 'BD' ? 2 : frequency === 'TID' ? 3 : frequency === 'QID' ? 4 : 1,
      duration: duration,
      instructions: language === 'bn' ? 'খাবারের পর' : 'After food',
      isAntibiotic: false,
      startTime: new Date()
    };
  }
  
  // Create medication schedule from extracted info
  private createMedicationSchedule(medicationInfo: MedicationInfo, userId: string): MedicationSchedule {
    return generateMedicationSchedule(
      [medicationInfo],
      new Date(),
      userId,
      ['app'] // Default to app notifications
    );
  }
}

export default new MedicalAIService();