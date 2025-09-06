// Smart Test Selection System - স্মার্ট টেস্ট নির্বাচন সিস্টেম
import React, { useState, useEffect } from 'react';
import { 
  TestTube, 
  Search, 
  Filter, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Star, 
  Activity, 
  Heart, 
  Brain, 
  Eye, 
  Zap, 
  Calendar, 
  MapPin, 
  Phone, 
  FileText, 
  Download, 
  Upload,
  Loader,
  Plus,
  Minus,
  MoreVertical
} from 'lucide-react';

interface Test {
  id: string;
  name: string;
  bengaliName: string;
  category: 'blood' | 'urine' | 'imaging' | 'cardiac' | 'neurological' | 'endocrine' | 'other';
  type: 'routine' | 'specialized' | 'emergency';
  priority: 'high' | 'medium' | 'low';
  cost: number;
  duration: string; // How long the test takes
  reportTime: string; // When results are available
  description: string;
  preparation: string[];
  indications: string[];
  contraindications: string[];
  normalRange?: string;
  clinicalSignificance: string;
  accuracy: number; // Percentage
  availability: 'available' | 'limited' | 'unavailable';
  labRequirements: string[];
  sampleType: string;
  fasting: boolean;
  urgency: 'stat' | 'routine' | 'urgent';
}

interface Patient {
  age: number;
  gender: 'male' | 'female';
  symptoms: string[];
  medicalHistory: string[];
  currentMedications: string[];
  allergies: string[];
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    respiratoryRate?: number;
  };
}

interface TestRecommendation {
  test: Test;
  relevanceScore: number;
  reasoning: string;
  urgency: 'immediate' | 'within_24h' | 'within_week' | 'routine';
  costEffectiveness: number;
}

interface Props {
  symptoms: string[];
  diagnosis: string;
  patient: Patient;
  onTestSelect: (test: Test) => void;
  selectedTests: Test[];
}

