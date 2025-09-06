// Image Upload & Processing System - ইমেজ আপলোড ও প্রক্রিয়াকরণ সিস্টেম
import React, { useState, useRef, useCallback } from 'react';
import {
  Upload, Camera, FileImage, File, X, Check, AlertCircle,
  Eye, Download, Trash2, RotateCw, ZoomIn, ZoomOut,
  Crop, Filter, Maximize2, Share2, Copy, Save,
  Image as ImageIcon, FileText, Scan, Brain
} from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

// Types
interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadDate: Date;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  category: 'prescription' | 'lab_report' | 'medical_image' | 'document' | 'other';
  extractedText?: string;
  ocrConfidence?: number;
  metadata?: {
    width?: number;
    height?: number;
    format?: string;
    colorSpace?: string;
    dpi?: number;
  };
  processingResults?: {
    textExtracted: boolean;
    medicineDetected: boolean;
    handwritingDetected: boolean;
    qualityScore: number;
    recommendations: string[];
  };
}

interface ImageUploadSystemProps {
  onFilesUploaded?: (files: UploadedFile[]) => void;
  onTextExtracted?: (text: string, fileId: string) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedFormats?: string[];
  category?: 'prescription' | 'lab_report' | 'medical_image' | 'document' | 'other';
  enableOCR?: boolean;
  enablePreprocessing?: boolean;
}

