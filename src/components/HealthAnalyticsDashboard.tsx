// Health Analytics Dashboard - স্বাস্থ্য বিশ্লেষণ ড্যাশবোর্ড
import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, Activity, Heart, Droplets, Thermometer,
  Weight, Zap, Brain, Eye, Shield, Calendar, Filter,
  Download, Share2, RefreshCw, AlertTriangle, CheckCircle,
  BarChart3, LineChart, PieChart, Target, Award, Clock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

// Types
interface HealthMetric {
  id: string;
  type: 'bp' | 'sugar' | 'weight' | 'temperature' | 'pulse' | 'oxygen' | 'cholesterol' | 'bmi';
  value: number | string;
  unit: string;
  date: Date;
  status: 'normal' | 'warning' | 'critical';
  target?: number;
  notes?: string;
}

interface HealthTrend {
  metric: string;
  period: '7d' | '30d' | '90d' | '1y';
  trend: 'improving' | 'stable' | 'declining';
  change: number;
  data: { date: Date; value: number }[];
}

interface HealthGoal {
  id: string;
  type: 'weight_loss' | 'bp_control' | 'sugar_control' | 'exercise' | 'medication_adherence';
  title: string;
  target: number;
  current: number;
  unit: string;
  deadline: Date;
  progress: number;
  status: 'on_track' | 'behind' | 'achieved';
}

interface HealthInsight {
  id: string;
  type: 'recommendation' | 'warning' | 'achievement' | 'reminder';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionRequired: boolean;
  date: Date;
}

interface HealthReport {
  id: string;
  title: string;
  type: 'monthly' | 'quarterly' | 'annual' | 'custom';
  period: { start: Date; end: Date };
  metrics: HealthMetric[];
  insights: HealthInsight[];
  recommendations: string[];
  generatedDate: Date;
}

const HealthAnalyticsDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['bp', 'sugar', 'weight']);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [healthTrends, setHealthTrends] = useState<HealthTrend[]>([]);
  const [healthGoals, setHealthGoals] = useState<HealthGoal[]>([]);
  const [healthInsights, setHealthInsights] = useState<HealthInsight[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'goals' | 'insights' | 'reports'>('overview');
  const [showExportModal, setShowExportModal] = useState(false);
  
  const { user } = useAuth();
  const { showNotification } = useNotification();

  // Initialize data
  useEffect(() => {
    loadHealthData();
  }, [selectedPeriod]);

  const loadHealthData = () => {
    // Sample health metrics
    const sampleMetrics: HealthMetric[] = [
      {
        id: '1',
        type: 'bp',
        value: '140/90',
        unit: 'mmHg',
        date: new Date('2024-01-20'),
        status: 'warning',
        target: 120,
        notes: 'সকালে পরিমাপ করা হয়েছে'
      },
      {
        id: '2',
        type: 'sugar',
        value: 180,
        unit: 'mg/dL',
        date: new Date('2024-01-20'),
        status: 'critical',
        target: 140,
        notes: 'খাবারের ২ ঘন্টা পর'
      },
      {
        id: '3',
        type: 'weight',
        value: 75,
        unit: 'kg',
        date: new Date('2024-01-20'),
        status: 'normal',
        target: 70
      },
      {
        id: '4',
        type: 'pulse',
        value: 85,
        unit: 'bpm',
        date: new Date('2024-01-20'),
        status: 'normal',
        target: 80
      }
    ];

    // Sample health trends
    const sampleTrends: HealthTrend[] = [
      {
        metric: 'রক্তচাপ',
        period: selectedPeriod,
        trend: 'declining',
        change: -5.2,
        data: [
          { date: new Date('2024-01-01'), value: 145 },
          { date: new Date('2024-01-08'), value: 142 },
          { date: new Date('2024-01-15'), value: 140 },
          { date: new Date('2024-01-20'), value: 138 }
        ]
      },
      {
        metric: 'রক্তের সুগার',
        period: selectedPeriod,
        trend: 'improving',
        change: -8.5,
        data: [
          { date: new Date('2024-01-01'), value: 200 },
          { date: new Date('2024-01-08'), value: 190 },
          { date: new Date('2024-01-15'), value: 185 },
          { date: new Date('2024-01-20'), value: 180 }
        ]
      },
      {
        metric: 'ওজন',
        period: selectedPeriod,
        trend: 'stable',
        change: -0.5,
        data: [
          { date: new Date('2024-01-01'), value: 76 },
          { date: new Date('2024-01-08'), value: 75.5 },
          { date: new Date('2024-01-15'), value: 75.2 },
          { date: new Date('2024-01-20'), value: 75 }
        ]
      }
    ];

    // Sample health goals
    const sampleGoals: HealthGoal[] = [
      {
        id: '1',
        type: 'weight_loss',
        title: 'ওজন কমানো',
        target: 70,
        current: 75,
        unit: 'kg',
        deadline: new Date('2024-06-01'),
        progress: 60,
        status: 'on_track'
      },
      {
        id: '2',
        type: 'bp_control',
        title: 'রক্তচাপ নিয়ন্ত্রণ',
        target: 120,
        current: 140,
        unit: 'mmHg',
        deadline: new Date('2024-03-01'),
        progress: 40,
        status: 'behind'
      },
      {
        id: '3',
        type: 'sugar_control',
        title: 'ডায়াবেটিস নিয়ন্ত্রণ',
        target: 140,
        current: 180,
        unit: 'mg/dL',
        deadline: new Date('2024-04-01'),
        progress: 30,
        status: 'behind'
      }
    ];

    // Sample health insights
    const sampleInsights: HealthInsight[] = [
      {
        id: '1',
        type: 'warning',
        title: 'রক্তের সুগার বেশি',
        description: 'আপনার রক্তের সুগার স্বাভাবিকের চেয়ে বেশি। ডাক্তারের সাথে পরামর্শ করুন।',
        priority: 'high',
        actionRequired: true,
        date: new Date()
      },
      {
        id: '2',
        type: 'recommendation',
        title: 'ব্যায়াম বৃদ্ধি করুন',
        description: 'নিয়মিত ৩০ মিনিট হাঁটাহাঁটি আপনার স্বাস্থ্যের উন্নতি করবে।',
        priority: 'medium',
        actionRequired: false,
        date: new Date()
      },
      {
        id: '3',
        type: 'achievement',
        title: 'ওষুধ সেবনে নিয়মিততা',
        description: 'গত সপ্তাহে আপনি ৯৫% সময় নিয়মিত ওষুধ সেবন করেছেন। চমৎকার!',
        priority: 'low',
        actionRequired: false,
        date: new Date()
      }
    ];

    setHealthMetrics(sampleMetrics);
    setHealthTrends(sampleTrends);
    setHealthGoals(sampleGoals);
    setHealthInsights(sampleInsights);
  };

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'bp': return <Heart className="w-5 h-5" />;
      case 'sugar': return <Droplets className="w-5 h-5" />;
      case 'weight': return <Weight className="w-5 h-5" />;
      case 'temperature': return <Thermometer className="w-5 h-5" />;
      case 'pulse': return <Activity className="w-5 h-5" />;
      case 'oxygen': return <Heart className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getMetricName = (type: string) => {
    switch (type) {
      case 'bp': return 'রক্তচাপ';
      case 'sugar': return 'রক্তের সুগার';
      case 'weight': return 'ওজন';
      case 'temperature': return 'তাপমাত্রা';
      case 'pulse': return 'নাড়ির গতি';
      case 'oxygen': return 'অক্সিজেন';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'stable': return <Activity className="w-4 h-4 text-blue-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const exportHealthReport = () => {
    const report: HealthReport = {
      id: `report-${Date.now()}`,
      title: 'স্বাস্থ্য রিপোর্ট',
      type: 'monthly',
      period: {
        start: new Date(new Date().setDate(new Date().getDate() - 30)),
        end: new Date()
      },
      metrics: healthMetrics,
      insights: healthInsights,
      recommendations: [
        'নিয়মিত ওষুধ সেবন করুন',
        'দৈনিক ৩০ মিনিট ব্যায়াম করুন',
        'স্বাস্থ্যকর খাবার খান',
        'পর্যাপ্ত পানি পান করুন'
      ],
      generatedDate: new Date()
    };
    
    // Simulate export
    showNotification('স্বাস্থ্য রিপোর্ট ডাউনলোড শুরু হয়েছে', 'success');
    setShowExportModal(false);
  };

  // Render Overview Tab
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {healthMetrics.map(metric => (
          <div key={metric.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${getStatusColor(metric.status)}`}>
                {getMetricIcon(metric.type)}
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                {metric.status === 'normal' ? 'স্বাভাবিক' :
                 metric.status === 'warning' ? 'সতর্কতা' : 'গুরুতর'}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">{getMetricName(metric.type)}</h3>
            <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
            <p className="text-sm text-gray-500">{metric.unit}</p>
            {metric.target && (
              <p className="text-xs text-gray-400 mt-1">
                লক্ষ্য: {metric.target} {metric.unit}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Health Trends */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">স্বাস্থ্য প্রবণতা</h3>
          <div className="flex space-x-2">
            {['7d', '30d', '90d', '1y'].map(period => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period as any)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === period
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {period === '7d' ? '৭ দিন' :
                 period === '30d' ? '৩০ দিন' :
                 period === '90d' ? '৯০ দিন' : '১ বছর'}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {healthTrends.map((trend, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">{trend.metric}</h4>
                {getTrendIcon(trend.trend)}
              </div>
              <p className={`text-lg font-bold ${
                trend.trend === 'improving' ? 'text-green-600' :
                trend.trend === 'declining' ? 'text-red-600' : 'text-blue-600'
              }`}>
                {trend.change > 0 ? '+' : ''}{trend.change}%
              </p>
              <p className="text-xs text-gray-500">
                {trend.trend === 'improving' ? 'উন্নতি হচ্ছে' :
                 trend.trend === 'declining' ? 'অবনতি হচ্ছে' : 'স্থিতিশীল'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Health Goals */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">স্বাস্থ্য লক্ষ্য</h3>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            নতুন লক্ষ্য যোগ করুন
          </button>
        </div>
        
        <div className="space-y-4">
          {healthGoals.map(goal => (
            <div key={goal.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-800">{goal.title}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  goal.status === 'on_track' ? 'bg-green-100 text-green-800' :
                  goal.status === 'behind' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {goal.status === 'on_track' ? 'ট্র্যাকে আছে' :
                   goal.status === 'behind' ? 'পিছিয়ে আছে' : 'অর্জিত'}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>বর্তমান: {goal.current} {goal.unit}</span>
                <span>লক্ষ্য: {goal.target} {goal.unit}</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className={`h-2 rounded-full ${
                    goal.status === 'on_track' ? 'bg-green-600' :
                    goal.status === 'behind' ? 'bg-red-600' : 'bg-blue-600'
                  }`}
                  style={{ width: `${goal.progress}%` }}
                ></div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{goal.progress}% সম্পন্ন</span>
                <span>শেষ তারিখ: {goal.deadline.toLocaleDateString('bn-BD')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Insights */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">স্বাস্থ্য অন্তর্দৃষ্টি</h3>
          <button 
            onClick={() => setActiveTab('insights')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            সব দেখুন
          </button>
        </div>
        
        <div className="space-y-3">
          {healthInsights.slice(0, 3).map(insight => (
            <div key={insight.id} className={`p-3 rounded-lg border-l-4 ${
              insight.type === 'warning' ? 'bg-red-50 border-red-400' :
              insight.type === 'recommendation' ? 'bg-blue-50 border-blue-400' :
              insight.type === 'achievement' ? 'bg-green-50 border-green-400' :
              'bg-gray-50 border-gray-400'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-800 mb-1">{insight.title}</h4>
                  <p className="text-sm text-gray-600">{insight.description}</p>
                </div>
                {insight.actionRequired && (
                  <AlertTriangle className="w-4 h-4 text-red-500 ml-2 flex-shrink-0" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">স্বাস্থ্য বিশ্লেষণ</h1>
                <p className="text-sm text-gray-600">আপনার স্বাস্থ্য ডেটা ও প্রবণতা</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowExportModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>রিপোর্ট ডাউনলোড</span>
              </button>
              
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'সংক্ষিপ্ত বিবরণ', icon: BarChart3 },
              { id: 'trends', label: 'প্রবণতা', icon: TrendingUp },
              { id: 'goals', label: 'লক্ষ্য', icon: Target },
              { id: 'insights', label: 'অন্তর্দৃষ্টি', icon: Brain },
              { id: 'reports', label: 'রিপোর্ট', icon: FileText }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'trends' && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">স্বাস্থ্য প্রবণতা</h2>
            <p className="text-gray-600">বিস্তারিত প্রবণতা বিশ্লেষণ শীঘ্রই আসছে...</p>
          </div>
        )}
        {activeTab === 'goals' && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">স্বাস্থ্য লক্ষ্য</h2>
            <p className="text-gray-600">লক্ষ্য ব্যবস্থাপনা ফিচার শীঘ্রই আসছে...</p>
          </div>
        )}
        {activeTab === 'insights' && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">স্বাস্থ্য অন্তর্দৃষ্টি</h2>
            <div className="space-y-4">
              {healthInsights.map(insight => (
                <div key={insight.id} className={`p-4 rounded-lg border-l-4 ${
                  insight.type === 'warning' ? 'bg-red-50 border-red-400' :
                  insight.type === 'recommendation' ? 'bg-blue-50 border-blue-400' :
                  insight.type === 'achievement' ? 'bg-green-50 border-green-400' :
                  'bg-gray-50 border-gray-400'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-sm font-medium text-gray-800">{insight.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          insight.priority === 'high' ? 'bg-red-100 text-red-800' :
                          insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {insight.priority === 'high' ? 'উচ্চ' :
                           insight.priority === 'medium' ? 'মাঝারি' : 'নিম্ন'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                      <p className="text-xs text-gray-500">
                        {insight.date.toLocaleDateString('bn-BD')}
                      </p>
                    </div>
                    {insight.actionRequired && (
                      <AlertTriangle className="w-5 h-5 text-red-500 ml-2 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'reports' && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">স্বাস্থ্য রিপোর্ট</h2>
            <p className="text-gray-600">রিপোর্ট জেনারেশন ফিচার শীঘ্রই আসছে...</p>
          </div>
        )}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">রিপোর্ট ডাউনলোড</h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">রিপোর্টের ধরন</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="monthly">মাসিক রিপোর্ট</option>
                  <option value="quarterly">ত্রৈমাসিক রিপোর্ট</option>
                  <option value="annual">বার্ষিক রিপোর্ট</option>
                  <option value="custom">কাস্টম রিপোর্ট</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ফরম্যাট</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">অন্তর্ভুক্ত করুন</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span className="text-sm text-gray-700">স্বাস্থ্য মেট্রিক্স</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span className="text-sm text-gray-700">প্রবণতা বিশ্লেষণ</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span className="text-sm text-gray-700">সুপারিশসমূহ</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-700">চার্ট ও গ্রাফ</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                বাতিল
              </button>
              <button
                onClick={exportHealthReport}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ডাউনলোড করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthAnalyticsDashboard;