// API key initialization from environment variables
import medicalAIService from './services/medicalAIService';

// Initialize API keys from environment variables
const initializeApiKeys = () => {
  // Get API keys from environment variables
  const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
  const deepseekApiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || '';
  
  // Set API keys if available
  if (geminiApiKey || openaiApiKey || deepseekApiKey) {
    medicalAIService.setApiKeys(geminiApiKey, openaiApiKey, deepseekApiKey);
    
    console.log('API keys initialized successfully!');
    console.log('Available providers:', medicalAIService.getAvailableProviders());
    
    // Log which APIs are available
    if (geminiApiKey) {
      console.log('✅ Google Gemini API enabled');
    } else {
      console.log('❌ Google Gemini API key not found in environment');
    }
    
    if (openaiApiKey) {
      console.log('✅ OpenAI API enabled');
    } else {
      console.log('❌ OpenAI API key not found in environment');
    }
    
    if (deepseekApiKey) {
      console.log('✅ DeepSeek API enabled');
    } else {
      console.log('❌ DeepSeek API key not found in environment');
    }
  } else {
    console.warn('⚠️ No API keys found in environment variables');
    console.log('Please add VITE_GEMINI_API_KEY, VITE_OPENAI_API_KEY, and/or VITE_DEEPSEEK_API_KEY to your .env file');
  }
};

export default initializeApiKeys;