const ImageUploadSystem: React.FC<ImageUploadSystemProps> = ({
  onFilesUploaded,
  onTextExtracted,
  maxFiles = 10,
  maxFileSize = 10,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/heic', 'image/webp', 'application/pdf'],
  category = 'other',
  enableOCR = true,
  enablePreprocessing = true
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [previewRotation, setPreviewRotation] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { showNotification } = useNotification();

  // File validation
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (!acceptedFormats.includes(file.type)) {
      return {
        valid: false,
        error: `অসমর্থিত ফাইল ফরম্যাট। সমর্থিত: ${acceptedFormats.join(', ')}`
      };
    }
    
    if (file.size > maxFileSize * 1024 * 1024) {
      return {
        valid: false,
        error: `ফাইল সাইজ ${maxFileSize}MB এর বেশি হতে পারবে না`
      };
    }
    
    if (uploadedFiles.length >= maxFiles) {
      return {
        valid: false,
        error: `সর্বোচ্চ ${maxFiles}টি ফাইল আপলোড করা যাবে`
      };
    }
    
    return { valid: true };
  };

  // File processing simulation
  const processFile = async (uploadedFile: UploadedFile): Promise<UploadedFile> => {
    // Simulate file processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate OCR text extraction
    const extractedText = simulateOCR(uploadedFile);
    
    // Simulate image analysis
    const processingResults = {
      textExtracted: extractedText.length > 0,
      medicineDetected: Math.random() > 0.5,
      handwritingDetected: Math.random() > 0.3,
      qualityScore: Math.floor(Math.random() * 40) + 60, // 60-100
      recommendations: generateRecommendations(uploadedFile)
    };
    
    // Simulate metadata extraction
    const metadata = {
      width: Math.floor(Math.random() * 2000) + 1000,
      height: Math.floor(Math.random() * 2000) + 1000,
      format: uploadedFile.type.split('/')[1].toUpperCase(),
      colorSpace: 'RGB',
      dpi: Math.floor(Math.random() * 200) + 150
    };
    
    const processedFile: UploadedFile = {
      ...uploadedFile,
      status: 'completed',
      progress: 100,
      extractedText,
      ocrConfidence: Math.floor(Math.random() * 30) + 70, // 70-100%
      metadata,
      processingResults
    };
    
    // Notify parent components
    if (onTextExtracted && extractedText) {
      onTextExtracted(extractedText, uploadedFile.id);
    }
    
    return processedFile;
  };

  // Simulate OCR text extraction
  const simulateOCR = (file: UploadedFile): string => {
    const sampleTexts = {
      prescription: `
ডাক্তারের প্রেসক্রিপশন
রোগীর নাম: মোহাম্মদ রহিম
বয়স: ৪৫ বছর
তারিখ: ${new Date().toLocaleDateString('bn-BD')}

ওষুধের তালিকা:
১. প্যারাসিটামল ৫০০mg - দিনে ৩ বার
২. অ্যামোক্সিসিলিন ২৫০mg - দিনে ২ বার
৩. ওমিপ্রাজল ২০mg - দিনে ১ বার

পরামর্শ:
- খাবারের পর ওষুধ সেবন করুন
- পর্যাপ্ত পানি পান করুন
- ৭ দিন পর আবার আসুন

ডাক্তারের স্বাক্ষর
ডা. আব্দুল করিম
এমবিবিএস, এফসিপিএস
      `,
      lab_report: `
ল্যাবরেটরি রিপোর্ট
রোগীর নাম: ফাতেমা খাতুন
বয়স: ৩৮ বছর
রিপোর্ট তারিখ: ${new Date().toLocaleDateString('bn-BD')}

রক্ত পরীক্ষার ফলাফল:
হিমোগ্লোবিন: ১২.৫ g/dL (স্বাভাবিক)
রক্তের সুগার (খালি পেটে): ৯৫ mg/dL (স্বাভাবিক)
কোলেস্টেরল: ১৮০ mg/dL (স্বাভাবিক)
ক্রিয়েটিনিন: ০.৯ mg/dL (স্বাভাবিক)

মন্তব্য: সব পরীক্ষার ফলাফল স্বাভাবিক সীমার মধ্যে
      `,
      medical_image: 'চিকিৎসা ইমেজ - এক্স-রে/আল্ট্রাসাউন্ড/সিটি স্ক্যান',
      document: 'চিকিৎসা সংক্রান্ত নথিপত্র',
      other: 'অন্যান্য চিকিৎসা সংক্রান্ত তথ্য'
    };
    
    return sampleTexts[file.category] || sampleTexts.other;
  };

  // Generate processing recommendations
  const generateRecommendations = (file: UploadedFile): string[] => {
    const recommendations = [];
    
    if (file.category === 'prescription') {
      recommendations.push('ওষুধের নাম ও ডোজ যাচাই করুন');
      recommendations.push('ডাক্তারের নির্দেশনা অনুসরণ করুন');
      recommendations.push('পার্শ্বপ্রতিক্রিয়া সম্পর্কে সচেতন থাকুন');
    }
    
    if (file.category === 'lab_report') {
      recommendations.push('রিপোর্টের মান স্বাভাবিক সীমার সাথে তুলনা করুন');
      recommendations.push('অস্বাভাবিক ফলাফল থাকলে ডাক্তারের সাথে যোগাযোগ করুন');
    }
    
    recommendations.push('ফাইলটি নিরাপদ স্থানে সংরক্ষণ করুন');
    recommendations.push('প্রয়োজনে ডাক্তারের সাথে শেয়ার করুন');
    
    return recommendations;
  };

  // Handle file upload
  const handleFileUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newFiles: UploadedFile[] = [];
    
    for (const file of fileArray) {
      const validation = validateFile(file);
      
      if (!validation.valid) {
        showNotification(validation.error!, 'error');
        continue;
      }
      
      const uploadedFile: UploadedFile = {
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        uploadDate: new Date(),
        status: 'uploading',
        progress: 0,
        category
      };
      
      newFiles.push(uploadedFile);
    }
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Process files
    for (const file of newFiles) {
      setUploadedFiles(prev => 
        prev.map(f => f.id === file.id ? { ...f, status: 'processing', progress: 50 } : f)
      );
      
      try {
        const processedFile = await processFile(file);
        setUploadedFiles(prev => 
          prev.map(f => f.id === file.id ? processedFile : f)
        );
        
        showNotification(`${file.name} সফলভাবে প্রক্রিয়া করা হয়েছে`, 'success');
      } catch (error) {
        setUploadedFiles(prev => 
          prev.map(f => f.id === file.id ? { ...f, status: 'error', progress: 0 } : f)
        );
        
        showNotification(`${file.name} প্রক্রিয়া করতে ত্রুটি হয়েছে`, 'error');
      }
    }
    
    if (onFilesUploaded) {
      onFilesUploaded(newFiles);
    }
  };

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, []);

  // File input handlers
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files);
    }
  };

  // Remove file
  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.url);
      }
      return prev.filter(f => f.id !== fileId);
    });
    
    if (selectedFile?.id === fileId) {
      setSelectedFile(null);
      setShowPreview(false);
    }
  };

  // Preview handlers
  const openPreview = (file: UploadedFile) => {
    setSelectedFile(file);
    setShowPreview(true);
    setPreviewZoom(1);
    setPreviewRotation(0);
  };

  const closePreview = () => {
    setShowPreview(false);
    setSelectedFile(null);
  };

  // Get file icon
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <ImageIcon className="w-8 h-8 text-blue-600" />;
    } else if (type === 'application/pdf') {
      return <FileText className="w-8 h-8 text-red-600" />;
    } else {
      return <File className="w-8 h-8 text-gray-600" />;
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'uploading': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="w-full">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-blue-600" />
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              ফাইল আপলোড করুন
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              ড্র্যাগ করে ছেড়ে দিন অথবা ক্লিক করে ফাইল নির্বাচন করুন
            </p>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FileImage className="w-4 h-4" />
                <span>ফাইল নির্বাচন</span>
              </button>
              
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Camera className="w-4 h-4" />
                <span>ক্যামেরা</span>
              </button>
            </div>
          </div>
          
          <div className="text-xs text-gray-500">
            <p>সমর্থিত ফরম্যাট: JPG, PNG, HEIC, WebP, PDF</p>
            <p>সর্বোচ্চ সাইজ: {maxFileSize}MB | সর্বোচ্চ ফাইল: {maxFiles}টি</p>
          </div>
        </div>
        
        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFormats.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            আপলোড করা ফাইল ({uploadedFiles.length})
          </h4>
          
          <div className="space-y-3">
            {uploadedFiles.map(file => (
              <div key={file.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    {getFileIcon(file.type)}
                    
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </h5>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(file.status)}`}>
                          {file.status === 'completed' ? 'সম্পন্ন' :
                           file.status === 'processing' ? 'প্রক্রিয়াধীন' :
                           file.status === 'uploading' ? 'আপলোড হচ্ছে' : 'ত্রুটি'}
                        </span>
                        {file.ocrConfidence && (
                          <span className="text-xs text-gray-500">
                            OCR: {file.ocrConfidence}%
                          </span>
                        )}
                      </div>
                      
                      {/* Progress bar */}
                      {file.status !== 'completed' && file.status !== 'error' && (
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${file.progress}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {file.status === 'completed' && (
                      <>
                        <button
                          onClick={() => openPreview(file)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="প্রিভিউ দেখুন"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {file.extractedText && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(file.extractedText!);
                              showNotification('টেক্সট কপি করা হয়েছে', 'success');
                            }}
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="টেক্সট কপি করুন"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="ডাউনলোড করুন"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Processing Results */}
                {file.processingResults && file.status === 'completed' && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${
                          file.processingResults.textExtracted ? 'bg-green-500' : 'bg-gray-300'
                        }`}></div>
                        <span className="text-gray-600">টেক্সট নিষ্কাশন</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${
                          file.processingResults.medicineDetected ? 'bg-green-500' : 'bg-gray-300'
                        }`}></div>
                        <span className="text-gray-600">ওষুধ শনাক্তকরণ</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${
                          file.processingResults.handwritingDetected ? 'bg-green-500' : 'bg-gray-300'
                        }`}></div>
                        <span className="text-gray-600">হাতের লেখা</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-600">গুণমান: {file.processingResults.qualityScore}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full mx-4 flex flex-col">
            {/* Preview Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                {getFileIcon(selectedFile.type)}
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{selectedFile.name}</h3>
                  <p className="text-sm text-gray-600">
                    {formatFileSize(selectedFile.size)} • {selectedFile.uploadDate.toLocaleDateString('bn-BD')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {selectedFile.type.startsWith('image/') && (
                  <>
                    <button
                      onClick={() => setPreviewZoom(prev => Math.max(0.5, prev - 0.25))}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    
                    <span className="text-sm text-gray-600 min-w-[60px] text-center">
                      {Math.round(previewZoom * 100)}%
                    </span>
                    
                    <button
                      onClick={() => setPreviewZoom(prev => Math.min(3, prev + 0.25))}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => setPreviewRotation(prev => (prev + 90) % 360)}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                  </>
                )}
                
                <button
                  onClick={closePreview}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Preview Content */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full flex">
                {/* Image/File Preview */}
                <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center">
                  {selectedFile.type.startsWith('image/') ? (
                    <img
                      src={selectedFile.url}
                      alt={selectedFile.name}
                      className="max-w-full max-h-full object-contain transition-transform"
                      style={{
                        transform: `scale(${previewZoom}) rotate(${previewRotation}deg)`
                      }}
                    />
                  ) : selectedFile.type === 'application/pdf' ? (
                    <div className="text-center p-8">
                      <FileText className="w-16 h-16 text-red-600 mx-auto mb-4" />
                      <p className="text-gray-600">PDF ফাইল প্রিভিউ</p>
                      <p className="text-sm text-gray-500 mt-2">
                        সম্পূর্ণ ফাইল দেখতে ডাউনলোড করুন
                      </p>
                    </div>
                  ) : (
                    <div className="text-center p-8">
                      <File className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-600">ফাইল প্রিভিউ উপলব্ধ নেই</p>
                    </div>
                  )}
                </div>
                
                {/* Extracted Text Panel */}
                {selectedFile.extractedText && (
                  <div className="w-80 border-l border-gray-200 bg-white flex flex-col">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <Scan className="w-4 h-4 text-blue-600" />
                        <h4 className="text-sm font-medium text-gray-900">নিষ্কাশিত টেক্সট</h4>
                        {selectedFile.ocrConfidence && (
                          <span className="text-xs text-gray-500">
                            ({selectedFile.ocrConfidence}% নির্ভুলতা)
                          </span>
                        )}
                      </div>
                      
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedFile.extractedText!);
                          showNotification('টেক্সট কপি করা হয়েছে', 'success');
                        }}
                        className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800"
                      >
                        <Copy className="w-3 h-3" />
                        <span>কপি করুন</span>
                      </button>
                    </div>
                    
                    <div className="flex-1 overflow-auto p-4">
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                        {selectedFile.extractedText}
                      </pre>
                    </div>
                    
                    {/* Processing Recommendations */}
                    {selectedFile.processingResults?.recommendations && (
                      <div className="p-4 border-t border-gray-200">
                        <h5 className="text-xs font-medium text-gray-900 mb-2">সুপারিশ:</h5>
                        <ul className="space-y-1">
                          {selectedFile.processingResults.recommendations.map((rec, index) => (
                            <li key={index} className="text-xs text-gray-600 flex items-start space-x-1">
                              <span className="text-blue-600 mt-1">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadSystem;