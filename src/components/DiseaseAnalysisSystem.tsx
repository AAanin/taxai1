// Disease Diagnosis & Analysis System - রোগ নির্ণয় ও বিশ্লেষণ সিস্টেম
import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  FileText, 
  Upload, 
  Camera, 
  Scan, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Star, 
  Activity, 
  Heart, 
  Eye, 
  Zap, 
  Calendar, 
  Clock, 
  Target, 
  BarChart3, 
  PieChart, 
  LineChart, 
  Download, 
  Share, 
  Bookmark,
  Loader,
  Plus,
  Minus,
  Search,
  Filter,
  MoreVertical,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface MedicalReport {
  id: string;
  type: 'blood' | 'urine' | 'imaging' | 'ecg' | 'pathology' | 'other';
  name: string;
  bengaliName: string;
  date: string;
  values: ReportValue[];
  images?: string[];
  summary: string;
  abnormalFindings: string[];
  recommendations: string[];
  urgency: 'normal' | 'attention' | 'urgent' | 'critical';
}

interface ReportValue {
  parameter: string;
  value: string | number;
  unit?: string;
  normalRange: string;
  status: 'normal' | 'low' | 'high' | 'critical';
  significance?: string;
}

interface DiagnosisResult {
  condition: string;
  bengaliName: string;
  probability: number;
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  confidence: number;
  supportingEvidence: string[];
  differentialDiagnosis: string[];
  recommendedActions: string[];
  prognosis: string;
  riskFactors: string[];
  complications: string[];
}

interface RiskAssessment {
  overallRisk: 'low' | 'moderate' | 'high' | 'critical';
  riskScore: number;
  riskFactors: {
    factor: string;
    impact: 'low' | 'medium' | 'high';
    modifiable: boolean;
  }[];
  preventiveMeasures: string[];
  followUpRecommendations: string[];
  timelineForReview: string;
}

interface PatientData {
  age: number;
  gender: 'male' | 'female';
  symptoms: string[];
  medicalHistory: string[];
  familyHistory: string[];
  lifestyle: {
    smoking: boolean;
    alcohol: boolean;
    exercise: 'none' | 'light' | 'moderate' | 'heavy';
    diet: 'poor' | 'average' | 'good' | 'excellent';
  };
  vitalSigns: {
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    respiratoryRate: number;
    oxygenSaturation: number;
  };
}

interface Props {
  symptoms: string[];
  patientData: PatientData;
  onDiagnosisComplete: (diagnosis: DiagnosisResult, riskAssessment: RiskAssessment) => void;
}

const DiseaseAnalysisSystem: React.FC<Props> = ({ 
  symptoms, 
  patientData, 
  onDiagnosisComplete 
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'analysis' | 'diagnosis' | 'risk'>('upload');
  const [uploadedReports, setUploadedReports] = useState<MedicalReport[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<DiagnosisResult[]>([]);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);
  const [showReportDetails, setShowReportDetails] = useState(false);
  const [ocrText, setOcrText] = useState('');
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [expandedDiagnosis, setExpandedDiagnosis] = useState<string | null>(null);

  // Mock medical reports for demonstration
  const mockReports: MedicalReport[] = [
    {
      id: '1',
      type: 'blood',
      name: 'Complete Blood Count',
      bengaliName: 'সম্পূর্ণ রক্ত পরীক্ষা',
      date: '2024-01-15',
      values: [
        {
          parameter: 'Hemoglobin',
          value: 8.5,
          unit: 'g/dl',
          normalRange: '12-16 g/dl',
          status: 'low',
          significance: 'রক্তাল্পতার ইঙ্গিত'
        },
        {
          parameter: 'WBC Count',
          value: 12000,
          unit: '/μl',
          normalRange: '4000-11000/μl',
          status: 'high',
          significance: 'সংক্রমণের সম্ভাবনা'
        },
        {
          parameter: 'Platelet Count',
          value: 250000,
          unit: '/μl',
          normalRange: '150000-450000/μl',
          status: 'normal'
        }
      ],
      summary: 'রক্তাল্পতা ও সংক্রমণের লক্ষণ দেখা যাচ্ছে',
      abnormalFindings: ['কম হিমোগ্লোবিন', 'বেশি শ্বেত রক্তকণিকা'],
      recommendations: ['আয়রন সাপ্লিমেন্ট', 'সংক্রমণের চিকিৎসা'],
      urgency: 'attention'
    },
    {
      id: '2',
      type: 'imaging',
      name: 'Chest X-Ray',
      bengaliName: 'বুকের এক্স-রে',
      date: '2024-01-14',
      values: [],
      summary: 'ডান ফুসফুসে ছায়া দেখা যাচ্ছে',
      abnormalFindings: ['ডান নিম্ন লোবে অস্বচ্ছতা'],
      recommendations: ['CT স্ক্যান প্রয়োজন', 'পালমোনোলজিস্ট দেখান'],
      urgency: 'urgent'
    }
  ];

  // AI Analysis Functions
  const analyzeReports = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Generate diagnosis based on reports and symptoms
    const diagnoses: DiagnosisResult[] = [
      {
        condition: 'Iron Deficiency Anemia with Secondary Infection',
        bengaliName: 'আয়রনের অভাবজনিত রক্তাল্পতা ও সংক্রমণ',
        probability: 85,
        severity: 'moderate',
        confidence: 90,
        supportingEvidence: [
          'হিমোগ্লোবিন ৮.৫ g/dl (স্বাভাবিক ১২-১৬)',
          'WBC বৃদ্ধি ১২,০০০/μl',
          'রোগীর ক্লান্তি ও দুর্বলতার লক্ষণ',
          'বুকের এক্স-রেতে সংক্রমণের চিহ্ন'
        ],
        differentialDiagnosis: [
          'Chronic Disease Anemia',
          'Thalassemia Minor',
          'Vitamin B12 Deficiency',
          'Pneumonia'
        ],
        recommendedActions: [
          'আয়রন সাপ্লিমেন্ট শুরু করুন',
          'অ্যান্টিবায়োটিক চিকিৎসা',
          'CT স্ক্যান করান',
          '২ সপ্তাহ পর ফলো-আপ'
        ],
        prognosis: 'উপযুক্ত চিকিৎসায় ৪-৬ সপ্তাহে উন্নতি আশা করা যায়',
        riskFactors: [
          'পুষ্টিহীনতা',
          'দীর্ঘমেয়াদী রক্তক্ষরণ',
          'দুর্বল রোগ প্রতিরোধ ক্ষমতা'
        ],
        complications: [
          'হার্ট ফেইলিউর',
          'গুরুতর সংক্রমণ',
          'শ্বাসকষ্ট'
        ]
      },
      {
        condition: 'Community Acquired Pneumonia',
        bengaliName: 'কমিউনিটি অর্জিত নিউমোনিয়া',
        probability: 75,
        severity: 'moderate',
        confidence: 80,
        supportingEvidence: [
          'বুকের এক্স-রেতে ডান নিম্ন লোবে অস্বচ্ছতা',
          'WBC বৃদ্ধি',
          'কাশি ও জ্বরের ইতিহাস',
          'শ্বাসকষ্টের লক্ষণ'
        ],
        differentialDiagnosis: [
          'Tuberculosis',
          'Lung Cancer',
          'Pulmonary Embolism',
          'Pleural Effusion'
        ],
        recommendedActions: [
          'ব্রড স্পেকট্রাম অ্যান্টিবায়োটিক',
          'CT স্ক্যান',
          'স্পুটাম কালচার',
          'অক্সিজেন থেরাপি যদি প্রয়োজন হয়'
        ],
        prognosis: 'অ্যান্টিবায়োটিক চিকিৎসায় ৭-১০ দিনে উন্নতি',
        riskFactors: [
          'বয়স ৬৫+',
          'ধূমপান',
          'দুর্বল রোগ প্রতিরোধ ক্ষমতা',
          'দীর্ঘমেয়াদী ফুসফুসের রোগ'
        ],
        complications: [
          'সেপসিস',
          'রেসপিরেটরি ফেইলিউর',
          'প্লুরাল ইফিউশন'
        ]
      }
    ];
    
    // Generate risk assessment
    const risk: RiskAssessment = {
      overallRisk: 'moderate',
      riskScore: 65,
      riskFactors: [
        {
          factor: 'রক্তাল্পতা',
          impact: 'high',
          modifiable: true
        },
        {
          factor: 'সংক্রমণ',
          impact: 'high',
          modifiable: true
        },
        {
          factor: 'বয়স',
          impact: 'medium',
          modifiable: false
        },
        {
          factor: 'পুষ্টিহীনতা',
          impact: 'medium',
          modifiable: true
        }
      ],
      preventiveMeasures: [
        'নিয়মিত আয়রন সমৃদ্ধ খাবার গ্রহণ',
        'ভিটামিন সি যুক্ত ফল খান',
        'পর্যাপ্ত বিশ্রাম নিন',
        'হাত ধোয়ার অভ্যাস বজায় রাখুন',
        'ধূমপান ত্যাগ করুন'
      ],
      followUpRecommendations: [
        '২ সপ্তাহ পর রক্ত পরীক্ষা',
        '১ মাস পর বুকের এক্স-রে',
        'লক্ষণ খারাপ হলে তাৎক্ষণিক চিকিৎসকের পরামর্শ'
      ],
      timelineForReview: '২ সপ্তাহ'
    };
    
    setAnalysisResults(diagnoses);
    setRiskAssessment(risk);
    setIsAnalyzing(false);
    setActiveTab('diagnosis');
  };

  // OCR Processing
  const processOCR = async (file: File) => {
    setIsProcessingOCR(true);
    
    // Simulate OCR processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock OCR result
    const mockOCRText = `
COMPLETE BLOOD COUNT REPORT
Date: 15/01/2024
Patient: John Doe

Hemoglobin: 8.5 g/dl (Normal: 12-16 g/dl) - LOW
RBC Count: 3.8 million/μl (Normal: 4.5-5.5 million/μl) - LOW
WBC Count: 12,000/μl (Normal: 4,000-11,000/μl) - HIGH
Platelet Count: 250,000/μl (Normal: 150,000-450,000/μl) - NORMAL

Remarks: Microcytic hypochromic anemia with leukocytosis
Suggestion: Iron deficiency anemia with possible infection
    `;
    
    setOcrText(mockOCRText);
    setIsProcessingOCR(false);
  };

  // File upload handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
          processOCR(file);
        }
        
        // Add to uploaded reports (mock)
        const newReport: MedicalReport = {
          id: Date.now().toString(),
          type: 'other',
          name: file.name,
          bengaliName: 'আপলোড করা রিপোর্ট',
          date: new Date().toISOString().split('T')[0],
          values: [],
          summary: 'রিপোর্ট আপলোড করা হয়েছে',
          abnormalFindings: [],
          recommendations: [],
          urgency: 'normal'
        };
        
        setUploadedReports(prev => [...prev, newReport]);
      });
    }
  };

  // Initialize with mock data
  useEffect(() => {
    setUploadedReports(mockReports);
  }, []);

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          {[
            { id: 'upload', name: 'রিপোর্ট আপলোড', icon: Upload },
            { id: 'analysis', name: 'বিশ্লেষণ', icon: Brain },
            { id: 'diagnosis', name: 'রোগ নির্ণয়', icon: Target },
            { id: 'risk', name: 'ঝুঁকি মূল্যায়ন', icon: AlertTriangle }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">মেডিকেল রিপোর্ট আপলোড করুন</h3>
            
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <div className="space-y-4">
                <div className="flex justify-center space-x-4">
                  <Upload className="h-12 w-12 text-gray-400" />
                  <Camera className="h-12 w-12 text-gray-400" />
                  <Scan className="h-12 w-12 text-gray-400" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-700">রিপোর্ট আপলোড করুন</p>
                  <p className="text-sm text-gray-500 mt-1">
                    ছবি, PDF বা স্ক্যান করা ডকুমেন্ট টেনে এনে ছাড়ুন অথবা ক্লিক করে নির্বাচন করুন
                  </p>
                </div>
                <div className="flex justify-center space-x-4">
                  <label className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    ফাইল নির্বাচন
                  </label>
                  <button className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors">
                    <Camera className="h-4 w-4 inline mr-2" />
                    ক্যামেরা
                  </button>
                </div>
              </div>
            </div>
            
            {/* OCR Processing */}
            {isProcessingOCR && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Loader className="h-5 w-5 animate-spin text-blue-600" />
                  <span className="text-blue-800">OCR প্রক্রিয়াকরণ চলছে...</span>
                </div>
              </div>
            )}
            
            {/* OCR Result */}
            {ocrText && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-800 mb-2">OCR ফলাফল:</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">{ocrText}</pre>
                </div>
              </div>
            )}
          </div>
          
          {/* Uploaded Reports */}
          {uploadedReports.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">আপলোড করা রিপোর্ট ({uploadedReports.length}টি)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {uploadedReports.map((report) => (
                  <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{report.bengaliName}</h4>
                        <p className="text-sm text-gray-600">{report.name}</p>
                        <p className="text-xs text-gray-500">{report.date}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        report.urgency === 'critical' ? 'bg-red-100 text-red-800' :
                        report.urgency === 'urgent' ? 'bg-orange-100 text-orange-800' :
                        report.urgency === 'attention' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {report.urgency === 'critical' ? 'জরুরি' :
                         report.urgency === 'urgent' ? 'তাৎক্ষণিক' :
                         report.urgency === 'attention' ? 'মনোযোগ' : 'স্বাভাবিক'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3">{report.summary}</p>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedReport(report);
                          setShowReportDetails(true);
                        }}
                        className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                      >
                        <Eye className="h-4 w-4 inline mr-1" />
                        বিস্তারিত
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-center">
                <button
                  onClick={analyzeReports}
                  disabled={isAnalyzing}
                  className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <><Loader className="h-5 w-5 animate-spin inline mr-2" />বিশ্লেষণ করা হচ্ছে...</>
                  ) : (
                    <><Brain className="h-5 w-5 inline mr-2" />এআই বিশ্লেষণ শুরু করুন</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analysis Tab */}
      {activeTab === 'analysis' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">এআই বিশ্লেষণ প্রক্রিয়া</h3>
            
            {isAnalyzing ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                    <Brain className="h-8 w-8 text-purple-600 animate-pulse" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-800 mb-2">এআই বিশ্লেষণ চলছে...</h4>
                  <p className="text-gray-600">আপনার মেডিকেল রিপোর্ট বিশ্লেষণ করা হচ্ছে</p>
                </div>
                
                <div className="space-y-4">
                  {[
                    'রিপোর্ট ডেটা প্রক্রিয়াকরণ',
                    'প্যাটার্ন সনাক্তকরণ',
                    'অস্বাভাবিক মান চিহ্নিতকরণ',
                    'ডিফারেনশিয়াল ডায়াগনোসিস তৈরি',
                    'ঝুঁকি মূল্যায়ন',
                    'সুপারিশ প্রস্তুতকরণ'
                  ].map((step, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                      </div>
                      <span className="text-gray-700">{step}</span>
                      <Loader className="h-4 w-4 animate-spin text-blue-600" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-800 mb-2">বিশ্লেষণের জন্য প্রস্তুত</h4>
                <p className="text-gray-600 mb-4">রিপোর্ট আপলোড করে এআই বিশ্লেষণ শুরু করুন</p>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  রিপোর্ট আপলোড করুন
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Diagnosis Tab */}
      {activeTab === 'diagnosis' && (
        <div className="space-y-6">
          {analysisResults.length > 0 ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Target className="h-6 w-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-800">এআই রোগ নির্ণয় ফলাফল</h3>
                </div>
                <p className="text-gray-600">আপনার মেডিকেল রিপোর্ট ও লক্ষণের ভিত্তিতে সম্ভাব্য রোগ নির্ণয়</p>
              </div>
              
              <div className="space-y-4">
                {analysisResults.map((diagnosis, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-800">{diagnosis.bengaliName}</h4>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              diagnosis.severity === 'critical' ? 'bg-red-100 text-red-800' :
                              diagnosis.severity === 'severe' ? 'bg-orange-100 text-orange-800' :
                              diagnosis.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {diagnosis.severity === 'critical' ? 'অত্যন্ত গুরুতর' :
                               diagnosis.severity === 'severe' ? 'গুরুতর' :
                               diagnosis.severity === 'moderate' ? 'মাঝারি' : 'হালকা'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{diagnosis.condition}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">{diagnosis.probability}%</div>
                              <div className="text-sm text-gray-600">সম্ভাবনা</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">{diagnosis.confidence}%</div>
                              <div className="text-sm text-gray-600">আত্মবিশ্বাস</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600">{diagnosis.supportingEvidence.length}</div>
                              <div className="text-sm text-gray-600">সহায়ক প্রমাণ</div>
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => setExpandedDiagnosis(
                            expandedDiagnosis === diagnosis.condition ? null : diagnosis.condition
                          )}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {expandedDiagnosis === diagnosis.condition ? 
                            <ChevronUp className="h-5 w-5" /> : 
                            <ChevronDown className="h-5 w-5" />
                          }
                        </button>
                      </div>
                      
                      {/* Progress Bars */}
                      <div className="space-y-2 mb-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>সম্ভাবনা</span>
                            <span>{diagnosis.probability}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${diagnosis.probability}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>আত্মবিশ্বাস</span>
                            <span>{diagnosis.confidence}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${diagnosis.confidence}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Expanded Details */}
                    {expandedDiagnosis === diagnosis.condition && (
                      <div className="border-t border-gray-200 p-6 space-y-6">
                        {/* Supporting Evidence */}
                        <div>
                          <h5 className="font-semibold text-gray-800 mb-3">সহায়ক প্রমাণ:</h5>
                          <div className="space-y-2">
                            {diagnosis.supportingEvidence.map((evidence, idx) => (
                              <div key={idx} className="flex items-center space-x-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm text-gray-700">{evidence}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Differential Diagnosis */}
                        <div>
                          <h5 className="font-semibold text-gray-800 mb-3">ডিফারেনশিয়াল ডায়াগনোসিস:</h5>
                          <div className="flex flex-wrap gap-2">
                            {diagnosis.differentialDiagnosis.map((diff, idx) => (
                              <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                                {diff}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        {/* Recommended Actions */}
                        <div>
                          <h5 className="font-semibold text-gray-800 mb-3">প্রস্তাবিত ব্যবস্থা:</h5>
                          <div className="space-y-2">
                            {diagnosis.recommendedActions.map((action, idx) => (
                              <div key={idx} className="flex items-center space-x-2">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm text-gray-700">{action}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Prognosis */}
                        <div className="bg-green-50 rounded-lg p-4">
                          <h5 className="font-semibold text-gray-800 mb-2">পূর্বাভাস:</h5>
                          <p className="text-sm text-gray-700">{diagnosis.prognosis}</p>
                        </div>
                        
                        {/* Risk Factors & Complications */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h5 className="font-semibold text-gray-800 mb-3">ঝুঁকির কারণ:</h5>
                            <div className="space-y-1">
                              {diagnosis.riskFactors.map((factor, idx) => (
                                <div key={idx} className="flex items-center space-x-2">
                                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                                  <span className="text-sm text-gray-700">{factor}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h5 className="font-semibold text-gray-800 mb-3">সম্ভাব্য জটিলতা:</h5>
                            <div className="space-y-1">
                              {diagnosis.complications.map((complication, idx) => (
                                <div key={idx} className="flex items-center space-x-2">
                                  <AlertTriangle className="h-4 w-4 text-red-500" />
                                  <span className="text-sm text-gray-700">{complication}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-800 mb-2">রোগ নির্ণয়ের জন্য অপেক্ষা করছে</h4>
              <p className="text-gray-600 mb-4">প্রথমে রিপোর্ট আপলোড করে এআই বিশ্লেষণ সম্পন্ন করুন</p>
              <button
                onClick={() => setActiveTab('upload')}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                রিপোর্ট আপলোড করুন
              </button>
            </div>
          )}
        </div>
      )}

      {/* Risk Assessment Tab */}
      {activeTab === 'risk' && (
        <div className="space-y-6">
          {riskAssessment ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                  <h3 className="text-lg font-semibold text-gray-800">ঝুঁকি মূল্যায়ন</h3>
                </div>
                <p className="text-gray-600">আপনার স্বাস্থ্য অবস্থার ভিত্তিতে ঝুঁকি বিশ্লেষণ</p>
              </div>
              
              {/* Overall Risk */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 ${
                    riskAssessment.overallRisk === 'critical' ? 'bg-red-100' :
                    riskAssessment.overallRisk === 'high' ? 'bg-orange-100' :
                    riskAssessment.overallRisk === 'moderate' ? 'bg-yellow-100' :
                    'bg-green-100'
                  }`}>
                    <span className={`text-3xl font-bold ${
                      riskAssessment.overallRisk === 'critical' ? 'text-red-600' :
                      riskAssessment.overallRisk === 'high' ? 'text-orange-600' :
                      riskAssessment.overallRisk === 'moderate' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {riskAssessment.riskScore}
                    </span>
                  </div>
                  <h4 className="text-xl font-semibold text-gray-800 mb-2">
                    {riskAssessment.overallRisk === 'critical' ? 'অত্যন্ত উচ্চ ঝুঁকি' :
                     riskAssessment.overallRisk === 'high' ? 'উচ্চ ঝুঁকি' :
                     riskAssessment.overallRisk === 'moderate' ? 'মাঝারি ঝুঁকি' :
                     'কম ঝুঁকি'}
                  </h4>
                  <p className="text-gray-600">সামগ্রিক স্বাস্থ্য ঝুঁকি স্কোর: {riskAssessment.riskScore}/100</p>
                </div>
                
                {/* Risk Score Progress */}
                <div className="mb-6">
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className={`h-4 rounded-full transition-all duration-1000 ${
                        riskAssessment.riskScore >= 80 ? 'bg-red-500' :
                        riskAssessment.riskScore >= 60 ? 'bg-orange-500' :
                        riskAssessment.riskScore >= 40 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${riskAssessment.riskScore}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>কম ঝুঁকি</span>
                    <span>মাঝারি ঝুঁকি</span>
                    <span>উচ্চ ঝুঁকি</span>
                  </div>
                </div>
              </div>
              
              {/* Risk Factors */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">ঝুঁকির কারণসমূহ</h4>
                <div className="space-y-4">
                  {riskAssessment.riskFactors.map((factor, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          factor.impact === 'high' ? 'bg-red-500' :
                          factor.impact === 'medium' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`} />
                        <span className="font-medium text-gray-800">{factor.factor}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          factor.impact === 'high' ? 'bg-red-100 text-red-800' :
                          factor.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {factor.impact === 'high' ? 'উচ্চ প্রভাব' :
                           factor.impact === 'medium' ? 'মাঝারি প্রভাব' : 'কম প্রভাব'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          factor.modifiable ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {factor.modifiable ? 'পরিবর্তনযোগ্য' : 'অপরিবর্তনীয়'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Preventive Measures */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">প্রতিরোধমূলক ব্যবস্থা</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {riskAssessment.preventiveMeasures.map((measure, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-gray-700">{measure}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Follow-up Recommendations */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">ফলো-আপ সুপারিশ</h4>
                <div className="space-y-3">
                  {riskAssessment.followUpRecommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      <span className="text-sm text-gray-700">{recommendation}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-800">
                      পরবর্তী পর্যালোচনা: {riskAssessment.timelineForReview}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-800 mb-2">ঝুঁকি মূল্যায়নের জন্য অপেক্ষা করছে</h4>
              <p className="text-gray-600 mb-4">প্রথমে রোগ নির্ণয় সম্পন্ন করুন</p>
              <button
                onClick={() => setActiveTab('diagnosis')}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                রোগ নির্ণয় দেখুন
              </button>
            </div>
          )}
        </div>
      )}

      {/* Report Details Modal */}
      {showReportDetails && selectedReport && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowReportDetails(false)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">রিপোর্ট বিস্তারিত</h2>
                <button
                  onClick={() => setShowReportDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Report Header */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">{selectedReport.bengaliName}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">ইংরেজি নাম:</span>
                      <p className="font-medium">{selectedReport.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">তারিখ:</span>
                      <p className="font-medium">{selectedReport.date}</p>
                    </div>
                  </div>
                </div>

                {/* Report Values */}
                {selectedReport.values.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">পরীক্ষার ফলাফল</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">পরামিতি</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">মান</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">স্বাভাবিক সীমা</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">অবস্থা</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {selectedReport.values.map((value, index) => (
                            <tr key={index}>
                              <td className="px-4 py-2 text-sm text-gray-800">{value.parameter}</td>
                              <td className="px-4 py-2 text-sm font-medium">
                                {value.value} {value.unit}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-600">{value.normalRange}</td>
                              <td className="px-4 py-2">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  value.status === 'critical' ? 'bg-red-100 text-red-800' :
                                  value.status === 'high' ? 'bg-orange-100 text-orange-800' :
                                  value.status === 'low' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {value.status === 'critical' ? 'জরুরি' :
                                   value.status === 'high' ? 'উচ্চ' :
                                   value.status === 'low' ? 'কম' : 'স্বাভাবিক'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Summary */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">সারসংক্ষেপ</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedReport.summary}</p>
                </div>

                {/* Abnormal Findings */}
                {selectedReport.abnormalFindings.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">অস্বাভাবিক ফলাফল</h4>
                    <div className="space-y-2">
                      {selectedReport.abnormalFindings.map((finding, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          <span className="text-sm text-gray-700">{finding}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {selectedReport.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">সুপারিশ</h4>
                    <div className="space-y-2">
                      {selectedReport.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-gray-700">{recommendation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 p-4 border-t border-gray-200">
                <button
                  onClick={() => setShowReportDetails(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  বন্ধ করুন
                </button>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <Download className="h-4 w-4 inline mr-2" />
                  ডাউনলোড
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiseaseAnalysisSystem;