import React, { useState, useEffect } from 'react';
import { FileText, Search, Filter, Download, Trash2, Eye, AlertTriangle, Info, CheckCircle, XCircle, Clock, User, MessageSquare, Settings, RefreshCw, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  agentId: string;
  agentName: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  category: 'conversation' | 'system' | 'api' | 'configuration' | 'performance';
  message: string;
  details?: any;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  duration?: number;
  statusCode?: number;
  endpoint?: string;
  userAgent?: string;
  ipAddress?: string;
}

interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  oldValue?: any;
  newValue?: any;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  errorMessage?: string;
}

interface AIAgentLogsProps {
  language: 'en' | 'bn';
  agentId?: string;
}

const AIAgentLogs: React.FC<AIAgentLogsProps> = ({ language, agentId }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'logs' | 'audit'>('logs');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAgent, setSelectedAgent] = useState<string>(agentId || 'all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [selectedLogs, setSelectedLogs] = useState<Set<string>>(new Set());

  const translations = {
    en: {
      title: 'AI Agent Logs & Audit Trail',
      logs: 'Logs',
      auditTrail: 'Audit Trail',
      search: 'Search logs...',
      searchAudit: 'Search audit logs...',
      level: 'Level',
      category: 'Category',
      agent: 'Agent',
      dateRange: 'Date Range',
      from: 'From',
      to: 'To',
      refresh: 'Refresh',
      autoRefresh: 'Auto Refresh',
      export: 'Export',
      clear: 'Clear',
      delete: 'Delete Selected',
      selectAll: 'Select All',
      deselectAll: 'Deselect All',
      timestamp: 'Timestamp',
      message: 'Message',
      details: 'Details',
      user: 'User',
      session: 'Session',
      duration: 'Duration',
      status: 'Status',
      action: 'Action',
      resource: 'Resource',
      oldValue: 'Old Value',
      newValue: 'New Value',
      ipAddress: 'IP Address',
      userAgent: 'User Agent',
      success: 'Success',
      failed: 'Failed',
      all: 'All',
      info: 'Info',
      warning: 'Warning',
      error: 'Error',
      debug: 'Debug',
      conversation: 'Conversation',
      system: 'System',
      api: 'API',
      configuration: 'Configuration',
      performance: 'Performance',
      noLogs: 'No logs found',
      noAuditLogs: 'No audit logs found',
      loading: 'Loading...',
      showDetails: 'Show Details',
      hideDetails: 'Hide Details',
      copyToClipboard: 'Copy to Clipboard',
      copied: 'Copied!',
      downloadLogs: 'Download Logs',
      clearLogs: 'Clear Logs',
      confirmClear: 'Are you sure you want to clear all logs?',
      confirmDelete: 'Are you sure you want to delete selected logs?',
      logsCleared: 'Logs cleared successfully',
      logsDeleted: 'Selected logs deleted successfully',
      itemsPerPage: 'Items per page',
      page: 'Page',
      of: 'of',
      total: 'Total',
      entries: 'entries',
      ms: 'ms',
      seconds: 'seconds',
      minutes: 'minutes',
      hours: 'hours',
      days: 'days',
      ago: 'ago',
      justNow: 'just now'
    },
    bn: {
      title: 'AI এজেন্ট লগ এবং অডিট ট্রেইল',
      logs: 'লগ',
      auditTrail: 'অডিট ট্রেইল',
      search: 'লগ খুঁজুন...',
      searchAudit: 'অডিট লগ খুঁজুন...',
      level: 'লেভেল',
      category: 'ক্যাটেগরি',
      agent: 'এজেন্ট',
      dateRange: 'তারিখের পরিসর',
      from: 'থেকে',
      to: 'পর্যন্ত',
      refresh: 'রিফ্রেশ',
      autoRefresh: 'অটো রিফ্রেশ',
      export: 'এক্সপোর্ট',
      clear: 'পরিষ্কার',
      delete: 'নির্বাচিত মুছুন',
      selectAll: 'সব নির্বাচন',
      deselectAll: 'নির্বাচন বাতিল',
      timestamp: 'সময়',
      message: 'বার্তা',
      details: 'বিস্তারিত',
      user: 'ব্যবহারকারী',
      session: 'সেশন',
      duration: 'সময়কাল',
      status: 'স্ট্যাটাস',
      action: 'কার্যক্রম',
      resource: 'রিসোর্স',
      oldValue: 'পুরাতন মান',
      newValue: 'নতুন মান',
      ipAddress: 'IP ঠিকানা',
      userAgent: 'ইউজার এজেন্ট',
      success: 'সফল',
      failed: 'ব্যর্থ',
      all: 'সব',
      info: 'তথ্য',
      warning: 'সতর্কতা',
      error: 'ত্রুটি',
      debug: 'ডিবাগ',
      conversation: 'কথোপকথন',
      system: 'সিস্টেম',
      api: 'API',
      configuration: 'কনফিগারেশন',
      performance: 'পারফরম্যান্স',
      noLogs: 'কোন লগ পাওয়া যায়নি',
      noAuditLogs: 'কোন অডিট লগ পাওয়া যায়নি',
      loading: 'লোড হচ্ছে...',
      showDetails: 'বিস্তারিত দেখান',
      hideDetails: 'বিস্তারিত লুকান',
      copyToClipboard: 'ক্লিপবোর্ডে কপি',
      copied: 'কপি হয়েছে!',
      downloadLogs: 'লগ ডাউনলোড',
      clearLogs: 'লগ পরিষ্কার',
      confirmClear: 'আপনি কি সমস্ত লগ পরিষ্কার করতে চান?',
      confirmDelete: 'আপনি কি নির্বাচিত লগগুলি মুছে ফেলতে চান?',
      logsCleared: 'লগ সফলভাবে পরিষ্কার হয়েছে',
      logsDeleted: 'নির্বাচিত লগ সফলভাবে মুছে ফেলা হয়েছে',
      itemsPerPage: 'প্রতি পৃষ্ঠায় আইটেম',
      page: 'পৃষ্ঠা',
      of: 'এর',
      total: 'মোট',
      entries: 'এন্ট্রি',
      ms: 'মিলিসেকেন্ড',
      seconds: 'সেকেন্ড',
      minutes: 'মিনিট',
      hours: 'ঘন্টা',
      days: 'দিন',
      ago: 'আগে',
      justNow: 'এখনই'
    }
  };

  const t = translations[language];

  // Sample data
  useEffect(() => {
    const sampleLogs: LogEntry[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        agentId: '1',
        agentName: 'Dr. Mimu Medical Assistant',
        level: 'info',
        category: 'conversation',
        message: 'User started new conversation',
        userId: 'user123',
        sessionId: 'session456',
        requestId: 'req789',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        agentId: '1',
        agentName: 'Dr. Mimu Medical Assistant',
        level: 'error',
        category: 'api',
        message: 'API request failed',
        details: {
          error: 'Rate limit exceeded',
          endpoint: '/api/chat/completions',
          statusCode: 429
        },
        userId: 'user456',
        sessionId: 'session789',
        requestId: 'req101',
        duration: 5000,
        statusCode: 429,
        endpoint: '/api/chat/completions'
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        agentId: '2',
        agentName: 'Legal Advisor Bot',
        level: 'warning',
        category: 'performance',
        message: 'Response time exceeded threshold',
        details: {
          responseTime: 8500,
          threshold: 5000,
          query: 'Legal advice about tax regulations'
        },
        userId: 'user789',
        sessionId: 'session012',
        requestId: 'req345',
        duration: 8500
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        agentId: '1',
        agentName: 'Dr. Mimu Medical Assistant',
        level: 'debug',
        category: 'system',
        message: 'Configuration updated',
        details: {
          parameter: 'temperature',
          oldValue: 0.7,
          newValue: 0.8
        },
        userId: 'admin',
        sessionId: 'admin_session'
      },
      {
        id: '5',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        agentId: '2',
        agentName: 'Legal Advisor Bot',
        level: 'info',
        category: 'conversation',
        message: 'Conversation completed successfully',
        details: {
          messageCount: 12,
          duration: 1800000,
          satisfaction: 4.5
        },
        userId: 'user321',
        sessionId: 'session654',
        requestId: 'req987',
        duration: 1800000
      }
    ];

    const sampleAuditLogs: AuditEntry[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        userId: 'admin',
        userName: 'System Administrator',
        action: 'UPDATE_CONFIGURATION',
        resource: 'agent_config',
        resourceId: '1',
        oldValue: { temperature: 0.7 },
        newValue: { temperature: 0.8 },
        ipAddress: '192.168.1.10',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        success: true
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        userId: 'admin',
        userName: 'System Administrator',
        action: 'CREATE_AGENT',
        resource: 'agent',
        resourceId: '3',
        newValue: {
          name: 'Customer Support Bot',
          model: 'gpt-4',
          status: 'active'
        },
        ipAddress: '192.168.1.10',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        success: true
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        userId: 'user123',
        userName: 'John Doe',
        action: 'LOGIN_ATTEMPT',
        resource: 'auth',
        resourceId: 'login',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        success: false,
        errorMessage: 'Invalid credentials'
      }
    ];

    setLogs(sampleLogs);
    setAuditLogs(sampleAuditLogs);
  }, []);

  // Auto refresh
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // Simulate new log entries
        const newLog: LogEntry = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          agentId: '1',
          agentName: 'Dr. Mimu Medical Assistant',
          level: 'info',
          category: 'conversation',
          message: 'New user message received',
          userId: `user${Math.floor(Math.random() * 1000)}`,
          sessionId: `session${Math.floor(Math.random() * 1000)}`
        };
        setLogs(prev => [newLog, ...prev]);
      }, 10000); // Every 10 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return t.justNow;
    if (diff < 3600000) return `${Math.floor(diff / 60000)} ${t.minutes} ${t.ago}`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} ${t.hours} ${t.ago}`;
    return `${Math.floor(diff / 86400000)} ${t.days} ${t.ago}`;
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return '-';
    if (duration < 1000) return `${duration}${t.ms}`;
    if (duration < 60000) return `${(duration / 1000).toFixed(1)}s`;
    if (duration < 3600000) return `${(duration / 60000).toFixed(1)}m`;
    return `${(duration / 3600000).toFixed(1)}h`;
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      case 'debug': return <Settings className="h-4 w-4 text-gray-500" />;
      default: return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'conversation': return <MessageSquare className="h-4 w-4" />;
      case 'system': return <Settings className="h-4 w-4" />;
      case 'api': return <Globe className="h-4 w-4" />;
      case 'configuration': return <Settings className="h-4 w-4" />;
      case 'performance': return <Clock className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.agentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || log.level === selectedLevel;
    const matchesCategory = selectedCategory === 'all' || log.category === selectedCategory;
    const matchesAgent = selectedAgent === 'all' || log.agentId === selectedAgent;
    
    let matchesDate = true;
    if (dateRange.start && dateRange.end) {
      const logDate = new Date(log.timestamp);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      matchesDate = logDate >= startDate && logDate <= endDate;
    }
    
    return matchesSearch && matchesLevel && matchesCategory && matchesAgent && matchesDate;
  });

  const filteredAuditLogs = auditLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.resource.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesDate = true;
    if (dateRange.start && dateRange.end) {
      const logDate = new Date(log.timestamp);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      matchesDate = logDate >= startDate && logDate <= endDate;
    }
    
    return matchesSearch && matchesDate;
  });

  const currentLogs = activeTab === 'logs' ? filteredLogs : filteredAuditLogs;
  const totalPages = Math.ceil(currentLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLogs = currentLogs.slice(startIndex, endIndex);

  const toggleLogExpansion = (logId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const toggleLogSelection = (logId: string) => {
    const newSelected = new Set(selectedLogs);
    if (newSelected.has(logId)) {
      newSelected.delete(logId);
    } else {
      newSelected.add(logId);
    }
    setSelectedLogs(newSelected);
  };

  const selectAllLogs = () => {
    setSelectedLogs(new Set(paginatedLogs.map(log => log.id)));
  };

  const deselectAllLogs = () => {
    setSelectedLogs(new Set());
  };

  const handleExport = () => {
    const dataToExport = activeTab === 'logs' ? filteredLogs : filteredAuditLogs;
    const jsonData = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearLogs = () => {
    if (window.confirm(t.confirmClear)) {
      if (activeTab === 'logs') {
        setLogs([]);
      } else {
        setAuditLogs([]);
      }
    }
  };

  const handleDeleteSelected = () => {
    if (selectedLogs.size === 0) return;
    if (window.confirm(t.confirmDelete)) {
      if (activeTab === 'logs') {
        setLogs(prev => prev.filter(log => !selectedLogs.has(log.id)));
      } else {
        setAuditLogs(prev => prev.filter(log => !selectedLogs.has(log.id)));
      }
      setSelectedLogs(new Set());
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        </div>
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{t.autoRefresh}</span>
          </label>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>{t.refresh}</span>
          </button>
          <button
            onClick={handleExport}
            className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>{t.export}</span>
          </button>
          <button
            onClick={handleClearLogs}
            className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>{t.clear}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'logs'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>{t.logs}</span>
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
              {filteredLogs.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'audit'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <User className="h-4 w-4" />
            <span>{t.auditTrail}</span>
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
              {filteredAuditLogs.length}
            </span>
          </button>
        </nav>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {activeTab === 'logs' ? t.search : t.searchAudit}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={activeTab === 'logs' ? t.search : t.searchAudit}
              />
            </div>
          </div>
          
          {activeTab === 'logs' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.level}</label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">{t.all}</option>
                  <option value="info">{t.info}</option>
                  <option value="warning">{t.warning}</option>
                  <option value="error">{t.error}</option>
                  <option value="debug">{t.debug}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.category}</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">{t.all}</option>
                  <option value="conversation">{t.conversation}</option>
                  <option value="system">{t.system}</option>
                  <option value="api">{t.api}</option>
                  <option value="configuration">{t.configuration}</option>
                  <option value="performance">{t.performance}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.agent}</label>
                <select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">{t.all}</option>
                  <option value="1">Dr. Mimu Medical Assistant</option>
                  <option value="2">Legal Advisor Bot</option>
                </select>
              </div>
            </>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.from}</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.to}</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedLogs.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedLogs.size} {t.entries} selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={deselectAllLogs}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {t.deselectAll}
              </button>
              <button
                onClick={handleDeleteSelected}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors flex items-center space-x-1"
              >
                <Trash2 className="h-3 w-3" />
                <span>{t.delete}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-medium text-gray-900">
              {activeTab === 'logs' ? t.logs : t.auditTrail}
            </h3>
            <span className="text-sm text-gray-500">
              {t.total}: {currentLogs.length} {t.entries}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={selectAllLogs}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {t.selectAll}
            </button>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-500">{t.itemsPerPage}</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {activeTab === 'logs' ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedLogs.size === paginatedLogs.length && paginatedLogs.length > 0}
                      onChange={() => selectedLogs.size === paginatedLogs.length ? deselectAllLogs() : selectAllLogs()}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.timestamp}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.level}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.category}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.agent}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.message}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.duration}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.details}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedLogs.map((log) => (
                  <React.Fragment key={log.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedLogs.has(log.id)}
                          onChange={() => toggleLogSelection(log.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{new Date(log.timestamp).toLocaleString()}</div>
                        <div className="text-xs text-gray-400">{formatTimestamp(log.timestamp)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getLevelIcon(log.level)}
                          <span className="text-sm capitalize">{log.level}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(log.category)}
                          <span className="text-sm capitalize">{log.category}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.agentName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {log.message}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDuration(log.duration)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {log.details && (
                          <button
                            onClick={() => toggleLogExpansion(log.id)}
                            className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                          >
                            {expandedLogs.has(log.id) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                            <span>{expandedLogs.has(log.id) ? t.hideDetails : t.showDetails}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                    {expandedLogs.has(log.id) && log.details && (
                      <tr>
                        <td colSpan={8} className="px-6 py-4 bg-gray-50">
                          <div className="space-y-2">
                            <h4 className="font-medium text-gray-900">{t.details}:</h4>
                            <pre className="text-sm text-gray-700 bg-white p-3 rounded border overflow-x-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                            {log.userId && (
                              <div className="text-sm text-gray-600">
                                <strong>{t.user}:</strong> {log.userId}
                              </div>
                            )}
                            {log.sessionId && (
                              <div className="text-sm text-gray-600">
                                <strong>{t.session}:</strong> {log.sessionId}
                              </div>
                            )}
                            {log.ipAddress && (
                              <div className="text-sm text-gray-600">
                                <strong>{t.ipAddress}:</strong> {log.ipAddress}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedLogs.size === paginatedLogs.length && paginatedLogs.length > 0}
                      onChange={() => selectedLogs.size === paginatedLogs.length ? deselectAllLogs() : selectAllLogs()}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.timestamp}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.user}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.action}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.resource}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.status}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.details}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedLogs.map((log) => (
                  <React.Fragment key={log.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedLogs.has(log.id)}
                          onChange={() => toggleLogSelection(log.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{new Date(log.timestamp).toLocaleString()}</div>
                        <div className="text-xs text-gray-400">{formatTimestamp(log.timestamp)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{log.userName}</div>
                        <div className="text-xs text-gray-500">{log.userId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.action.replace(/_/g, ' ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{log.resource}</div>
                        <div className="text-xs text-gray-500">ID: {log.resourceId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          log.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {log.success ? t.success : t.failed}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => toggleLogExpansion(log.id)}
                          className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                        >
                          {expandedLogs.has(log.id) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                          <span>{expandedLogs.has(log.id) ? t.hideDetails : t.showDetails}</span>
                        </button>
                      </td>
                    </tr>
                    {expandedLogs.has(log.id) && (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 bg-gray-50">
                          <div className="space-y-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {log.oldValue && (
                                <div>
                                  <h5 className="font-medium text-gray-900">{t.oldValue}:</h5>
                                  <pre className="text-sm text-gray-700 bg-white p-2 rounded border overflow-x-auto">
                                    {JSON.stringify(log.oldValue, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {log.newValue && (
                                <div>
                                  <h5 className="font-medium text-gray-900">{t.newValue}:</h5>
                                  <pre className="text-sm text-gray-700 bg-white p-2 rounded border overflow-x-auto">
                                    {JSON.stringify(log.newValue, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                              <div><strong>{t.ipAddress}:</strong> {log.ipAddress}</div>
                              <div><strong>{t.userAgent}:</strong> {log.userAgent}</div>
                            </div>
                            {log.errorMessage && (
                              <div className="text-sm text-red-600">
                                <strong>Error:</strong> {log.errorMessage}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              {t.page} {currentPage} {t.of} {totalPages} ({currentLogs.length} {t.total} {t.entries})
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                {Math.min(startIndex + 1, currentLogs.length)}-{Math.min(endIndex, currentLogs.length)}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* No logs message */}
      {currentLogs.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {activeTab === 'logs' ? t.noLogs : t.noAuditLogs}
          </h3>
        </div>
      )}
    </div>
  );
};

export default AIAgentLogs;