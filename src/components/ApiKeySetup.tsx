import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useMedicalAI } from '../hooks/useMedicalAI';
import { Language } from '../types';

interface ApiKeySetupProps {
  language: Language;
  onClose: () => void;
}

const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ language, onClose }) => {
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [deepseekKey, setDeepseekKey] = useState('');
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [showDeepseekKey, setShowDeepseekKey] = useState(false);
  const [savedKeys, setSavedKeys] = useState({ gemini: false, openai: false, deepseek: false });
  const { setApiKeys, getAvailableProviders } = useMedicalAI();

  useEffect(() => {
    // Check if keys are already set
    const providers = getAvailableProviders();
    setSavedKeys({
      gemini: providers.includes('Gemini'),
      openai: providers.includes('OpenAI GPT'),
      deepseek: providers.includes('DeepSeek')
    });
  }, [getAvailableProviders]);

  const handleSaveKeys = () => {
    if (geminiKey.trim() || openaiKey.trim() || deepseekKey.trim()) {
      setApiKeys(geminiKey.trim() || undefined, openaiKey.trim() || undefined, deepseekKey.trim() || undefined);
      
      if (geminiKey.trim()) {
        setSavedKeys(prev => ({ ...prev, gemini: true }));
      }
      if (openaiKey.trim()) {
        setSavedKeys(prev => ({ ...prev, openai: true }));
      }
      if (deepseekKey.trim()) {
        setSavedKeys(prev => ({ ...prev, deepseek: true }));
      }
    }
    
    // Clear input fields after saving
    setGeminiKey('');
    setOpenaiKey('');
    setDeepseekKey('');
  };

  const texts = {
    bn: {
      title: 'AI API কী সেটআপ',
      description: 'ডা.মিমু ব্যবহার করতে অনুগ্রহ করে আপনার AI API কী প্রদান করুন',
      geminiLabel: 'Google Gemini API কী',
      openaiLabel: 'OpenAI API কী',
      deepseekLabel: 'DeepSeek API কী',
      geminiPlaceholder: 'আপনার Gemini API কী এখানে লিখুন',
      openaiPlaceholder: 'আপনার OpenAI API কী এখানে লিখুন',
      deepseekPlaceholder: 'আপনার DeepSeek API কী এখানে লিখুন',
      saveButton: 'সংরক্ষণ করুন',
      closeButton: 'বন্ধ করুন',
      note: 'নোট: API কী শুধুমাত্র আপনার ব্রাউজারে সংরক্ষিত হবে এবং কোথাও পাঠানো হবে না।',
      getGeminiKey: 'Gemini API কী পেতে',
      getOpenaiKey: 'OpenAI API কী পেতে',
      getDeepseekKey: 'DeepSeek API কী পেতে',
      clickHere: 'এখানে ক্লিক করুন',
      keySet: 'সেট করা হয়েছে',
      optional: '(ঐচ্ছিক - অন্তত একটি প্রয়োজন)'
    },
    en: {
      title: 'AI API Key Setup',
      description: 'Please provide your AI API keys to use Dr.Mimu',
      geminiLabel: 'Google Gemini API Key',
      openaiLabel: 'OpenAI API Key',
      deepseekLabel: 'DeepSeek API Key',
      geminiPlaceholder: 'Enter your Gemini API key here',
      openaiPlaceholder: 'Enter your OpenAI API key here',
      deepseekPlaceholder: 'Enter your DeepSeek API key here',
      saveButton: 'Save Keys',
      closeButton: 'Close',
      note: 'Note: API keys are stored only in your browser and are not sent anywhere.',
      getGeminiKey: 'To get Gemini API key',
      getOpenaiKey: 'To get OpenAI API key',
      getDeepseekKey: 'To get DeepSeek API key',
      clickHere: 'click here',
      keySet: 'Key Set',
      optional: '(Optional - at least one required)'
    }
  };

  const t = texts[language];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center space-x-2 mb-4">
          <Key className="w-6 h-6 text-blue-500" />
          <h2 className={`text-xl font-bold text-gray-800 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
            {t.title}
          </h2>
        </div>
        
        <p className={`text-gray-600 mb-6 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
          {t.description}
        </p>

        <div className="space-y-4">
          {/* Gemini API Key */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`block text-sm font-medium text-gray-700 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                {t.geminiLabel} {t.optional}
              </label>
              {savedKeys.gemini && (
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs">{t.keySet}</span>
                </div>
              )}
            </div>
            <div className="relative">
              <input
                type={showGeminiKey ? 'text' : 'password'}
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder={t.geminiPlaceholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowGeminiKey(!showGeminiKey)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className={`text-xs text-gray-500 mt-1 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
              {t.getGeminiKey}{' '}
              <a 
                href="https://makersuite.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {t.clickHere}
              </a>
            </p>
          </div>

          {/* OpenAI API Key */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`block text-sm font-medium text-gray-700 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                {t.openaiLabel} {t.optional}
              </label>
              {savedKeys.openai && (
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs">{t.keySet}</span>
                </div>
              )}
            </div>
            <div className="relative">
              <input
                type={showOpenaiKey ? 'text' : 'password'}
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder={t.openaiPlaceholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showOpenaiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className={`text-xs text-gray-500 mt-1 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
              {t.getOpenaiKey}{' '}
              <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {t.clickHere}
              </a>
            </p>
          </div>

          {/* DeepSeek API Key */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`block text-sm font-medium text-gray-700 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
                {t.deepseekLabel} {t.optional}
              </label>
              {savedKeys.deepseek && (
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs">{t.keySet}</span>
                </div>
              )}
            </div>
            <div className="relative">
              <input
                type={showDeepseekKey ? 'text' : 'password'}
                value={deepseekKey}
                onChange={(e) => setDeepseekKey(e.target.value)}
                placeholder={t.deepseekPlaceholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowDeepseekKey(!showDeepseekKey)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showDeepseekKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className={`text-xs text-gray-500 mt-1 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
              {t.getDeepseekKey}{' '}
              <a 
                href="https://platform.deepseek.com/api_keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {t.clickHere}
              </a>
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-2 mt-4 p-3 bg-yellow-50 rounded-md">
          <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <p className={`text-xs text-yellow-800 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}>
            {t.note}
          </p>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleSaveKeys}
            disabled={!geminiKey.trim() && !openaiKey.trim() && !deepseekKey.trim()}
            className={`flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-md transition-colors duration-200 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}
          >
            {t.saveButton}
          </button>
          <button
            onClick={onClose}
            className={`flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition-colors duration-200 ${language === 'bn' ? 'bangla-text' : 'english-text'}`}
          >
            {t.closeButton}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeySetup;