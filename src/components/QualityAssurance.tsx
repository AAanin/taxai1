// Quality Assurance & Complete Feature Testing
import React, { useState, useEffect } from 'react';
import {
  CheckCircle, AlertTriangle, XCircle, Clock, Play, Pause,
  RefreshCw, Download, Upload, FileText, BarChart3, TrendingUp,
  Monitor, Smartphone, Tablet, Globe, Wifi, WifiOff,
  Shield, Lock, Eye, EyeOff, Zap, Activity, Target,
  Users, Database, Settings, Bell, MessageSquare,
  Calendar, Heart, Pill, Hospital, Stethoscope,
  Search, Filter, SortAsc, Plus, Edit3, Trash2,
  X, ChevronRight, ChevronDown, Info, AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

// Types for Quality Assurance
interface TestSuite {
  id: string;
  name: string;
  category: 'functional' | 'performance' | 'security' | 'accessibility' | 'integration' | 'ui';
  description: string;
  tests: Test[];
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  progress: number;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
}

interface Test {
  id: string;
  name: string;
  description: string;
  type: 'unit' | 'integration' | 'e2e' | 'performance' | 'security' | 'accessibility';
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  priority: 'low' | 'medium' | 'high' | 'critical';
  module: string;
  feature: string;
  steps: TestStep[];
  expectedResult: string;
  actualResult?: string;
  errorMessage?: string;
  screenshot?: string;
  duration?: number;
  retryCount: number;
  maxRetries: number;
}

interface TestStep {
  id: string;
  description: string;
  action: string;
  expected: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  screenshot?: string;
  duration?: number;
}

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  threshold: number;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  history: { timestamp: Date; value: number }[];
}

interface AccessibilityIssue {
  id: string;
  level: 'A' | 'AA' | 'AAA';
  type: 'error' | 'warning' | 'notice';
  rule: string;
  description: string;
  element: string;
  page: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  suggestion: string;
}

interface SecurityVulnerability {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  description: string;
  location: string;
  cwe?: string;
  cvss?: number;
  recommendation: string;
  status: 'open' | 'fixed' | 'accepted' | 'false_positive';
}

interface TestReport {
  id: string;
  name: string;
  type: 'summary' | 'detailed' | 'performance' | 'security' | 'accessibility';
  generatedAt: Date;
  testSuites: TestSuite[];
  overallStatus: 'passed' | 'failed' | 'warning';
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  coverage: number;
  duration: number;
  performanceMetrics?: PerformanceMetric[];
  accessibilityIssues?: AccessibilityIssue[];
  securityVulnerabilities?: SecurityVulnerability[];
}

const QualityAssurance: React.FC = () => {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [accessibilityIssues, setAccessibilityIssues] = useState<AccessibilityIssue[]>([]);
  const [securityVulnerabilities, setSecurityVulnerabilities] = useState<SecurityVulnerability[]>([]);
  const [testReports, setTestReports] = useState<TestReport[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'functional' | 'performance' | 'security' | 'accessibility' | 'reports'>('overview');
  const [selectedTestSuite, setSelectedTestSuite] = useState<TestSuite | null>(null);
  const [showTestDetails, setShowTestDetails] = useState(false);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [autoRun, setAutoRun] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState<string[]>(['desktop']);
  const [selectedBrowsers, setSelectedBrowsers] = useState<string[]>(['chrome']);
  
  const { user } = useAuth();
  const { showNotification } = useNotification();

  // Initialize test data
  useEffect(() => {
    loadTestSuites();
    loadPerformanceMetrics();
    loadAccessibilityIssues();
    loadSecurityVulnerabilities();
    loadTestReports();
  }, []);

  const loadTestSuites = () => {
    const sampleTestSuites: TestSuite[] = [
      {
        id: 'functional-patient',
        name: 'রোগী ব্যবস্থাপনা কার্যকারিতা',
        category: 'functional',
        description: 'রোগী নিবন্ধন, প্রোফাইল আপডেট, এবং মেডিকেল হিস্ট্রি পরীক্ষা',
        status: 'passed',
        progress: 100,
        tests: [
          {
            id: 'test-patient-registration',
            name: 'রোগী নিবন্ধন',
            description: 'নতুন রোগী নিবন্ধন প্রক্রিয়া পরীক্ষা',
            type: 'e2e',
            status: 'passed',
            priority: 'high',
            module: 'patient-management',
            feature: 'registration',
            expectedResult: 'রোগী সফলভাবে নিবন্ধিত হবে',
            actualResult: 'রোগী সফলভাবে নিবন্ধিত হয়েছে',
            duration: 2500,
            retryCount: 0,
            maxRetries: 3,
            steps: [
              {
                id: 'step1',
                description: 'নিবন্ধন ফর্ম খুলুন',
                action: 'click registration button',
                expected: 'ফর্ম প্রদর্শিত হবে',
                status: 'passed',
                duration: 500
              },
              {
                id: 'step2',
                description: 'তথ্য পূরণ করুন',
                action: 'fill form fields',
                expected: 'সব ফিল্ড পূরণ হবে',
                status: 'passed',
                duration: 1500
              },
              {
                id: 'step3',
                description: 'সাবমিট করুন',
                action: 'click submit button',
                expected: 'সফল বার্তা দেখাবে',
                status: 'passed',
                duration: 500
              }
            ]
          }
        ]
      },
      {
        id: 'functional-doctor',
        name: 'ডাক্তার সিস্টেম কার্যকারিতা',
        category: 'functional',
        description: 'ডাক্তার ড্যাশবোর্ড, প্রেসক্রিপশন লেখা, এবং রোগী ব্যবস্থাপনা',
        status: 'passed',
        progress: 100,
        tests: []
      },
      {
        id: 'functional-medicine',
        name: 'ওষুধ সিস্টেম কার্যকারিতা',
        category: 'functional',
        description: 'ওষুধ অনুসন্ধান, অর্ডার, এবং রিমাইন্ডার',
        status: 'failed',
        progress: 75,
        tests: []
      },
      {
        id: 'functional-hospital',
        name: 'হাসপাতাল সেবা কার্যকারিতা',
        category: 'functional',
        description: 'হাসপাতাল খোঁজা, অ্যাপয়েন্টমেন্ট বুকিং, জরুরি সেবা',
        status: 'passed',
        progress: 100,
        tests: []
      },
      {
        id: 'performance-load',
        name: 'লোড পারফরম্যান্স',
        category: 'performance',
        description: 'উচ্চ ট্রাফিকে সিস্টেমের কর্মক্ষমতা পরীক্ষা',
        status: 'warning',
        progress: 90,
        tests: []
      },
      {
        id: 'security-auth',
        name: 'অথেন্টিকেশন নিরাপত্তা',
        category: 'security',
        description: 'লগইন, পাসওয়ার্ড, এবং সেশন নিরাপত্তা',
        status: 'passed',
        progress: 100,
        tests: []
      },
      {
        id: 'accessibility-wcag',
        name: 'WCAG অ্যাক্সেসিবিলিটি',
        category: 'accessibility',
        description: 'ওয়েব কন্টেন্ট অ্যাক্সেসিবিলিটি গাইডলাইন পরীক্ষা',
        status: 'warning',
        progress: 85,
        tests: []
      },
      {
        id: 'integration-modules',
        name: 'মডিউল ইন্টিগ্রেশন',
        category: 'integration',
        description: 'বিভিন্ন মডিউলের মধ্যে ডেটা শেয়ারিং এবং কমিউনিকেশন',
        status: 'passed',
        progress: 100,
        tests: []
      },
      {
        id: 'ui-responsive',
        name: 'রেসপন্সিভ UI',
        category: 'ui',
        description: 'বিভিন্ন ডিভাইসে UI এর প্রদর্শন এবং ব্যবহারযোগ্যতা',
        status: 'passed',
        progress: 100,
        tests: []
      }
    ];

    setTestSuites(sampleTestSuites);
  };

  const loadPerformanceMetrics = () => {
    const sampleMetrics: PerformanceMetric[] = [
      {
        id: 'page-load-time',
        name: 'পেজ লোড টাইম',
        value: 2.3,
        unit: 'সেকেন্ড',
        threshold: 3.0,
        status: 'good',
        trend: 'down',
        history: [
          { timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), value: 2.8 },
          { timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), value: 2.5 },
          { timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), value: 2.4 },
          { timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), value: 2.6 },
          { timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), value: 2.2 },
          { timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), value: 2.4 },
          { timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), value: 2.3 }
        ]
      },
      {
        id: 'api-response-time',
        name: 'API রেসপন্স টাইম',
        value: 450,
        unit: 'মিলিসেকেন্ড',
        threshold: 1000,
        status: 'good',
        trend: 'stable',
        history: []
      },
      {
        id: 'memory-usage',
        name: 'মেমরি ব্যবহার',
        value: 65,
        unit: '%',
        threshold: 80,
        status: 'good',
        trend: 'up',
        history: []
      },
      {
        id: 'cpu-usage',
        name: 'CPU ব্যবহার',
        value: 45,
        unit: '%',
        threshold: 70,
        status: 'good',
        trend: 'stable',
        history: []
      },
      {
        id: 'error-rate',
        name: 'ত্রুটির হার',
        value: 0.5,
        unit: '%',
        threshold: 1.0,
        status: 'good',
        trend: 'down',
        history: []
      },
      {
        id: 'concurrent-users',
        name: 'সমসাময়িক ব্যবহারকারী',
        value: 150,
        unit: 'জন',
        threshold: 500,
        status: 'good',
        trend: 'up',
        history: []
      }
    ];

    setPerformanceMetrics(sampleMetrics);
  };

  const loadAccessibilityIssues = () => {
    const sampleIssues: AccessibilityIssue[] = [
      {
        id: 'acc-001',
        level: 'AA',
        type: 'error',
        rule: 'color-contrast',
        description: 'পর্যাপ্ত রঙের বৈপরীত্য নেই',
        element: 'button.secondary',
        page: '/patient/registration',
        impact: 'serious',
        suggestion: 'বাটনের রঙের বৈপরীত্য ৪.৫:১ অনুপাতে বাড়ান'
      },
      {
        id: 'acc-002',
        level: 'A',
        type: 'warning',
        rule: 'alt-text',
        description: 'ছবিতে alt টেক্সট নেই',
        element: 'img.profile-picture',
        page: '/doctor/dashboard',
        impact: 'moderate',
        suggestion: 'সব ছবিতে বর্ণনামূলক alt টেক্সট যোগ করুন'
      },
      {
        id: 'acc-003',
        level: 'AA',
        type: 'notice',
        rule: 'focus-visible',
        description: 'ফোকাস ইন্ডিকেটর স্পষ্ট নয়',
        element: 'input.search',
        page: '/medicine/search',
        impact: 'minor',
        suggestion: 'ফোকাস অবস্থায় স্পষ্ট বর্ডার বা আউটলাইন যোগ করুন'
      }
    ];

    setAccessibilityIssues(sampleIssues);
  };

  const loadSecurityVulnerabilities = () => {
    const sampleVulnerabilities: SecurityVulnerability[] = [
      {
        id: 'sec-001',
        severity: 'medium',
        type: 'Cross-Site Scripting (XSS)',
        description: 'ব্যবহারকারীর ইনপুট যথাযথভাবে স্যানিটাইজ করা হয়নি',
        location: '/api/patient/notes',
        cwe: 'CWE-79',
        cvss: 6.1,
        recommendation: 'সব ব্যবহারকারীর ইনপুট এনকোড এবং ভ্যালিডেট করুন',
        status: 'open'
      },
      {
        id: 'sec-002',
        severity: 'low',
        type: 'Information Disclosure',
        description: 'ত্রুটি বার্তায় সংবেদনশীল তথ্য প্রকাশ',
        location: '/api/auth/login',
        cwe: 'CWE-200',
        cvss: 3.1,
        recommendation: 'জেনেরিক ত্রুটি বার্তা ব্যবহার করুন',
        status: 'fixed'
      }
    ];

    setSecurityVulnerabilities(sampleVulnerabilities);
  };

  const loadTestReports = () => {
    const sampleReports: TestReport[] = [
      {
        id: 'report-001',
        name: 'সাপ্তাহিক QA রিপোর্ট',
        type: 'summary',
        generatedAt: new Date(),
        testSuites: [],
        overallStatus: 'passed',
        totalTests: 156,
        passedTests: 142,
        failedTests: 8,
        skippedTests: 6,
        coverage: 87.5,
        duration: 3600000
      }
    ];

    setTestReports(sampleReports);
  };

  // Test execution functions
  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestProgress(0);
    
    showNotification('সব টেস্ট চালানো শুরু হয়েছে', 'info');
    
    // Simulate test execution
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setTestProgress(i);
    }
    
    setIsRunningTests(false);
    showNotification('সব টেস্ট সম্পন্ন হয়েছে', 'success');
  };

  const runTestSuite = async (suiteId: string) => {
    setTestSuites(prev => 
      prev.map(suite => 
        suite.id === suiteId 
          ? { ...suite, status: 'running', progress: 0 }
          : suite
      )
    );
    
    // Simulate test execution
    for (let i = 0; i <= 100; i += 20) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setTestSuites(prev => 
        prev.map(suite => 
          suite.id === suiteId 
            ? { ...suite, progress: i }
            : suite
        )
      );
    }
    
    setTestSuites(prev => 
      prev.map(suite => 
        suite.id === suiteId 
          ? { ...suite, status: 'passed', progress: 100 }
          : suite
      )
    );
    
    showNotification('টেস্ট স্যুট সম্পন্ন হয়েছে', 'success');
  };

  const generateReport = (type: string) => {
    const newReport: TestReport = {
      id: `report-${Date.now()}`,
      name: `${type} রিপোর্ট`,
      type: type as any,
      generatedAt: new Date(),
      testSuites,
      overallStatus: 'passed',
      totalTests: testSuites.reduce((acc, suite) => acc + suite.tests.length, 0),
      passedTests: testSuites.filter(s => s.status === 'passed').length,
      failedTests: testSuites.filter(s => s.status === 'failed').length,
      skippedTests: testSuites.filter(s => s.status === 'skipped').length,
      coverage: 85.7,
      duration: 3600000,
      performanceMetrics: type === 'performance' ? performanceMetrics : undefined,
      accessibilityIssues: type === 'accessibility' ? accessibilityIssues : undefined,
      securityVulnerabilities: type === 'security' ? securityVulnerabilities : undefined
    };
    
    setTestReports([newReport, ...testReports]);
    showNotification(`${type} রিপোর্ট তৈরি হয়েছে`, 'success');
  };

  // Helper functions
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
      case 'good':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'failed':
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'running':
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'pending':
      case 'skipped':
        return <Clock className="w-5 h-5 text-gray-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
      case 'good':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'running':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
      case 'skipped':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'functional': return <Settings className="w-5 h-5" />;
      case 'performance': return <Zap className="w-5 h-5" />;
      case 'security': return <Shield className="w-5 h-5" />;
      case 'accessibility': return <Eye className="w-5 h-5" />;
      case 'integration': return <Database className="w-5 h-5" />;
      case 'ui': return <Monitor className="w-5 h-5" />;
      default: return <CheckCircle className="w-5 h-5" />;
    }
  };

  const overallStatus = testSuites.some(s => s.status === 'failed') ? 'failed' :
                      testSuites.some(s => s.status === 'warning') ? 'warning' : 'passed';
  
  const totalTests = testSuites.reduce((acc, suite) => acc + suite.tests.length, 0);
  const passedTests = testSuites.filter(s => s.status === 'passed').length;
  const failedTests = testSuites.filter(s => s.status === 'failed').length;
  const runningTests = testSuites.filter(s => s.status === 'running').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                overallStatus === 'passed' ? 'bg-green-600' :
                overallStatus === 'warning' ? 'bg-yellow-600' : 'bg-red-600'
              }`}>
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">কোয়ালিটি অ্যাসিওরেন্স</h1>
                <p className="text-sm text-gray-600">সম্পূর্ণ ফিচার টেস্টিং ও মান নিয়ন্ত্রণ</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Test Progress */}
              {isRunningTests && (
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${testProgress}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">{testProgress}%</span>
                </div>
              )}
              
              {/* Auto Run Toggle */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setAutoRun(!autoRun)}
                  className={`p-2 rounded-lg transition-colors ${
                    autoRun 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                  title={autoRun ? 'অটো রান বন্ধ করুন' : 'অটো রান চালু করুন'}
                >
                  {autoRun ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                
                <button
                  onClick={runAllTests}
                  disabled={isRunningTests}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Play className="w-4 h-4" />
                  <span>সব টেস্ট চালান</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Summary */}
      <div className={`border-b ${
        overallStatus === 'passed' ? 'bg-green-50 border-green-200' :
        overallStatus === 'warning' ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {getStatusIcon(overallStatus)}
              <div>
                <p className={`font-medium ${
                  overallStatus === 'passed' ? 'text-green-800' :
                  overallStatus === 'warning' ? 'text-yellow-800' : 'text-red-800'
                }`}>
                  সিস্টেম স্ট্যাটাস: {overallStatus === 'passed' ? 'সব টেস্ট পাস' :
                                    overallStatus === 'warning' ? 'কিছু সতর্কতা' : 'টেস্ট ব্যর্থ'}
                </p>
                <p className="text-sm text-gray-600">
                  {passedTests}/{testSuites.length} টেস্ট স্যুট পাস • {totalTests} মোট টেস্ট
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="text-green-600 font-medium">{passedTests} পাস</span> • 
                <span className="text-red-600 font-medium">{failedTests} ব্যর্থ</span>
                {runningTests > 0 && (
                  <> • <span className="text-blue-600 font-medium">{runningTests} চলমান</span></>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'ওভারভিউ', icon: BarChart3 },
              { id: 'functional', label: 'কার্যকারিতা', icon: Settings, count: testSuites.filter(s => s.category === 'functional').length },
              { id: 'performance', label: 'পারফরম্যান্স', icon: Zap, count: performanceMetrics.length },
              { id: 'security', label: 'নিরাপত্তা', icon: Shield, count: securityVulnerabilities.filter(v => v.status === 'open').length },
              { id: 'accessibility', label: 'অ্যাক্সেসিবিলিটি', icon: Eye, count: accessibilityIssues.length },
              { id: 'reports', label: 'রিপোর্ট', icon: FileText, count: testReports.length }
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
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      (tab.id === 'security' || tab.id === 'accessibility') && tab.count > 0
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">মোট টেস্ট স্যুট</p>
                    <p className="text-2xl font-bold text-gray-900">{testSuites.length}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-blue-600" />
                </div>
                <div className="mt-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-green-600">{passedTests} পাস</span>
                    <span className="text-red-600">{failedTests} ব্যর্থ</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">কোড কভারেজ</p>
                    <p className="text-2xl font-bold text-gray-900">87.5%</p>
                  </div>
                  <Target className="w-8 h-8 text-green-600" />
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '87.5%' }} />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">পারফরম্যান্স স্কোর</p>
                    <p className="text-2xl font-bold text-gray-900">92</p>
                  </div>
                  <Zap className="w-8 h-8 text-yellow-600" />
                </div>
                <div className="mt-4">
                  <div className="text-sm text-green-600">গড় লোড টাইম: 2.3s</div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">নিরাপত্তা স্কোর</p>
                    <p className="text-2xl font-bold text-gray-900">A-</p>
                  </div>
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <div className="mt-4">
                  <div className="text-sm text-yellow-600">{securityVulnerabilities.filter(v => v.status === 'open').length} খোলা সমস্যা</div>
                </div>
              </div>
            </div>

            {/* Test Suites Overview */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">টেস্ট স্যুট ওভারভিউ</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {testSuites.map(suite => (
                  <div key={suite.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(suite.category)}
                        <h4 className="font-medium text-gray-900">{suite.name}</h4>
                      </div>
                      {getStatusIcon(suite.status)}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{suite.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">অগ্রগতি</span>
                        <span className="font-medium">{suite.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            suite.status === 'passed' ? 'bg-green-600' :
                            suite.status === 'failed' ? 'bg-red-600' :
                            suite.status === 'running' ? 'bg-blue-600' : 'bg-gray-400'
                          }`}
                          style={{ width: `${suite.progress}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(suite.status)}`}>
                        {suite.status === 'passed' ? 'পাস' :
                         suite.status === 'failed' ? 'ব্যর্থ' :
                         suite.status === 'running' ? 'চলমান' : 'অপেক্ষমান'}
                      </span>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedTestSuite(suite);
                            setShowTestDetails(true);
                          }}
                          className="px-2 py-1 text-blue-600 border border-blue-300 rounded text-xs hover:bg-blue-50 transition-colors"
                        >
                          বিস্তারিত
                        </button>
                        
                        <button
                          onClick={() => runTestSuite(suite.id)}
                          disabled={suite.status === 'running'}
                          className="px-2 py-1 text-green-600 border border-green-300 rounded text-xs hover:bg-green-50 transition-colors disabled:opacity-50"
                        >
                          চালান
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">দ্রুত কার্যক্রম</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'সব টেস্ট চালান', action: runAllTests, icon: Play, disabled: isRunningTests },
                  { label: 'পারফরম্যান্স টেস্ট', action: () => generateReport('performance'), icon: Zap },
                  { label: 'নিরাপত্তা স্ক্যান', action: () => generateReport('security'), icon: Shield },
                  { label: 'রিপোর্ট তৈরি করুন', action: () => generateReport('summary'), icon: FileText }
                ].map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={action.action}
                      disabled={action.disabled}
                      className="flex items-center space-x-2 p-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'functional' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">কার্যকারিতা পরীক্ষা</h2>
                <div className="flex space-x-2">
                  <select 
                    value={selectedDevices[0] || 'desktop'}
                    onChange={(e) => setSelectedDevices([e.target.value])}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="desktop">ডেস্কটপ</option>
                    <option value="tablet">ট্যাবলেট</option>
                    <option value="mobile">মোবাইল</option>
                  </select>
                  
                  <select 
                    value={selectedBrowsers[0] || 'chrome'}
                    onChange={(e) => setSelectedBrowsers([e.target.value])}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="chrome">Chrome</option>
                    <option value="firefox">Firefox</option>
                    <option value="safari">Safari</option>
                    <option value="edge">Edge</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-4">
                {testSuites.filter(s => s.category === 'functional').map(suite => (
                  <div key={suite.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(suite.status)}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{suite.name}</h3>
                          <p className="text-sm text-gray-600">{suite.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(suite.status)}`}>
                          {suite.status === 'passed' ? 'পাস' :
                           suite.status === 'failed' ? 'ব্যর্থ' :
                           suite.status === 'running' ? 'চলমান' : 'অপেক্ষমান'}
                        </span>
                        
                        <button
                          onClick={() => runTestSuite(suite.id)}
                          disabled={suite.status === 'running'}
                          className="px-3 py-1 text-blue-600 border border-blue-300 rounded hover:bg-blue-50 transition-colors disabled:opacity-50 text-sm"
                        >
                          চালান
                        </button>
                        
                        <button
                          onClick={() => {
                            setSelectedTestSuite(suite);
                            setShowTestDetails(true);
                          }}
                          className="px-3 py-1 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm"
                        >
                          বিস্তারিত
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                      <div>
                        <span className="font-medium">টেস্ট:</span>
                        <p>{suite.tests.length}টি</p>
                      </div>
                      <div>
                        <span className="font-medium">অগ্রগতি:</span>
                        <p>{suite.progress}%</p>
                      </div>
                      <div>
                        <span className="font-medium">সময়:</span>
                        <p>{suite.duration ? `${Math.round(suite.duration / 1000)}s` : 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium">শেষ রান:</span>
                        <p>{suite.endTime ? suite.endTime.toLocaleTimeString('bn-BD') : 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          suite.status === 'passed' ? 'bg-green-600' :
                          suite.status === 'failed' ? 'bg-red-600' :
                          suite.status === 'running' ? 'bg-blue-600' : 'bg-gray-400'
                        }`}
                        style={{ width: `${suite.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">পারফরম্যান্স মেট্রিক্স</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {performanceMetrics.map(metric => (
                  <div key={metric.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{metric.name}</h3>
                      {getStatusIcon(metric.status)}
                    </div>
                    
                    <div className="text-center mb-4">
                      <div className={`text-3xl font-bold ${
                        metric.status === 'good' ? 'text-green-600' :
                        metric.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {metric.value}{metric.unit}
                      </div>
                      <div className="text-sm text-gray-600">
                        থ্রেশহোল্ড: {metric.threshold}{metric.unit}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className={`px-2 py-1 rounded-full font-medium ${getStatusColor(metric.status)}`}>
                        {metric.status === 'good' ? 'ভাল' :
                         metric.status === 'warning' ? 'সতর্কতা' : 'সমস্যা'}
                      </span>
                      
                      <div className="flex items-center space-x-1">
                        {metric.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : metric.trend === 'down' ? (
                          <TrendingUp className="w-4 h-4 text-red-600 transform rotate-180" />
                        ) : (
                          <div className="w-4 h-4 bg-gray-400 rounded-full" />
                        )}
                        <span className="text-gray-600">
                          {metric.trend === 'up' ? 'বৃদ্ধি' :
                           metric.trend === 'down' ? 'হ্রাস' : 'স্থিতিশীল'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">নিরাপত্তা দুর্বলতা</h2>
                <button
                  onClick={() => generateReport('security')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  নিরাপত্তা স্ক্যান
                </button>
              </div>
              
              <div className="space-y-4">
                {securityVulnerabilities.map(vuln => (
                  <div key={vuln.id} className={`p-4 border rounded-lg ${
                    vuln.severity === 'critical' ? 'border-red-300 bg-red-50' :
                    vuln.severity === 'high' ? 'border-orange-300 bg-orange-50' :
                    vuln.severity === 'medium' ? 'border-yellow-300 bg-yellow-50' :
                    'border-blue-300 bg-blue-50'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{vuln.type}</h3>
                        <p className="text-sm text-gray-600">{vuln.description}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          vuln.severity === 'critical' ? 'bg-red-200 text-red-800' :
                          vuln.severity === 'high' ? 'bg-orange-200 text-orange-800' :
                          vuln.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                          'bg-blue-200 text-blue-800'
                        }`}>
                          {vuln.severity === 'critical' ? 'জরুরি' :
                           vuln.severity === 'high' ? 'উচ্চ' :
                           vuln.severity === 'medium' ? 'মাঝারি' : 'নিম্ন'}
                        </span>
                        
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          vuln.status === 'open' ? 'bg-red-100 text-red-800' :
                          vuln.status === 'fixed' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {vuln.status === 'open' ? 'খোলা' :
                           vuln.status === 'fixed' ? 'সমাধান' :
                           vuln.status === 'accepted' ? 'গৃহীত' : 'মিথ্যা ইতিবাচক'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                      <div>
                        <span className="font-medium">অবস্থান:</span>
                        <p>{vuln.location}</p>
                      </div>
                      {vuln.cwe && (
                        <div>
                          <span className="font-medium">CWE:</span>
                          <p>{vuln.cwe}</p>
                        </div>
                      )}
                      {vuln.cvss && (
                        <div>
                          <span className="font-medium">CVSS:</span>
                          <p>{vuln.cvss}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-3 bg-white border border-gray-200 rounded">
                      <h4 className="font-medium text-gray-900 mb-1">সুপারিশ:</h4>
                      <p className="text-sm text-gray-700">{vuln.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'accessibility' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">অ্যাক্সেসিবিলিটি সমস্যা</h2>
                <button
                  onClick={() => generateReport('accessibility')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  অ্যাক্সেসিবিলিটি স্ক্যান
                </button>
              </div>
              
              <div className="space-y-4">
                {accessibilityIssues.map(issue => (
                  <div key={issue.id} className={`p-4 border rounded-lg ${
                    issue.type === 'error' ? 'border-red-300 bg-red-50' :
                    issue.type === 'warning' ? 'border-yellow-300 bg-yellow-50' :
                    'border-blue-300 bg-blue-50'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{issue.rule}</h3>
                        <p className="text-sm text-gray-600">{issue.description}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          issue.type === 'error' ? 'bg-red-200 text-red-800' :
                          issue.type === 'warning' ? 'bg-yellow-200 text-yellow-800' :
                          'bg-blue-200 text-blue-800'
                        }`}>
                          {issue.type === 'error' ? 'ত্রুটি' :
                           issue.type === 'warning' ? 'সতর্কতা' : 'নোটিশ'}
                        </span>
                        
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-800">
                          WCAG {issue.level}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                      <div>
                        <span className="font-medium">পেজ:</span>
                        <p>{issue.page}</p>
                      </div>
                      <div>
                        <span className="font-medium">এলিমেন্ট:</span>
                        <p>{issue.element}</p>
                      </div>
                      <div>
                        <span className="font-medium">প্রভাব:</span>
                        <p className={`${
                          issue.impact === 'critical' ? 'text-red-600' :
                          issue.impact === 'serious' ? 'text-orange-600' :
                          issue.impact === 'moderate' ? 'text-yellow-600' : 'text-blue-600'
                        }`}>
                          {issue.impact === 'critical' ? 'জরুরি' :
                           issue.impact === 'serious' ? 'গুরুতর' :
                           issue.impact === 'moderate' ? 'মাঝারি' : 'সামান্য'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-white border border-gray-200 rounded">
                      <h4 className="font-medium text-gray-900 mb-1">সমাধান:</h4>
                      <p className="text-sm text-gray-700">{issue.suggestion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">টেস্ট রিপোর্ট</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => generateReport('summary')}
                    className="px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    সামারি রিপোর্ট
                  </button>
                  <button
                    onClick={() => generateReport('detailed')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    বিস্তারিত রিপোর্ট
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                {testReports.map(report => (
                  <div key={report.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{report.name}</h3>
                        <p className="text-sm text-gray-600">
                          তৈরি: {report.generatedAt.toLocaleString('bn-BD')}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(report.overallStatus)}`}>
                          {report.overallStatus === 'passed' ? 'পাস' :
                           report.overallStatus === 'failed' ? 'ব্যর্থ' : 'সতর্কতা'}
                        </span>
                        
                        <button className="px-3 py-1 text-blue-600 border border-blue-300 rounded hover:bg-blue-50 transition-colors text-sm">
                          ডাউনলোড
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">মোট টেস্ট:</span>
                        <p>{report.totalTests}</p>
                      </div>
                      <div>
                        <span className="font-medium">পাস:</span>
                        <p className="text-green-600">{report.passedTests}</p>
                      </div>
                      <div>
                        <span className="font-medium">ব্যর্থ:</span>
                        <p className="text-red-600">{report.failedTests}</p>
                      </div>
                      <div>
                        <span className="font-medium">কভারেজ:</span>
                        <p>{report.coverage}%</p>
                      </div>
                      <div>
                        <span className="font-medium">সময়:</span>
                        <p>{Math.round(report.duration / 60000)}m</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Test Details Modal */}
      {showTestDetails && selectedTestSuite && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full mx-4 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedTestSuite.name}</h2>
                <button
                  onClick={() => setShowTestDetails(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">টেস্ট স্যুট তথ্য</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">বিভাগ:</span>
                      <p>{selectedTestSuite.category}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">স্ট্যাটাস:</span>
                      <p>{selectedTestSuite.status}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">অগ্রগতি:</span>
                      <p>{selectedTestSuite.progress}%</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">টেস্ট সংখ্যা:</span>
                      <p>{selectedTestSuite.tests.length}</p>
                    </div>
                  </div>
                </div>
                
                {selectedTestSuite.tests.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">টেস্ট বিস্তারিত</h3>
                    <div className="space-y-4">
                      {selectedTestSuite.tests.map(test => (
                        <div key={test.id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              {getStatusIcon(test.status)}
                              <div>
                                <h4 className="font-semibold text-gray-900">{test.name}</h4>
                                <p className="text-sm text-gray-600">{test.description}</p>
                              </div>
                            </div>
                            
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              test.priority === 'critical' ? 'bg-red-100 text-red-800' :
                              test.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                              test.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {test.priority === 'critical' ? 'জরুরি' :
                               test.priority === 'high' ? 'উচ্চ' :
                               test.priority === 'medium' ? 'মাঝারি' : 'নিম্ন'}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                            <div>
                              <span className="font-medium">ধরন:</span>
                              <p>{test.type}</p>
                            </div>
                            <div>
                              <span className="font-medium">মডিউল:</span>
                              <p>{test.module}</p>
                            </div>
                            <div>
                              <span className="font-medium">ফিচার:</span>
                              <p>{test.feature}</p>
                            </div>
                            <div>
                              <span className="font-medium">সময়:</span>
                              <p>{test.duration ? `${test.duration}ms` : 'N/A'}</p>
                            </div>
                          </div>
                          
                          {test.steps.length > 0 && (
                            <div>
                              <h5 className="font-medium text-gray-900 mb-2">টেস্ট স্টেপ:</h5>
                              <div className="space-y-2">
                                {test.steps.map(step => (
                                  <div key={step.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                                    {getStatusIcon(step.status)}
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-gray-900">{step.description}</p>
                                      <p className="text-xs text-gray-600">{step.action} → {step.expected}</p>
                                    </div>
                                    {step.duration && (
                                      <span className="text-xs text-gray-500">{step.duration}ms</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="mt-3 p-3 bg-gray-50 rounded">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">প্রত্যাশিত ফলাফল:</span>
                                <p className="text-gray-600">{test.expectedResult}</p>
                              </div>
                              {test.actualResult && (
                                <div>
                                  <span className="font-medium text-gray-700">প্রকৃত ফলাফল:</span>
                                  <p className={`${
                                    test.status === 'passed' ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {test.actualResult}
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            {test.errorMessage && (
                              <div className="mt-2">
                                <span className="font-medium text-red-700">ত্রুটি বার্তা:</span>
                                <p className="text-red-600 text-sm">{test.errorMessage}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => runTestSuite(selectedTestSuite.id)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  টেস্ট চালান
                </button>
                
                <button
                  onClick={() => setShowTestDetails(false)}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QualityAssurance;