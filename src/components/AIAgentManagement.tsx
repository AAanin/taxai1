import React, { useState, useEffect } from 'react';
import { Bot, Settings, Activity, Eye, EyeOff, Play, Pause, RotateCcw, Trash2, Plus, Search, Filter, Download, Upload, AlertTriangle, CheckCircle, XCircle, Clock, Cpu, Memory, Zap, BarChart3, TrendingUp, TrendingDown, RefreshCw, Database, Key, Globe, MessageSquare, Users, Calendar, FileText, Shield, Lock } from 'lucide-react';

interface AIAgent {
  id: string;
  name: string;
  type: 'medical' | 'legal' | 'general' | 'custom';
  model: string;
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  version: string;
  apiKey: string;
  endpoint: string;
  maxTokens: number;
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  systemPrompt: string;
  createdAt: string;
  lastUsed: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  tokensUsed: number;
  cost: number;
  uptime: number;
  errorRate: number;
  description: string;
  tags: string[];
  owner: string;
  permissions: string[];
}

interface AIAgentManagementProps {
  language: 'en' | 'bn';
}

const AIAgentManagement: React.FC<AIAgentManagementProps> = ({ language }) => {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<AIAgent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<keyof AIAgent>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const translations = {
    en: {
      title: 'AI Agent Management',
      addAgent: 'Add New Agent',
      search: 'Search agents...',
      filter: 'Filter',
      status: 'Status',
      type: 'Type',
      all: 'All',
      active: 'Active',
      inactive: 'Inactive',
      maintenance: 'Maintenance',
      error: 'Error',
      medical: 'Medical',
      legal: 'Legal',
      general: 'General',
      custom: 'Custom',
      name: 'Name',
      model: 'Model',
      version: 'Version',
      lastUsed: 'Last Used',
      requests: 'Requests',
      successRate: 'Success Rate',
      responseTime: 'Avg Response Time',
      actions: 'Actions',
      edit: 'Edit',
      configure: 'Configure',
      logs: 'Logs',
      performance: 'Performance',
      delete: 'Delete',
      enable: 'Enable',
      disable: 'Disable',
      restart: 'Restart',
      agentDetails: 'Agent Details',
      configuration: 'Configuration',
      performanceMetrics: 'Performance Metrics',
      auditLogs: 'Audit Logs',
      apiKey: 'API Key',
      endpoint: 'Endpoint',
      maxTokens: 'Max Tokens',
      temperature: 'Temperature',
      topP: 'Top P',
      frequencyPenalty: 'Frequency Penalty',
      presencePenalty: 'Presence Penalty',
      systemPrompt: 'System Prompt',
      description: 'Description',
      tags: 'Tags',
      owner: 'Owner',
      permissions: 'Permissions',
      totalRequests: 'Total Requests',
      successfulRequests: 'Successful Requests',
      failedRequests: 'Failed Requests',
      tokensUsed: 'Tokens Used',
      cost: 'Cost',
      uptime: 'Uptime',
      errorRate: 'Error Rate',
      save: 'Save',
      cancel: 'Cancel',
      close: 'Close',
      confirm: 'Confirm',
      deleteConfirm: 'Are you sure you want to delete this agent?',
      loading: 'Loading...',
      noAgents: 'No agents found',
      agentAdded: 'Agent added successfully',
      agentUpdated: 'Agent updated successfully',
      agentDeleted: 'Agent deleted successfully',
      agentEnabled: 'Agent enabled successfully',
      agentDisabled: 'Agent disabled successfully',
      agentRestarted: 'Agent restarted successfully',
      errorOccurred: 'An error occurred',
      invalidInput: 'Please fill in all required fields',
      export: 'Export',
      import: 'Import',
      refresh: 'Refresh',
      realTimeMetrics: 'Real-time Metrics',
      cpuUsage: 'CPU Usage',
      memoryUsage: 'Memory Usage',
      networkLatency: 'Network Latency',
      requestsPerMinute: 'Requests/Min',
      errorLogs: 'Error Logs',
      accessLogs: 'Access Logs',
      systemLogs: 'System Logs'
    },
    bn: {
      title: 'এআই এজেন্ট ম্যানেজমেন্ট',
      addAgent: 'নতুন এজেন্ট যোগ করুন',
      search: 'এজেন্ট খুঁজুন...',
      filter: 'ফিল্টার',
      status: 'স্ট্যাটাস',
      type: 'ধরন',
      all: 'সব',
      active: 'সক্রিয়',
      inactive: 'নিষ্ক্রিয়',
      maintenance: 'রক্ষণাবেক্ষণ',
      error: 'ত্রুটি',
      medical: 'চিকিৎসা',
      legal: 'আইনি',
      general: 'সাধারণ',
      custom: 'কাস্টম',
      name: 'নাম',
      model: 'মডেল',
      version: 'সংস্করণ',
      lastUsed: 'শেষ ব্যবহার',
      requests: 'অনুরোধ',
      successRate: 'সফলতার হার',
      responseTime: 'গড় প্রতিক্রিয়ার সময়',
      actions: 'কার্যক্রম',
      edit: 'সম্পাদনা',
      configure: 'কনফিগার',
      logs: 'লগ',
      performance: 'পারফরম্যান্স',
      delete: 'মুছুন',
      enable: 'সক্রিয় করুন',
      disable: 'নিষ্ক্রিয় করুন',
      restart: 'পুনরায় চালু',
      agentDetails: 'এজেন্ট বিবরণ',
      configuration: 'কনফিগারেশন',
      performanceMetrics: 'পারফরম্যান্স মেট্রিক্স',
      auditLogs: 'অডিট লগ',
      apiKey: 'এপিআই কী',
      endpoint: 'এন্ডপয়েন্ট',
      maxTokens: 'সর্বোচ্চ টোকেন',
      temperature: 'টেম্পারেচার',
      topP: 'টপ পি',
      frequencyPenalty: 'ফ্রিকোয়েন্সি পেনাল্টি',
      presencePenalty: 'প্রেজেন্স পেনাল্টি',
      systemPrompt: 'সিস্টেম প্রম্পট',
      description: 'বিবরণ',
      tags: 'ট্যাগ',
      owner: 'মালিক',
      permissions: 'অনুমতি',
      totalRequests: 'মোট অনুরোধ',
      successfulRequests: 'সফল অনুরোধ',
      failedRequests: 'ব্যর্থ অনুরোধ',
      tokensUsed: 'ব্যবহৃত টোকেন',
      cost: 'খরচ',
      uptime: 'আপটাইম',
      errorRate: 'ত্রুটির হার',
      save: 'সংরক্ষণ',
      cancel: 'বাতিল',
      close: 'বন্ধ',
      confirm: 'নিশ্চিত',
      deleteConfirm: 'আপনি কি এই এজেন্টটি মুছে ফেলতে চান?',
      loading: 'লোড হচ্ছে...',
      noAgents: 'কোন এজেন্ট পাওয়া যায়নি',
      agentAdded: 'এজেন্ট সফলভাবে যোগ করা হয়েছে',
      agentUpdated: 'এজেন্ট সফলভাবে আপডেট করা হয়েছে',
      agentDeleted: 'এজেন্ট সফলভাবে মুছে ফেলা হয়েছে',
      agentEnabled: 'এজেন্ট সফলভাবে সক্রিয় করা হয়েছে',
      agentDisabled: 'এজেন্ট সফলভাবে নিষ্ক্রিয় করা হয়েছে',
      agentRestarted: 'এজেন্ট সফলভাবে পুনরায় চালু করা হয়েছে',
      errorOccurred: 'একটি ত্রুটি ঘটেছে',
      invalidInput: 'অনুগ্রহ করে সমস্ত প্রয়োজনীয় ক্ষেত্র পূরণ করুন',
      export: 'এক্সপোর্ট',
      import: 'ইমপোর্ট',
      refresh: 'রিফ্রেশ',
      realTimeMetrics: 'রিয়েল-টাইম মেট্রিক্স',
      cpuUsage: 'সিপিইউ ব্যবহার',
      memoryUsage: 'মেমরি ব্যবহার',
      networkLatency: 'নেটওয়ার্ক লেটেন্সি',
      requestsPerMinute: 'অনুরোধ/মিনিট',
      errorLogs: 'ত্রুটি লগ',
      accessLogs: 'অ্যাক্সেস লগ',
      systemLogs: 'সিস্টেম লগ'
    }
  };

  const t = translations[language];

  // Sample data - in real app, this would come from API
  useEffect(() => {
    const sampleAgents: AIAgent[] = [
      {
        id: '1',
        name: 'Dr. Mimu Medical Assistant',
        type: 'medical',
        model: 'gpt-4-turbo',
        status: 'active',
        version: '2.1.0',
        apiKey: 'sk-*********************',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        maxTokens: 4096,
        temperature: 0.7,
        topP: 0.9,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0,
        systemPrompt: 'You are a medical AI assistant specialized in providing accurate medical information and guidance.',
        createdAt: '2024-01-15T10:30:00Z',
        lastUsed: '2024-01-20T14:25:00Z',
        totalRequests: 15420,
        successfulRequests: 15180,
        failedRequests: 240,
        averageResponseTime: 1.2,
        tokensUsed: 2450000,
        cost: 245.50,
        uptime: 99.2,
        errorRate: 1.6,
        description: 'Advanced medical AI assistant for patient consultation and medical information',
        tags: ['medical', 'consultation', 'diagnosis'],
        owner: 'Dr. Mimu Team',
        permissions: ['read', 'write', 'execute']
      },
      {
        id: '2',
        name: 'Legal Advisor Bot',
        type: 'legal',
        model: 'claude-3-opus',
        status: 'active',
        version: '1.8.5',
        apiKey: 'sk-ant-*********************',
        endpoint: 'https://api.anthropic.com/v1/messages',
        maxTokens: 8192,
        temperature: 0.3,
        topP: 0.8,
        frequencyPenalty: 0.1,
        presencePenalty: 0.1,
        systemPrompt: 'You are a legal AI assistant providing accurate legal information and guidance.',
        createdAt: '2024-01-10T09:15:00Z',
        lastUsed: '2024-01-20T16:45:00Z',
        totalRequests: 8750,
        successfulRequests: 8680,
        failedRequests: 70,
        averageResponseTime: 2.1,
        tokensUsed: 1850000,
        cost: 185.75,
        uptime: 98.8,
        errorRate: 0.8,
        description: 'Specialized legal AI for legal consultation and document analysis',
        tags: ['legal', 'consultation', 'documents'],
        owner: 'Legal Team',
        permissions: ['read', 'write']
      },
      {
        id: '3',
        name: 'General Assistant',
        type: 'general',
        model: 'gemini-pro',
        status: 'maintenance',
        version: '1.5.2',
        apiKey: 'AIza*********************',
        endpoint: 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent',
        maxTokens: 2048,
        temperature: 0.9,
        topP: 0.95,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0,
        systemPrompt: 'You are a helpful general-purpose AI assistant.',
        createdAt: '2024-01-05T08:00:00Z',
        lastUsed: '2024-01-19T12:30:00Z',
        totalRequests: 12300,
        successfulRequests: 12150,
        failedRequests: 150,
        averageResponseTime: 0.8,
        tokensUsed: 1200000,
        cost: 60.25,
        uptime: 97.5,
        errorRate: 1.2,
        description: 'General-purpose AI assistant for various tasks and queries',
        tags: ['general', 'multipurpose', 'assistant'],
        owner: 'System Admin',
        permissions: ['read']
      }
    ];
    setAgents(sampleAgents);
    setFilteredAgents(sampleAgents);
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = agents.filter(agent => {
      const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           agent.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           agent.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || agent.status === filterStatus;
      const matchesType = filterType === 'all' || agent.type === filterType;
      return matchesSearch && matchesStatus && matchesType;
    });

    // Sort logic
    filtered.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredAgents(filtered);
    setCurrentPage(1);
  }, [agents, searchTerm, filterStatus, filterType, sortBy, sortOrder]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAgents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAgents = filteredAgents.slice(startIndex, endIndex);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'maintenance': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSort = (field: keyof AIAgent) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleAgentAction = async (action: string, agentId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      switch (action) {
        case 'enable':
          setAgents(prev => prev.map(agent => 
            agent.id === agentId ? { ...agent, status: 'active' as const } : agent
          ));
          setSuccess(t.agentEnabled);
          break;
        case 'disable':
          setAgents(prev => prev.map(agent => 
            agent.id === agentId ? { ...agent, status: 'inactive' as const } : agent
          ));
          setSuccess(t.agentDisabled);
          break;
        case 'restart':
          setAgents(prev => prev.map(agent => 
            agent.id === agentId ? { ...agent, status: 'active' as const, lastUsed: new Date().toISOString() } : agent
          ));
          setSuccess(t.agentRestarted);
          break;
        case 'delete':
          setAgents(prev => prev.filter(agent => agent.id !== agentId));
          setSuccess(t.agentDeleted);
          break;
      }
    } catch (err) {
      setError(t.errorOccurred);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 3000);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(agents, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'ai-agents-export.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    setSuccess('Data exported successfully');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);
          if (Array.isArray(importedData)) {
            setAgents(importedData);
            setSuccess('Data imported successfully');
          } else {
            setError('Invalid file format');
          }
        } catch (err) {
          setError('Error reading file');
        }
        setTimeout(() => {
          setSuccess(null);
          setError(null);
        }, 3000);
      };
      reader.readAsText(file);
    }
  };

  const handleAddAgent = (newAgent: Partial<AIAgent>) => {
    const agent: AIAgent = {
      id: Date.now().toString(),
      name: newAgent.name || 'New Agent',
      type: newAgent.type || 'general',
      model: newAgent.model || 'gpt-3.5-turbo',
      status: 'inactive',
      version: '1.0.0',
      apiKey: newAgent.apiKey || '',
      endpoint: newAgent.endpoint || '',
      maxTokens: newAgent.maxTokens || 2048,
      temperature: newAgent.temperature || 0.7,
      topP: newAgent.topP || 0.9,
      frequencyPenalty: newAgent.frequencyPenalty || 0.0,
      presencePenalty: newAgent.presencePenalty || 0.0,
      systemPrompt: newAgent.systemPrompt || 'You are a helpful AI assistant.',
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      tokensUsed: 0,
      cost: 0,
      uptime: 0,
      errorRate: 0,
      description: newAgent.description || '',
      tags: newAgent.tags || [],
      owner: newAgent.owner || 'System Admin',
      permissions: newAgent.permissions || ['read']
    };
    setAgents(prev => [...prev, agent]);
    setSuccess(t.agentAdded);
    setShowAddModal(false);
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bot className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>{t.addAgent}</span>
          </button>
          <button 
            onClick={handleExport}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>{t.export}</span>
          </button>
          <button 
            onClick={() => document.getElementById('import-file')?.click()}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>{t.import}</span>
          </button>
          <input
            id="import-file"
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <button 
            onClick={() => window.location.reload()}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>{t.refresh}</span>
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

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder={t.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{t.all}</option>
              <option value="active">{t.active}</option>
              <option value="inactive">{t.inactive}</option>
              <option value="maintenance">{t.maintenance}</option>
              <option value="error">{t.error}</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{t.all}</option>
              <option value="medical">{t.medical}</option>
              <option value="legal">{t.legal}</option>
              <option value="general">{t.general}</option>
              <option value="custom">{t.custom}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Agents Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>{t.name}</span>
                    {sortBy === 'name' && (
                      sortOrder === 'asc' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.status}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('type')}
                >
                  <div className="flex items-center space-x-1">
                    <span>{t.type}</span>
                    {sortBy === 'type' && (
                      sortOrder === 'asc' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('model')}
                >
                  <div className="flex items-center space-x-1">
                    <span>{t.model}</span>
                    {sortBy === 'model' && (
                      sortOrder === 'asc' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.performance}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('lastUsed')}
                >
                  <div className="flex items-center space-x-1">
                    <span>{t.lastUsed}</span>
                    {sortBy === 'lastUsed' && (
                      sortOrder === 'asc' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.actions}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentAgents.map((agent) => (
                <tr key={agent.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Bot className="h-8 w-8 text-blue-500 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                        <div className="text-sm text-gray-500">v{agent.version}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(agent.status)}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(agent.status)}`}>
                        {t[agent.status as keyof typeof t] || agent.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 capitalize">{t[agent.type as keyof typeof t] || agent.type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{agent.model}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600">{agent.successfulRequests.toLocaleString()}</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-600">{agent.totalRequests.toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {((agent.successfulRequests / agent.totalRequests) * 100).toFixed(1)}% success
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(agent.lastUsed).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedAgent(agent);
                          setShowEditModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title={t.edit}
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAgent(agent);
                          setShowConfigModal(true);
                        }}
                        className="text-green-600 hover:text-green-900"
                        title={t.configure}
                      >
                        <Key className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAgent(agent);
                          setShowPerformanceModal(true);
                        }}
                        className="text-purple-600 hover:text-purple-900"
                        title={t.performance}
                      >
                        <BarChart3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAgent(agent);
                          setShowLogsModal(true);
                        }}
                        className="text-yellow-600 hover:text-yellow-900"
                        title={t.logs}
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                      {agent.status === 'active' ? (
                        <button
                          onClick={() => handleAgentAction('disable', agent.id)}
                          className="text-red-600 hover:text-red-900"
                          title={t.disable}
                          disabled={isLoading}
                        >
                          <Pause className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAgentAction('enable', agent.id)}
                          className="text-green-600 hover:text-green-900"
                          title={t.enable}
                          disabled={isLoading}
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleAgentAction('restart', agent.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title={t.restart}
                        disabled={isLoading}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(t.deleteConfirm)) {
                            handleAgentAction('delete', agent.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                        title={t.delete}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(endIndex, filteredAgents.length)}</span> of{' '}
                  <span className="font-medium">{filteredAgents.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* No agents message */}
      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <Bot className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">{t.noAgents}</h3>
        </div>
      )}

      {/* Edit Agent Modal */}
      {showEditModal && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{t.edit} - {selectedAgent.name}</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const updatedAgent = {
                ...selectedAgent,
                name: formData.get('name') as string,
                type: formData.get('type') as 'medical' | 'legal' | 'general' | 'custom',
                model: formData.get('model') as string,
                apiKey: formData.get('apiKey') as string,
                endpoint: formData.get('endpoint') as string,
                maxTokens: parseInt(formData.get('maxTokens') as string) || selectedAgent.maxTokens,
                temperature: parseFloat(formData.get('temperature') as string) || selectedAgent.temperature,
                systemPrompt: formData.get('systemPrompt') as string,
                description: formData.get('description') as string
              };
              setAgents(prev => prev.map(agent => agent.id === selectedAgent.id ? updatedAgent : agent));
              setSuccess(t.agentUpdated);
              setShowEditModal(false);
              setTimeout(() => setSuccess(null), 3000);
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.name}</label>
                  <input name="name" type="text" defaultValue={selectedAgent.name} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.type}</label>
                  <select name="type" defaultValue={selectedAgent.type} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                    <option value="general">{t.general}</option>
                    <option value="medical">{t.medical}</option>
                    <option value="legal">{t.legal}</option>
                    <option value="custom">{t.custom}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.model}</label>
                  <input name="model" type="text" defaultValue={selectedAgent.model} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.maxTokens}</label>
                  <input name="maxTokens" type="number" defaultValue={selectedAgent.maxTokens} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.temperature}</label>
                  <input name="temperature" type="number" step="0.1" min="0" max="2" defaultValue={selectedAgent.temperature} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.apiKey}</label>
                  <input name="apiKey" type="password" defaultValue={selectedAgent.apiKey} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.endpoint}</label>
                <input name="endpoint" type="url" defaultValue={selectedAgent.endpoint} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.description}</label>
                <textarea name="description" rows={3} defaultValue={selectedAgent.description} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"></textarea>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.systemPrompt}</label>
                <textarea name="systemPrompt" rows={4} defaultValue={selectedAgent.systemPrompt} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"></textarea>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">{t.cancel}</button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">{t.save}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Agent Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{t.addAgent}</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const newAgent = {
                name: formData.get('name') as string,
                type: formData.get('type') as 'medical' | 'legal' | 'general' | 'custom',
                model: formData.get('model') as string,
                apiKey: formData.get('apiKey') as string,
                endpoint: formData.get('endpoint') as string,
                maxTokens: parseInt(formData.get('maxTokens') as string) || 2048,
                temperature: parseFloat(formData.get('temperature') as string) || 0.7,
                systemPrompt: formData.get('systemPrompt') as string,
                description: formData.get('description') as string
              };
              handleAddAgent(newAgent);
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.name}</label>
                  <input name="name" type="text" required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.type}</label>
                  <select name="type" required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                    <option value="general">{t.general}</option>
                    <option value="medical">{t.medical}</option>
                    <option value="legal">{t.legal}</option>
                    <option value="custom">{t.custom}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.model}</label>
                  <input name="model" type="text" required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" placeholder="gpt-4-turbo" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.maxTokens}</label>
                  <input name="maxTokens" type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" placeholder="2048" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.temperature}</label>
                  <input name="temperature" type="number" step="0.1" min="0" max="2" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" placeholder="0.7" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.apiKey}</label>
                  <input name="apiKey" type="password" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" placeholder="sk-..." />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.endpoint}</label>
                <input name="endpoint" type="url" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" placeholder="https://api.openai.com/v1/chat/completions" />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.description}</label>
                <textarea name="description" rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" placeholder="Agent description..."></textarea>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.systemPrompt}</label>
                <textarea name="systemPrompt" rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" placeholder="You are a helpful AI assistant..."></textarea>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">{t.cancel}</button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">{t.save}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Configuration Modal */}
      {showConfigModal && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{t.configuration} - {selectedAgent.name}</h2>
              <button onClick={() => setShowConfigModal(false)} className="text-gray-500 hover:text-gray-700">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">API Configuration</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.apiKey}</label>
                  <input type="password" value={selectedAgent.apiKey} readOnly className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.endpoint}</label>
                  <input type="text" value={selectedAgent.endpoint} readOnly className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.model}</label>
                  <input type="text" value={selectedAgent.model} readOnly className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50" />
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Model Parameters</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.maxTokens}</label>
                  <input type="number" value={selectedAgent.maxTokens} readOnly className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.temperature}</label>
                  <input type="number" value={selectedAgent.temperature} readOnly className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.topP}</label>
                  <input type="number" value={selectedAgent.topP} readOnly className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50" />
                </div>
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.systemPrompt}</label>
              <textarea value={selectedAgent.systemPrompt} readOnly rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"></textarea>
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={() => setShowConfigModal(false)} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">{t.close}</button>
            </div>
          </div>
        </div>
      )}

      {/* Performance Modal */}
      {showPerformanceModal && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{t.performanceMetrics} - {selectedAgent.name}</h2>
              <button onClick={() => setShowPerformanceModal(false)} className="text-gray-500 hover:text-gray-700">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600">{t.totalRequests}</p>
                    <p className="text-2xl font-bold text-blue-900">{selectedAgent.totalRequests.toLocaleString()}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600">{t.successRate}</p>
                    <p className="text-2xl font-bold text-green-900">{((selectedAgent.successfulRequests / selectedAgent.totalRequests) * 100).toFixed(1)}%</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-600">{t.responseTime}</p>
                    <p className="text-2xl font-bold text-yellow-900">{selectedAgent.averageResponseTime}s</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600">{t.cost}</p>
                    <p className="text-2xl font-bold text-purple-900">${selectedAgent.cost.toFixed(2)}</p>
                  </div>
                  <Database className="h-8 w-8 text-purple-500" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Usage Statistics</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Successful Requests:</span>
                    <span className="font-medium text-green-600">{selectedAgent.successfulRequests.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Failed Requests:</span>
                    <span className="font-medium text-red-600">{selectedAgent.failedRequests.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tokens Used:</span>
                    <span className="font-medium">{selectedAgent.tokensUsed.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Uptime:</span>
                    <span className="font-medium">{selectedAgent.uptime}%</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Agent Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Version:</span>
                    <span className="font-medium">{selectedAgent.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="font-medium capitalize">{selectedAgent.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Owner:</span>
                    <span className="font-medium">{selectedAgent.owner}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span className="font-medium">{new Date(selectedAgent.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={() => setShowPerformanceModal(false)} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">{t.close}</button>
            </div>
          </div>
        </div>
      )}

      {/* Logs Modal */}
      {showLogsModal && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{t.logs} - {selectedAgent.name}</h2>
              <button onClick={() => setShowLogsModal(false)} className="text-gray-500 hover:text-gray-700">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="mb-4">
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm">{t.accessLogs}</button>
                <button className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-sm">{t.errorLogs}</button>
                <button className="px-3 py-1 bg-gray-100 text-gray-800 rounded-lg text-sm">{t.systemLogs}</button>
              </div>
            </div>
            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
              <div className="space-y-1">
                <div>[2024-01-20 14:25:32] INFO: Agent {selectedAgent.name} started successfully</div>
                <div>[2024-01-20 14:25:35] INFO: Processing request from user_123</div>
                <div>[2024-01-20 14:25:36] INFO: Response generated in 1.2s</div>
                <div>[2024-01-20 14:25:40] INFO: Request completed successfully</div>
                <div>[2024-01-20 14:26:15] INFO: Processing request from user_456</div>
                <div>[2024-01-20 14:26:16] INFO: Response generated in 0.8s</div>
                <div>[2024-01-20 14:26:20] INFO: Request completed successfully</div>
                <div>[2024-01-20 14:27:05] WARN: High token usage detected</div>
                <div>[2024-01-20 14:27:30] INFO: Processing request from user_789</div>
                <div>[2024-01-20 14:27:32] INFO: Response generated in 1.5s</div>
                <div>[2024-01-20 14:27:35] INFO: Request completed successfully</div>
                <div>[2024-01-20 14:28:10] INFO: Agent performance metrics updated</div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={() => setShowLogsModal(false)} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">{t.close}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAgentManagement;