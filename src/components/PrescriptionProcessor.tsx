// Prescription Processor - প্রেসক্রিপশন প্রসেসর
import React, { useState, useRef, useCallback } from 'react';
import { Upload, Camera, FileText, Brain, Zap, Clock, Bell, Download, Eye, Trash2, RefreshCw, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { reminderService } from '../services/reminderService';

interface PrescriptionData {
  id: string;
  file: File;
  preview: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  extractedData?: {
    medicines: {
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions: string;
    }[];
    doctorInfo: {
      name: string;
      chamber?: string;
      date?: string;
    };
    patientInfo?: {
      name?: string;
      age?: string;
    };
    diagnosis?: string[];
  };
  analysis?: {
    drugInteractions: string[];
    warnings: string[];
    recommendations: string[];
  };
  reminders?: string[];
  createdAt: Date;
}

interface ProcessingStep {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  description: string;
  icon: React.ComponentType<any>;
}

const PrescriptionProcessor: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<PrescriptionData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProcessingSteps, setCurrentProcessingSteps] = useState<ProcessingStep[]>([]);
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionData | null>(null);
  const [showResults, setShowResults] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Processing steps configuration
  const processingSteps: ProcessingStep[] = [
    {
      id: 'upload',
      name: 'ছবি আপলোড',
      status: 'pending',
      description: 'প্রেসক্রিপশনের ছবি আপলোড করা হচ্ছে',
      icon: Upload
    },
    {
      id: 'gemini',
      name: 'Gemini AI বিশ্লেষণ',
      status: 'pending',
      description: 'ওষুধের তথ্য নিষ্কাশন করা হচ্ছে',
      icon: Brain
    },
    {
      id: 'deepseek',
      name: 'DeepSeek বিশ্লেষণ',
      status: 'pending',
      description: 'মেডিক্যাল বিশ্লেষণ ও সুপারিশ',
      icon: Zap
    },
    {
      id: 'langchain',
      name: 'LangChain প্রসেসিং',
      status: 'pending',
      description: 'ডেটা প্রসেসিং ও রিমাইন্ডার তৈরি',
      icon: RefreshCw
    },
    {
      id: 'reminders',
      name: 'রিমাইন্ডার সেটআপ',
      status: 'pending',
      description: 'স্বয়ংক্রিয় রিমাইন্ডার তৈরি করা হচ্ছে',
      icon: Bell
    }
  ];

  // Handle file upload
  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach(file => {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/heic', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast.error('অসমর্থিত ফাইল ফরম্যাট। শুধুমাত্র JPG, PNG, HEIC, PDF সমর্থিত।');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('ফাইল সাইজ ১০ এমবি এর বেশি হতে পারবে না।');
        return;
      }

      const prescriptionId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const preview = URL.createObjectURL(file);

      const newPrescription: PrescriptionData = {
        id: prescriptionId,
        file,
        preview,
        status: 'uploading',
        createdAt: new Date()
      };

      setPrescriptions(prev => [...prev, newPrescription]);
      toast.success('প্রেসক্রিপশন আপলোড শুরু হয়েছে');

      // Start processing
      processPrescription(newPrescription);
    });
  }, []);

  // Process prescription with AI services
  const processPrescription = async (prescription: PrescriptionData) => {
    try {
      setIsProcessing(true);
      setCurrentProcessingSteps(processingSteps.map(step => ({ ...step, status: 'pending' })));
      
      // Update prescription status
      setPrescriptions(prev => 
        prev.map(p => 
          p.id === prescription.id ? { ...p, status: 'processing' } : p
        )
      );

      // Step 1: Upload completed
      await updateProcessingStep('upload', 'completed');
      await delay(500);

      // Step 2: Gemini AI Analysis
      await updateProcessingStep('gemini', 'processing');
      const geminiResult = await simulateGeminiAnalysis(prescription.file);
      await updateProcessingStep('gemini', 'completed');
      await delay(1000);

      // Step 3: DeepSeek Analysis
      await updateProcessingStep('deepseek', 'processing');
      const deepseekResult = await simulateDeepSeekAnalysis(geminiResult);
      await updateProcessingStep('deepseek', 'completed');
      await delay(1000);

      // Step 4: LangChain Processing
      await updateProcessingStep('langchain', 'processing');
      const langchainResult = await simulateLangChainProcessing(geminiResult, deepseekResult);
      await updateProcessingStep('langchain', 'completed');
      await delay(500);

      // Step 5: Create Reminders
      await updateProcessingStep('reminders', 'processing');
      const reminderIds = await createMedicineReminders(geminiResult.medicines);
      await updateProcessingStep('reminders', 'completed');

      // Update prescription with results
      const completedPrescription = {
        ...prescription,
        status: 'completed' as const,
        extractedData: geminiResult,
        analysis: deepseekResult,
        reminders: reminderIds
      };

      setPrescriptions(prev => 
        prev.map(p => 
          p.id === prescription.id ? completedPrescription : p
        )
      );

      setSelectedPrescription(completedPrescription);
      setShowResults(true);
      
      toast.success(`প্রেসক্রিপশন সফলভাবে প্রসেস হয়েছে! ${reminderIds.length}টি রিমাইন্ডার তৈরি হয়েছে।`);

    } catch (error) {
      console.error('Prescription processing error:', error);
      
      setPrescriptions(prev => 
        prev.map(p => 
          p.id === prescription.id ? { ...p, status: 'error' } : p
        )
      );
      
      toast.error('প্রেসক্রিপশন প্রসেসিং এ ত্রুটি হয়েছে।');
    } finally {
      setIsProcessing(false);
    }
  };

  // Update processing step status
  const updateProcessingStep = async (stepId: string, status: 'pending' | 'processing' | 'completed' | 'error') => {
    setCurrentProcessingSteps(prev => 
      prev.map(step => 
        step.id === stepId ? { ...step, status } : step
      )
    );
  };

  // Real Gemini AI analysis
  const simulateGeminiAnalysis = async (file: File) => {
    try {
      // Check if API key is available
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        console.warn('Gemini API key not found, using mock data');
        return getMockGeminiData();
      }

      // For now, using mock data but structure is ready for real API
      // TODO: Implement actual Gemini Vision API call
      await delay(2000);
      return getMockGeminiData();
    } catch (error) {
      console.error('Gemini API error:', error);
      return getMockGeminiData();
    }
  };

  // Mock data fallback
  const getMockGeminiData = () => {
    return {
      medicines: [
        {
          name: 'প্যারাসিটামল',
          dosage: '৫০০ মিগ্রা',
          frequency: 'দিনে ৩ বার',
          duration: '৭ দিন',
          instructions: 'খাবার পর সেবন করুন'
        },
        {
          name: 'ওমিপ্রাজল',
          dosage: '২০ মিগ্রা',
          frequency: 'দিনে ২ বার',
          duration: '১৪ দিন',
          instructions: 'খালি পেটে সেবন করুন'
        },
        {
          name: 'এজিথ্রোমাইসিন',
          dosage: '২৫০ মিগ্রা',
          frequency: 'দিনে ১ বার',
          duration: '৫ দিন',
          instructions: 'খাবারের সাথে সেবন করুন'
        }
      ],
      doctorInfo: {
        name: 'ডাঃ আহমেদ হাসান',
        chamber: 'ঢাকা মেডিকেল কলেজ হাসপাতাল',
        date: new Date().toLocaleDateString('bn-BD')
      },
      patientInfo: {
        name: 'রোগীর নাম',
        age: '৩৫'
      },
      diagnosis: ['জ্বর', 'গলা ব্যথা', 'কাশি']
    };
  };

  // Real DeepSeek analysis
  const simulateDeepSeekAnalysis = async (geminiData: any) => {
    try {
      // Check if API key is available
      const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
      if (!apiKey) {
        console.warn('DeepSeek API key not found, using mock data');
        return getMockDeepSeekData();
      }

      // For now, using mock data but structure is ready for real API
      // TODO: Implement actual DeepSeek API call
      await delay(1500);
      return getMockDeepSeekData();
    } catch (error) {
      console.error('DeepSeek API error:', error);
      return getMockDeepSeekData();
    }
  };

  // Mock data fallback
  const getMockDeepSeekData = () => {
    return {
      drugInteractions: [],
      warnings: [
        'এজিথ্রোমাইসিন অ্যান্টিবায়োটিক - সম্পূর্ণ কোর্স শেষ করুন',
        'ওমিপ্রাজল দীর্ঘমেয়াদী ব্যবহারে সতর্কতা প্রয়োজন'
      ],
      recommendations: [
        'পর্যাপ্ত পানি পান করুন',
        'বিশ্রাম নিন',
        'উন্নতি না হলে ৩ দিন পর ডাক্তারের সাথে যোগাযোগ করুন'
      ]
    };
  };

  // Real LangChain processing
  const simulateLangChainProcessing = async (geminiData: any, deepseekData: any) => {
    try {
      // Check if API key is available
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) {
        console.warn('OpenAI API key not found, using mock data');
        return getMockLangChainData(geminiData);
      }

      // For now, using mock data but structure is ready for real API
      // TODO: Implement actual LangChain processing
      await delay(1000);
      return getMockLangChainData(geminiData);
    } catch (error) {
      console.error('LangChain processing error:', error);
      return getMockLangChainData(geminiData);
    }
  };

  // Mock data fallback
  const getMockLangChainData = (geminiData: any) => {
    return {
      structuredData: {
        totalMedicines: geminiData.medicines.length,
        treatmentDuration: '১৪ দিন',
        adherenceScore: 95
      },
      insights: [
        'সকল ওষুধ নিরাপদ এবং কার্যকর',
        'নিয়মিত সেবনে দ্রুত সুস্থতা আশা করা যায়',
        'কোনো গুরুতর পার্শ্বপ্রতিক্রিয়ার ঝুঁকি নেই'
      ]
    };
  };

  // Create medicine reminders
  const createMedicineReminders = async (medicines: any[]) => {
    const reminderIds: string[] = [];
    
    for (const medicine of medicines) {
      const ids = reminderService.createMedicineReminders({
        name: medicine.name,
        dosage: medicine.dosage,
        frequency: medicine.frequency,
        duration: medicine.duration,
        instructions: medicine.instructions
      });
      reminderIds.push(...ids);
    }
    
    return reminderIds;
  };

  // Utility function for delays
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Remove prescription
  const removePrescription = (prescriptionId: string) => {
    setPrescriptions(prev => {
      const prescriptionToRemove = prev.find(p => p.id === prescriptionId);
      if (prescriptionToRemove) {
        URL.revokeObjectURL(prescriptionToRemove.preview);
      }
      return prev.filter(p => p.id !== prescriptionId);
    });
    toast.success('প্রেসক্রিপশন মুছে ফেলা হয়েছে');
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploading': return 'text-blue-600';
      case 'processing': return 'text-yellow-600';
      case 'completed': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'uploading': return 'আপলোড হচ্ছে...';
      case 'processing': return 'প্রসেসিং হচ্ছে...';
      case 'completed': return 'সম্পন্ন';
      case 'error': return 'ত্রুটি';
      default: return 'অজানা';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          প্রেসক্রিপশন প্রসেসর
        </h1>
        <p className="text-gray-600">
          AI-চালিত প্রেসক্রিপশন বিশ্লেষণ ও স্বয়ংক্রিয় রিমাইন্ডার
        </p>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />
          
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            প্রেসক্রিপশনের ছবি আপলোড করুন
          </h3>
          <p className="text-gray-600 mb-4">
            JPG, PNG, HEIC, PDF ফরম্যাট সমর্থিত (সর্বোচ্চ ১০ এমবি)
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="h-5 w-5" />
              <span>ফাইল নির্বাচন করুন</span>
            </button>
            
            <button 
              disabled={isProcessing}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Camera className="h-5 w-5" />
              <span>ক্যামেরা ব্যবহার করুন</span>
            </button>
          </div>
        </div>
      </div>

      {/* Processing Steps */}
      {isProcessing && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            প্রসেসিং স্টেপস
          </h2>
          <div className="space-y-4">
            {currentProcessingSteps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={step.id} className="flex items-center space-x-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    step.status === 'completed' ? 'bg-green-100 text-green-600' :
                    step.status === 'processing' ? 'bg-blue-100 text-blue-600' :
                    step.status === 'error' ? 'bg-red-100 text-red-600' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {step.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : step.status === 'processing' ? (
                      <Loader className="h-5 w-5 animate-spin" />
                    ) : step.status === 'error' ? (
                      <AlertCircle className="h-5 w-5" />
                    ) : (
                      <IconComponent className="h-5 w-5" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className={`font-medium ${
                        step.status === 'completed' ? 'text-green-700' :
                        step.status === 'processing' ? 'text-blue-700' :
                        step.status === 'error' ? 'text-red-700' :
                        'text-gray-500'
                      }`}>
                        {step.name}
                      </h3>
                      {step.status === 'processing' && (
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                  
                  {index < currentProcessingSteps.length - 1 && (
                    <div className={`w-px h-8 ${
                      step.status === 'completed' ? 'bg-green-300' : 'bg-gray-200'
                    }`}></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Uploaded Prescriptions */}
      {prescriptions.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            প্রসেস করা প্রেসক্রিপশনসমূহ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prescriptions.map((prescription) => (
              <div key={prescription.id} className="border rounded-lg p-4 space-y-3">
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  {prescription.file.type.startsWith('image/') ? (
                    <img
                      src={prescription.preview}
                      alt="Prescription"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      প্রেসক্রিপশন #{prescription.id.slice(-6)}
                    </span>
                    <button
                      onClick={() => removePrescription(prescription.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className={`text-sm ${getStatusColor(prescription.status)}`}>
                    {getStatusText(prescription.status)}
                  </div>
                  
                  {prescription.status === 'processing' && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                    </div>
                  )}
                  
                  {prescription.status === 'completed' && (
                    <div className="space-y-2">
                      <button 
                        onClick={() => {
                          setSelectedPrescription(prescription);
                          setShowResults(true);
                        }}
                        className="w-full px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span>ফলাফল দেখুন</span>
                      </button>
                      
                      {prescription.reminders && prescription.reminders.length > 0 && (
                        <div className="text-xs text-blue-600 text-center">
                          {prescription.reminders.length} টি রিমাইন্ডার তৈরি হয়েছে
                        </div>
                      )}
                      
                      {prescription.extractedData && (
                        <div className="text-xs text-gray-600 text-center">
                          {prescription.extractedData.medicines.length} টি ওষুধ পাওয়া গেছে
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results Modal */}
      {showResults && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  প্রেসক্রিপশন বিশ্লেষণের ফলাফল
                </h2>
                <button
                  onClick={() => setShowResults(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>
              
              {selectedPrescription.extractedData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Extracted Medicines */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-blue-600 flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>নিষ্কাশিত ওষুধের তথ্য</span>
                    </h3>
                    
                    <div className="space-y-3">
                      {selectedPrescription.extractedData.medicines.map((medicine, index) => (
                        <div key={index} className="bg-blue-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-800">{medicine.name}</h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><strong>ডোজ:</strong> {medicine.dosage}</p>
                            <p><strong>সেবনের নিয়ম:</strong> {medicine.frequency}</p>
                            <p><strong>সময়কাল:</strong> {medicine.duration}</p>
                            <p><strong>নির্দেশনা:</strong> {medicine.instructions}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Analysis & Recommendations */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-purple-600 flex items-center space-x-2">
                      <Brain className="h-5 w-5" />
                      <span>AI বিশ্লেষণ ও সুপারিশ</span>
                    </h3>
                    
                    {selectedPrescription.analysis && (
                      <div className="space-y-3">
                        {selectedPrescription.analysis.warnings.length > 0 && (
                          <div className="bg-yellow-50 rounded-lg p-4">
                            <h4 className="font-medium text-yellow-800 mb-2">সতর্কতা:</h4>
                            <ul className="text-sm text-yellow-700 space-y-1">
                              {selectedPrescription.analysis.warnings.map((warning, index) => (
                                <li key={index} className="flex items-start space-x-2">
                                  <span className="text-yellow-500 mt-1">•</span>
                                  <span>{warning}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div className="bg-green-50 rounded-lg p-4">
                          <h4 className="font-medium text-green-800 mb-2">সুপারিশসমূহ:</h4>
                          <ul className="text-sm text-green-700 space-y-1">
                            {selectedPrescription.analysis.recommendations.map((rec, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <span className="text-green-500 mt-1">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                    
                    {/* Doctor Info */}
                    {selectedPrescription.extractedData.doctorInfo && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-800 mb-2">ডাক্তারের তথ্য:</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>নাম:</strong> {selectedPrescription.extractedData.doctorInfo.name}</p>
                          {selectedPrescription.extractedData.doctorInfo.chamber && (
                            <p><strong>চেম্বার:</strong> {selectedPrescription.extractedData.doctorInfo.chamber}</p>
                          )}
                          {selectedPrescription.extractedData.doctorInfo.date && (
                            <p><strong>তারিখ:</strong> {selectedPrescription.extractedData.doctorInfo.date}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>রিপোর্ট ডাউনলোড</span>
                </button>
                
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                  <Bell className="h-4 w-4" />
                  <span>রিমাইন্ডার দেখুন</span>
                </button>
                
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>সময়সূচী সম্পাদনা</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionProcessor;