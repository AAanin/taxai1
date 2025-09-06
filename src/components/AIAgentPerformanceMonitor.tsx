import React, { useState, useEffect } from 'react';
import { Activity, Cpu, Memory, Zap, BarChart3, TrendingUp, TrendingDown, Clock, Users, MessageSquare, AlertTriangle, CheckCircle, RefreshCw, Download, Calendar, Filter } from 'lucide-react';

interface PerformanceMetric {
  id: string;
  agentId: string;
  agentName: string;
  timestamp: string;
  cpuUsage: number;
  memoryUsage: number;
  responseTime: number;
  requestsPerMinute: number;
  successRate: number;
  errorRate: number;
  activeUsers: number;
  tokensPerSecond: number;
  networkLatency: number;
  queueLength: number;
}

interface AIAgentPerformanceMonitorProps {
  language: 'en' | 'bn';
  agentId?: string;
}

const AIAgentPerformanceMonitor: React.FC<AIAgentPerformanceMonitorProps> = ({ language, agentId }) => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('1h');
  const [selectedAgent, setSelectedAgent] = useState<string>(agentId || 'all');
  const [isRealTime, setIsRealTime] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [alertThresholds, setAlertThresholds] = useState({
    cpuUsage: 80,
    memoryUsage: 85,
    responseTime: 3000,
    errorRate: 5
  });

  const translations = {
    en: {
      title: 'AI Agent Performance Monitor',
      realTimeMetrics: 'Real-time Metrics',
      historicalData: 'Historical Data',
      timeRange: 'Time Range',
      agent: 'Agent',
      allAgents: 'All Agents',
      lastHour: 'Last Hour',
      last6Hours: 'Last 6 Hours',
      last24Hours: 'Last 24 Hours',
      last7Days: 'Last 7 Days',
      last30Days: 'Last 30 Days',
      cpuUsage: 'CPU Usage',
      memoryUsage: 'Memory Usage',
      responseTime: 'Response Time',
      requestsPerMinute: 'Requests/Min',
      successRate: 'Success Rate',
      errorRate: 'Error Rate',
      activeUsers: 'Active Users',
      tokensPerSecond: 'Tokens/Sec',
      networkLatency: 'Network Latency',
      queueLength: 'Queue Length',
      average: 'Average',
      peak: 'Peak',
      current: 'Current',
      healthy: 'Healthy',
      warning: 'Warning',
      critical: 'Critical',
      alerts: 'Alerts',
      noAlerts: 'No active alerts',
      export: 'Export Data',
      refresh: 'Refresh',
      autoRefresh: 'Auto Refresh',
      refreshEvery: 'Refresh every',
      seconds: 'seconds',
      minutes: 'minutes',
      ms: 'ms',
      percent: '%',
      users: 'users',
      requests: 'requests',
      tokens: 'tokens',
      performanceOverview: 'Performance Overview',
      systemHealth: 'System Health',
      resourceUtilization: 'Resource Utilization',
      trafficAnalysis: 'Traffic Analysis',
      alertsAndNotifications: 'Alerts & Notifications',
      configureAlerts: 'Configure Alerts',
      thresholds: 'Thresholds',
      save: 'Save',
      cancel: 'Cancel'
    },
    bn: {
      title: 'AI এজেন্ট পারফরম্যান্স মনিটর',
      realTimeMetrics: 'রিয়েল-টাইম মেট্রিক্স',
      historicalData: 'ঐতিহাসিক ডেটা',
      timeRange: 'সময়সীমা',
      agent: 'এজেন্ট',
      allAgents: 'সব এজেন্ট',
      lastHour: 'শেষ ঘন্টা',
      last6Hours: 'শেষ ৬ ঘন্টা',
      last24Hours: 'শেষ ২৪ ঘন্টা',
      last7Days: 'শেষ ৭ দিন',
      last30Days: 'শেষ ৩০ দিন',
      cpuUsage: 'সিপিইউ ব্যবহার',
      memoryUsage: 'মেমরি ব্যবহার',
      responseTime: 'প্রতিক্রিয়ার সময়',
      requestsPerMinute: 'অনুরোধ/মিনিট',
      successRate: 'সফলতার হার',
      errorRate: 'ত্রুটির হার',
      activeUsers: 'সক্রিয় ব্যবহারকারী',
      tokensPerSecond: 'টোকেন/সেকেন্ড',
      networkLatency: 'নেটওয়ার্ক লেটেন্সি',
      queueLength: 'সারির দৈর্ঘ্য',
      average: 'গড়',
      peak: 'সর্বোচ্চ',
      current: 'বর্তমান',
      healthy: 'সুস্থ',
      warning: 'সতর্কতা',
      critical: 'গুরুতর',
      alerts: 'সতর্কতা',
      noAlerts: 'কোন সক্রিয় সতর্কতা নেই',
      export: 'ডেটা এক্সপোর্ট',
      refresh: 'রিফ্রেশ',
      autoRefresh: 'অটো রিফ্রেশ',
      refreshEvery: 'প্রতি রিফ্রেশ',
      seconds: 'সেকেন্ড',
      minutes: 'মিনিট',
      ms: 'মিসে',
      percent: '%',
      users: 'ব্যবহারকারী',
      requests: 'অনুরোধ',
      tokens: 'টোকেন',
      performanceOverview: 'পারফরম্যান্স ওভারভিউ',
      systemHealth: 'সিস্টেম স্বাস্থ্য',
      resourceUtilization: 'রিসোর্স ব্যবহার',
      trafficAnalysis: 'ট্রাফিক বিশ্লেষণ',
      alertsAndNotifications: 'সতর্কতা ও বিজ্ঞপ্তি',
      configureAlerts: 'সতর্কতা কনফিগার করুন',
      thresholds: 'থ্রেশহোল্ড',
      save: 'সংরক্ষণ',
      cancel: 'বাতিল'
    }
  };

  const t = translations[language];

  // Sample data generation
  useEffect(() => {
    const generateSampleMetrics = () => {
      const agents = [
        { id: '1', name: 'Dr. Mimu Medical Assistant' },
        { id: '2', name: 'Legal Advisor Bot' },
        { id: '3', name: 'General Assistant' }
      ];

      const now = new Date();
      const sampleMetrics: PerformanceMetric[] = [];

      agents.forEach(agent => {
        for (let i = 0; i < 60; i++) {
          const timestamp = new Date(now.getTime() - i * 60000).toISOString();
          sampleMetrics.push({
            id: `${agent.id}-${i}`,
            agentId: agent.id,
            agentName: agent.name,
            timestamp,
            cpuUsage: Math.random() * 100,
            memoryUsage: Math.random() * 100,
            responseTime: Math.random() * 5000,
            requestsPerMinute: Math.floor(Math.random() * 100),
            successRate: 95 + Math.random() * 5,
            errorRate: Math.random() * 5,
            activeUsers: Math.floor(Math.random() * 50),
            tokensPerSecond: Math.random() * 1000,
            networkLatency: Math.random() * 200,
            queueLength: Math.floor(Math.random() * 20)
          });
        }
      });

      setMetrics(sampleMetrics);
    };

    generateSampleMetrics();
  }, []);

  // Real-time updates
  useEffect(() => {
    if (!isRealTime) return;

    const interval = setInterval(() => {
      // Simulate real-time metric updates
      setMetrics(prev => {
        const newMetrics = [...prev];
        const agents = ['1', '2', '3'];
        const agentNames = ['Dr. Mimu Medical Assistant', 'Legal Advisor Bot', 'General Assistant'];
        
        agents.forEach((agentId, index) => {
          const newMetric: PerformanceMetric = {
            id: `${agentId}-${Date.now()}`,
            agentId,
            agentName: agentNames[index],
            timestamp: new Date().toISOString(),
            cpuUsage: Math.random() * 100,
            memoryUsage: Math.random() * 100,
            responseTime: Math.random() * 5000,
            requestsPerMinute: Math.floor(Math.random() * 100),
            successRate: 95 + Math.random() * 5,
            errorRate: Math.random() * 5,
            activeUsers: Math.floor(Math.random() * 50),
            tokensPerSecond: Math.random() * 1000,
            networkLatency: Math.random() * 200,
            queueLength: Math.floor(Math.random() * 20)
          };
          newMetrics.unshift(newMetric);
        });

        // Keep only recent metrics
        return newMetrics.slice(0, 1000);
      });
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [isRealTime, refreshInterval]);

  const getFilteredMetrics = () => {
    let filtered = metrics;

    if (selectedAgent !== 'all') {
      filtered = filtered.filter(m => m.agentId === selectedAgent);
    }

    const now = new Date();
    let timeLimit: Date;

    switch (selectedTimeRange) {
      case '1h':
        timeLimit = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '6h':
        timeLimit = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        break;
      case '24h':
        timeLimit = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        timeLimit = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        timeLimit = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        timeLimit = new Date(now.getTime() - 60 * 60 * 1000);
    }

    return filtered.filter(m => new Date(m.timestamp) >= timeLimit);
  };

  const getMetricStats = (metricKey: keyof PerformanceMetric) => {
    const filteredMetrics = getFilteredMetrics();
    const values = filteredMetrics.map(m => Number(m[metricKey])).filter(v => !isNaN(v));
    
    if (values.length === 0) return { current: 0, average: 0, peak: 0 };

    return {
      current: values[0] || 0,
      average: values.reduce((a, b) => a + b, 0) / values.length,
      peak: Math.max(...values)
    };
  };

  const getHealthStatus = (value: number, threshold: number, isInverse = false) => {
    if (isInverse) {
      if (value < threshold * 0.7) return 'healthy';
      if (value < threshold) return 'warning';
      return 'critical';
    } else {
      if (value > threshold) return 'critical';
      if (value > threshold * 0.8) return 'warning';
      return 'healthy';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const MetricCard = ({ title, value, unit, icon: Icon, threshold, isInverse = false }: {
    title: string;
    value: number;
    unit: string;
    icon: React.ComponentType<any>;
    threshold: number;
    isInverse?: boolean;
  }) => {
    const stats = getMetricStats(title.toLowerCase().replace(/[^a-z]/g, '') as keyof PerformanceMetric);
    const status = getHealthStatus(value, threshold, isInverse);
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Icon className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-medium text-gray-900">{title}</h3>
          </div>
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
            {getStatusIcon(status)}
            <span>{t[status as keyof typeof t]}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-gray-900">
              {typeof value === 'number' ? value.toFixed(1) : value}
            </span>
            <span className="text-sm text-gray-500">{unit}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
            <div>
              <span className="block">{t.average}</span>
              <span className="font-medium">{stats.average.toFixed(1)} {unit}</span>
            </div>
            <div>
              <span className="block">{t.peak}</span>
              <span className="font-medium">{stats.peak.toFixed(1)} {unit}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const currentMetrics = getFilteredMetrics()[0] || {
    cpuUsage: 0,
    memoryUsage: 0,
    responseTime: 0,
    requestsPerMinute: 0,
    successRate: 0,
    errorRate: 0,
    activeUsers: 0,
    tokensPerSecond: 0,
    networkLatency: 0,
    queueLength: 0
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Activity className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">{t.autoRefresh}</label>
            <button
              onClick={() => setIsRealTime(!isRealTime)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isRealTime ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isRealTime ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>{t.refresh}</span>
          </button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>{t.export}</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">{t.timeRange}:</label>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="1h">{t.lastHour}</option>
              <option value="6h">{t.last6Hours}</option>
              <option value="24h">{t.last24Hours}</option>
              <option value="7d">{t.last7Days}</option>
              <option value="30d">{t.last30Days}</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">{t.agent}:</label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{t.allAgents}</option>
              <option value="1">Dr. Mimu Medical Assistant</option>
              <option value="2">Legal Advisor Bot</option>
              <option value="3">General Assistant</option>
            </select>
          </div>
          {isRealTime && (
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">{t.refreshEvery}:</label>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={1000}>1 {t.seconds}</option>
                <option value={5000}>5 {t.seconds}</option>
                <option value={10000}>10 {t.seconds}</option>
                <option value={30000}>30 {t.seconds}</option>
                <option value={60000}>1 {t.minutes}</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Performance Overview */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">{t.performanceOverview}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title={t.cpuUsage}
            value={currentMetrics.cpuUsage}
            unit={t.percent}
            icon={Cpu}
            threshold={alertThresholds.cpuUsage}
          />
          <MetricCard
            title={t.memoryUsage}
            value={currentMetrics.memoryUsage}
            unit={t.percent}
            icon={Memory}
            threshold={alertThresholds.memoryUsage}
          />
          <MetricCard
            title={t.responseTime}
            value={currentMetrics.responseTime}
            unit={t.ms}
            icon={Clock}
            threshold={alertThresholds.responseTime}
          />
          <MetricCard
            title={t.requestsPerMinute}
            value={currentMetrics.requestsPerMinute}
            unit={t.requests}
            icon={BarChart3}
            threshold={50}
            isInverse
          />
        </div>
      </div>

      {/* System Health */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">{t.systemHealth}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCard
            title={t.successRate}
            value={currentMetrics.successRate}
            unit={t.percent}
            icon={CheckCircle}
            threshold={95}
            isInverse
          />
          <MetricCard
            title={t.errorRate}
            value={currentMetrics.errorRate}
            unit={t.percent}
            icon={AlertTriangle}
            threshold={alertThresholds.errorRate}
          />
          <MetricCard
            title={t.activeUsers}
            value={currentMetrics.activeUsers}
            unit={t.users}
            icon={Users}
            threshold={100}
            isInverse
          />
        </div>
      </div>

      {/* Resource Utilization */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">{t.resourceUtilization}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCard
            title={t.tokensPerSecond}
            value={currentMetrics.tokensPerSecond}
            unit={t.tokens}
            icon={Zap}
            threshold={500}
            isInverse
          />
          <MetricCard
            title={t.networkLatency}
            value={currentMetrics.networkLatency}
            unit={t.ms}
            icon={Activity}
            threshold={100}
          />
          <MetricCard
            title={t.queueLength}
            value={currentMetrics.queueLength}
            unit={t.requests}
            icon={MessageSquare}
            threshold={10}
          />
        </div>
      </div>

      {/* Alerts Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">{t.alertsAndNotifications}</h2>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            {t.configureAlerts}
          </button>
        </div>
        <div className="text-center py-8">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-2" />
          <p className="text-gray-600">{t.noAlerts}</p>
        </div>
      </div>
    </div>
  );
};

export default AIAgentPerformanceMonitor;