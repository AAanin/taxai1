// Medical Image Analysis System - মেডিকেল ইমেজ বিশ্লেষণ সিস্টেম
import React, { useState, useRef, useCallback } from 'react';
import { Upload, Camera, FileText, Activity, Brain, Zap, Clock, Bell, Download, Eye, Trash2, RefreshCw } from 'lucide-react';

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  type: 'prescription' | 'report' | 'lab' | 'xray' | 'mri' | 'ct';
  status: 'uploading' | 'processing' | 'completed' | 'error';
  extractedData?: any;
  analysis?: any;
  reminders?: any[];
}

interface AnalysisResult {
  geminiAnalysis: {
    extractedText: string;
    medicines: any[];
    dosages: any[];
    instructions: string[];
    doctorInfo: any;
  };
  deepseekAnalysis: {
    diseasePatterns: string[];
    riskAssessment: string;
    recommendations: string[];
    labValues: any[];
    abnormalFindings: string[];
  };
  langchainProcessing: {
    structuredData: any;
    reminders: any[];
    insights: string[];
    nextSteps: string[];
  };
}

const MedicalImageAnalysisSystem: React.FC = () => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [selectedImageType, setSelectedImageType] = useState<string>('prescription');
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image type configurations
  const imageTypes = [
    { id: 'prescription', name: 'প্রেসক্রিপশন', icon: FileText, color: 'blue' },
    { id: 'report', name: 'মেডিকেল রিপোর্ট', icon: Activity, color: 'green' },
    { id: 'lab', name: 'ল্যাব টেস্ট', icon: Brain, color: 'purple' },
    { id: 'xray', name: 'এক্স-রে', icon: Zap, color: 'orange' },
    { id: 'mri', name: 'এমআরআই', icon: Eye, color: 'red' },
    { id: 'ct', name: 'সিটি স্ক্যান', icon: RefreshCw, color: 'indigo' }
  ];

  // Handle file upload
  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach(file => {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/heic', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        alert('অসমর্থিত ফাইল ফরম্যাট। শুধুমাত্র JPG, PNG, HEIC, PDF সমর্থিত।');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('ফাইল সাইজ ১০ এমবি এর বেশি হতে পারবে না।');
        return;
      }

      const imageId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const preview = URL.createObjectURL(file);

      const newImage: UploadedImage = {
        id: imageId,
        file,
        preview,
        type: selectedImageType as any,
        status: 'uploading'
      };

      setUploadedImages(prev => [...prev, newImage]);

      // Start processing
      processImage(newImage);
    });
  }, [selectedImageType]);

  // Process image with AI services
  const processImage = async (image: UploadedImage) => {
    try {
      // Update status to processing
      setUploadedImages(prev => 
        prev.map(img => 
          img.id === image.id ? { ...img, status: 'processing' } : img
        )
      );

      setIsProcessing(true);

      // Simulate AI processing (replace with actual API calls)
      const analysisResult = await simulateAIAnalysis(image);

      // Update image with results
      setUploadedImages(prev => 
        prev.map(img => 
          img.id === image.id ? {
            ...img,
            status: 'completed',
            extractedData: analysisResult.geminiAnalysis,
            analysis: analysisResult.deepseekAnalysis,
            reminders: analysisResult.langchainProcessing.reminders
          } : img
        )
      );

      setAnalysisResults(analysisResult);
      setShowResults(true);

    } catch (error) {
      console.error('Image processing error:', error);
      setUploadedImages(prev => 
        prev.map(img => 
          img.id === image.id ? { ...img, status: 'error' } : img
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Simulate AI analysis (replace with actual implementations)
  const simulateAIAnalysis = async (image: UploadedImage): Promise<AnalysisResult> => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Mock analysis results based on image type
    const mockResults: AnalysisResult = {
      geminiAnalysis: {
        extractedText: image.type === 'prescription' ? 
          'প্যারাসিটামল ৫০০ মিগ্রা - দিনে ৩ বার খাবার পর\nওমিপ্রাজল ২০ মিগ্রা - দিনে ২ বার খালি পেটে' :
          'হিমোগ্লোবিন: ১২.৫ গ্রাম/ডেসিলিটার\nব্লাড সুগার: ১২০ মিগ্রা/ডেসিলিটার',
        medicines: image.type === 'prescription' ? [
          { name: 'প্যারাসিটামল', dosage: '৫০০ মিগ্রা', frequency: 'দিনে ৩ বার' },
          { name: 'ওমিপ্রাজল', dosage: '২০ মিগ্রা', frequency: 'দিনে ২ বার' }
        ] : [],
        dosages: ['৫০০ মিগ্রা', '২০ মিগ্রা'],
        instructions: ['খাবার পর সেবন করুন', 'খালি পেটে সেবন করুন'],
        doctorInfo: { name: 'ডাঃ আহমেদ', chamber: 'ঢাকা মেডিকেল' }
      },
      deepseekAnalysis: {
        diseasePatterns: image.type === 'prescription' ? 
          ['জ্বর', 'গ্যাস্ট্রিক সমস্যা'] : 
          ['স্বাভাবিক রক্তের মান', 'সামান্য রক্তশূন্যতা'],
        riskAssessment: 'নিম্ন ঝুঁকি',
        recommendations: [
          'নিয়মিত ওষুধ সেবন করুন',
          'পর্যাপ্ত পানি পান করুন',
          'বিশ্রাম নিন'
        ],
        labValues: image.type === 'lab' ? [
          { parameter: 'হিমোগ্লোবিন', value: '১২.৫', unit: 'গ্রাম/ডেসিলিটার', status: 'স্বাভাবিক' },
          { parameter: 'ব্লাড সুগার', value: '১২০', unit: 'মিগ্রা/ডেসিলিটার', status: 'স্বাভাবিক' }
        ] : [],
        abnormalFindings: []
      },
      langchainProcessing: {
        structuredData: {
          patientInfo: { age: '৩৫', gender: 'পুরুষ' },
          medications: image.type === 'prescription' ? [
            { medicine: 'প্যারাসিটামল', schedule: 'দিনে ৩ বার' }
          ] : [],
          followUp: '৭ দিন পর'
        },
        reminders: image.type === 'prescription' ? [
          {
            id: '1',
            type: 'medicine',
            medicine: 'প্যারাসিটামল',
            time: '০৮:০০',
            frequency: 'দৈনিক',
            duration: '৭ দিন'
          },
          {
            id: '2',
            type: 'medicine',
            medicine: 'ওমিপ্রাজল',
            time: '০৭:০০',
            frequency: 'দৈনিক',
            duration: '১৪ দিন'
          }
        ] : [
          {
            id: '3',
            type: 'followup',
            description: 'পুনরায় টেস্ট করান',
            date: '৩০ দিন পর'
          }
        ],
        insights: [
          'ওষুধের মিথস্ক্রিয়া পরীক্ষা করা হয়েছে - কোনো সমস্যা নেই',
          'রোগীর বয়স ও অবস্থা অনুযায়ী ডোজ উপযুক্ত',
          'নিয়মিত সেবনে দ্রুত সুস্থতা আশা করা যায়'
        ],
        nextSteps: [
          '৭ দিন পর ডাক্তারের সাথে দেখা করুন',
          'পার্শ্বপ্রতিক্রিয়া দেখা দিলে ওষুধ বন্ধ করুন',
          'উন্নতি না হলে অবিলম্বে ডাক্তারের পরামর্শ নিন'
        ]
      }
    };

    return mockResults;
  };

  // Remove uploaded image
  const removeImage = (imageId: string) => {
    setUploadedImages(prev => {
      const imageToRemove = prev.find(img => img.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter(img => img.id !== imageId);
    });
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
      case 'processing': return 'বিশ্লেষণ হচ্ছে...';
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
          মেডিকেল ইমেজ বিশ্লেষণ সিস্টেম
        </h1>
        <p className="text-gray-600">
          AI-চালিত প্রেসক্রিপশন ও রিপোর্ট বিশ্লেষণ
        </p>
      </div>

      {/* Image Type Selection */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          ইমেজের ধরন নির্বাচন করুন
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {imageTypes.map((type) => {
            const IconComponent = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedImageType(type.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedImageType === type.id
                    ? `border-${type.color}-500 bg-${type.color}-50`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <IconComponent className={`h-8 w-8 mx-auto mb-2 ${
                  selectedImageType === type.id ? `text-${type.color}-600` : 'text-gray-400'
                }`} />
                <p className={`text-sm font-medium ${
                  selectedImageType === type.id ? `text-${type.color}-700` : 'text-gray-600'
                }`}>
                  {type.name}
                </p>
              </button>
            );
          })}
        </div>
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
            ছবি আপলোড করুন
          </h3>
          <p className="text-gray-600 mb-4">
            JPG, PNG, HEIC, PDF ফরম্যাট সমর্থিত (সর্বোচ্চ ১০ এমবি)
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Upload className="h-5 w-5" />
              <span>ফাইল নির্বাচন করুন</span>
            </button>
            
            <button className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2">
              <Camera className="h-5 w-5" />
              <span>ক্যামেরা ব্যবহার করুন</span>
            </button>
          </div>
        </div>
      </div>

      {/* Uploaded Images */}
      {uploadedImages.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            আপলোড করা ছবিসমূহ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadedImages.map((image) => (
              <div key={image.id} className="border rounded-lg p-4 space-y-3">
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  {image.file.type.startsWith('image/') ? (
                    <img
                      src={image.preview}
                      alt="Uploaded"
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
                      {imageTypes.find(t => t.id === image.type)?.name}
                    </span>
                    <button
                      onClick={() => removeImage(image.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className={`text-sm ${getStatusColor(image.status)}`}>
                    {getStatusText(image.status)}
                  </div>
                  
                  {image.status === 'processing' && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                    </div>
                  )}
                  
                  {image.status === 'completed' && (
                    <div className="space-y-2">
                      <button className="w-full px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors flex items-center justify-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>ফলাফল দেখুন</span>
                      </button>
                      
                      {image.reminders && image.reminders.length > 0 && (
                        <div className="text-xs text-blue-600">
                          {image.reminders.length} টি রিমাইন্ডার তৈরি হয়েছে
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

      {/* Analysis Results */}
      {showResults && analysisResults && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              বিশ্লেষণের ফলাফল
            </h2>
            <button
              onClick={() => setShowResults(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gemini Analysis */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-blue-600 flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>Gemini AI বিশ্লেষণ</span>
              </h3>
              
              <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">নিষ্কাশিত টেক্সট:</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-line">
                    {analysisResults.geminiAnalysis.extractedText}
                  </p>
                </div>
                
                {analysisResults.geminiAnalysis.medicines.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">ওষুধসমূহ:</h4>
                    <div className="space-y-2">
                      {analysisResults.geminiAnalysis.medicines.map((med, index) => (
                        <div key={index} className="bg-white rounded p-2 text-sm">
                          <div className="font-medium">{med.name}</div>
                          <div className="text-gray-600">{med.dosage} - {med.frequency}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* DeepSeek Analysis */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-purple-600 flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>DeepSeek AI বিশ্লেষণ</span>
              </h3>
              
              <div className="bg-purple-50 rounded-lg p-4 space-y-3">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">রোগের ধরন:</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisResults.deepseekAnalysis.diseasePatterns.map((pattern, index) => (
                      <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm">
                        {pattern}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">ঝুঁকি মূল্যায়ন:</h4>
                  <p className="text-sm text-gray-600">
                    {analysisResults.deepseekAnalysis.riskAssessment}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">সুপারিশসমূহ:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {analysisResults.deepseekAnalysis.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-purple-500 mt-1">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            {/* LangChain Processing */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-green-600 flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>LangChain প্রসেসিং</span>
              </h3>
              
              <div className="bg-green-50 rounded-lg p-4 space-y-3">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2 flex items-center space-x-2">
                    <Bell className="h-4 w-4" />
                    <span>রিমাইন্ডারসমূহ:</span>
                  </h4>
                  <div className="space-y-2">
                    {analysisResults.langchainProcessing.reminders.map((reminder, index) => (
                      <div key={index} className="bg-white rounded p-2 text-sm">
                        <div className="font-medium">
                          {reminder.type === 'medicine' ? reminder.medicine : reminder.description}
                        </div>
                        <div className="text-gray-600">
                          {reminder.time ? `সময়: ${reminder.time}` : `তারিখ: ${reminder.date}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">অন্তর্দৃষ্টি:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {analysisResults.langchainProcessing.insights.map((insight, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">পরবর্তী পদক্ষেপ:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {analysisResults.langchainProcessing.nextSteps.map((step, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>রিপোর্ট ডাউনলোড</span>
            </button>
            
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>রিমাইন্ডার সেট করুন</span>
            </button>
            
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>ফলো-আপ শিডিউল</span>
            </button>
          </div>
        </div>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                AI বিশ্লেষণ চলছে...
              </h3>
              <p className="text-gray-600 text-sm">
                Gemini, DeepSeek এবং LangChain দিয়ে আপনার ছবি বিশ্লেষণ করা হচ্ছে
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalImageAnalysisSystem;