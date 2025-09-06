// LangChain এবং AI মডেল ইমপোর্ট
import { ChatOpenAI } from '@langchain/openai'; // OpenAI GPT মডেল
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'; // Google Gemini মডেল
import { PromptTemplate } from '@langchain/core/prompts'; // প্রম্পট টেমপ্লেট তৈরির জন্য
import { LLMChain } from 'langchain/chains'; // LLM চেইন তৈরির জন্য
import { ConversationChain } from 'langchain/chains'; // কথোপকথন চেইন তৈরির জন্য
import { BufferMemory } from 'langchain/memory'; // চ্যাট হিস্টরি মেমরি ম্যানেজমেন্ট
import { Language } from '../types'; // ভাষা টাইপ ডেফিনিশন

// Redis Integration ইমপোর্ট
import { redisCacheService } from './redisCacheService';
import { redisMemoryService } from './redisMemoryService';
import { redisVectorService } from './redisVectorService';
import { HumanMessage, AIMessage } from '@langchain/core/messages';

/**
 * LangChain সার্ভিস ক্লাস - AI মডেল ম্যানেজমেন্ট ও মেডিকেল AI সহায়তার জন্য
 * এই ক্লাস OpenAI GPT এবং Google Gemini মডেল ব্যবহার করে
 * ডা. মিমু প্রজেক্টের জন্য বিশেষায়িত মেডিকেল AI সেবা প্রদান করে
 */
class LangChainService {
  // OpenAI GPT মডেল ইনস্ট্যান্স
  private openaiModel: ChatOpenAI | null = null;
  // Google Gemini মডেল ইনস্ট্যান্স
  private geminiModel: ChatGoogleGenerativeAI | null = null;
  // চ্যাট হিস্টরি সংরক্ষণের জন্য মেমরি
  private memory: BufferMemory;
  // কথোপকথন চেইন - AI এর সাথে ধারাবাহিক কথোপকথনের জন্য
  private conversationChain: ConversationChain | null = null;

  /**
   * কনস্ট্রাক্টর - LangChain সার্ভিস ইনিশিয়ালাইজ করে
   * চ্যাট হিস্টরি মেমরি সেটআপ করে এবং environment variables থেকে API keys লোড করে
   * Redis integration সহ performance optimization
   */
  constructor() {
    // চ্যাট হিস্টরি সংরক্ষণের জন্য বাফার মেমরি তৈরি
    this.memory = new BufferMemory({
      returnMessages: true, // মেসেজ ফরম্যাটে রিটার্ন করবে
      memoryKey: 'chat_history', // মেমরি কী নাম
      // Redis cache integration
      cache: redisCacheService.getLangChainCache()
    });
    
    // Environment variables থেকে API keys স্বয়ংক্রিয়ভাবে লোড করা
    this.autoInitializeFromEnvironment();
    
    // Redis services initialization
    this.initializeRedisServices();
  }

  /**
   * Redis services ইনিশিয়ালাইজ করে
   */
  private async initializeRedisServices() {
    try {
      // Redis services ready হওয়ার জন্য অপেক্ষা
      await Promise.all([
        redisCacheService.initialize(),
        redisMemoryService.initialize(),
        redisVectorService.initialize()
      ]);
      console.log('✅ Redis services initialized for LangChain optimization');
    } catch (error) {
      console.warn('⚠️ Redis services initialization failed, continuing without Redis optimization:', error);
    }
  }

  /**
   * Environment variables থেকে API keys স্বয়ংক্রিয়ভাবে লোড করে
   */
  private autoInitializeFromEnvironment() {
    try {
      console.log('🔄 Auto-initializing LangChain from environment variables...');
      
      // OpenAI API key চেক ও ইনিশিয়ালাইজ
      const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (this.validateAPIKey(openaiKey, 'OpenAI')) {
        this.initializeOpenAI(openaiKey);
      }
      
      // Gemini API key চেক ও ইনিশিয়ালাইজ
      const geminiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY;
      if (this.validateAPIKey(geminiKey, 'Gemini')) {
        this.initializeGemini(geminiKey);
      }
      
      if (!openaiKey && !geminiKey) {
        console.warn('⚠️ No API keys found in environment variables. Please set VITE_OPENAI_API_KEY or VITE_GEMINI_API_KEY.');
      }
    } catch (error) {
      console.error('❌ Error auto-initializing from environment:', error);
    }
  }

  /**
   * API key validation
   */
  private validateAPIKey(apiKey: string, provider: string): boolean {
    if (!apiKey || apiKey.trim() === '') {
      console.warn(`⚠️ ${provider} API key is empty`);
      return false;
    }
    
    // Check for placeholder values
    if (apiKey.includes('your-') || apiKey.includes('sk-xxx') || apiKey.includes('placeholder')) {
      console.warn(`⚠️ ${provider} API key appears to be a placeholder`);
      return false;
    }
    
    // Basic format validation
    if (provider === 'OpenAI' && !apiKey.startsWith('sk-')) {
      console.warn(`⚠️ ${provider} API key format appears invalid (should start with 'sk-')`);
      return false;
    }
    
    if (provider === 'Gemini' && apiKey.length < 20) {
      console.warn(`⚠️ ${provider} API key appears too short`);
      return false;
    }
    
    console.log(`✅ ${provider} API key validation passed`);
    return true;
  }

  /**
   * OpenAI GPT মডেল ইনিশিয়ালাইজ করে
   * @param apiKey - OpenAI API কী
   */
  initializeOpenAI(apiKey?: string) {
    // Environment variable থেকে API key লোড করা
    const finalApiKey = apiKey || import.meta.env.VITE_OPENAI_API_KEY;
    
    // API কী ভ্যালিডেশন চেক
    if (!finalApiKey || finalApiKey.trim() === '') {
      console.error('OpenAI API key is empty or undefined. Please set VITE_OPENAI_API_KEY environment variable.');
      return;
    }
    
    try {
      // OpenAI ChatGPT মডেল কনফিগারেশন
      this.openaiModel = new ChatOpenAI({
        apiKey: finalApiKey, // API কী (updated parameter name)
        model: 'gpt-3.5-turbo', // মডেল নাম (updated parameter name)
        temperature: 0.7, // রেসপন্সের ক্রিয়েটিভিটি লেভেল (0-1)
        maxTokens: 1000 // সর্বোচ্চ টোকেন সংখ্যা
      });
      // কথোপকথন চেইন সেটআপ করে
      this.setupConversationChain();
      console.log('✅ OpenAI model initialized successfully with API key');
    } catch (error) {
      console.error('❌ Error initializing OpenAI model:', error);
      this.openaiModel = null;
    }
  }

  /**
   * Google Gemini মডেল ইনিশিয়ালাইজ করে
   * @param apiKey - Google AI API কী
   */
  initializeGemini(apiKey?: string) {
    // Environment variable থেকে API key লোড করা
    const finalApiKey = apiKey || import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY;
    
    // API কী ভ্যালিডেশন চেক
    if (!finalApiKey || finalApiKey.trim() === '') {
      console.error('Gemini API key is empty or undefined. Please set VITE_GEMINI_API_KEY environment variable.');
      return;
    }
    
    try {
      // Google Gemini মডেল কনফিগারেশন
      this.geminiModel = new ChatGoogleGenerativeAI({
        apiKey: finalApiKey, // API কী
        model: 'gemini-1.5-flash', // আপডেটেড মডেল নাম
        temperature: 0.7, // রেসপন্সের ক্রিয়েটিভিটি লেভেল
        maxOutputTokens: 1000 // সর্বোচ্চ আউটপুট টোকেন
      });
      // কথোপকথন চেইন সেটআপ করে
      this.setupConversationChain();
      console.log('✅ Gemini model initialized successfully with API key');
    } catch (error) {
      console.error('❌ Error initializing Gemini model:', error);
      this.geminiModel = null;
    }
  }

  /**
   * কথোপকথন চেইন সেটআপ করে
   * উপলব্ধ AI মডেল (OpenAI বা Gemini) ব্যবহার করে চেইন তৈরি করে
   */
  private setupConversationChain() {
    // উপলব্ধ মডেল নির্বাচন (OpenAI প্রাধান্য পাবে)
    const model = this.openaiModel || this.geminiModel;
    if (!model) return; // কোন মডেল না থাকলে রিটার্ন

    try {
      // Medical prompt template তৈরি করি
      const medicalPrompt = this.createMedicalPrompt('bn'); // Default Bengali
      
      // Custom prompt template যা medical context include করে
      const promptTemplate = PromptTemplate.fromTemplate(
        `${medicalPrompt}\n\nCurrent conversation:\n{chat_history}\n\nHuman: {input}\nAssistant:`
      );

      // কথোপকথন চেইন তৈরি - custom prompt template সহ
      this.conversationChain = new ConversationChain({
        llm: model, // ব্যবহৃত AI মডেল
        memory: this.memory, // চ্যাট হিস্টরি মেমরি
        prompt: promptTemplate // Custom medical prompt template
      });
      console.log('✅ ConversationChain initialized successfully with medical prompt');
    } catch (error) {
      console.error('❌ Error setting up ConversationChain:', error);
      this.conversationChain = null;
    }
  }