const SmartTestSelection: React.FC<Props> = ({ 
  symptoms, 
  diagnosis, 
  patient, 
  onTestSelect,
  selectedTests 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'cost' | 'priority' | 'accuracy'>('relevance');
  const [showOnlyRecommended, setShowOnlyRecommended] = useState(true);
  const [aiRecommendations, setAiRecommendations] = useState<TestRecommendation[]>([]);
  const [allTests, setAllTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [showTestDetails, setShowTestDetails] = useState(false);
  const [costFilter, setCostFilter] = useState<{ min: number; max: number }>({ min: 0, max: 10000 });

  // Comprehensive Test Database
  const testDatabase: Test[] = [
    {
      id: '1',
      name: 'Complete Blood Count (CBC)',
      bengaliName: 'সম্পূর্ণ রক্ত পরীক্ষা',
      category: 'blood',
      type: 'routine',
      priority: 'high',
      cost: 300,
      duration: '15 minutes',
      reportTime: '2-4 hours',
      description: 'রক্তের সম্পূর্ণ বিশ্লেষণ যা হিমোগ্লোবিন, WBC, RBC, প্লেটলেট গণনা করে',
      preparation: ['কোন বিশেষ প্রস্তুতির প্রয়োজন নেই'],
      indications: ['জ্বর', 'দুর্বলতা', 'সংক্রমণ', 'রক্তাল্পতা', 'রক্তক্ষরণ'],
      contraindications: [],
      normalRange: 'Hb: 12-16 g/dl, WBC: 4000-11000/μl',
      clinicalSignificance: 'সাধারণ স্বাস্থ্য মূল্যায়ন ও রক্তের রোগ নির্ণয়',
      accuracy: 95,
      availability: 'available',
      labRequirements: ['EDTA tube'],
      sampleType: 'Venous blood',
      fasting: false,
      urgency: 'routine'
    },
    {
      id: '2',
      name: 'Chest X-Ray',
      bengaliName: 'বুকের এক্স-রে',
      category: 'imaging',
      type: 'routine',
      priority: 'medium',
      cost: 500,
      duration: '10 minutes',
      reportTime: '1-2 hours',
      description: 'ফুসফুস, হৃদযন্ত্র ও বুকের অন্যান্য অঙ্গের অবস্থা দেখার জন্য',
      preparation: ['ধাতব বস্তু সরান', 'গর্ভাবস্থায় জানান'],
      indications: ['কাশি', 'শ্বাসকষ্ট', 'বুকে ব্যথা', 'জ্বর'],
      contraindications: ['গর্ভাবস্থার প্রথম ত্রৈমাসিক'],
      clinicalSignificance: 'ফুসফুসের সংক্রমণ, নিউমোনিয়া, হৃদরোগ নির্ণয়',
      accuracy: 85,
      availability: 'available',
      labRequirements: ['X-ray machine'],
      sampleType: 'Imaging',
      fasting: false,
      urgency: 'routine'
    },
    {
      id: '3',
      name: 'Urine Routine Examination',
      bengaliName: 'প্রস্রাবের সাধারণ পরীক্ষা',
      category: 'urine',
      type: 'routine',
      priority: 'medium',
      cost: 150,
      duration: '10 minutes',
      reportTime: '1-2 hours',
      description: 'প্রস্রাবের রং, ঘনত্ব, প্রোটিন, চিনি, রক্তকণিকা পরীক্ষা',
      preparation: ['সকালের প্রথম প্রস্রাব সংগ্রহ', 'পরিষ্কার পাত্র ব্যবহার'],
      indications: ['প্রস্রাবে জ্বালাপোড়া', 'ঘন ঘন প্রস্রাব', 'প্রস্রাবে রক্ত'],
      contraindications: [],
      normalRange: 'Protein: Negative, Sugar: Negative',
      clinicalSignificance: 'কিডনি রোগ, ডায়াবেটিস, মূত্রনালীর সংক্রমণ নির্ণয়',
      accuracy: 90,
      availability: 'available',
      labRequirements: ['Clean container'],
      sampleType: 'Urine',
      fasting: false,
      urgency: 'routine'
    },
    {
      id: '4',
      name: 'Blood Sugar (Fasting)',
      bengaliName: 'রক্তের চিনি (খালি পেটে)',
      category: 'blood',
      type: 'routine',
      priority: 'high',
      cost: 100,
      duration: '5 minutes',
      reportTime: '30 minutes',
      description: 'খালি পেটে রক্তের গ্লুকোজের মাত্রা পরীক্ষা',
      preparation: ['৮-১২ ঘন্টা উপবাস', 'শুধু পানি পান করা যাবে'],
      indications: ['ডায়াবেটিস সন্দেহ', 'অতিরিক্ত তৃষ্ণা', 'ঘন ঘন প্রস্রাব'],
      contraindications: [],
      normalRange: '70-100 mg/dl',
      clinicalSignificance: 'ডায়াবেটিস নির্ণয় ও নিয়ন্ত্রণ',
      accuracy: 98,
      availability: 'available',
      labRequirements: ['Fluoride tube'],
      sampleType: 'Venous blood',
      fasting: true,
      urgency: 'routine'
    },
    {
      id: '5',
      name: 'Electrocardiogram (ECG)',
      bengaliName: 'হৃদযন্ত্রের বৈদ্যুতিক পরীক্ষা',
      category: 'cardiac',
      type: 'specialized',
      priority: 'high',
      cost: 400,
      duration: '15 minutes',
      reportTime: '30 minutes',
      description: 'হৃদযন্ত্রের বৈদ্যুতিক কার্যকলাপ পরীক্ষা',
      preparation: ['আঁটসাঁট কাপড় পরবেন না', 'ধাতব গহনা সরান'],
      indications: ['বুকে ব্যথা', 'হৃদস্পন্দন অনিয়মিত', 'শ্বাসকষ্ট'],
      contraindications: [],
      clinicalSignificance: 'হার্ট অ্যাটাক, অ্যারিথমিয়া, হৃদরোগ নির্ণয়',
      accuracy: 92,
      availability: 'available',
      labRequirements: ['ECG machine'],
      sampleType: 'Electrical recording',
      fasting: false,
      urgency: 'urgent'
    },
    {
      id: '6',
      name: 'Liver Function Test (LFT)',
      bengaliName: 'লিভার ফাংশন টেস্ট',
      category: 'blood',
      type: 'specialized',
      priority: 'medium',
      cost: 800,
      duration: '10 minutes',
      reportTime: '4-6 hours',
      description: 'লিভারের কার্যকারিতা ও এনজাইমের মাত্রা পরীক্ষা',
      preparation: ['৮-১২ ঘন্টা উপবাস'],
      indications: ['জন্ডিস', 'পেট ব্যথা', 'লিভার বড় হওয়া'],
      contraindications: [],
      normalRange: 'ALT: 7-56 U/L, AST: 10-40 U/L',
      clinicalSignificance: 'লিভারের রোগ, হেপাটাইটিস নির্ণয়',
      accuracy: 94,
      availability: 'available',
      labRequirements: ['Serum separator tube'],
      sampleType: 'Venous blood',
      fasting: true,
      urgency: 'routine'
    },
    {
      id: '7',
      name: 'Thyroid Function Test (TFT)',
      bengaliName: 'থাইরয়েড ফাংশন টেস্ট',
      category: 'endocrine',
      type: 'specialized',
      priority: 'medium',
      cost: 1200,
      duration: '10 minutes',
      reportTime: '24 hours',
      description: 'থাইরয়েড গ্রন্থির হরমোনের মাত্রা পরীক্ষা',
      preparation: ['কোন বিশেষ প্রস্তুতির প্রয়োজন নেই'],
      indications: ['ওজন বৃদ্ধি/হ্রাস', 'ক্লান্তি', 'হৃদস্পন্দন পরিবর্তন'],
      contraindications: [],
      normalRange: 'TSH: 0.4-4.0 mIU/L',
      clinicalSignificance: 'হাইপো/হাইপারথাইরয়েডিজম নির্ণয়',
      accuracy: 96,
      availability: 'available',
      labRequirements: ['Serum separator tube'],
      sampleType: 'Venous blood',
      fasting: false,
      urgency: 'routine'
    },
    {
      id: '8',
      name: 'CT Scan (Head)',
      bengaliName: 'সিটি স্ক্যান (মাথা)',
      category: 'imaging',
      type: 'specialized',
      priority: 'high',
      cost: 3500,
      duration: '30 minutes',
      reportTime: '2-4 hours',
      description: 'মাথার বিস্তারিত ছবি তোলার জন্য',
      preparation: ['ধাতব বস্তু সরান', 'কনট্রাস্ট এলার্জি জানান'],
      indications: ['মাথাব্যথা', 'খিঁচুনি', 'মাথায় আঘাত', 'স্ট্রোক সন্দেহ'],
      contraindications: ['গর্ভাবস্থা', 'কনট্রাস্ট এলার্জি'],
      clinicalSignificance: 'স্ট্রোক, টিউমার, রক্তক্ষরণ নির্ণয়',
      accuracy: 98,
      availability: 'limited',
      labRequirements: ['CT scanner'],
      sampleType: 'Imaging',
      fasting: false,
      urgency: 'urgent'
    }
  ];

  const categories = [
    { id: 'all', name: 'সব ক্যাটেগরি', icon: TestTube },
    { id: 'blood', name: 'রক্ত পরীক্ষা', icon: Activity },
    { id: 'urine', name: 'প্রস্রাব পরীক্ষা', icon: TestTube },
    { id: 'imaging', name: 'ইমেজিং', icon: Eye },
    { id: 'cardiac', name: 'হৃদযন্ত্র', icon: Heart },
    { id: 'neurological', name: 'স্নায়ুতন্ত্র', icon: Brain },
    { id: 'endocrine', name: 'হরমোন', icon: Zap }
  ];

  const testTypes = [
    { id: 'all', name: 'সব ধরনের' },
    { id: 'routine', name: 'নিয়মিত' },
    { id: 'specialized', name: 'বিশেষায়িত' },
    { id: 'emergency', name: 'জরুরি' }
  ];

  // AI-based test recommendation
  const generateAIRecommendations = async () => {
    setIsLoading(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const recommendations: TestRecommendation[] = [];
    
    // Analyze symptoms and diagnosis to recommend tests
    testDatabase.forEach(test => {
      let relevanceScore = 0;
      let reasoning = '';
      let urgency: 'immediate' | 'within_24h' | 'within_week' | 'routine' = 'routine';
      
      // Check if test is indicated for symptoms
      const symptomMatches = test.indications.filter(indication => 
        symptoms.some(symptom => 
          symptom.toLowerCase().includes(indication.toLowerCase()) ||
          indication.toLowerCase().includes(symptom.toLowerCase())
        )
      );
      
      // Check if test is indicated for diagnosis
      const diagnosisMatch = test.indications.some(indication => 
        diagnosis.toLowerCase().includes(indication.toLowerCase())
      );
      
      if (symptomMatches.length > 0 || diagnosisMatch) {
        relevanceScore = (symptomMatches.length * 20) + (diagnosisMatch ? 30 : 0);
        
        // Add age and gender specific recommendations
        if (patient.age > 40 && test.category === 'cardiac') {
          relevanceScore += 15;
          reasoning += 'বয়স অনুযায়ী হৃদরোগের ঝুঁকি। ';
        }
        
        if (patient.gender === 'female' && patient.age > 35 && test.name.includes('Thyroid')) {
          relevanceScore += 10;
          reasoning += 'মহিলাদের থাইরয়েড সমস্যার ঝুঁকি। ';
        }
        
        // Determine urgency based on symptoms
        if (symptoms.some(s => ['বুকে ব্যথা', 'শ্বাসকষ্ট', 'অজ্ঞান'].includes(s))) {
          urgency = 'immediate';
        } else if (symptoms.some(s => ['জ্বর', 'তীব্র ব্যথা'].includes(s))) {
          urgency = 'within_24h';
        } else if (symptoms.some(s => ['দুর্বলতা', 'ক্লান্তি'].includes(s))) {
          urgency = 'within_week';
        }
        
        // Calculate cost-effectiveness
        const costEffectiveness = (test.accuracy * relevanceScore) / test.cost;
        
        if (symptomMatches.length > 0) {
          reasoning += `লক্ষণ মিল: ${symptomMatches.join(', ')}। `;
        }
        if (diagnosisMatch) {
          reasoning += `রোগ নির্ণয়ের সাথে সম্পর্কিত। `;
        }
        
        recommendations.push({
          test,
          relevanceScore,
          reasoning: reasoning || 'সাধারণ স্বাস্থ্য পরীক্ষার জন্য প্রয়োজনীয়।',
          urgency,
          costEffectiveness
        });
      }
    });
    
    // Sort by relevance score
    recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    setAiRecommendations(recommendations.slice(0, 8));
    setAllTests(testDatabase);
    setIsLoading(false);
  };

  // Filter tests
  const getFilteredTests = () => {
    let filtered = showOnlyRecommended ? 
      aiRecommendations.map(rec => rec.test) : 
      allTests;
    
    if (searchQuery) {
      filtered = filtered.filter(test => 
        test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.bengaliName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(test => test.category === selectedCategory);
    }
    
    if (selectedType !== 'all') {
      filtered = filtered.filter(test => test.type === selectedType);
    }
    
    // Cost filter
    filtered = filtered.filter(test => 
      test.cost >= costFilter.min && test.cost <= costFilter.max
    );
    
    // Sort tests
    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case 'cost':
          return a.cost - b.cost;
        case 'priority':
          const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'accuracy':
          return b.accuracy - a.accuracy;
        default:
          // Relevance - if showing recommendations, use relevance score
          if (showOnlyRecommended) {
            const aRec = aiRecommendations.find(rec => rec.test.id === a.id);
            const bRec = aiRecommendations.find(rec => rec.test.id === b.id);
            return (bRec?.relevanceScore || 0) - (aRec?.relevanceScore || 0);
          }
          return b.accuracy - a.accuracy;
      }
    });
    
    return filtered;
  };

  // Get recommendation for a test
  const getTestRecommendation = (testId: string) => {
    return aiRecommendations.find(rec => rec.test.id === testId);
  };

  // Handle test selection
  const handleTestSelect = (test: Test) => {
    onTestSelect(test);
  };

  // Show test details
  const showTestDetailsModal = (test: Test) => {
    setSelectedTest(test);
    setShowTestDetails(true);
  };

  useEffect(() => {
    if (symptoms.length > 0 || diagnosis) {
      generateAIRecommendations();
    }
  }, [symptoms, diagnosis, patient]);

  return (
    <div className="space-y-6">
      {/* AI Recommendations */}
      {aiRecommendations.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Brain className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-800">এআই প্রস্তাবিত পরীক্ষা</h3>
            {isLoading && <Loader className="h-5 w-5 animate-spin text-purple-600" />}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiRecommendations.slice(0, 6).map((recommendation) => {
              const { test, relevanceScore, reasoning, urgency, costEffectiveness } = recommendation;
              const isSelected = selectedTests.some(t => t.id === test.id);
              
              return (
                <div key={test.id} className={`bg-white rounded-lg border p-4 hover:shadow-md transition-all ${
                  urgency === 'immediate' ? 'border-red-300 bg-red-50' :
                  urgency === 'within_24h' ? 'border-orange-300 bg-orange-50' :
                  urgency === 'within_week' ? 'border-yellow-300 bg-yellow-50' :
                  'border-purple-200'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{test.bengaliName}</h4>
                      <p className="text-sm text-gray-600">{test.name}</p>
                      <p className="text-xs text-gray-500">{test.category} • {test.type}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{Math.round(relevanceScore)}%</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">খরচ:</span>
                      <span className="font-medium">৳{test.cost}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">রিপোর্ট:</span>
                      <span className="font-medium">{test.reportTime}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">নির্ভুলতা:</span>
                      <span className="font-medium">{test.accuracy}%</span>
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-xs text-gray-600 mb-1">কেন প্রয়োজন:</p>
                      <p className="text-xs text-gray-700">{reasoning}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        urgency === 'immediate' ? 'bg-red-100 text-red-800' :
                        urgency === 'within_24h' ? 'bg-orange-100 text-orange-800' :
                        urgency === 'within_week' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {urgency === 'immediate' ? 'জরুরি' :
                         urgency === 'within_24h' ? '২৪ ঘন্টায়' :
                         urgency === 'within_week' ? '১ সপ্তাহে' : 'নিয়মিত'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        test.availability === 'available'
                          ? 'bg-green-100 text-green-800'
                          : test.availability === 'limited'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {test.availability === 'available' ? 'উপলব্ধ' : 
                         test.availability === 'limited' ? 'সীমিত' : 'অনুপলব্ধ'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleTestSelect(test)}
                      disabled={isSelected}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        isSelected
                          ? 'bg-green-100 text-green-800 cursor-not-allowed'
                          : 'bg-purple-500 text-white hover:bg-purple-600'
                      }`}
                    >
                      {isSelected ? (
                        <><CheckCircle className="h-4 w-4 inline mr-1" />নির্বাচিত</>
                      ) : (
                        <><Plus className="h-4 w-4 inline mr-1" />নির্বাচন</>
                      )}
                    </button>
                    <button 
                      onClick={() => showTestDetailsModal(test)}
                      className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="space-y-4">
          {/* Search */}
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="পরীক্ষার নাম বা বিবরণ খুঁজুন..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showOnlyRecommended}
                onChange={(e) => setShowOnlyRecommended(e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">শুধু প্রস্তাবিত</span>
            </label>
          </div>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            
            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {testTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'relevance' | 'cost' | 'priority' | 'accuracy')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="relevance">প্রাসঙ্গিকতা</option>
              <option value="cost">মূল্য</option>
              <option value="priority">অগ্রাধিকার</option>
              <option value="accuracy">নির্ভুলতা</option>
            </select>
            
            {/* Cost Range */}
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="সর্বনিম্ন"
                value={costFilter.min}
                onChange={(e) => setCostFilter(prev => ({ ...prev, min: Number(e.target.value) }))}
                className="w-20 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
              <input
                type="number"
                placeholder="সর্বোচ্চ"
                value={costFilter.max}
                onChange={(e) => setCostFilter(prev => ({ ...prev, max: Number(e.target.value) }))}
                className="w-20 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Test List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            {showOnlyRecommended ? 'প্রস্তাবিত পরীক্ষা' : 'সব পরীক্ষা'} ({getFilteredTests().length}টি)
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {getFilteredTests().map((test) => {
            const recommendation = getTestRecommendation(test.id);
            const isSelected = selectedTests.some(t => t.id === test.id);
            
            return (
              <div key={test.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-800">{test.bengaliName}</h4>
                          {recommendation && (
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                              {Math.round(recommendation.relevanceScore)}% মিল
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{test.name}</p>
                        <p className="text-sm text-gray-500 mb-3">{test.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4 text-green-500" />
                            <span>৳{test.cost}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span>{test.reportTime}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="h-4 w-4 text-purple-500" />
                            <span>{test.accuracy}% নির্ভুল</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <AlertTriangle className={`h-4 w-4 ${
                              test.priority === 'high' ? 'text-red-500' :
                              test.priority === 'medium' ? 'text-yellow-500' :
                              'text-green-500'
                            }`} />
                            <span className={`${
                              test.priority === 'high' ? 'text-red-600' :
                              test.priority === 'medium' ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>
                              {test.priority === 'high' ? 'উচ্চ' :
                               test.priority === 'medium' ? 'মাঝারি' : 'কম'} অগ্রাধিকার
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            test.availability === 'available'
                              ? 'bg-green-100 text-green-800'
                              : test.availability === 'limited'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {test.availability === 'available' ? 'উপলব্ধ' : 
                             test.availability === 'limited' ? 'সীমিত' : 'অনুপলব্ধ'}
                          </span>
                          
                          {test.fasting && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                              উপবাস প্রয়োজন
                            </span>
                          )}
                          
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            test.urgency === 'stat' ? 'bg-red-100 text-red-800' :
                            test.urgency === 'urgent' ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {test.urgency === 'stat' ? 'জরুরি' :
                             test.urgency === 'urgent' ? 'তাৎক্ষণিক' : 'নিয়মিত'}
                          </span>
                        </div>
                        
                        {recommendation && (
                          <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                            <p className="text-sm text-purple-800">
                              <strong>এআই সুপারিশ:</strong> {recommendation.reasoning}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleTestSelect(test)}
                          disabled={isSelected}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isSelected
                              ? 'bg-green-100 text-green-800 cursor-not-allowed'
                              : 'bg-purple-500 text-white hover:bg-purple-600'
                          }`}
                        >
                          {isSelected ? (
                            <><CheckCircle className="h-4 w-4 inline mr-1" />নির্বাচিত</>
                          ) : (
                            <><Plus className="h-4 w-4 inline mr-1" />নির্বাচন</>
                          )}
                        </button>
                        <button 
                          onClick={() => showTestDetailsModal(test)}
                          className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Test Details Modal */}
      {showTestDetails && selectedTest && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowTestDetails(false)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">পরীক্ষার বিস্তারিত</h2>
                <button
                  onClick={() => setShowTestDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Test Info */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">{selectedTest.bengaliName}</h3>
                  <p className="text-gray-600 mb-2">{selectedTest.name}</p>
                  <p className="text-gray-700">{selectedTest.description}</p>
                </div>

                {/* Test Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">পরীক্ষার তথ্য</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">ক্যাটেগরি:</span>
                        <span className="font-medium">{selectedTest.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">ধরন:</span>
                        <span className="font-medium">{selectedTest.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">খরচ:</span>
                        <span className="font-medium text-green-600">৳{selectedTest.cost}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">সময়:</span>
                        <span className="font-medium">{selectedTest.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">রিপোর্ট:</span>
                        <span className="font-medium">{selectedTest.reportTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">নির্ভুলতা:</span>
                        <span className="font-medium">{selectedTest.accuracy}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">নমুনার তথ্য</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">নমুনার ধরন:</span>
                        <span className="font-medium">{selectedTest.sampleType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">উপবাস:</span>
                        <span className="font-medium">{selectedTest.fasting ? 'প্রয়োজন' : 'প্রয়োজন নেই'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">জরুরিত্ব:</span>
                        <span className="font-medium">{selectedTest.urgency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">উপলব্ধতা:</span>
                        <span className={`font-medium ${
                          selectedTest.availability === 'available' ? 'text-green-600' :
                          selectedTest.availability === 'limited' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {selectedTest.availability === 'available' ? 'উপলব্ধ' : 
                           selectedTest.availability === 'limited' ? 'সীমিত' : 'অনুপলব্ধ'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preparation */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">প্রস্তুতি</h4>
                  <div className="space-y-2">
                    {selectedTest.preparation.map((prep, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{prep}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Indications */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">কখন করা হয়</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTest.indications.map((indication, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                        {indication}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contraindications */}
                {selectedTest.contraindications.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">সতর্কতা</h4>
                    <div className="space-y-2">
                      {selectedTest.contraindications.map((contra, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm text-red-600">
                          <AlertTriangle className="h-4 w-4" />
                          <span>{contra}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Normal Range */}
                {selectedTest.normalRange && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">স্বাভাবিক মাত্রা</h4>
                    <p className="text-gray-700 bg-green-50 p-3 rounded-lg">{selectedTest.normalRange}</p>
                  </div>
                )}

                {/* Clinical Significance */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">চিকিৎসা গুরুত্ব</h4>
                  <p className="text-gray-700">{selectedTest.clinicalSignificance}</p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 p-4 border-t border-gray-200">
                <button
                  onClick={() => setShowTestDetails(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  বন্ধ করুন
                </button>
                <button
                  onClick={() => {
                    handleTestSelect(selectedTest);
                    setShowTestDetails(false);
                  }}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  নির্বাচন করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartTestSelection;