import React, { useState, useEffect } from 'react';
import { Power, Settings, AlertTriangle, CheckCircle, XCircle, Clock, Wrench, Play, Pause, RotateCcw, Activity, Zap, Shield, Bell, Calendar, Users, MessageSquare, TrendingUp, Database, Wifi, WifiOff } from 'lucide-react';

interface AgentStatus {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'maintenance' | 'error' | 'starting' | 'stopping';
  health: 'healthy' | 'warning' | 'critical';
  uptime: number;
  lastActivity: string;
  version: string;
  model: string;
  responseTime: number;
  requestCount: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
  activeConnections: number;
  maintenanceScheduled?: {
    start: string;
    end: string;
    reason: string;
  };
  configuration: {
    autoRestart: boolean;
    maxConnections: number;
    timeout: number;
    retryAttempts: number;
  };
}

interface SystemStatus {
  totalAgents: number;
  activeAgents: number;
  maintenanceAgents: number;
  errorAgents: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  lastUpdate: string;
  alerts: Array<{
    id: string;
    type: 'info' | 'warning' | 'error';
    message: string;
    timestamp: string;
    agentId?: string;
  }>;
}

interface AIAgentStatusManagerProps {
  language: 'en' | 'bn';
}

const AIAgentStatusManager: React.FC<AIAgentStatusManagerProps> = ({ language }) => {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [maintenanceForm, setMaintenanceForm] = useState({
    agentId: '',
    start: '',
    end: '',
    reason: ''
  });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds

  const translations = {
    en: {
      title: 'AI Agent Status Manager',
      systemOverview: 'System Overview',
      agentStatus: 'Agent Status',
      totalAgents: 'Total Agents',
      activeAgents: 'Active Agents',
      maintenanceAgents: 'In Maintenance',
      errorAgents: 'Error Agents',
      systemHealth: 'System Health',
      lastUpdate: 'Last Update',
      alerts: 'Alerts',
      noAlerts: 'No alerts',
      agentName: 'Agent Name',
      status: 'Status',
      health: 'Health',
      uptime: 'Uptime',
      lastActivity: 'Last Activity',
      version: 'Version',
      model: 'Model',
      responseTime: 'Response Time',
      requestCount: 'Requests',
      errorRate: 'Error Rate',
      memoryUsage: 'Memory Usage',
      cpuUsage: 'CPU Usage',
      activeConnections: 'Active Connections',
      actions: 'Actions',
      start: 'Start',
      stop: 'Stop',
      restart: 'Restart',
      maintenance: 'Maintenance',
      configure: 'Configure',
      details: 'Details',
      active: 'Active',
      inactive: 'Inactive',
      error: 'Error',
      starting: 'Starting',
      stopping: 'Stopping',
      healthy: 'Healthy',
      warning: 'Warning',
      critical: 'Critical',
      scheduleMaintenance: 'Schedule Maintenance',
      maintenanceScheduled: 'Maintenance Scheduled',
      startTime: 'Start Time',
      endTime: 'End Time',
      reason: 'Reason',
      schedule: 'Schedule',
      cancel: 'Cancel',
      confirmStart: 'Are you sure you want to start this agent?',
      confirmStop: 'Are you sure you want to stop this agent?',
      confirmRestart: 'Are you sure you want to restart this agent?',
      confirmMaintenance: 'Are you sure you want to put this agent in maintenance mode?',
      autoRefresh: 'Auto Refresh',
      refreshInterval: 'Refresh Interval',
      seconds: 'seconds',
      minutes: 'minutes',
      hours: 'hours',
      days: 'days',
      ago: 'ago',
      justNow: 'just now',
      ms: 'ms',
      percentage: '%',
      mb: 'MB',
      gb: 'GB',
      configuration: 'Configuration',
      autoRestart: 'Auto Restart',
      maxConnections: 'Max Connections',
      timeout: 'Timeout',
      retryAttempts: 'Retry Attempts',
      save: 'Save',
      agentDetails: 'Agent Details',
      performanceMetrics: 'Performance Metrics',
      maintenanceHistory: 'Maintenance History',
      logs: 'Logs',
      viewLogs: 'View Logs',
      exportStatus: 'Export Status',
      refreshNow: 'Refresh Now',
      bulkActions: 'Bulk Actions',
      selectAll: 'Select All',
      deselectAll: 'Deselect All',
      startSelected: 'Start Selected',
      stopSelected: 'Stop Selected',
      maintenanceSelected: 'Maintenance Selected',
      agentsSelected: 'agents selected',
      systemMaintenance: 'System Maintenance',
      enableSystemMaintenance: 'Enable System Maintenance',
      disableSystemMaintenance: 'Disable System Maintenance',
      systemMaintenanceEnabled: 'System maintenance mode is enabled',
      systemMaintenanceDisabled: 'System maintenance mode is disabled',
      emergencyStop: 'Emergency Stop',
      emergencyStopAll: 'Emergency Stop All Agents',
      confirmEmergencyStop: 'Are you sure you want to emergency stop all agents? This action cannot be undone.',
      networkStatus: 'Network Status',
      connected: 'Connected',
      disconnected: 'Disconnected',
      connectionQuality: 'Connection Quality',
      excellent: 'Excellent',
      good: 'Good',
      fair: 'Fair',
      poor: 'Poor'
    },
    bn: {
      title: 'AI এজেন্ট স্ট্যাটাস ম্যানেজার',
      systemOverview: 'সিস্টেম ওভারভিউ',
      agentStatus: 'এজেন্ট স্ট্যাটাস',
      totalAgents: 'মোট এজেন্ট',
      activeAgents: 'সক্রিয় এজেন্ট',
      maintenanceAgents: 'রক্ষণাবেক্ষণে',
      errorAgents: 'ত্রুটিযুক্ত এজেন্ট',
      systemHealth: 'সিস্টেম স্বাস্থ্য',
      lastUpdate: 'শেষ আপডেট',
      alerts: 'সতর্কতা',
      noAlerts: 'কোন সতর্কতা নেই',
      agentName: 'এজেন্টের নাম',
      status: 'স্ট্যাটাস',
      health: 'স্বাস্থ্য',
      uptime: 'আপটাইম',
      lastActivity: 'শেষ কার্যকলাপ',
      version: 'সংস্করণ',
      model: 'মডেল',
      responseTime: 'প্রতিক্রিয়ার সময়',
      requestCount: 'অনুরোধ',
      errorRate: 'ত্রুটির হার',
      memoryUsage: 'মেমরি ব্যবহার',
      cpuUsage: 'CPU ব্যবহার',
      activeConnections: 'সক্রিয় সংযোগ',
      actions: 'কার্যক্রম',
      start: 'শুরু',
      stop: 'বন্ধ',
      restart: 'পুনরায় শুরু',
      maintenance: 'রক্ষণাবেক্ষণ',
      configure: 'কনফিগার',
      details: 'বিস্তারিত',
      active: 'সক্রিয়',
      inactive: 'নিষ্ক্রিয়',
      error: 'ত্রুটি',
      starting: 'শুরু হচ্ছে',
      stopping: 'বন্ধ হচ্ছে',
      healthy: 'সুস্থ',
      warning: 'সতর্কতা',
      critical: 'গুরুতর',
      scheduleMaintenance: 'রক্ষণাবেক্ষণ নির্ধারণ',
      maintenanceScheduled: 'রক্ষণাবেক্ষণ নির্ধারিত',
      startTime: 'শুরুর সময়',
      endTime: 'শেষের সময়',
      reason: 'কারণ',
      schedule: 'নির্ধারণ',
      cancel: 'বাতিল',
      confirmStart: 'আপনি কি এই এজেন্ট শুরু করতে চান?',
      confirmStop: 'আপনি কি এই এজেন্ট বন্ধ করতে চান?',
      confirmRestart: 'আপনি কি এই এজেন্ট পুনরায় শুরু করতে চান?',
      confirmMaintenance: 'আপনি কি এই এজেন্টকে রক্ষণাবেক্ষণ মোডে রাখতে চান?',
      autoRefresh: 'অটো রিফ্রেশ',
      refreshInterval: 'রিফ্রেশ ইন্টারভাল',
      seconds: 'সেকেন্ড',
      minutes: 'মিনিট',
      hours: 'ঘন্টা',
      days: 'দিন',
      ago: 'আগে',
      justNow: 'এখনই',
      ms: 'মিলিসেকেন্ড',
      percentage: '%',
      mb: 'MB',
      gb: 'GB',
      configuration: 'কনফিগারেশন',
      autoRestart: 'অটো রিস্টার্ট',
      maxConnections: 'সর্বোচ্চ সংযোগ',
      timeout: 'টাইমআউট',
      retryAttempts: 'পুনঃচেষ্টা',
      save: 'সংরক্ষণ',
      agentDetails: 'এজেন্ট বিস্তারিত',
      performanceMetrics: 'পারফরম্যান্স মেট্রিক্স',
      maintenanceHistory: 'রক্ষণাবেক্ষণ ইতিহাস',
      logs: 'লগ',
      viewLogs: 'লগ দেখুন',
      exportStatus: 'স্ট্যাটাস এক্সপোর্ট',
      refreshNow: 'এখনই রিফ্রেশ',
      bulkActions: 'বাল্ক অ্যাকশন',
      selectAll: 'সব নির্বাচন',
      deselectAll: 'নির্বাচন বাতিল',
      startSelected: 'নির্বাচিত শুরু',
      stopSelected: 'নির্বাচিত বন্ধ',
      maintenanceSelected: 'নির্বাচিত রক্ষণাবেক্ষণ',
      agentsSelected: 'এজেন্ট নির্বাচিত',
      systemMaintenance: 'সিস্টেম রক্ষণাবেক্ষণ',
      enableSystemMaintenance: 'সিস্টেম রক্ষণাবেক্ষণ সক্রিয়',
      disableSystemMaintenance: 'সিস্টেম রক্ষণাবেক্ষণ নিষ্ক্রিয়',
      systemMaintenanceEnabled: 'সিস্টেম রক্ষণাবেক্ষণ মোড সক্রিয়',
      systemMaintenanceDisabled: 'সিস্টেম রক্ষণাবেক্ষণ মোড নিষ্ক্রিয়',
      emergencyStop: 'জরুরি বন্ধ',
      emergencyStopAll: 'সব এজেন্ট জরুরি বন্ধ',
      confirmEmergencyStop: 'আপনি কি সব এজেন্ট জরুরি বন্ধ করতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।',
      networkStatus: 'নেটওয়ার্ক স্ট্যাটাস',
      connected: 'সংযুক্ত',
      disconnected: 'সংযোগ বিচ্ছিন্ন',
      connectionQuality: 'সংযোগের মান',
      excellent: 'চমৎকার',
      good: 'ভাল',
      fair: 'মোটামুটি',
      poor: 'খারাপ'
    }
  };

  const t = translations[language];

  // Sample data
  useEffect(() => {
    const sampleAgents: AgentStatus[] = [
      {
        id: '1',
        name: 'Dr. Mimu Medical Assistant',
        status: 'active',
        health: 'healthy',
        uptime: 86400000, // 1 day
        lastActivity: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        version: '2.1.0',
        model: 'gpt-4',
        responseTime: 1200,
        requestCount: 1547,
        errorRate: 0.2,
        memoryUsage: 512,
        cpuUsage: 15,
        activeConnections: 23,
        configuration: {
          autoRestart: true,
          maxConnections: 100,
          timeout: 30000,
          retryAttempts: 3
        }
      },
      {
        id: '2',
        name: 'Legal Advisor Bot',
        status: 'maintenance',
        health: 'warning',
        uptime: 43200000, // 12 hours
        lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        version: '1.8.5',
        model: 'gpt-3.5-turbo',
        responseTime: 2100,
        requestCount: 892,
        errorRate: 1.1,
        memoryUsage: 768,
        cpuUsage: 8,
        activeConnections: 0,
        maintenanceScheduled: {
          start: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          end: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          reason: 'Model update and performance optimization'
        },
        configuration: {
          autoRestart: true,
          maxConnections: 50,
          timeout: 45000,
          retryAttempts: 2
        }
      },
      {
        id: '3',
        name: 'Customer Support Bot',
        status: 'error',
        health: 'critical',
        uptime: 0,
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        version: '1.5.2',
        model: 'claude-3',
        responseTime: 0,
        requestCount: 0,
        errorRate: 100,
        memoryUsage: 0,
        cpuUsage: 0,
        activeConnections: 0,
        configuration: {
          autoRestart: false,
          maxConnections: 75,
          timeout: 25000,
          retryAttempts: 5
        }
      },
      {
        id: '4',
        name: 'Data Analysis Agent',
        status: 'starting',
        health: 'healthy',
        uptime: 0,
        lastActivity: new Date().toISOString(),
        version: '3.0.1',
        model: 'gpt-4-turbo',
        responseTime: 0,
        requestCount: 0,
        errorRate: 0,
        memoryUsage: 256,
        cpuUsage: 45,
        activeConnections: 0,
        configuration: {
          autoRestart: true,
          maxConnections: 200,
          timeout: 60000,
          retryAttempts: 3
        }
      }
    ];

    const sampleSystemStatus: SystemStatus = {
      totalAgents: 4,
      activeAgents: 1,
      maintenanceAgents: 1,
      errorAgents: 1,
      systemHealth: 'warning',
      lastUpdate: new Date().toISOString(),
      alerts: [
        {
          id: '1',
          type: 'error',
          message: 'Customer Support Bot is down due to API connection failure',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          agentId: '3'
        },
        {
          id: '2',
          type: 'warning',
          message: 'Legal Advisor Bot response time exceeding threshold',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          agentId: '2'
        },
        {
          id: '3',
          type: 'info',
          message: 'Data Analysis Agent starting up',
          timestamp: new Date().toISOString(),
          agentId: '4'
        }
      ]
    };

    setAgents(sampleAgents);
    setSystemStatus(sampleSystemStatus);
  }, []);

  // Auto refresh
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // Simulate status updates
        setSystemStatus(prev => prev ? {
          ...prev,
          lastUpdate: new Date().toISOString()
        } : null);
      }, refreshInterval * 1000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const formatUptime = (uptime: number) => {
    if (uptime === 0) return '0s';
    const days = Math.floor(uptime / (24 * 60 * 60 * 1000));
    const hours = Math.floor((uptime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((uptime % (60 * 60 * 1000)) / (60 * 1000));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return t.justNow;
    if (diff < 3600000) return `${Math.floor(diff / 60000)} ${t.minutes} ${t.ago}`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} ${t.hours} ${t.ago}`;
    return `${Math.floor(diff / 86400000)} ${t.days} ${t.ago}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'inactive': return <XCircle className="h-5 w-5 text-gray-500" />;
      case 'maintenance': return <Wrench className="h-5 w-5 text-yellow-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'starting': return <Play className="h-5 w-5 text-blue-500" />;
      case 'stopping': return <Pause className="h-5 w-5 text-orange-500" />;
      default: return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'starting': return 'bg-blue-100 text-blue-800';
      case 'stopping': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const handleAgentAction = async (agentId: string, action: string) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setAgents(prev => prev.map(agent => {
      if (agent.id === agentId) {
        switch (action) {
          case 'start':
            return { ...agent, status: 'starting' as const };
          case 'stop':
            return { ...agent, status: 'stopping' as const };
          case 'restart':
            return { ...agent, status: 'starting' as const };
          case 'maintenance':
            return { ...agent, status: 'maintenance' as const };
          default:
            return agent;
        }
      }
      return agent;
    }));
    
    setIsLoading(false);
  };

  const handleScheduleMaintenance = () => {
    if (maintenanceForm.agentId && maintenanceForm.start && maintenanceForm.end && maintenanceForm.reason) {
      setAgents(prev => prev.map(agent => {
        if (agent.id === maintenanceForm.agentId) {
          return {
            ...agent,
            status: 'maintenance' as const,
            maintenanceScheduled: {
              start: maintenanceForm.start,
              end: maintenanceForm.end,
              reason: maintenanceForm.reason
            }
          };
        }
        return agent;
      }));
      
      setShowMaintenanceModal(false);
      setMaintenanceForm({ agentId: '', start: '', end: '', reason: '' });
    }
  };

  const handleExportStatus = () => {
    const exportData = {
      systemStatus,
      agents,
      timestamp: new Date().toISOString()
    };
    
    const jsonData = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent_status_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!systemStatus) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Activity className="h-8 w-8 text-blue-600" />
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
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value={10}>10s</option>
            <option value={30}>30s</option>
            <option value={60}>1m</option>
            <option value={300}>5m</option>
          </select>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>{t.refreshNow}</span>
          </button>
          <button
            onClick={handleExportStatus}
            className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
          >
            <Database className="h-4 w-4" />
            <span>{t.exportStatus}</span>
          </button>
        </div>
      </div>

      {/* System Overview */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>{t.systemOverview}</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">{t.totalAgents}</p>
                <p className="text-2xl font-bold text-blue-900">{systemStatus.totalAgents}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">{t.activeAgents}</p>
                <p className="text-2xl font-bold text-green-900">{systemStatus.activeAgents}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">{t.maintenanceAgents}</p>
                <p className="text-2xl font-bold text-yellow-900">{systemStatus.maintenanceAgents}</p>
              </div>
              <Wrench className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">{t.errorAgents}</p>
                <p className="text-2xl font-bold text-red-900">{systemStatus.errorAgents}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </div>
          
          <div className={`rounded-lg p-4 ${
            systemStatus.systemHealth === 'healthy' ? 'bg-green-50' :
            systemStatus.systemHealth === 'warning' ? 'bg-yellow-50' : 'bg-red-50'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${
                  systemStatus.systemHealth === 'healthy' ? 'text-green-600' :
                  systemStatus.systemHealth === 'warning' ? 'text-yellow-600' : 'text-red-600'
                }`}>{t.systemHealth}</p>
                <p className={`text-lg font-bold ${
                  systemStatus.systemHealth === 'healthy' ? 'text-green-900' :
                  systemStatus.systemHealth === 'warning' ? 'text-yellow-900' : 'text-red-900'
                }`}>{t[systemStatus.systemHealth]}</p>
              </div>
              {getHealthIcon(systemStatus.systemHealth)}
            </div>
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          {t.lastUpdate}: {formatTimestamp(systemStatus.lastUpdate)}
        </div>
      </div>

      {/* Alerts */}
      {systemStatus.alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>{t.alerts}</span>
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
              {systemStatus.alerts.length}
            </span>
          </h3>
          
          <div className="space-y-3">
            {systemStatus.alerts.map((alert) => (
              <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${
                alert.type === 'error' ? 'bg-red-50 border-red-400' :
                alert.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                'bg-blue-50 border-blue-400'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {alert.type === 'error' ? <XCircle className="h-5 w-5 text-red-500 mt-0.5" /> :
                     alert.type === 'warning' ? <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" /> :
                     <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                      <p className="text-xs text-gray-500">{formatTimestamp(alert.timestamp)}</p>
                    </div>
                  </div>
                  {alert.agentId && (
                    <button
                      onClick={() => setSelectedAgent(alert.agentId!)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      {t.details}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agent Status Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{t.agentStatus}</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.agentName}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.status}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.health}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.uptime}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.responseTime}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.activeConnections}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.errorRate}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t.actions}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {agents.map((agent) => (
                <tr key={agent.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                      <div className="text-xs text-gray-500">{agent.model} v{agent.version}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(agent.status)}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(agent.status)}`}>
                        {t[agent.status]}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getHealthIcon(agent.health)}
                      <span className={`text-sm font-medium ${getHealthColor(agent.health)}`}>
                        {t[agent.health]}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatUptime(agent.uptime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {agent.responseTime > 0 ? `${agent.responseTime}${t.ms}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {agent.activeConnections}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`font-medium ${
                      agent.errorRate > 5 ? 'text-red-600' :
                      agent.errorRate > 1 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {agent.errorRate.toFixed(1)}{t.percentage}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {agent.status === 'active' && (
                      <>
                        <button
                          onClick={() => handleAgentAction(agent.id, 'stop')}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title={t.stop}
                        >
                          <Pause className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleAgentAction(agent.id, 'restart')}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title={t.restart}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    {(agent.status === 'inactive' || agent.status === 'error') && (
                      <button
                        onClick={() => handleAgentAction(agent.id, 'start')}
                        className="text-green-600 hover:text-green-900 p-1 rounded"
                        title={t.start}
                      >
                        <Play className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setMaintenanceForm({ ...maintenanceForm, agentId: agent.id });
                        setShowMaintenanceModal(true);
                      }}
                      className="text-yellow-600 hover:text-yellow-900 p-1 rounded"
                      title={t.maintenance}
                    >
                      <Wrench className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setSelectedAgent(agent.id)}
                      className="text-gray-600 hover:text-gray-900 p-1 rounded"
                      title={t.details}
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Maintenance Modal */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.scheduleMaintenance}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.startTime}</label>
                <input
                  type="datetime-local"
                  value={maintenanceForm.start}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, start: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.endTime}</label>
                <input
                  type="datetime-local"
                  value={maintenanceForm.end}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, end: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.reason}</label>
                <textarea
                  value={maintenanceForm.reason}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, reason: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter maintenance reason..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowMaintenanceModal(false);
                  setMaintenanceForm({ agentId: '', start: '', end: '', reason: '' });
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleScheduleMaintenance}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {t.schedule}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAgentStatusManager;