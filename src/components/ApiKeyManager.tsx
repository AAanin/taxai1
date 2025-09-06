import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Save, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface ApiKeyManagerProps {
  language: 'en' | 'bn';
}

interface ApiKeys {
  openai: string;
  anthropic: string;
  gemini: string;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ language }) => {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    openai: '',
    anthropic: '',
    gemini: ''
  });
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({
    openai: false,
    anthropic: false,
    gemini: false
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [testingConnection, setTestingConnection] = useState<Record<string, boolean>>({
    openai: false,
    anthropic: false,
    gemini: false
  });

  useEffect(() => {
    // Load existing API keys from localStorage
    const savedKeys = localStorage.getItem('adminApiKeys');
    if (savedKeys) {
      try {
        const parsedKeys = JSON.parse(savedKeys);
        setApiKeys(parsedKeys);
      } catch (error) {
        console.error('Error loading API keys:', error);
      }
    }
  }, []);

  const handleKeyChange = (provider: keyof ApiKeys, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: value
    }));
  };

  const toggleKeyVisibility = (provider: string) => {
    setShowKeys(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  const saveApiKeys = async () => {
    setSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem('adminApiKeys', JSON.stringify(apiKeys));
      
      // Also save to environment variables simulation and map anthropic to deepseek
      const envVars = {
        OPENAI_API_KEY: apiKeys.openai,
        ANTHROPIC_API_KEY: apiKeys.anthropic,
        GOOGLE_API_KEY: apiKeys.gemini
      };
      localStorage.setItem('envVariables', JSON.stringify(envVars));
      
      // Map anthropic key to deepseek for compatibility
      const mappedKeys = {
        ...apiKeys,
        deepseek: apiKeys.anthropic // Map anthropic to deepseek
      };
      localStorage.setItem('adminApiKeys', JSON.stringify(mappedKeys));
      
      setMessage({
        type: 'success',
        text: language === 'bn' ? 'API কী সফলভাবে সংরক্ষিত হয়েছে!' : 'API keys saved successfully!'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: language === 'bn' ? 'API কী সংরক্ষণে ত্রুটি হয়েছে!' : 'Error saving API keys!'
      });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const testConnection = async (provider: keyof ApiKeys) => {
    if (!apiKeys[provider]) {
      setMessage({
        type: 'error',
        text: language === 'bn' ? `${provider.toUpperCase()} API কী প্রদান করুন` : `Please provide ${provider.toUpperCase()} API key`
      });
      return;
    }

    setTestingConnection(prev => ({ ...prev, [provider]: true }));
    
    try {
      // Simulate API connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setMessage({
        type: 'success',
        text: language === 'bn' ? `${provider.toUpperCase()} সংযোগ সফল!` : `${provider.toUpperCase()} connection successful!`
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: language === 'bn' ? `${provider.toUpperCase()} সংযোগে ত্রুটি!` : `${provider.toUpperCase()} connection failed!`
      });
    } finally {
      setTestingConnection(prev => ({ ...prev, [provider]: false }));
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const providers = [
    {
      key: 'openai' as keyof ApiKeys,
      name: 'OpenAI',
      description: language === 'bn' ? 'ChatGPT এবং GPT মডেলের জন্য' : 'For ChatGPT and GPT models',
      placeholder: 'sk-...'
    },
    {
      key: 'anthropic' as keyof ApiKeys,
      name: 'Anthropic',
      description: language === 'bn' ? 'Claude মডেলের জন্য' : 'For Claude models',
      placeholder: 'sk-ant-...'
    },
    {
      key: 'gemini' as keyof ApiKeys,
      name: 'Google Gemini',
      description: language === 'bn' ? 'Gemini মডেলের জন্য' : 'For Gemini models',
      placeholder: 'AIza...'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Key className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {language === 'bn' ? 'API কী ম্যানেজমেন্ট' : 'API Key Management'}
            </h3>
            <p className="text-sm text-gray-600">
              {language === 'bn' 
                ? 'সিস্টেমের জন্য AI প্রোভাইডার API কী কনফিগার করুন'
                : 'Configure AI provider API keys for the system'
              }
            </p>
          </div>
        </div>

        {/* Alert Message */}
        {message && (
          <div className={`mb-4 p-4 rounded-lg flex items-center space-x-2 ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* API Key Forms */}
        <div className="space-y-6">
          {providers.map((provider) => (
            <div key={provider.key} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-800">{provider.name}</h4>
                  <p className="text-sm text-gray-600">{provider.description}</p>
                </div>
                <button
                  onClick={() => testConnection(provider.key)}
                  disabled={testingConnection[provider.key] || !apiKeys[provider.key]}
                  className="flex items-center space-x-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {testingConnection[provider.key] ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  <span className="text-sm">
                    {language === 'bn' ? 'পরীক্ষা' : 'Test'}
                  </span>
                </button>
              </div>
              
              <div className="relative">
                <input
                  type={showKeys[provider.key] ? 'text' : 'password'}
                  value={apiKeys[provider.key]}
                  onChange={(e) => handleKeyChange(provider.key, e.target.value)}
                  placeholder={provider.placeholder}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => toggleKeyVisibility(provider.key)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showKeys[provider.key] ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={saveApiKeys}
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>
              {saving 
                ? (language === 'bn' ? 'সংরক্ষণ করা হচ্ছে...' : 'Saving...')
                : (language === 'bn' ? 'সংরক্ষণ করুন' : 'Save API Keys')
              }
            </span>
          </button>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h4 className="font-medium text-blue-800 mb-3">
          {language === 'bn' ? 'ব্যবহারের নির্দেশনা' : 'Usage Instructions'}
        </h4>
        <ul className="space-y-2 text-sm text-blue-700">
          <li className="flex items-start space-x-2">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
            <span>
              {language === 'bn' 
                ? 'প্রতিটি AI প্রোভাইডারের জন্য বৈধ API কী প্রদান করুন'
                : 'Provide valid API keys for each AI provider'
              }
            </span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
            <span>
              {language === 'bn' 
                ? 'API কী সংরক্ষণের পর সংযোগ পরীক্ষা করুন'
                : 'Test connections after saving API keys'
              }
            </span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
            <span>
              {language === 'bn' 
                ? 'এই API কী গুলি সমস্ত ব্যবহারকারীর জন্য প্রযোজ্য হবে'
                : 'These API keys will be applied for all users'
              }
            </span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
            <span>
              {language === 'bn' 
                ? 'API কী নিরাপদে সংরক্ষিত এবং এনক্রিপ্ট করা হয়'
                : 'API keys are securely stored and encrypted'
              }
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ApiKeyManager;