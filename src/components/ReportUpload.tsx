import React, { useState, useRef } from 'react';
import { Upload, FileText, Camera, X, Check, AlertCircle } from 'lucide-react';

interface ReportUploadProps {
  language: 'bn' | 'en';
  onReportExtracted: (data: {
    reportType: string;
    findings: string;
    recommendations: string;
    doctorName?: string;
    date?: string;
    labName?: string;
    testResults?: { name: string; value: string; unit?: string; normalRange?: string }[];
  }) => void;
  onClose: () => void;
}

interface ReportData {
  reportType: string;
  findings: string;
  recommendations: string;
  doctorName?: string;
  date?: string;
  labName?: string;
  testResults?: { name: string; value: string; unit?: string; normalRange?: string }[];
}

const ReportUpload: React.FC<ReportUploadProps> = ({ language, onReportExtracted, onClose }) => {
  const [uploadMethod, setUploadMethod] = useState<'image' | 'text' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [currentStep, setCurrentStep] = useState<'upload' | 'review' | 'confirm'>('upload');
  const [extractedData, setExtractedData] = useState<ReportData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = {
    bn: {
      title: 'মেডিকেল রিপোর্ট আপলোড করুন',
      uploadImage: 'ছবি আপলোড',
      typeText: 'টেক্সট লিখুন',
      dragDrop: 'ছবি এখানে টেনে আনুন বা ক্লিক করুন',
      processing: 'প্রক্রিয়াকরণ...',
      textPlaceholder: 'রিপোর্টের বিষয়বস্তু এখানে লিখুন...',
      parseText: 'টেক্সট পার্স করুন',
      reviewTitle: 'রিপোর্ট তথ্য পর্যালোচনা করুন',
      reportType: 'রিপোর্টের ধরন',
      findings: 'ফলাফল',
      recommendations: 'সুপারিশ',
      doctorName: 'ডাক্তারের নাম',
      labName: 'ল্যাবের নাম',
      date: 'তারিখ',
      testResults: 'পরীক্ষার ফলাফল',
      testName: 'পরীক্ষার নাম',
      value: 'মান',
      unit: 'একক',
      normalRange: 'স্বাভাবিক পরিসর',
      addTest: 'পরীক্ষা যোগ করুন',
      removeTest: 'মুছে ফেলুন',
      save: 'সংরক্ষণ করুন',
      back: 'পিছনে',
      close: 'বন্ধ করুন',
      success: 'রিপোর্ট সফলভাবে সংরক্ষিত হয়েছে!',
      error: 'ত্রুটি ঘটেছে। আবার চেষ্টা করুন।'
    },
    en: {
      title: 'Upload Medical Report',
      uploadImage: 'Upload Image',
      typeText: 'Type Text',
      dragDrop: 'Drag and drop image here or click to select',
      processing: 'Processing...',
      textPlaceholder: 'Enter report content here...',
      parseText: 'Parse Text',
      reviewTitle: 'Review Report Information',
      reportType: 'Report Type',
      findings: 'Findings',
      recommendations: 'Recommendations',
      doctorName: 'Doctor Name',
      labName: 'Lab Name',
      date: 'Date',
      testResults: 'Test Results',
      testName: 'Test Name',
      value: 'Value',
      unit: 'Unit',
      normalRange: 'Normal Range',
      addTest: 'Add Test',
      removeTest: 'Remove',
      save: 'Save',
      back: 'Back',
      close: 'Close',
      success: 'Report saved successfully!',
      error: 'An error occurred. Please try again.'
    }
  };

  const currentText = t[language];

  // Extract report data from text
  const extractReportData = (text: string): ReportData => {
    const reportTypePatterns = [
      /(?:report type|type)\s*:?\s*([^\n]+)/i,
      /(?:blood test|x-ray|mri|ct scan|ultrasound|ecg|echo)/i
    ];
    
    const findingsPatterns = [
      /(?:findings|results|observations)\s*:?\s*([^\n]+(?:\n[^\n]+)*)/i,
      /(?:impression|conclusion)\s*:?\s*([^\n]+(?:\n[^\n]+)*)/i
    ];
    
    const recommendationsPatterns = [
      /(?:recommendations|advice|suggestions)\s*:?\s*([^\n]+(?:\n[^\n]+)*)/i,
      /(?:follow up|follow-up)\s*:?\s*([^\n]+(?:\n[^\n]+)*)/i
    ];
    
    const doctorPatterns = [
      /(?:dr\.?|doctor)\s+([a-z\s\.]+)/i,
      /(?:physician|consultant)\s*:?\s*([^\n]+)/i
    ];
    
    const labPatterns = [
      /(?:lab|laboratory)\s*:?\s*([^\n]+)/i,
      /(?:center|centre)\s*:?\s*([^\n]+)/i
    ];
    
    const datePatterns = [
      /(?:date|dated)\s*:?\s*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i,
      /(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/
    ];
    
    // Extract basic information
    let reportType = 'General Report';
    let findings = '';
    let recommendations = '';
    let doctorName = '';
    let labName = '';
    let date = '';
    
    // Extract report type
    for (const pattern of reportTypePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        reportType = match[1].trim();
        break;
      }
    }
    
    // Extract findings
    for (const pattern of findingsPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        findings = match[1].trim();
        break;
      }
    }
    
    // Extract recommendations
    for (const pattern of recommendationsPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        recommendations = match[1].trim();
        break;
      }
    }
    
    // Extract doctor name
    for (const pattern of doctorPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        doctorName = match[1].trim();
        break;
      }
    }
    
    // Extract lab name
    for (const pattern of labPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        labName = match[1].trim();
        break;
      }
    }
    
    // Extract date
    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const dateStr = match[1].trim();
        try {
          const parsedDate = new Date(dateStr);
          if (!isNaN(parsedDate.getTime())) {
            date = parsedDate.toISOString().split('T')[0];
          }
        } catch {
          date = dateStr;
        }
        break;
      }
    }
    
    // Extract test results
    const testResults: { name: string; value: string; unit?: string; normalRange?: string }[] = [];
    const testPatterns = [
      /([a-z\s]+)\s*:?\s*(\d+\.?\d*)\s*([a-z\/]+)?\s*(?:\(([^)]+)\))?/gi
    ];
    
    for (const pattern of testPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const testName = match[1].trim();
        const value = match[2];
        const unit = match[3] || '';
        const normalRange = match[4] || '';
        
        if (testName.length > 2 && value) {
          testResults.push({
            name: testName,
            value,
            unit,
            normalRange
          });
        }
      }
    }
    
    return {
      reportType,
      findings: findings || 'No specific findings mentioned',
      recommendations: recommendations || 'Follow up as advised',
      doctorName,
      labName,
      date: date || new Date().toISOString().split('T')[0],
      testResults: testResults.length > 0 ? testResults : undefined
    };
  };

  const handleImageUpload = async (file: File) => {
    setIsProcessing(true);
    try {
      // Mock OCR processing for reports
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock extracted text from report
      const mockText = `Blood Test Report
Date: ${new Date().toLocaleDateString()}
Dr. Rahman
ABC Laboratory

Findings: Hemoglobin: 12.5 g/dL (12-16)
White Blood Cell Count: 7500 /μL (4000-11000)
Platelet Count: 250000 /μL (150000-450000)

Recommendations: Continue current medication. Follow up in 2 weeks.`;
      
      const data = extractReportData(mockText);
      setExtractedData(data);
      setCurrentStep('review');
    } catch (error) {
      console.error('Error processing report:', error);
      alert(currentText.error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextParse = () => {
    if (!textInput.trim()) return;
    
    setIsProcessing(true);
    try {
      const data = extractReportData(textInput);
      setExtractedData(data);
      setCurrentStep('review');
    } catch (error) {
      console.error('Error parsing text:', error);
      alert(currentText.error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleSave = () => {
    if (extractedData) {
      onReportExtracted(extractedData);
      setCurrentStep('confirm');
    }
  };

  const updateField = (field: keyof ReportData, value: string) => {
    if (extractedData) {
      setExtractedData({ ...extractedData, [field]: value });
    }
  };

  const addTestResult = () => {
    if (extractedData) {
      const newTest = { name: '', value: '', unit: '', normalRange: '' };
      const testResults = extractedData.testResults || [];
      setExtractedData({ ...extractedData, testResults: [...testResults, newTest] });
    }
  };

  const updateTestResult = (index: number, field: string, value: string) => {
    if (extractedData && extractedData.testResults) {
      const updated = [...extractedData.testResults];
      (updated[index] as any)[field] = value;
      setExtractedData({ ...extractedData, testResults: updated });
    }
  };

  const removeTestResult = (index: number) => {
    if (extractedData && extractedData.testResults) {
      const updated = extractedData.testResults.filter((_, i) => i !== index);
      setExtractedData({ ...extractedData, testResults: updated });
    }
  };

  if (currentStep === 'confirm') {
    return (
      <div className="p-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <Check className="text-green-500" size={48} />
        </div>
        <h3 className="text-lg font-semibold mb-4">{currentText.success}</h3>
        <button
          onClick={onClose}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
        >
          {currentText.close}
        </button>
      </div>
    );
  }

  if (currentStep === 'review' && extractedData) {
    return (
      <div className="p-6 max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">{currentText.reviewTitle}</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{currentText.reportType}</label>
            <input
              type="text"
              value={extractedData.reportType}
              onChange={(e) => updateField('reportType', e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">{currentText.findings}</label>
            <textarea
              value={extractedData.findings}
              onChange={(e) => updateField('findings', e.target.value)}
              className="w-full p-2 border rounded-lg h-24"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">{currentText.recommendations}</label>
            <textarea
              value={extractedData.recommendations}
              onChange={(e) => updateField('recommendations', e.target.value)}
              className="w-full p-2 border rounded-lg h-24"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{currentText.doctorName}</label>
              <input
                type="text"
                value={extractedData.doctorName || ''}
                onChange={(e) => updateField('doctorName', e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">{currentText.labName}</label>
              <input
                type="text"
                value={extractedData.labName || ''}
                onChange={(e) => updateField('labName', e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">{currentText.date}</label>
              <input
                type="date"
                value={extractedData.date || ''}
                onChange={(e) => updateField('date', e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>
          
          {extractedData.testResults && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">{currentText.testResults}</label>
                <button
                  onClick={addTestResult}
                  className="text-blue-500 hover:text-blue-700 text-sm"
                >
                  {currentText.addTest}
                </button>
              </div>
              
              <div className="space-y-2">
                {extractedData.testResults.map((test, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2 p-2 border rounded">
                    <input
                      type="text"
                      placeholder={currentText.testName}
                      value={test.name}
                      onChange={(e) => updateTestResult(index, 'name', e.target.value)}
                      className="p-1 border rounded text-sm"
                    />
                    <input
                      type="text"
                      placeholder={currentText.value}
                      value={test.value}
                      onChange={(e) => updateTestResult(index, 'value', e.target.value)}
                      className="p-1 border rounded text-sm"
                    />
                    <input
                      type="text"
                      placeholder={currentText.unit}
                      value={test.unit || ''}
                      onChange={(e) => updateTestResult(index, 'unit', e.target.value)}
                      className="p-1 border rounded text-sm"
                    />
                    <div className="flex gap-1">
                      <input
                        type="text"
                        placeholder={currentText.normalRange}
                        value={test.normalRange || ''}
                        onChange={(e) => updateTestResult(index, 'normalRange', e.target.value)}
                        className="p-1 border rounded text-sm flex-1"
                      />
                      <button
                        onClick={() => removeTestResult(index)}
                        className="text-red-500 hover:text-red-700 px-1"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-4 mt-6">
          <button
            onClick={() => setCurrentStep('upload')}
            className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600"
          >
            {currentText.back}
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
          >
            {currentText.save}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-4">{currentText.title}</h3>
        
        <div className="flex gap-4 justify-center mb-6">
          <button
            onClick={() => setUploadMethod('image')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
              uploadMethod === 'image' ? 'bg-blue-50 border-blue-500' : 'border-gray-300'
            }`}
          >
            <Camera size={20} />
            {currentText.uploadImage}
          </button>
          <button
            onClick={() => setUploadMethod('text')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
              uploadMethod === 'text' ? 'bg-blue-50 border-blue-500' : 'border-gray-300'
            }`}
          >
            <FileText size={20} />
            {currentText.typeText}
          </button>
        </div>
      </div>

      {uploadMethod === 'image' && (
        <div className="space-y-4">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
                {currentText.processing}
              </div>
            ) : (
              <>
                <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-600">{currentText.dragDrop}</p>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {uploadMethod === 'text' && (
        <div className="space-y-4">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={currentText.textPlaceholder}
            className="w-full h-40 p-3 border rounded-lg resize-none"
          />
          <button
            onClick={handleTextParse}
            disabled={!textInput.trim() || isProcessing}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isProcessing ? currentText.processing : currentText.parseText}
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportUpload;