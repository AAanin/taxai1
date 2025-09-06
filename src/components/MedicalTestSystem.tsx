// Medical Test System Component - মেডিকেল টেস্ট সিস্টেম কম্পোনেন্ট
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Heart,
  Droplets,
  Brain,
  Zap,
  FileText,
  Download,
  Upload,
  Save,
  MessageCircle,
  CheckCircle,
  AlertTriangle,
  Info,
  TrendingUp,
  Calendar,
  User,
  Printer,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Shield,
  Clock,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Smartphone,
  Monitor
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

// Test Types and Interfaces
interface TestResult {
  id: string;
  name: string;
  value: number | string;
  unit: string;
  normalRange: string;
  status: 'normal' | 'high' | 'low' | 'critical';
  category: string;
}

interface TestCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  tests: TestResult[];
}

interface PatientInfo {
  name: string;
  age: number;
  gender: 'male' | 'female';
  testDate: string;
}

const MedicalTestSystem: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('kidney');
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    name: '',
    age: 0,
    gender: 'male',
    testDate: new Date().toISOString().split('T')[0]
  });
  const [testResults, setTestResults] = useState<{ [key: string]: TestResult[] }>({});
  const [showResults, setShowResults] = useState(false);
  const [savedTests, setSavedTests] = useState<any[]>([]);
  const [showHelp, setShowHelp] = useState<{ [key: string]: boolean }>({});
  const [isMobile, setIsMobile] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});

  // Test Categories Configuration
  const testCategories: TestCategory[] = [
    {
      id: 'kidney',
      name: 'কিডনি ফাংশন টেস্ট',
      icon: <Droplets className="w-6 h-6" />,
      color: 'blue',
      tests: [
        { id: 'creatinine', name: 'ক্রিয়েটিনিন', value: '', unit: 'mg/dL', normalRange: '0.6-1.2', status: 'normal', category: 'kidney' },
        { id: 'bun', name: 'BUN (Blood Urea Nitrogen)', value: '', unit: 'mg/dL', normalRange: '7-20', status: 'normal', category: 'kidney' },
        { id: 'gfr', name: 'GFR (Glomerular Filtration Rate)', value: '', unit: 'mL/min/1.73m²', normalRange: '>60', status: 'normal', category: 'kidney' },
        { id: 'urea', name: 'ইউরিয়া', value: '', unit: 'mg/dL', normalRange: '15-40', status: 'normal', category: 'kidney' }
      ]
    },
    {
      id: 'liver',
      name: 'লিভার ফাংশন টেস্ট',
      icon: <Activity className="w-6 h-6" />,
      color: 'green',
      tests: [
        { id: 'alt', name: 'ALT (Alanine Transaminase)', value: '', unit: 'U/L', normalRange: '7-56', status: 'normal', category: 'liver' },
        { id: 'ast', name: 'AST (Aspartate Transaminase)', value: '', unit: 'U/L', normalRange: '10-40', status: 'normal', category: 'liver' },
        { id: 'bilirubin', name: 'বিলিরুবিন (Total)', value: '', unit: 'mg/dL', normalRange: '0.3-1.2', status: 'normal', category: 'liver' },
        { id: 'albumin', name: 'অ্যালবুমিন', value: '', unit: 'g/dL', normalRange: '3.5-5.0', status: 'normal', category: 'liver' }
      ]
    },
    {
      id: 'blood',
      name: 'রক্ত পরীক্ষা',
      icon: <Heart className="w-6 h-6" />,
      color: 'red',
      tests: [
        { id: 'hemoglobin', name: 'হিমোগ্লোবিন', value: '', unit: 'g/dL', normalRange: '12-16 (F), 14-18 (M)', status: 'normal', category: 'blood' },
        { id: 'glucose', name: 'গ্লুকোজ (Fasting)', value: '', unit: 'mg/dL', normalRange: '70-100', status: 'normal', category: 'blood' },
        { id: 'cholesterol', name: 'কোলেস্টেরল (Total)', value: '', unit: 'mg/dL', normalRange: '<200', status: 'normal', category: 'blood' },
        { id: 'wbc', name: 'WBC (White Blood Cells)', value: '', unit: '/μL', normalRange: '4,000-11,000', status: 'normal', category: 'blood' }
      ]
    },
    {
      id: 'urine',
      name: 'প্রস্রাব পরীক্ষা',
      icon: <Droplets className="w-6 h-6" />,
      color: 'yellow',
      tests: [
        { id: 'protein', name: 'প্রোটিন', value: '', unit: 'mg/dL', normalRange: '<30', status: 'normal', category: 'urine' },
        { id: 'sugar', name: 'চিনি', value: '', unit: 'mg/dL', normalRange: 'Negative', status: 'normal', category: 'urine' },
        { id: 'blood_urine', name: 'রক্ত', value: '', unit: '', normalRange: 'Negative', status: 'normal', category: 'urine' },
        { id: 'specific_gravity', name: 'Specific Gravity', value: '', unit: '', normalRange: '1.003-1.030', status: 'normal', category: 'urine' }
      ]
    },
    {
      id: 'cardiac',
      name: 'হৃদযন্ত্র পরীক্ষা',
      icon: <Heart className="w-6 h-6" />,
      color: 'pink',
      tests: [
        { id: 'systolic_bp', name: 'সিস্টোলিক BP', value: '', unit: 'mmHg', normalRange: '90-120', status: 'normal', category: 'cardiac' },
        { id: 'diastolic_bp', name: 'ডায়াস্টোলিক BP', value: '', unit: 'mmHg', normalRange: '60-80', status: 'normal', category: 'cardiac' },
        { id: 'heart_rate', name: 'হার্ট রেট', value: '', unit: 'bpm', normalRange: '60-100', status: 'normal', category: 'cardiac' },
        { id: 'ecg', name: 'ECG', value: '', unit: '', normalRange: 'Normal', status: 'normal', category: 'cardiac' }
      ]
    },
    {
      id: 'thyroid',
      name: 'থাইরয়েড পরীক্ষা',
      icon: <Brain className="w-6 h-6" />,
      color: 'purple',
      tests: [
        { id: 'tsh', name: 'TSH', value: '', unit: 'mIU/L', normalRange: '0.4-4.0', status: 'normal', category: 'thyroid' },
        { id: 't3', name: 'T3', value: '', unit: 'ng/dL', normalRange: '80-200', status: 'normal', category: 'thyroid' },
        { id: 't4', name: 'T4', value: '', unit: 'μg/dL', normalRange: '5.0-12.0', status: 'normal', category: 'thyroid' },
        { id: 'ft4', name: 'Free T4', value: '', unit: 'ng/dL', normalRange: '0.8-1.8', status: 'normal', category: 'thyroid' }
      ]
    }
  ];

  // Initialize test results and mobile detection
  useEffect(() => {
    const initialResults: { [key: string]: TestResult[] } = {};
    testCategories.forEach(category => {
      initialResults[category.id] = [...category.tests];
    });
    setTestResults(initialResults);

    // Load saved tests from localStorage
    const saved = localStorage.getItem('medicalTests');
    if (saved) {
      setSavedTests(JSON.parse(saved));
    }

    // Mobile detection
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update test value and determine status
  const updateTestValue = (categoryId: string, testId: string, value: string) => {
    setTestResults(prev => {
      const updated = { ...prev };
      const categoryTests = [...updated[categoryId]];
      const testIndex = categoryTests.findIndex(test => test.id === testId);
      
      if (testIndex !== -1) {
        const test = { ...categoryTests[testIndex] };
        test.value = value;
        test.status = determineTestStatus(test, value);
        categoryTests[testIndex] = test;
        updated[categoryId] = categoryTests;
      }
      
      return updated;
    });
  };

  // Determine test status based on value and normal range
  const determineTestStatus = (test: TestResult, value: string): 'normal' | 'high' | 'low' | 'critical' => {
    if (!value || value === '') return 'normal';
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'normal';

    // Simple logic for demonstration - in real app, this would be more sophisticated
    const range = test.normalRange;
    if (range.includes('-')) {
      const [min, max] = range.split('-').map(v => parseFloat(v.replace(/[^0-9.]/g, '')));
      if (numValue < min) return 'low';
      if (numValue > max) return 'high';
      return 'normal';
    } else if (range.includes('<')) {
      const maxValue = parseFloat(range.replace(/[^0-9.]/g, ''));
      return numValue > maxValue ? 'high' : 'normal';
    } else if (range.includes('>')) {
      const minValue = parseFloat(range.replace(/[^0-9.]/g, ''));
      return numValue < minValue ? 'low' : 'normal';
    }
    
    return 'normal';
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600 bg-green-100';
      case 'high': return 'text-red-600 bg-red-100';
      case 'low': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-800 bg-red-200';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal': return <CheckCircle className="w-4 h-4" />;
      case 'high': case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'low': return <Info className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  // Save test results
  const saveTestResults = () => {
    const testData = {
      id: Date.now().toString(),
      patientInfo,
      testResults,
      createdAt: new Date().toISOString(),
      summary: generateTestSummary()
    };
    
    const saved = [...savedTests, testData];
    setSavedTests(saved);
    localStorage.setItem('medicalTests', JSON.stringify(saved));
    
    alert('টেস্ট ফলাফল সফলভাবে সেভ করা হয়েছে!');
  };

  // Generate test summary
  const generateTestSummary = () => {
    const allTests = Object.values(testResults).flat();
    const abnormalTests = allTests.filter(test => test.status !== 'normal' && test.value !== '');
    
    return {
      totalTests: allTests.filter(test => test.value !== '').length,
      normalTests: allTests.filter(test => test.status === 'normal' && test.value !== '').length,
      abnormalTests: abnormalTests.length,
      criticalTests: abnormalTests.filter(test => test.status === 'critical').length
    };
  };

  // Export to AI Chat
  const exportToAIChat = () => {
    const summary = generateTestSummary();
    const allTests = Object.values(testResults).flat().filter(test => test.value !== '');
    
    const chatMessage = `মেডিকেল টেস্ট রিপোর্ট:\n\nরোগীর তথ্য:\n- নাম: ${patientInfo.name}\n- বয়স: ${patientInfo.age}\n- লিঙ্গ: ${patientInfo.gender}\n- পরীক্ষার তারিখ: ${patientInfo.testDate}\n\nটেস্ট সারসংক্ষেপ:\n- মোট পরীক্ষা: ${summary.totalTests}\n- স্বাভাবিক: ${summary.normalTests}\n- অস্বাভাবিক: ${summary.abnormalTests}\n\nবিস্তারিত ফলাফল:\n${allTests.map(test => `- ${test.name}: ${test.value} ${test.unit} (স্বাভাবিক: ${test.normalRange}) - ${test.status}`).join('\n')}\n\nদয়া করে এই ফলাফল বিশ্লেষণ করুন এবং পরামর্শ দিন।`;
    
    // Store in localStorage for AI chat to pick up
    localStorage.setItem('pendingChatMessage', chatMessage);
    
    // Navigate to chat page
    navigate('/chat');
  };

  // Generate PDF Report
  const generatePDFReport = () => {
    window.print();
  };

  // Generate chart data for visualization
  const generateChartData = () => {
    const allTests = Object.values(testResults).flat().filter(test => test.value !== '');
    
    // Category-wise test count
    const categoryData = testCategories.map(category => {
      const categoryTests = testResults[category.id]?.filter(test => test.value !== '') || [];
      const normalCount = categoryTests.filter(test => test.status === 'normal').length;
      const abnormalCount = categoryTests.filter(test => test.status !== 'normal').length;
      
      return {
        name: category.name,
        normal: normalCount,
        abnormal: abnormalCount,
        total: categoryTests.length
      };
    }).filter(item => item.total > 0);

    // Status distribution
    const statusData = [
      { name: 'স্বাভাবিক', value: allTests.filter(test => test.status === 'normal').length, color: '#10B981' },
      { name: 'উচ্চ', value: allTests.filter(test => test.status === 'high').length, color: '#EF4444' },
      { name: 'নিম্ন', value: allTests.filter(test => test.status === 'low').length, color: '#F59E0B' },
      { name: 'গুরুতর', value: allTests.filter(test => test.status === 'critical').length, color: '#DC2626' }
    ].filter(item => item.value > 0);

    // Trend data (simulated for demonstration)
    const trendData = [
      { month: 'জানুয়ারি', normal: 85, abnormal: 15 },
      { month: 'ফেব্রুয়ারি', normal: 82, abnormal: 18 },
      { month: 'মার্চ', normal: 88, abnormal: 12 },
      { month: 'এপ্রিল', normal: 90, abnormal: 10 },
      { month: 'মে', normal: 87, abnormal: 13 },
      { month: 'জুন', normal: 92, abnormal: 8 }
    ];

    return { categoryData, statusData, trendData };
  };

  // Get health score based on test results
  const getHealthScore = () => {
    const allTests = Object.values(testResults).flat().filter(test => test.value !== '');
    if (allTests.length === 0) return 0;
    
    const normalTests = allTests.filter(test => test.status === 'normal').length;
    const score = Math.round((normalTests / allTests.length) * 100);
    return score;
  };

  // Get health recommendations
  const getHealthRecommendations = () => {
    const allTests = Object.values(testResults).flat().filter(test => test.value !== '');
    const abnormalTests = allTests.filter(test => test.status !== 'normal');
    
    const recommendations = [];
    
    if (abnormalTests.length === 0) {
      recommendations.push('🎉 সব পরীক্ষার ফলাফল স্বাভাবিক! নিয়মিত স্বাস্থ্যকর জীবনযাত্রা বজায় রাখুন।');
    } else {
      recommendations.push(`⚠️ ${abnormalTests.length}টি পরীক্ষার ফলাফল অস্বাভাবিক। ডাক্তারের পরামর্শ নিন।`);
      
      // Specific recommendations based on test categories
      const kidneyIssues = abnormalTests.filter(test => test.category === 'kidney');
      const liverIssues = abnormalTests.filter(test => test.category === 'liver');
      const bloodIssues = abnormalTests.filter(test => test.category === 'blood');
      
      if (kidneyIssues.length > 0) {
        recommendations.push('🫘 কিডনির স্বাস্থ্যের জন্য পর্যাপ্ত পানি পান করুন এবং লবণ কম খান।');
      }
      
      if (liverIssues.length > 0) {
        recommendations.push('🫀 লিভারের স্বাস্থ্যের জন্য অ্যালকোহল এড়িয়ে চলুন এবং স্বাস্থ্যকর খাবার খান।');
      }
      
      if (bloodIssues.length > 0) {
        recommendations.push('🩸 রক্তের স্বাস্থ্যের জন্য নিয়মিত ব্যায়াম করুন এবং পুষ্টিকর খাবার খান।');
      }
    }
    
    return recommendations;
  };

  // Toggle help tooltip
  const toggleHelp = (testId: string) => {
    setShowHelp(prev => ({
      ...prev,
      [testId]: !prev[testId]
    }));
  };

  // Toggle category expansion on mobile
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Get test explanation
  const getTestExplanation = (testId: string) => {
    const explanations: { [key: string]: string } = {
      'creatinine': 'ক্রিয়েটিনিন কিডনির কার্যকারিতা পরিমাপ করে। উচ্চ মাত্রা কিডনির সমস্যা নির্দেশ করতে পারে।',
      'bun': 'BUN রক্তে ইউরিয়া নাইট্রোজেনের পরিমাণ পরিমাপ করে। কিডনি ও লিভারের স্বাস্থ্য নির্ধারণে সহায়ক।',
      'gfr': 'GFR কিডনির ফিল্ট্রেশন ক্ষমতা পরিমাপ করে। ৬০ এর নিচে হলে কিডনির সমস্যা থাকতে পারে।',
      'alt': 'ALT লিভারের এনজাইম। উচ্চ মাত্রা লিভারের ক্ষতি বা প্রদাহ নির্দেশ করে।',
      'ast': 'AST লিভার ও হার্টের এনজাইম। উচ্চ মাত্রা লিভার বা হার্টের সমস্যা নির্দেশ করতে পারে।',
      'hemoglobin': 'হিমোগ্লোবিন রক্তে অক্সিজেন বহন করে। কম মাত্রা রক্তশূন্যতা নির্দেশ করে।',
      'glucose': 'রক্তে চিনির পরিমাণ। উচ্চ মাত্রা ডায়াবেটিসের লক্ষণ।',
      'tsh': 'TSH থাইরয়েড গ্রন্থির কার্যকারিতা নিয়ন্ত্রণ করে। অস্বাভাবিক মাত্রা থাইরয়েডের সমস্যা নির্দেশ করে।'
    };
    
    return explanations[testId] || 'এই পরীক্ষা সম্পর্কে বিস্তারিত তথ্যের জন্য ডাক্তারের পরামর্শ নিন।';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">মেডিকেল টেস্ট সিস্টেম</h1>
                <p className="text-gray-600">সম্পূর্ণ স্বাস্থ্য পরীক্ষা ও বিশ্লেষণ</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowResults(!showResults)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <TrendingUp className="w-4 h-4" />
                <span>{showResults ? 'টেস্ট ফর্ম' : 'ফলাফল দেখুন'}</span>
              </button>
            </div>
          </div>

          {/* Patient Information */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">রোগীর নাম</label>
              <input
                type="text"
                value={patientInfo.name}
                onChange={(e) => setPatientInfo(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="নাম লিখুন"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">বয়স</label>
              <input
                type="number"
                value={patientInfo.age || ''}
                onChange={(e) => setPatientInfo(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="বয়স"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">লিঙ্গ</label>
              <select
                value={patientInfo.gender}
                onChange={(e) => setPatientInfo(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="male">পুরুষ</option>
                <option value="female">মহিলা</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">পরীক্ষার তারিখ</label>
              <input
                type="date"
                value={patientInfo.testDate}
                onChange={(e) => setPatientInfo(prev => ({ ...prev, testDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {!showResults ? (
          /* Test Input Form */
          <div className="space-y-6">
            {/* Test Category Tabs - Mobile Responsive */}
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
              {isMobile ? (
                /* Mobile Accordion Style */
                <div className="space-y-2">
                  {testCategories.map((category) => (
                    <div key={category.id} className="border border-gray-200 rounded-lg">
                      <button
                        onClick={() => {
                          setActiveTab(category.id);
                          toggleCategory(category.id);
                        }}
                        className={`w-full flex items-center justify-between p-4 text-left transition-colors ${
                          activeTab === category.id
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {category.icon}
                          <span className="font-medium">{category.name}</span>
                        </div>
                        {expandedCategories[category.id] ? 
                          <ChevronUp className="w-5 h-5" /> : 
                          <ChevronDown className="w-5 h-5" />
                        }
                      </button>
                      
                      {activeTab === category.id && expandedCategories[category.id] && (
                        <div className="p-4 border-t border-gray-200 bg-gray-50">
                          <div className="grid grid-cols-1 gap-4">
                            {testResults[category.id]?.map((test) => (
                              <div key={test.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <label className="font-medium text-gray-900 text-sm">{test.name}</label>
                                    <button
                                      onClick={() => toggleHelp(test.id)}
                                      className="text-blue-500 hover:text-blue-700 transition-colors"
                                      title="সাহায্য"
                                    >
                                      <HelpCircle className="w-4 h-4" />
                                    </button>
                                  </div>
                                  <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
                                    getStatusColor(test.status)
                                  }`}>
                                    {getStatusIcon(test.status)}
                                    <span>{test.status === 'normal' ? 'স্বাভাবিক' : test.status === 'high' ? 'উচ্চ' : test.status === 'low' ? 'নিম্ন' : 'গুরুতর'}</span>
                                  </div>
                                </div>
                                
                                {/* Help Tooltip */}
                                {showHelp[test.id] && (
                                  <div className="mb-3 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                                    <p className="text-sm text-blue-800">{getTestExplanation(test.id)}</p>
                                  </div>
                                )}
                                
                                <div className="flex flex-col space-y-2">
                                  <input
                                    type="text"
                                    value={test.value}
                                    onChange={(e) => updateTestValue(category.id, test.id, e.target.value)}
                                    className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg"
                                    placeholder="মান লিখুন"
                                  />
                                  <div className="text-center py-2 bg-gray-100 text-gray-700 rounded-md font-medium">
                                    {test.unit}
                                  </div>
                                </div>
                                
                                <div className="mt-2 text-sm text-gray-600 text-center">
                                  <span className="font-medium">স্বাভাবিক সীমা:</span> {test.normalRange}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                /* Desktop Tab Style */
                <>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {testCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setActiveTab(category.id)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                          activeTab === category.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {category.icon}
                        <span className="font-medium">{category.name}</span>
                      </button>
                    ))}
                  </div>
                  
                  {/* Desktop Active Test Category */}
                  {testCategories.map((category) => (
                    activeTab === category.id && (
                      <div key={category.id} className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                          {category.icon}
                          <span>{category.name}</span>
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {testResults[category.id]?.map((test) => (
                            <div key={test.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <label className="font-medium text-gray-900">{test.name}</label>
                                  <button
                                    onClick={() => toggleHelp(test.id)}
                                    className="text-blue-500 hover:text-blue-700 transition-colors"
                                    title="সাহায্য"
                                  >
                                    <HelpCircle className="w-4 h-4" />
                                  </button>
                                </div>
                                <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
                                  getStatusColor(test.status)
                                }`}>
                                  {getStatusIcon(test.status)}
                                  <span>{test.status === 'normal' ? 'স্বাভাবিক' : test.status === 'high' ? 'উচ্চ' : test.status === 'low' ? 'নিম্ন' : 'গুরুতর'}</span>
                                </div>
                              </div>
                              
                              {/* Help Tooltip */}
                              {showHelp[test.id] && (
                                <div className="mb-3 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                                  <p className="text-sm text-blue-800">{getTestExplanation(test.id)}</p>
                                </div>
                              )}
                              
                              <div className="flex space-x-2">
                                <input
                                  type="text"
                                  value={test.value}
                                  onChange={(e) => updateTestValue(category.id, test.id, e.target.value)}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="মান লিখুন"
                                />
                                <span className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md font-medium">
                                  {test.unit}
                                </span>
                              </div>
                              
                              <div className="mt-2 text-sm text-gray-600">
                                <span className="font-medium">স্বাভাবিক সীমা:</span> {test.normalRange}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </>
              )}


            </div>

            {/* Action Buttons - Mobile Responsive */}
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
              <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 md:grid-cols-3 gap-4'}`}>
                <button
                  onClick={saveTestResults}
                  className={`flex items-center ${isMobile ? 'justify-center' : 'justify-center md:justify-start'} space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium`}
                >
                  <Save className="w-5 h-5" />
                  <span>ফলাফল সেভ করুন</span>
                </button>
                
                <button
                  onClick={exportToAIChat}
                  className={`flex items-center ${isMobile ? 'justify-center' : 'justify-center md:justify-start'} space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium`}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>AI চ্যাটে পাঠান</span>
                </button>
                
                <button
                  onClick={generatePDFReport}
                  className={`flex items-center ${isMobile ? 'justify-center' : 'justify-center md:justify-start'} space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium`}
                >
                  <Printer className="w-5 h-5" />
                  <span>রিপোর্ট প্রিন্ট করুন</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Results Dashboard */
          <div className="space-y-4 md:space-y-6">
            {/* Health Score & Summary Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* Health Score Card */}
              <div className="lg:col-span-1 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-4 md:p-6 text-white">
                <div className="text-center">
                  <Target className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} mx-auto mb-2`} />
                  <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium opacity-90`}>স্বাস্থ্য স্কোর</p>
                  <p className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold`}>{getHealthScore()}%</p>
                  <div className="mt-2">
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-white rounded-full h-2 transition-all duration-500"
                        style={{ width: `${getHealthScore()}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Summary Cards */}
              <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {(() => {
                  const summary = generateTestSummary();
                  return [
                    { label: 'মোট পরীক্ষা', value: summary.totalTests, color: 'blue', icon: <FileText className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'}`} /> },
                    { label: 'স্বাভাবিক', value: summary.normalTests, color: 'green', icon: <CheckCircle className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'}`} /> },
                    { label: 'অস্বাভাবিক', value: summary.abnormalTests, color: 'yellow', icon: <AlertTriangle className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'}`} /> },
                    { label: 'গুরুতর', value: summary.criticalTests, color: 'red', icon: <AlertTriangle className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'}`} /> }
                  ].map((item, index) => (
                    <div key={index} className={`bg-white rounded-xl shadow-lg ${isMobile ? 'p-3' : 'p-4'} border-l-4 border-${item.color}-500`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-xs'} font-medium`}>{item.label}</p>
                          <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-gray-900`}>{item.value}</p>
                        </div>
                        <div className={`text-${item.color}-600`}>
                          {item.icon}
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Charts and Analytics */}
            <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'lg:grid-cols-2 gap-6'}`}>
              {/* Category-wise Test Results Chart */}
              <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
                <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-900 mb-4 flex items-center space-x-2`}>
                  <BarChart3 className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                  <span>বিভাগ অনুযায়ী ফলাফল</span>
                </h3>
                <div className={`${isMobile ? 'h-48' : 'h-64'}`}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={generateChartData().categoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        fontSize={isMobile ? 10 : 12}
                        tick={{ fill: '#6B7280' }}
                        angle={isMobile ? -45 : 0}
                        textAnchor={isMobile ? 'end' : 'middle'}
                        height={isMobile ? 60 : 30}
                      />
                      <YAxis fontSize={isMobile ? 10 : 12} tick={{ fill: '#6B7280' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#F9FAFB', 
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="normal" fill="#10B981" name="স্বাভাবিক" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="abnormal" fill="#EF4444" name="অস্বাভাবিক" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Status Distribution Pie Chart */}
              <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
                <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-900 mb-4 flex items-center space-x-2`}>
                  <PieChart className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                  <span>অবস্থা বিতরণ</span>
                </h3>
                <div className={`${isMobile ? 'h-48' : 'h-64'}`}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={generateChartData().statusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={isMobile ? 60 : 80}
                        fill="#8884d8"
                        dataKey="value"
                        label={isMobile ? false : ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {generateChartData().statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      {isMobile && <Legend />}
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Health Trend Chart */}
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
              <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-900 mb-4 flex items-center space-x-2`}>
                <LineChart className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                <span>স্বাস্থ্য ট্রেন্ড (গত ৬ মাস)</span>
              </h3>
              <div className={`${isMobile ? 'h-48' : 'h-64'}`}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={generateChartData().trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      fontSize={isMobile ? 10 : 12}
                      tick={{ fill: '#6B7280' }}
                      angle={isMobile ? -45 : 0}
                      textAnchor={isMobile ? 'end' : 'middle'}
                      height={isMobile ? 60 : 30}
                    />
                    <YAxis fontSize={isMobile ? 10 : 12} tick={{ fill: '#6B7280' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#F9FAFB', 
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px'
                      }}
                    />
                    {!isMobile && <Legend />}
                    <Area 
                      type="monotone" 
                      dataKey="normal" 
                      stackId="1" 
                      stroke="#10B981" 
                      fill="#10B981" 
                      fillOpacity={0.6}
                      name="স্বাভাবিক %"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="abnormal" 
                      stackId="1" 
                      stroke="#EF4444" 
                      fill="#EF4444" 
                      fillOpacity={0.6}
                      name="অস্বাভাবিক %"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Health Recommendations */}
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
              <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-900 mb-4 flex items-center space-x-2`}>
                <Shield className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                <span>স্বাস্থ্য পরামর্শ</span>
              </h3>
              <div className={`space-y-${isMobile ? '2' : '3'}`}>
                {getHealthRecommendations().map((recommendation, index) => (
                  <div key={index} className={`p-${isMobile ? '3' : '4'} bg-blue-50 border-l-4 border-blue-500 rounded-r-lg`}>
                    <p className={`text-gray-800 ${isMobile ? 'text-sm' : 'text-base'}`}>{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Results */}
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
              <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-gray-900 mb-4 md:mb-6`}>বিস্তারিত ফলাফল</h3>
              
              <div className={`space-y-${isMobile ? '4' : '6'}`}>
                {testCategories.map((category) => {
                  const categoryTests = testResults[category.id]?.filter(test => test.value !== '') || [];
                  if (categoryTests.length === 0) return null;
                  
                  return (
                    <div key={category.id} className="border border-gray-200 rounded-lg p-3 md:p-4">
                      <h4 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-900 mb-3 md:mb-4 flex items-center space-x-2`}>
                        {category.icon}
                        <span>{category.name}</span>
                      </h4>
                      
                      {isMobile ? (
                        /* Mobile Card Layout */
                        <div className="space-y-3">
                          {categoryTests.map((test) => (
                            <div key={test.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-gray-900 text-sm">{test.name}</h5>
                                <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                                  getStatusColor(test.status)
                                }`}>
                                  {getStatusIcon(test.status)}
                                  <span>
                                    {test.status === 'normal' ? 'স্বাভাবিক' : 
                                     test.status === 'high' ? 'উচ্চ' : 
                                     test.status === 'low' ? 'নিম্ন' : 'গুরুতর'}
                                  </span>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-gray-600">ফলাফল:</span>
                                  <p className="font-medium text-gray-900">{test.value} {test.unit}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">স্বাভাবিক সীমা:</span>
                                  <p className="text-gray-700">{test.normalRange}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        /* Desktop Table Layout */
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left py-2 font-medium text-gray-700">পরীক্ষা</th>
                                <th className="text-left py-2 font-medium text-gray-700">ফলাফল</th>
                                <th className="text-left py-2 font-medium text-gray-700">স্বাভাবিক সীমা</th>
                                <th className="text-left py-2 font-medium text-gray-700">অবস্থা</th>
                              </tr>
                            </thead>
                            <tbody>
                              {categoryTests.map((test) => (
                                <tr key={test.id} className="border-b border-gray-100">
                                  <td className="py-3 font-medium text-gray-900">{test.name}</td>
                                  <td className="py-3 text-gray-700">{test.value} {test.unit}</td>
                                  <td className="py-3 text-gray-600">{test.normalRange}</td>
                                  <td className="py-3">
                                    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                                      getStatusColor(test.status)
                                    }`}>
                                      {getStatusIcon(test.status)}
                                      <span>
                                        {test.status === 'normal' ? 'স্বাভাবিক' : 
                                         test.status === 'high' ? 'উচ্চ' : 
                                         test.status === 'low' ? 'নিম্ন' : 'গুরুতর'}
                                      </span>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  onClick={saveTestResults}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="w-5 h-5" />
                  <span>ফলাফল সেভ করুন</span>
                </button>
                
                <button
                  onClick={exportToAIChat}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>AI চ্যাটে পাঠান</span>
                </button>
                
                <button
                  onClick={generatePDFReport}
                  className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Printer className="w-5 h-5" />
                  <span>রিপোর্ট প্রিন্ট করুন</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Saved Tests History */}
        {savedTests.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mt-4 md:mt-6">
            <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-gray-900 mb-4 flex items-center space-x-2`}>
              <Calendar className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
              <span>সংরক্ষিত পরীক্ষার ইতিহাস</span>
            </h3>
            
            <div className={`space-y-${isMobile ? '2' : '3'}`}>
              {savedTests.slice(-5).reverse().map((test) => (
                <div key={test.id} className={`p-${isMobile ? '3' : '4'} border border-gray-200 rounded-lg hover:shadow-md transition-shadow`}>
                  <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'items-center justify-between'}`}>
                    <div>
                      <p className={`font-medium text-gray-900 ${isMobile ? 'text-sm' : 'text-base'}`}>{test.patientInfo.name || 'অজ্ঞাত রোগী'}</p>
                      <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>
                        {new Date(test.createdAt).toLocaleDateString('bn-BD')} - 
                        মোট পরীক্ষা: {test.summary.totalTests}, 
                        অস্বাভাবিক: {test.summary.abnormalTests}
                      </p>
                    </div>
                    <div className={`flex ${isMobile ? 'justify-center' : ''} space-x-2`}>
                      <button className={`px-3 py-1 ${isMobile ? 'text-xs' : 'text-sm'} bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors`}>
                        দেখুন
                      </button>
                      <button className={`px-3 py-1 ${isMobile ? 'text-xs' : 'text-sm'} bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors`}>
                        তুলনা করুন
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalTestSystem;