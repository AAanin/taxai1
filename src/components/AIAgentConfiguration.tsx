import React, { useState, useEffect } from 'react';
import { Settings, Key, Globe, Cpu, Sliders, Save, X, Plus, Trash2, Eye, EyeOff, Copy, Check, AlertTriangle, Info, Lock, Unlock } from 'lucide-react';

interface AIModel {
  id: string;
  name: string;
  provider: string;
  maxTokens: number;
  costPer1kTokens: number;
  capabilities: string[];
}

interface APIConfiguration {
  id: string;
  name: string;
  provider: string;
  apiKey: string;
  endpoint: string;
  isActive: boolean;
  rateLimit: number;
  timeout: number;
  retryAttempts: number;
  headers: Record<string, string>;
}

interface ModelParameters {
  temperature: number;
  topP: number;
  topK: number;
  frequencyPenalty: number;
  presencePenalty: number;
  maxTokens: number;
  stopSequences: string[];
  systemPrompt: string;
}

interface AgentConfiguration {
  id: string;
  agentId: string;
  agentName: string;
  modelId: string;
  apiConfigId: string;
  parameters: ModelParameters;
  isActive: boolean;
  lastModified: string;
  modifiedBy: string;
}

interface AIAgentConfigurationProps {
  language: 'en' | 'bn';
  agentId?: string;
}

const AIAgentConfiguration: React.FC<AIAgentConfigurationProps> = ({ language, agentId }) => {
  const [configurations, setConfigurations] = useState<AgentConfiguration[]>([]);
  const [apiConfigs, setApiConfigs] = useState<APIConfiguration[]>([]);
  const [models, setModels] = useState<AIModel[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<AgentConfiguration | null>(null);
  const [showApiModal, setShowApiModal] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'api' | 'models' | 'parameters'>('general');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const translations = {
    en: {
      title: 'AI Agent Configuration',
      generalSettings: 'General Settings',
      apiConfiguration: 'API Configuration',
      modelSettings: 'Model Settings',
      parameters: 'Parameters',
      agentName: 'Agent Name',
      model: 'Model',
      apiConfig: 'API Configuration',
      status: 'Status',
      active: 'Active',
      inactive: 'Inactive',
      lastModified: 'Last Modified',
      modifiedBy: 'Modified By',
      actions: 'Actions',
      edit: 'Edit',
      delete: 'Delete',
      save: 'Save',
      cancel: 'Cancel',
      add: 'Add',
      addNew: 'Add New',
      addApiConfig: 'Add API Configuration',
      addModel: 'Add Model',
      addConfiguration: 'Add Configuration',
      name: 'Name',
      provider: 'Provider',
      apiKey: 'API Key',
      endpoint: 'Endpoint',
      rateLimit: 'Rate Limit',
      timeout: 'Timeout',
      retryAttempts: 'Retry Attempts',
      headers: 'Headers',
      maxTokens: 'Max Tokens',
      costPer1kTokens: 'Cost per 1K Tokens',
      capabilities: 'Capabilities',
      temperature: 'Temperature',
      topP: 'Top P',
      topK: 'Top K',
      frequencyPenalty: 'Frequency Penalty',
      presencePenalty: 'Presence Penalty',
      stopSequences: 'Stop Sequences',
      systemPrompt: 'System Prompt',
      showApiKey: 'Show API Key',
      hideApiKey: 'Hide API Key',
      copyApiKey: 'Copy API Key',
      copied: 'Copied!',
      requestsPerMinute: 'requests/min',
      milliseconds: 'ms',
      attempts: 'attempts',
      dollars: '$',
      loading: 'Loading...',
      saved: 'Configuration saved successfully',
      deleted: 'Configuration deleted successfully',
      error: 'An error occurred',
      invalidInput: 'Please fill in all required fields',
      confirmDelete: 'Are you sure you want to delete this configuration?',
      noConfigurations: 'No configurations found',
      testConnection: 'Test Connection',
      connectionSuccessful: 'Connection successful',
      connectionFailed: 'Connection failed',
      securityNote: 'Security Note',
      apiKeyWarning: 'API keys are encrypted and stored securely. Never share your API keys.',
      parameterHelp: 'Parameter Help',
      temperatureHelp: 'Controls randomness (0.0-2.0). Lower values make output more focused.',
      topPHelp: 'Controls diversity via nucleus sampling (0.0-1.0).',
      frequencyPenaltyHelp: 'Reduces repetition of tokens based on frequency.',
      presencePenaltyHelp: 'Reduces repetition of tokens based on presence.',
      backup: 'Backup Configuration',
      restore: 'Restore Configuration',
      export: 'Export',
      import: 'Import'
    },
    bn: {
      title: 'AI এজেন্ট কনফিগারেশন',
      generalSettings: 'সাধারণ সেটিংস',
      apiConfiguration: 'API কনফিগারেশন',
      modelSettings: 'মডেল সেটিংস',
      parameters: 'প্যারামিটার',
      agentName: 'এজেন্টের নাম',
      model: 'মডেল',
      apiConfig: 'API কনফিগারেশন',
      status: 'স্ট্যাটাস',
      active: 'সক্রিয়',
      inactive: 'নিষ্ক্রিয়',
      lastModified: 'শেষ পরিবর্তন',
      modifiedBy: 'পরিবর্তনকারী',
      actions: 'কার্যক্রম',
      edit: 'সম্পাদনা',
      delete: 'মুছুন',
      save: 'সংরক্ষণ',
      cancel: 'বাতিল',
      add: 'যোগ করুন',
      addNew: 'নতুন যোগ করুন',
      addApiConfig: 'API কনফিগারেশন যোগ করুন',
      addModel: 'মডেল যোগ করুন',
      addConfiguration: 'কনফিগারেশন যোগ করুন',
      name: 'নাম',
      provider: 'প্রদানকারী',
      apiKey: 'API কী',
      endpoint: 'এন্ডপয়েন্ট',
      rateLimit: 'রেট লিমিট',
      timeout: 'টাইমআউট',
      retryAttempts: 'পুনঃচেষ্টা',
      headers: 'হেডার',
      maxTokens: 'সর্বোচ্চ টোকেন',
      costPer1kTokens: '১হাজার টোকেনের খরচ',
      capabilities: 'ক্ষমতা',
      temperature: 'টেম্পারেচার',
      topP: 'টপ পি',
      topK: 'টপ কে',
      frequencyPenalty: 'ফ্রিকোয়েন্সি পেনাল্টি',
      presencePenalty: 'প্রেজেন্স পেনাল্টি',
      stopSequences: 'স্টপ সিকোয়েন্স',
      systemPrompt: 'সিস্টেম প্রম্পট',
      showApiKey: 'API কী দেখান',
      hideApiKey: 'API কী লুকান',
      copyApiKey: 'API কী কপি করুন',
      copied: 'কপি হয়েছে!',
      requestsPerMinute: 'অনুরোধ/মিনিট',
      milliseconds: 'মিলিসেকেন্ড',
      attempts: 'চেষ্টা',
      dollars: '$',
      loading: 'লোড হচ্ছে...',
      saved: 'কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে',
      deleted: 'কনফিগারেশন সফলভাবে মুছে ফেলা হয়েছে',
      error: 'একটি ত্রুটি ঘটেছে',
      invalidInput: 'অনুগ্রহ করে সমস্ত প্রয়োজনীয় ক্ষেত্র পূরণ করুন',
      confirmDelete: 'আপনি কি এই কনফিগারেশনটি মুছে ফেলতে চান?',
      noConfigurations: 'কোন কনফিগারেশন পাওয়া যায়নি',
      testConnection: 'সংযোগ পরীক্ষা',
      connectionSuccessful: 'সংযোগ সফল',
      connectionFailed: 'সংযোগ ব্যর্থ',
      securityNote: 'নিরাপত্তা নোট',
      apiKeyWarning: 'API কীগুলি এনক্রিপ্ট করা এবং নিরাপদে সংরক্ষিত। আপনার API কী কখনো শেয়ার করবেন না।',
      parameterHelp: 'প্যারামিটার সাহায্য',
      temperatureHelp: 'র্যান্ডমনেস নিয়ন্ত্রণ করে (০.০-২.০)। কম মান আউটপুটকে আরো ফোকাসড করে।',
      topPHelp: 'নিউক্লিয়াস স্যাম্পলিং এর মাধ্যমে বৈচিত্র্য নিয়ন্ত্রণ করে (০.০-১.০)।',
      frequencyPenaltyHelp: 'ফ্রিকোয়েন্সির ভিত্তিতে টোকেনের পুনরাবৃত্তি কমায়।',
      presencePenaltyHelp: 'উপস্থিতির ভিত্তিতে টোকেনের পুনরাবৃত্তি কমায়।',
      backup: 'কনফিগারেশন ব্যাকআপ',
      restore: 'কনফিগারেশন পুনরুদ্ধার',
      export: 'এক্সপোর্ট',
      import: 'ইমপোর্ট'
    }
  };

  const t = translations[language];

  // Sample data
  useEffect(() => {
    const sampleModels: AIModel[] = [
      {
        id: '1',
        name: 'GPT-4 Turbo',
        provider: 'OpenAI',
        maxTokens: 128000,
        costPer1kTokens: 0.01,
        capabilities: ['text', 'code', 'analysis']
      },
      {
        id: '2',
        name: 'Claude 3 Opus',
        provider: 'Anthropic',
        maxTokens: 200000,
        costPer1kTokens: 0.015,
        capabilities: ['text', 'code', 'analysis', 'reasoning']
      },
      {
        id: '3',
        name: 'Gemini Pro',
        provider: 'Google',
        maxTokens: 32000,
        costPer1kTokens: 0.0005,
        capabilities: ['text', 'multimodal']
      }
    ];

    const sampleApiConfigs: APIConfiguration[] = [
      {
        id: '1',
        name: 'OpenAI Production',
        provider: 'OpenAI',
        apiKey: 'sk-*********************',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        isActive: true,
        rateLimit: 3500,
        timeout: 30000,
        retryAttempts: 3,
        headers: { 'Content-Type': 'application/json' }
      },
      {
        id: '2',
        name: 'Anthropic Production',
        provider: 'Anthropic',
        apiKey: 'sk-ant-*********************',
        endpoint: 'https://api.anthropic.com/v1/messages',
        isActive: true,
        rateLimit: 1000,
        timeout: 60000,
        retryAttempts: 2,
        headers: { 'Content-Type': 'application/json', 'anthropic-version': '2023-06-01' }
      }
    ];

    const sampleConfigurations: AgentConfiguration[] = [
      {
        id: '1',
        agentId: '1',
        agentName: 'Dr. Mimu Medical Assistant',
        modelId: '1',
        apiConfigId: '1',
        parameters: {
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          frequencyPenalty: 0.0,
          presencePenalty: 0.0,
          maxTokens: 4096,
          stopSequences: [],
          systemPrompt: 'You are a medical AI assistant specialized in providing accurate medical information and guidance.'
        },
        isActive: true,
        lastModified: '2024-01-20T10:30:00Z',
        modifiedBy: 'Admin'
      },
      {
        id: '2',
        agentId: '2',
        agentName: 'Legal Advisor Bot',
        modelId: '2',
        apiConfigId: '2',
        parameters: {
          temperature: 0.3,
          topP: 0.8,
          topK: 20,
          frequencyPenalty: 0.1,
          presencePenalty: 0.1,
          maxTokens: 8192,
          stopSequences: ['\n\n---\n\n'],
          systemPrompt: 'You are a legal AI assistant providing accurate legal information and guidance.'
        },
        isActive: true,
        lastModified: '2024-01-19T14:15:00Z',
        modifiedBy: 'Legal Team'
      }
    ];

    setModels(sampleModels);
    setApiConfigs(sampleApiConfigs);
    setConfigurations(sampleConfigurations);
  }, []);

  const handleSaveConfiguration = async (config: AgentConfiguration) => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (config.id) {
        setConfigurations(prev => prev.map(c => c.id === config.id ? config : c));
      } else {
        const newConfig = { ...config, id: Date.now().toString() };
        setConfigurations(prev => [...prev, newConfig]);
      }
      
      setSuccess(t.saved);
      setShowConfigModal(false);
    } catch (err) {
      setError(t.error);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 3000);
    }
  };

  const handleDeleteConfiguration = async (id: string) => {
    if (!window.confirm(t.confirmDelete)) return;
    
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setConfigurations(prev => prev.filter(c => c.id !== id));
      setSuccess(t.deleted);
    } catch (err) {
      setError(t.error);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 3000);
    }
  };

  const toggleApiKeyVisibility = (id: string) => {
    setShowApiKey(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(id);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getModelName = (modelId: string) => {
    const model = models.find(m => m.id === modelId);
    return model ? model.name : 'Unknown Model';
  };

  const getApiConfigName = (apiConfigId: string) => {
    const apiConfig = apiConfigs.find(a => a.id === apiConfigId);
    return apiConfig ? apiConfig.name : 'Unknown API Config';
  };

  const maskApiKey = (apiKey: string) => {
    if (apiKey.length <= 8) return '*'.repeat(apiKey.length);
    return apiKey.substring(0, 4) + '*'.repeat(apiKey.length - 8) + apiKey.substring(apiKey.length - 4);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Settings className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowConfigModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>{t.addConfiguration}</span>
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'general', label: t.generalSettings, icon: Settings },
            { id: 'api', label: t.apiConfiguration, icon: Key },
            { id: 'models', label: t.modelSettings, icon: Cpu },
            { id: 'parameters', label: t.parameters, icon: Sliders }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          {/* Configurations Table */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">{t.generalSettings}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.agentName}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.model}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.apiConfig}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.status}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.lastModified}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t.actions}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {configurations.map((config) => (
                    <tr key={config.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{config.agentName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getModelName(config.modelId)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getApiConfigName(config.apiConfigId)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          config.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {config.isActive ? t.active : t.inactive}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{new Date(config.lastModified).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-400">{config.modifiedBy}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedConfig(config);
                              setShowConfigModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            {t.edit}
                          </button>
                          <button
                            onClick={() => handleDeleteConfiguration(config.id)}
                            className="text-red-600 hover:text-red-900"
                            disabled={isLoading}
                          >
                            {t.delete}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'api' && (
        <div className="space-y-6">
          {/* Security Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Lock className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">{t.securityNote}</h4>
                <p className="text-sm text-yellow-700 mt-1">{t.apiKeyWarning}</p>
              </div>
            </div>
          </div>

          {/* API Configurations */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">{t.apiConfiguration}</h3>
              <button
                onClick={() => setShowApiModal(true)}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors flex items-center space-x-1"
              >
                <Plus className="h-3 w-3" />
                <span>{t.addApiConfig}</span>
              </button>
            </div>
            <div className="divide-y divide-gray-200">
              {apiConfigs.map((config) => (
                <div key={config.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-medium text-gray-900">{config.name}</h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        config.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {config.isActive ? t.active : t.inactive}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">{t.testConnection}</button>
                      <button className="text-red-600 hover:text-red-800 text-sm">{t.delete}</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t.provider}</label>
                      <div className="text-sm text-gray-900">{config.provider}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t.endpoint}</label>
                      <div className="text-sm text-gray-900 truncate">{config.endpoint}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t.apiKey}</label>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900 font-mono">
                          {showApiKey[config.id] ? config.apiKey : maskApiKey(config.apiKey)}
                        </span>
                        <button
                          onClick={() => toggleApiKeyVisibility(config.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {showApiKey[config.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(config.apiKey, config.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {copySuccess === config.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t.rateLimit}</label>
                      <div className="text-sm text-gray-900">{config.rateLimit} {t.requestsPerMinute}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t.timeout}</label>
                      <div className="text-sm text-gray-900">{config.timeout} {t.milliseconds}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t.retryAttempts}</label>
                      <div className="text-sm text-gray-900">{config.retryAttempts} {t.attempts}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'models' && (
        <div className="space-y-6">
          {/* Models */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">{t.modelSettings}</h3>
              <button
                onClick={() => setShowModelModal(true)}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors flex items-center space-x-1"
              >
                <Plus className="h-3 w-3" />
                <span>{t.addModel}</span>
              </button>
            </div>
            <div className="divide-y divide-gray-200">
              {models.map((model) => (
                <div key={model.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900">{model.name}</h4>
                    <button className="text-red-600 hover:text-red-800 text-sm">{t.delete}</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t.provider}</label>
                      <div className="text-sm text-gray-900">{model.provider}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t.maxTokens}</label>
                      <div className="text-sm text-gray-900">{model.maxTokens.toLocaleString()}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t.costPer1kTokens}</label>
                      <div className="text-sm text-gray-900">{t.dollars}{model.costPer1kTokens}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t.capabilities}</label>
                      <div className="flex flex-wrap gap-1">
                        {model.capabilities.map((capability, index) => (
                          <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                            {capability}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'parameters' && (
        <div className="space-y-6">
          {/* Parameter Help */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-800">{t.parameterHelp}</h4>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li><strong>{t.temperature}:</strong> {t.temperatureHelp}</li>
                  <li><strong>{t.topP}:</strong> {t.topPHelp}</li>
                  <li><strong>{t.frequencyPenalty}:</strong> {t.frequencyPenaltyHelp}</li>
                  <li><strong>{t.presencePenalty}:</strong> {t.presencePenaltyHelp}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Parameters for each configuration */}
          <div className="space-y-4">
            {configurations.map((config) => (
              <div key={config.id} className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{config.agentName}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.temperature}</label>
                    <input
                      type="number"
                      min="0"
                      max="2"
                      step="0.1"
                      value={config.parameters.temperature}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.topP}</label>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={config.parameters.topP}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.maxTokens}</label>
                    <input
                      type="number"
                      value={config.parameters.maxTokens}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.frequencyPenalty}</label>
                    <input
                      type="number"
                      min="-2"
                      max="2"
                      step="0.1"
                      value={config.parameters.frequencyPenalty}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.presencePenalty}</label>
                    <input
                      type="number"
                      min="-2"
                      max="2"
                      step="0.1"
                      value={config.parameters.presencePenalty}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      readOnly
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.systemPrompt}</label>
                  <textarea
                    value={config.parameters.systemPrompt}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    readOnly
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No configurations message */}
      {configurations.length === 0 && (
        <div className="text-center py-12">
          <Settings className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">{t.noConfigurations}</h3>
        </div>
      )}
    </div>
  );
};

export default AIAgentConfiguration;