  /**
   * মেডিকেল রেসপন্স জেনারেট করে
   * ব্যবহারকারীর প্রশ্নের ভিত্তিতে ডা. মিমুর মতো মেডিকেল পরামর্শ প্রদান করে
   * Redis caching এবং semantic search সহ performance optimization
   * @param prompt - ব্যবহারকারীর প্রশ্ন বা সমস্যা
   * @param language - রেসপন্সের ভাষা (বাংলা/ইংরেজি)
   * @param userId - ব্যবহারকারীর ID (optional)
   * @param sessionId - সেশন ID (optional)
   * @returns মেডিকেল পরামর্শ টেক্সট
   */
  async generateMedicalResponse(
    prompt: string, 
    language: Language, 
    userId?: string, 
    sessionId?: string
  ): Promise<string> {
    // Input validation
    if (!prompt || prompt.trim() === '') {
      return language === 'bn' 
        ? 'অনুগ্রহ করে আপনার প্রশ্ন বা সমস্যা লিখুন।'
        : 'Please enter your question or concern.';
    }

    // 🚀 Redis Cache Check - প্রথমে cache থেকে response খোঁজা
    try {
      const cachedResponse = await redisCacheService.getSemanticCache(
        prompt, 
        'medical_advice', 
        userId
      );
      
      if (cachedResponse && cachedResponse.metadata.language === language) {
        console.log('🎯 Cache hit - returning cached medical advice');
        
        // Store in session memory if sessionId provided
        if (sessionId) {
          await redisMemoryService.addMessage(
            sessionId,
            new HumanMessage(prompt)
          );
          await redisMemoryService.addMessage(
            sessionId,
            new AIMessage(cachedResponse.response)
          );
        }
        
        return cachedResponse.response;
      }

      // 🔍 Semantic Search - similar cached responses খোঁজা
      const similarResponses = await redisCacheService.findSimilarCachedQueries(
        prompt,
        'medical_advice',
        0.85, // 85% similarity threshold
        1
      );
      
      if (similarResponses.length > 0 && similarResponses[0].metadata.language === language) {
        console.log('🔍 Similar cached response found');
        const similarResponse = similarResponses[0].response;
        
        // Store in session memory if sessionId provided
        if (sessionId) {
          await redisMemoryService.addMessage(
            sessionId,
            new HumanMessage(prompt)
          );
          await redisMemoryService.addMessage(
            sessionId,
            new AIMessage(similarResponse)
          );
        }
        
        return similarResponse;
      }
    } catch (cacheError) {
      console.warn('⚠️ Redis cache error, proceeding without cache:', cacheError);
    }

    // Check if any AI model is available
    if (!this.openaiModel && !this.geminiModel) {
      console.warn('No AI models available, providing offline response');
      return this.getOfflineFallbackResponse(prompt, language);
    }

    // চেইন ইনিশিয়ালাইজড কিনা চেক
    if (!this.conversationChain) {
      console.log('ConversationChain not available, using direct model call');
      return this.directModelCall(prompt, language);
    }

    try {
      // Add timeout for conversation chain as well
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Conversation chain timeout')), 25000); // 25 second timeout
      });

      // AI মডেল থেকে রেসপন্স পাওয়া
      const response = await Promise.race([
        this.conversationChain.call({
          input: prompt // শুধু user input, medical prompt template এ আছে
        }),
        timeoutPromise
      ]);
      
      // রেসপন্স থেকে টেক্সট বের করা
      const result = response.response || response.text || response.output || String(response);
      
      if (!result || result.trim() === '') {
        console.warn('Empty response from ConversationChain, trying direct model call');
        return this.directModelCall(prompt, language);
      }
      
      // Validate response quality
      if (result.length < 10) {
        console.warn('Response too short, trying direct model call');
        return this.directModelCall(prompt, language, userId, sessionId);
      }
      
      // 💾 Cache the successful response in Redis
      await this.cacheSuccessfulResponse(prompt, result, language, userId, sessionId);
      
      return result;
    } catch (error) {
      console.error('LangChain ConversationChain error:', error);
      
      // Error type অনুযায়ী specific handling
      if (error.message && error.message.includes('Missing value for input')) {
        console.log('History input error detected, reinitializing chain...');
        this.setupConversationChain(); // Chain reinitialize করি
        // Try once more with reinitialized chain
        try {
          const retryResponse = await this.conversationChain?.call({ input: prompt });
          const retryResult = retryResponse?.response || retryResponse?.text || retryResponse?.output || String(retryResponse);
          if (retryResult && retryResult.trim() !== '') {
            return retryResult;
          }
        } catch (retryError) {
          console.error('Retry with reinitialized chain failed:', retryError);
        }
      }
      
      // Check for specific error types
      if (error.message && error.message.includes('timeout')) {
        console.log('ConversationChain timeout, falling back to direct model call...');
      } else {
        console.log('ConversationChain error, falling back to direct model call...');
      }
      
      // Fallback: Direct model call
      return this.directModelCall(prompt, language, userId, sessionId);
    }
  }

  /**
   * Direct model call fallback method with retry mechanism
   * ConversationChain এ সমস্যা হলে সরাসরি মডেল কল করে
   */
  private async directModelCall(
    prompt: string, 
    language: Language, 
    userId?: string, 
    sessionId?: string, 
    retryCount: number = 0
  ): Promise<string> {
    const model = this.openaiModel || this.geminiModel;
    if (!model) {
      return this.getOfflineFallbackResponse(prompt, language);
    }

    try {
      const medicalPrompt = this.createMedicalPrompt(language);
      const fullPrompt = `${medicalPrompt}\n\nUser: ${prompt}`;
      
      // Get chat history from memory
      const chatHistory = await this.memory.chatHistory.getMessages();
      const historyText = chatHistory.map(msg => `${msg._getType()}: ${msg.content}`).join('\n');
      
      const finalPrompt = historyText ? `${historyText}\n\n${fullPrompt}` : fullPrompt;
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 30000); // 30 second timeout
      });
      
      const response = await Promise.race([
        model.invoke(finalPrompt),
        timeoutPromise
      ]);
      
      const result = response.content || response.text || String(response);
      
      if (!result || result.trim() === '') {
        throw new Error('Empty response from AI model');
      }
      
      // Save to memory manually
      await this.memory.chatHistory.addUserMessage(prompt);
      await this.memory.chatHistory.addAIChatMessage(result);
      
      // 💾 Cache the successful response in Redis
      await this.cacheSuccessfulResponse(prompt, result, language, userId, sessionId);
      
      return result;
    } catch (error) {
      console.error(`Direct model call error (attempt ${retryCount + 1}):`, error);
      
      // Retry logic - maximum 2 retries
      if (retryCount < 2) {
        console.log(`Retrying API call... (attempt ${retryCount + 2})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Progressive delay
        return this.directModelCall(prompt, language, userId, sessionId, retryCount + 1);
      }
      
      // Enhanced error handling with specific messages
      return this.handleAPIError(error, language, prompt);
    }
  }

  /**
   * Handle API errors with specific user-friendly messages
   */
  private handleAPIError(error: any, language: Language, prompt: string): string {
    const errorMessage = error.message || error.toString();
    
    // API Key related errors
    if (errorMessage.includes('API key') || errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      return language === 'bn' 
        ? 'দুঃখিত, AI সেবা সাময়িকভাবে অনুপলব্ধ। অনুগ্রহ করে পরে আবার চেষ্টা করুন অথবা সরাসরি ডাক্তারের পরামর্শ নিন।'
        : 'Sorry, AI service is temporarily unavailable. Please try again later or consult a doctor directly.';
    }
    
    // Quota/Rate limit errors
    if (errorMessage.includes('quota') || errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      return language === 'bn' 
        ? 'AI সেবার ব্যবহার সীমা অতিক্রম হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন। জরুরি প্রয়োজনে ডাক্তারের সাথে যোগাযোগ করুন।'
        : 'AI service usage limit exceeded. Please try again in a few minutes. For urgent needs, contact a doctor.';
    }
    
    // Network/Timeout errors
    if (errorMessage.includes('timeout') || errorMessage.includes('network') || errorMessage.includes('ENOTFOUND')) {
      return language === 'bn' 
        ? 'ইন্টারনেট সংযোগে সমস্যা হচ্ছে। আপনার নেটওয়ার্ক চেক করে আবার চেষ্টা করুন। অথবা অফলাইন পরামর্শের জন্য নিচের তথ্য দেখুন।'
        : 'Internet connection issue. Please check your network and try again. Or see offline advice below.';
    }
    
    // Model not found errors
    if (errorMessage.includes('404') || errorMessage.includes('model')) {
      return language === 'bn' 
        ? 'AI মডেল সাময়িকভাবে অনুপলব্ধ। আমাদের টেকনিক্যাল টিম এই সমস্যা সমাধানে কাজ করছে। জরুরি প্রয়োজনে ডাক্তারের পরামর্শ নিন।'
        : 'AI model temporarily unavailable. Our technical team is working on this issue. For urgent needs, consult a doctor.';
    }
    
    // Generic fallback with helpful suggestions
    return this.getOfflineFallbackResponse(prompt, language);
  }

  /**
   * Provide offline fallback responses with helpful medical guidance
   */
  private getOfflineFallbackResponse(prompt: string, language: Language): string {
    const promptLower = prompt.toLowerCase();
    
    if (language === 'bn') {
      // Emergency symptoms detection
      if (promptLower.includes('বুকে ব্যথা') || promptLower.includes('শ্বাসকষ্ট') || promptLower.includes('অজ্ঞান')) {
        return 'জরুরি লক্ষণ সনাক্ত হয়েছে! অবিলম্বে নিকটস্থ হাসপাতালে যান বা ৯৯৯ নম্বরে কল করুন। AI সেবা এখন উপলব্ধ নেই, তাই দেরি না করে চিকিৎসা সেবা নিন।';
      }
      
      // Fever related
      if (promptLower.includes('জ্বর') || promptLower.includes('fever')) {
        return 'AI সেবা সাময়িকভাবে বন্ধ আছে। জ্বরের জন্য: পর্যাপ্ত পানি পান করুন, বিশ্রাম নিন, প্যারাসিটামল খেতে পারেন। ১০২°F এর বেশি জ্বর বা ৩ দিনের বেশি স্থায়ী হলে ডাক্তার দেখান।';
      }
      
      // General advice
      return 'দুঃখিত, AI বিশ্লেষণ সেবা এখন উপলব্ধ নেই। সাধারণ পরামর্শ: পর্যাপ্ত পানি পান করুন, সুষম খাবার খান, নিয়মিত ব্যায়াম করুন। কোনো গুরুতর লক্ষণ থাকলে অবিলম্বে ডাক্তারের পরামর্শ নিন। জরুরি সেবার জন্য: ৯৯৯';
    } else {
      // Emergency symptoms detection
      if (promptLower.includes('chest pain') || promptLower.includes('difficulty breathing') || promptLower.includes('unconscious')) {
        return 'Emergency symptoms detected! Go to the nearest hospital immediately or call 999. AI service is currently unavailable, so please seek medical attention without delay.';
      }
      
      // Fever related
      if (promptLower.includes('fever') || promptLower.includes('temperature')) {
        return 'AI service is temporarily unavailable. For fever: drink plenty of water, rest, you may take paracetamol. See a doctor if fever exceeds 102°F or persists for more than 3 days.';
      }
      
      // General advice
      return 'Sorry, AI analysis service is currently unavailable. General advice: drink plenty of water, eat balanced meals, exercise regularly. For any serious symptoms, consult a doctor immediately. Emergency: 999';
    }
  }

  /**
   * ওষুধের বিশ্লেষণ জেনারেট করে
   * প্রেসক্রিপশন থেকে ওষুধের তথ্য বিশ্লেষণ করে নিরাপত্তা পরামর্শ প্রদান করে
   * @param medicationText - ওষুধের তথ্য (প্রেসক্রিপশন টেক্সট)
   * @param language - বিশ্লেষণের ভাষা
   * @returns ওষুধের বিস্তারিত বিশ্লেষণ অবজেক্ট
   */
  async generateMedicationAnalysis(medicationText: string, language: Language): Promise<{
    medications: Array<{ // ওষুধের তালিকা
      name: string; // ওষুধের নাম
      dosage: string; // ডোজ
      frequency: string; // সেবনের ফ্রিকোয়েন্সি
      duration: string; // সেবনের মেয়াদ
      isAntibiotic: boolean; // অ্যান্টিবায়োটিক কিনা
      warnings: string[]; // সতর্কতা তালিকা
    }>;
    interactions: string[]; // ওষুধের মধ্যে ইন্টারঅ্যাকশন
    recommendations: string[]; // সুপারিশ তালিকা
  }> {
    // উপলব্ধ AI মডেল নির্বাচন
    const model = this.openaiModel || this.geminiModel;
    if (!model) {
      throw new Error('LangChain not initialized. Please set API keys first.');
    }

    // ওষুধ বিশ্লেষণের জন্য বিশেষায়িত প্রম্পট টেমপ্লেট
    const analysisPrompt = PromptTemplate.fromTemplate(`
      You are a medical AI assistant specialized in medication analysis for Bangladesh context.
      
      Analyze the following medication information and provide a structured response:
      
      Medication Text: {medicationText}
      Language: {language}
      
      Please provide:
      1. List of medications with dosage, frequency, duration
      2. Identify any antibiotics
      3. Check for potential drug interactions
      4. Provide safety recommendations
      
      Respond in JSON format with the following structure:
      {{
        "medications": [
          {{
            "name": "medication name",
            "dosage": "dosage amount",
            "frequency": "how often",
            "duration": "how long",
            "isAntibiotic": true/false,
            "warnings": ["warning1", "warning2"]
          }}
        ],
        "interactions": ["interaction1", "interaction2"],
        "recommendations": ["recommendation1", "recommendation2"]
      }}
    `);

    // LLM চেইন তৈরি - প্রম্পট টেমপ্লেট ও মডেল সহ
    const chain = new LLMChain({
      llm: model, // ব্যবহৃত AI মডেল
      prompt: analysisPrompt // ওষুধ বিশ্লেষণ প্রম্পট
    });

    try {
      // AI মডেল থেকে ওষুধ বিশ্লেষণ পাওয়া
      const response = await chain.call({
        medicationText, // ওষুধের টেক্সট
        language // ভাষা
      });
      
      // JSON ফরম্যাটে রেসপন্স পার্স করা
      return JSON.parse(response.text);
    } catch (error) {
      console.error('Medication analysis error:', error);
      throw error;
    }
  }

  /**
   * লক্ষণ বিশ্লেষণ জেনারেট করে
   * ব্যবহারকারীর লক্ষণের ভিত্তিতে সম্ভাব্য রোগ ও জরুরিত্বের মাত্রা নির্ধারণ করে
   * @param symptoms - ব্যবহারকারীর লক্ষণ বর্ণনা
   * @param language - বিশ্লেষণের ভাষা
   * @returns লক্ষণ বিশ্লেষণ অবজেক্ট
   */
  async generateSymptomAnalysis(symptoms: string, language: Language): Promise<{
    possibleConditions: string[]; // সম্ভাব্য রোগের তালিকা
    urgencyLevel: 'low' | 'medium' | 'high' | 'emergency'; // জরুরিত্বের মাত্রা
    recommendations: string[]; // সুপারিশ তালিকা
    whenToSeeDoctor: string; // কখন ডাক্তার দেখাতে হবে
  }> {
    // উপলব্ধ AI মডেল নির্বাচন
    const model = this.openaiModel || this.geminiModel;
    if (!model) {
      throw new Error('LangChain not initialized. Please set API keys first.');
    }

    // লক্ষণ বিশ্লেষণের জন্য বিশেষায়িত প্রম্পট টেমপ্লেট
    const symptomPrompt = PromptTemplate.fromTemplate(`
      You are Dr. Mimu, an AI medical assistant for Bangladesh. Analyze these symptoms:
      
      Symptoms: {symptoms}
      Language: {language}
      
      Provide analysis in JSON format:
      {{
        "possibleConditions": ["condition1", "condition2"],
        "urgencyLevel": "low/medium/high/emergency",
        "recommendations": ["recommendation1", "recommendation2"],
        "whenToSeeDoctor": "specific guidance on when to seek medical help"
      }}
      
      Consider Bangladesh's healthcare context and common diseases.
      Always err on the side of caution for serious symptoms.
    `);

    // LLM চেইন তৈরি - লক্ষণ বিশ্লেষণের জন্য
    const chain = new LLMChain({
      llm: model, // ব্যবহৃত AI মডেল
      prompt: symptomPrompt // লক্ষণ বিশ্লেষণ প্রম্পট
    });

    try {
      // AI মডেল থেকে লক্ষণ বিশ্লেষণ পাওয়া
      const response = await chain.call({
        symptoms, // লক্ষণ বর্ণনা
        language // ভাষা
      });
      
      // JSON ফরম্যাটে রেসপন্স পার্স করা
      return JSON.parse(response.text);
    } catch (error) {
      console.error('Symptom analysis error:', error);
      throw error;
    }
  }

  /**
   * ভাষা অনুযায়ী মেডিকেল প্রম্পট তৈরি করে
   * ডা. মিমুর পরিচয় ও দায়িত্ব সংজ্ঞায়িত করে
   * @param language - প্রম্পটের ভাষা (বাংলা/ইংরেজি)
   * @returns মেডিকেল AI এর জন্য সিস্টেম প্রম্পট
   */
  private createMedicalPrompt(language: Language): string {
    // বাংলা ভাষার জন্য প্রম্পট
    if (language === 'bn') {
      return `আপনি "ডা. মিমু" - বাংলাদেশের প্রেক্ষাপটে বিশেষায়িত একজন AI চিকিৎসা সহায়ক। আপনার দায়িত্ব:

1. বাংলাদেশের স্বাস্থ্যসেবা ব্যবস্থা এবং সাধারণ রোগের কথা বিবেচনা করে চিকিৎসা পরামর্শ প্রদান
2. স্থানীয়ভাবে উপলব্ধ ওষুধ এবং চিকিৎসা পদ্ধতি সম্পর্কে তথ্য প্রদান
3. প্রাথমিক স্বাস্থ্যসেবা এবং প্রতিরোধমূলক ব্যবস্থার পরামর্শ
4. জরুরি পরিস্থিতিতে নিকটস্থ হাসপাতাল বা ডাক্তারের কাছে যাওয়ার পরামর্শ
5. ওষুধ অর্ডার এবং ডাক্তার অ্যাপয়েন্টমেন্ট বুকিং এ সহায়তা প্রদান

গুরুত্বপূর্ণ নির্দেশনা:
- সর্বদা বাংলায় উত্তর দিন
- গুরুতর লক্ষণের জন্য অবিলম্বে ডাক্তারের পরামর্শ নিতে বলুন
- ওষুধের নাম উল্লেখ করার সময় জেনেরিক নাম ব্যবহার করুন
- বাংলাদেশে প্রচলিত স্বাস্থ্যসেবা অনুশীলন বিবেচনা করুন
- কখনও নিশ্চিত রোগ নির্ণয় প্রদান করবেন না, শুধুমাত্র সম্ভাব্য কারণ এবং পরামর্শ দিন
- ওষুধ অর্ডার করার জন্য বললে সহায়তা করুন এবং উপযুক্ত ওষুধের পরামর্শ দিন
- ডাক্তার অ্যাপয়েন্টমেন্ট বুকিং এর জন্য বললে সংশ্লিষ্ট বিশেষজ্ঞ ডাক্তারের পরামর্শ দিন`;
    } else {
      // ইংরেজি ভাষার জন্য প্রম্পট
      return `You are "Dr. Mimu" - an AI medical assistant specialized for Bangladesh context. Your responsibilities:

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

  /**
   * ব্যবহারকারীর মেসেজ প্রসেস করে
   * মেসেজের ধরন (টেক্সট/ওষুধ/ডাক্তার) নির্ধারণ করে উপযুক্ত রেসপন্স প্রদান করে
   * @param message - ব্যবহারকারীর মেসেজ
   * @returns প্রসেসড রেসপন্স অবজেক্ট
   */
  async processMessage(message: string): Promise<{ text: string; type: 'text' | 'medicine' | 'doctor'; suggestDoctor?: boolean }> {
    // চেইন ইনিশিয়ালাইজড কিনা চেক
    if (!this.conversationChain) {
      throw new Error('LangChain not initialized. Please set API keys first.');
    }

    try {
      // মেসেজ বিশ্লেষণ করে ইনটেন্ট নির্ধারণ
      const lowerMessage = message.toLowerCase();
      let type: 'text' | 'medicine' | 'doctor' = 'text'; // ডিফল্ট টাইপ
      let suggestDoctor = false; // ডাক্তার সাজেস্ট করার ফ্ল্যাগ
      
      // ওষুধ সংক্রান্ত কীওয়ার্ড চেক
      if (lowerMessage.includes('ওষুধ') || lowerMessage.includes('medicine') || 
          lowerMessage.includes('tablet') || lowerMessage.includes('ঔষধ') ||
          lowerMessage.includes('দোকান') || lowerMessage.includes('pharmacy')) {
        type = 'medicine'; // ওষুধ টাইপ
        
        // রোগের লক্ষণ বা অবস্থা উল্লেখ থাকলে ডাক্তার সাজেস্ট করা
        const healthConditions = [
          'জ্বর', 'fever', 'ব্যথা', 'pain', 'মাথাব্যথা', 'headache',
          'পেটব্যথা', 'stomach', 'কাশি', 'cough', 'সর্দি', 'cold',
          'গ্যাস্ট্রিক', 'gastric', 'অ্যাসিডিটি', 'acidity', 'ডায়াবেটিস', 'diabetes',
          'চাপ', 'pressure', 'হার্ট', 'heart', 'শ্বাসকষ্ট', 'breathing',
          'অ্যালার্জি', 'allergy', 'চর্মরোগ', 'skin', 'ইনফেকশন', 'infection'
        ];
        
        suggestDoctor = healthConditions.some(condition => 
          lowerMessage.includes(condition)
        );
      }
      // ডাক্তার সংক্রান্ত কীওয়ার্ড চেক
      else if (lowerMessage.includes('ডাক্তার') || lowerMessage.includes('doctor') ||
               lowerMessage.includes('অ্যাপয়েন্টমেন্ট') || lowerMessage.includes('appointment') ||
               lowerMessage.includes('চিকিৎসক') || lowerMessage.includes('বিশেষজ্ঞ')) {
        type = 'doctor'; // ডাক্তার টাইপ
      }

      // মেডিকেল প্রম্পট ব্যবহার করে রেসপন্স জেনারেট
      const response = await this.generateMedicalResponse(message, 'bn');
      
      return {
        text: response, // AI রেসপন্স টেক্সট
        type, // নির্ধারিত মেসেজ টাইপ
        suggestDoctor // ডাক্তার সাজেস্ট করার ফ্ল্যাগ
      };
    } catch (error) {
      console.error('Process message error:', error);
      // এরর হলে ডিফল্ট বাংলা এরর মেসেজ রিটার্ন
      return {
        text: 'দুঃখিত, আমি এখন আপনার প্রশ্নের উত্তর দিতে পারছি না। অনুগ্রহ করে পরে আবার চেষ্টা করুন।',
        type: 'text'
      };
    }
  }

  /**
   * ডাক্তার রেকমেন্ডেশন জেনারেট করে
   * ব্যবহারকারীর স্বাস্থ্য সমস্যার ভিত্তিতে উপযুক্ত বিশেষজ্ঞ ডাক্তারের পরামর্শ দেয়
   * @param query - ব্যবহারকারীর স্বাস্থ্য সমস্যা বা প্রয়োজন
   * @returns ডাক্তার বিশেষত্বের রেকমেন্ডেশন
   */
  async getDoctorRecommendations(query: string): Promise<string> {
    // চেইন ইনিশিয়ালাইজড কিনা চেক
    if (!this.conversationChain) {
      throw new Error('LangChain not initialized. Please set API keys first.');
    }

    try {
      // ডাক্তার রেকমেন্ডেশনের জন্য প্রম্পট তৈরি
      const prompt = `Based on the following query about medical needs, recommend appropriate medical specializations or doctor types in Bangladesh context:

Query: "${query}"

Provide recommendations for:
1. What type of specialist doctor should be consulted
2. What medical specialization is most relevant
3. Any specific expertise needed

Respond in a concise manner focusing on the medical specialization names in both Bengali and English.`;

      // AI থেকে ডাক্তার রেকমেন্ডেশন পাওয়া
      const response = await this.conversationChain.call({ input: prompt });
      return response.response || response.text || 'কার্ডিওলজি, গাইনোকোলজি, অর্থোপেডিক্স';
    } catch (error) {
      console.error('Doctor recommendation error:', error);
      // এরর হলে ডিফল্ট রেকমেন্ডেশন রিটার্ন
      return 'সাধারণ চিকিৎসক, কার্ডিওলজি, গাইনোকোলজি';
    }
  }

  /**
   * চ্যাট মেমরি ক্লিয়ার করে
   * নতুন কথোপকথন শুরুর জন্য পুরাতন হিস্টরি মুছে ফেলে
   */
  clearMemory() {
    this.memory.clear();
  }

  /**
   * সার্ভিস ইনিশিয়ালাইজড কিনা চেক করে
   * @returns true যদি কোন AI মডেল সেটআপ থাকে
   */
  isInitialized(): boolean {
    return this.openaiModel !== null || this.geminiModel !== null;
  }

  /**
   * উপলব্ধ AI মডেলের তালিকা রিটার্ন করে
   * @returns সেটআপ করা মডেলের নামের অ্যারে
   */
  getAvailableModels(): string[] {
    const models = [];
    if (this.openaiModel) models.push('OpenAI GPT'); // OpenAI মডেল চেক
    if (this.geminiModel) models.push('Google Gemini'); // Gemini মডেল চেক
    return models;
  }

  /**
   * সফল AI response Redis এ cache করে
   * Performance optimization এবং cost reduction এর জন্য
   * @param prompt - ব্যবহারকারীর প্রশ্ন
   * @param response - AI এর উত্তর
   * @param language - ভাষা
   * @param userId - ব্যবহারকারীর ID (optional)
   * @param sessionId - সেশন ID (optional)
   */
  private async cacheSuccessfulResponse(
    prompt: string,
    response: string,
    language: Language,
    userId?: string,
    sessionId?: string
  ): Promise<void> {
    try {
      // 💾 Semantic cache এ store করা
      await redisCacheService.setSemanticCache(prompt, response, {
        model: this.openaiModel ? 'openai' : 'gemini',
        type: 'medical_advice',
        language,
        userId,
        sessionId,
      });

      // 🧠 Session memory এ store করা (যদি sessionId থাকে)
      if (sessionId) {
        await redisMemoryService.addMessage(
          sessionId,
          new HumanMessage(prompt)
        );
        await redisMemoryService.addMessage(
          sessionId,
          new AIMessage(response)
        );

        // Conversation context update করা
        const context = await redisMemoryService.getConversationContext(sessionId) || {
          extractedSymptoms: [],
          suggestedMedicines: [],
          recommendedDoctors: [],
          followUpQuestions: [],
        };

        // Extract symptoms from prompt (simple keyword matching)
        const symptomKeywords = [
          'জ্বর', 'fever', 'ব্যথা', 'pain', 'মাথাব্যথা', 'headache',
          'পেটব্যথা', 'stomach pain', 'কাশি', 'cough', 'সর্দি', 'cold',
          'শ্বাসকষ্ট', 'breathing difficulty', 'বমি', 'vomiting'
        ];

        const extractedSymptoms = symptomKeywords.filter(keyword => 
          prompt.toLowerCase().includes(keyword.toLowerCase())
        );

        if (extractedSymptoms.length > 0) {
          context.extractedSymptoms = [...new Set([...context.extractedSymptoms, ...extractedSymptoms])];
        }

        await redisMemoryService.updateConversationContext(sessionId, context);
      }

      // 📊 Vector database এ store করা (semantic search এর জন্য)
      await redisVectorService.addDocuments([{
        id: `conversation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: `User: ${prompt}\nAI: ${response}`,
        type: 'general',
        metadata: {
          category: 'medical_conversation',
          language,
          userId,
          sessionId,
          timestamp: Date.now(),
          source: 'langchain_ai',
        },
      }]);

      console.log('💾 Successfully cached AI response in Redis');
    } catch (cacheError) {
      console.warn('⚠️ Failed to cache response in Redis:', cacheError);
      // Cache error shouldn't affect the main response
    }
  }

  /**
   * Redis integration status চেক করে
   * @returns Redis services এর status
   */
  getRedisStatus(): {
    cache: boolean;
    memory: boolean;
    vector: boolean;
  } {
    return {
      cache: redisCacheService.isReady(),
      memory: redisMemoryService.isReady(),
      vector: redisVectorService.isReady(),
    };
  }

  /**
   * Performance metrics পাওয়ার জন্য
   * @returns Cache এবং memory statistics
   */
  async getPerformanceMetrics(): Promise<{
    cacheStats: any;
    memoryStats: any;
    vectorStats: any;
  }> {
    try {
      const [cacheStats, memoryStats, vectorStats] = await Promise.all([
        redisCacheService.getCacheStats(),
        redisMemoryService.getMemoryStats(),
        redisVectorService.getStats(),
      ]);

      return {
        cacheStats,
        memoryStats,
        vectorStats,
      };
    } catch (error) {
      console.error('Failed to get performance metrics:', error);
      return {
        cacheStats: null,
        memoryStats: null,
        vectorStats: null,
      };
    }
  }
}

// LangChain সার্ভিসের সিঙ্গেলটন ইনস্ট্যান্স এক্সপোর্ট
// এটি পুরো অ্যাপ্লিকেশনে একটি মাত্র ইনস্ট্যান্স ব্যবহার নিশ্চিত করে
export default new LangChainService();