import React, { useState, useRef } from 'react';
import { Upload, Camera, FileText, AlertCircle, CheckCircle, Clock, X, Bot } from 'lucide-react';
import { parsePrescriptionFromImage, parsePrescriptionFromText, validateImageFile, generateMedicationDraft, generateDisambiguationQuestion, getOCRTips, PrescriptionParseResult } from '../utils/prescriptionOCR';
import { generateMedicationSchedule, MedicationInfo, MedicationSchedule } from '../utils/medicineTracker';
import { getAntibioticEducationMessage } from '../utils/antibioticDetector';

interface PrescriptionUploadProps {
  language: 'bn' | 'en';
  onScheduleCreated: (schedule: MedicationSchedule) => void;
  onClose: () => void;
  onMedicalDataExtracted?: (data: { medications: MedicationInfo[], diagnosis?: string, doctorName?: string, date?: string }) => void;
  userId?: string;
}

const PrescriptionUpload: React.FC<PrescriptionUploadProps> = ({ language, onScheduleCreated, onClose, onMedicalDataExtracted, userId }) => {
  const [uploadMethod, setUploadMethod] = useState<'image' | 'text' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseResult, setParseResult] = useState<PrescriptionParseResult | null>(null);
  const [editedMedications, setEditedMedications] = useState<MedicationInfo[]>([]);
  const [currentStep, setCurrentStep] = useState<'upload' | 'review' | 'schedule' | 'confirm'>('upload');
  const [startTime, setStartTime] = useState<string>('');
  const [reminderChannels, setReminderChannels] = useState<('app' | 'sms' | 'whatsapp')[]>(['app']);
  const [consent, setConsent] = useState(false);
  const [autoSetupConsent, setAutoSetupConsent] = useState<boolean | null>(null);
  const [showAutoSetupDialog, setShowAutoSetupDialog] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [disambiguationIndex, setDisambiguationIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const texts = {
    bn: {
      title: 'প্রেসক্রিপশন আপলোড করুন',
      uploadImage: 'ছবি আপলোড করুন',
      typeText: 'টেক্সট লিখুন',
      dragDrop: 'ছবি এখানে ড্র্যাগ করুন বা ক্লিক করুন',
      processing: 'প্রক্রিয়াকরণ হচ্ছে...',
      ocrTips: 'ভালো ফলাফলের জন্য টিপস:',
      textPlaceholder: 'আপনার প্রেসক্রিপশনের টেক্সট এখানে লিখুন...\n\nউদাহরণ:\nAzin 500 mg\nOD x 3 days\n\nParacetamol 500 mg\nq6h PRN',
      parse: 'পার্স করুন',
      reviewMedications: 'ওষুধের তালিকা পর্যালোচনা করুন',
      correct: 'ঠিক আছে',
      needsCorrection: 'ভুল আছে → ঠিক করি',
      setSchedule: 'সময়সূচি নির্ধারণ করুন',
      startTime: 'কবে থেকে শুরু করবেন?',
      reminderChannels: 'রিমাইন্ডার কোন চ্যানেলে দেব?',
      consent: 'আপনার ওষুধের সময়সূচি নিরাপদে সেভ করবো কি?',
      autoSetupTitle: 'AI ওষুধের রিমাইন্ডার সেটআপ',
      autoSetupMessage: 'আমি আপনার প্রেসক্রিপশনে ওষুধ খুঁজে পেয়েছি। আপনি কি চান আমি স্বয়ংক্রিয়ভাবে রিমাইন্ডার সেট করে দিই?',
      autoSetupBenefits: '• স্বয়ংক্রিয় রিমাইন্ডার সময়সূচি\n• স্মার্ট সময়ের পরামর্শ\n• ওষুধ ট্র্যাকিং',
      yes: 'হ্যাঁ',
      no: 'না',
      setupNow: 'এখনই সেটআপ করুন',
      reviewFirst: 'আগে দেখে নিই',
      createSchedule: 'সময়সূচি তৈরি করুন',
      scheduleCreated: 'সময়সূচি তৈরি হয়েছে!',
      close: 'বন্ধ করুন',
      back: 'পিছনে',
      next: 'পরবর্তী',
      edit: 'সম্পাদনা',
      save: 'সংরক্ষণ',
      name: 'নাম',
      strength: 'শক্তি',
      frequency: 'ফ্রিকোয়েন্সি',
      duration: 'সময়কাল',
      instructions: 'নির্দেশনা'
    },
    en: {
      title: 'Upload Prescription',
      uploadImage: 'Upload Image',
      typeText: 'Type Text',
      dragDrop: 'Drag image here or click to upload',
      processing: 'Processing...',
      ocrTips: 'Tips for better results:',
      textPlaceholder: 'Enter your prescription text here...\n\nExample:\nAzin 500 mg\nOD x 3 days\n\nParacetamol 500 mg\nq6h PRN',
      parse: 'Parse',
      reviewMedications: 'Review Medications',
      correct: 'Correct',
      needsCorrection: 'Needs Correction',
      setSchedule: 'Set Schedule',
      startTime: 'When to start?',
      reminderChannels: 'Reminder channels?',
      consent: 'Save your medication schedule securely?',
      autoSetupTitle: 'AI Medication Reminder Setup',
      autoSetupMessage: 'I found medications in your prescription. Would you like me to automatically set up reminders for you?',
      autoSetupBenefits: '• Automatic reminder scheduling\n• Smart timing suggestions\n• Medication tracking',
      yes: 'Yes',
      no: 'No',
      setupNow: 'Setup Now',
      reviewFirst: 'Review First',
      createSchedule: 'Create Schedule',
      scheduleCreated: 'Schedule Created!',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      edit: 'Edit',
      save: 'Save',
      name: 'Name',
      strength: 'Strength',
      frequency: 'Frequency',
      duration: 'Duration',
      instructions: 'Instructions'
    }
  };

  const t = texts[language];

  const handleImageUpload = async (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setIsProcessing(true);
    try {
      const result = await parsePrescriptionFromImage(file);
      setParseResult(result);
      setEditedMedications([...result.medications]);
      
      // Show auto-setup dialog if medications are detected
      if (result.medications.length > 0) {
        setShowAutoSetupDialog(true);
      } else {
        setCurrentStep('review');
      }
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error processing image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextParse = () => {
    if (!textInput.trim()) return;

    setIsProcessing(true);
    try {
      const result = parsePrescriptionFromText(textInput);
      setParseResult(result);
      setEditedMedications([...result.medications]);
      
      // Show auto-setup dialog if medications are detected
      if (result.medications.length > 0) {
        setShowAutoSetupDialog(true);
      } else {
        setCurrentStep('review');
      }
    } catch (error) {
      console.error('Error parsing text:', error);
      alert('Error parsing text. Please try again.');
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

  const handleMedicationEdit = (index: number, field: keyof MedicationInfo, value: string) => {
    const updated = [...editedMedications];
    (updated[index] as any)[field] = value;
    setEditedMedications(updated);
  };

  const extractMedicalData = () => {
    if (parseResult && onMedicalDataExtracted) {
      const medicalData = {
        medications: editedMedications,
        diagnosis: parseResult.diagnosis,
        doctorName: parseResult.doctorName,
        date: parseResult.date || new Date().toISOString().split('T')[0]
      };
      onMedicalDataExtracted(medicalData);
    }
  };

  const handleAutoSetup = (consent: boolean) => {
    setAutoSetupConsent(consent);
    setShowAutoSetupDialog(false);
    
    if (consent) {
      // Auto-setup with smart defaults
      const now = new Date();
      const startDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Start tomorrow
      setStartTime(startDate.toISOString().split('T')[0]);
      setConsent(true);
      setReminderChannels(['app']);
      
      // Create schedule immediately
      const schedule = generateMedicationSchedule(
        editedMedications,
        startDate,
        userId || 'user_123',
        ['app']
      );
      
      schedule.consentGiven = true;
      
      // Extract medical data for history
      extractMedicalData();
      
      // Save to localStorage
      const savedSchedules = JSON.parse(localStorage.getItem('medicationSchedules') || '[]');
      savedSchedules.push(schedule);
      localStorage.setItem('medicationSchedules', JSON.stringify(savedSchedules));
      
      onScheduleCreated(schedule);
      setCurrentStep('confirm');
    } else {
      setCurrentStep('review');
    }
  };

  const handleCreateSchedule = () => {
    if (!startTime || editedMedications.length === 0) return;

    const startDate = new Date(startTime);
    const schedule = generateMedicationSchedule(
      editedMedications,
      startDate,
      userId || 'user_123',
      reminderChannels
    );
    
    schedule.consentGiven = consent;
    
    // Extract medical data for history
    extractMedicalData();
    
    onScheduleCreated(schedule);
    setCurrentStep('confirm');
  };

  const renderUploadStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-4">{t.title}</h3>
        
        <div className="flex gap-4 justify-center mb-6">
          <button
            onClick={() => setUploadMethod('image')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
              uploadMethod === 'image' ? 'bg-blue-50 border-blue-500' : 'border-gray-300'
            }`}
          >
            <Camera size={20} />
            {t.uploadImage}
          </button>
          <button
            onClick={() => setUploadMethod('text')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
              uploadMethod === 'text' ? 'bg-blue-50 border-blue-500' : 'border-gray-300'
            }`}
          >
            <FileText size={20} />
            {t.typeText}
          </button>
        </div>
      </div>

      {uploadMethod === 'image' && (
        <div className="space-y-4">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
          >
            <Upload size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">{t.dragDrop}</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">{t.ocrTips}</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {getOCRTips(language).map((tip, index) => (
                <li key={index}>• {tip}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {uploadMethod === 'text' && (
        <div className="space-y-4">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={t.textPlaceholder}
            className="w-full h-40 p-3 border border-gray-300 rounded-lg resize-none"
          />
          <button
            onClick={handleTextParse}
            disabled={!textInput.trim() || isProcessing}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isProcessing ? t.processing : t.parse}
          </button>
        </div>
      )}

      {isProcessing && (
        <div className="flex items-center justify-center gap-2 text-blue-600">
          <Clock className="animate-spin" size={20} />
          {t.processing}
        </div>
      )}
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t.reviewMedications}</h3>
        <button onClick={() => setCurrentStep('upload')} className="text-gray-500">
          <X size={20} />
        </button>
      </div>

      {parseResult && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">
            {generateMedicationDraft(editedMedications, language)}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {editedMedications.map((med, index) => (
          <div key={med.id} className="border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t.name}</label>
                <input
                  type="text"
                  value={med.name}
                  onChange={(e) => handleMedicationEdit(index, 'name', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t.strength}</label>
                <input
                  type="text"
                  value={med.strength}
                  onChange={(e) => handleMedicationEdit(index, 'strength', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t.frequency}</label>
                <input
                  type="text"
                  value={med.frequency}
                  onChange={(e) => handleMedicationEdit(index, 'frequency', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t.duration}</label>
                <input
                  type="number"
                  value={med.duration}
                  onChange={(e) => handleMedicationEdit(index, 'duration', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>
            
            {med.isAntibiotic && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertCircle size={16} />
                  <span className="text-sm font-medium">
                    {getAntibioticEducationMessage(language)}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setCurrentStep('upload')}
          className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
        >
          {t.back}
        </button>
        <button
          onClick={() => setCurrentStep('schedule')}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          {t.next}
        </button>
      </div>
    </div>
  );

  const renderScheduleStep = () => {
    const now = new Date();
    const defaultTimes = [
      { label: language === 'bn' ? 'আজ রাত ৯টা' : 'Today 9 PM', value: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 21, 0).toISOString().slice(0, 16) },
      { label: language === 'bn' ? 'আজ দুপুর ২টা' : 'Today 2 PM', value: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0).toISOString().slice(0, 16) },
      { label: language === 'bn' ? 'আগামীকাল সকাল ৯টা' : 'Tomorrow 9 AM', value: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0).toISOString().slice(0, 16) }
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">{t.setSchedule}</h3>

        <div>
          <label className="block text-sm font-medium mb-3">{t.startTime}</label>
          <div className="grid grid-cols-1 gap-2 mb-3">
            {defaultTimes.map((time, index) => (
              <button
                key={index}
                onClick={() => setStartTime(time.value)}
                className={`p-3 text-left border rounded-lg ${
                  startTime === time.value ? 'bg-blue-50 border-blue-500' : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {time.label}
              </button>
            ))}
          </div>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">{t.reminderChannels}</label>
          <div className="space-y-2">
            {[
              { key: 'app' as const, label: language === 'bn' ? 'অ্যাপ নোটিফিকেশন' : 'App Notification' },
              { key: 'sms' as const, label: language === 'bn' ? 'এসএমএস' : 'SMS' },
              { key: 'whatsapp' as const, label: 'WhatsApp' }
            ].map((channel) => (
              <label key={channel.key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={reminderChannels.includes(channel.key)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setReminderChannels([...reminderChannels, channel.key]);
                    } else {
                      setReminderChannels(reminderChannels.filter(c => c !== channel.key));
                    }
                  }}
                  className="rounded"
                />
                {channel.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">{t.consent}</span>
          </label>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setCurrentStep('review')}
            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
          >
            {t.back}
          </button>
          <button
            onClick={handleCreateSchedule}
            disabled={!startTime || !consent}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {t.createSchedule}
          </button>
        </div>
      </div>
    );
  };

  const renderConfirmStep = () => (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <CheckCircle size={64} className="text-green-500" />
      </div>
      <h3 className="text-lg font-semibold text-green-700">{t.scheduleCreated}</h3>
      <p className="text-gray-600">
        {language === 'bn' 
          ? 'আপনার ওষুধের সময়সূচি সফলভাবে তৈরি হয়েছে। রিমাইন্ডার চালু করা হয়েছে।'
          : 'Your medication schedule has been created successfully. Reminders are now active.'}
      </p>
      <button
        onClick={onClose}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
      >
        {t.close}
      </button>
    </div>
  );

  const renderAutoSetupDialog = () => (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <Bot size={64} className="text-blue-500" />
      </div>
      <h3 className="text-lg font-semibold text-blue-700">{t.autoSetupTitle}</h3>
      <p className="text-gray-600">{t.autoSetupMessage}</p>
      
      <div className="bg-blue-50 p-4 rounded-lg text-left">
        <h4 className="font-medium text-blue-800 mb-2">
          {language === 'bn' ? 'সুবিধাসমূহ:' : 'Benefits:'}
        </h4>
        <div className="text-sm text-blue-700 whitespace-pre-line">
          {t.autoSetupBenefits}
        </div>
      </div>
      
      <div className="flex gap-3">
        <button
          onClick={() => handleAutoSetup(false)}
          className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50"
        >
          {t.reviewFirst}
        </button>
        <button
          onClick={() => handleAutoSetup(true)}
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
        >
          {t.setupNow}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {showAutoSetupDialog && renderAutoSetupDialog()}
          {!showAutoSetupDialog && currentStep === 'upload' && renderUploadStep()}
          {!showAutoSetupDialog && currentStep === 'review' && renderReviewStep()}
          {!showAutoSetupDialog && currentStep === 'schedule' && renderScheduleStep()}
          {!showAutoSetupDialog && currentStep === 'confirm' && renderConfirmStep()}
        </div>
      </div>
    </div>
  );
};

export default PrescriptionUpload;