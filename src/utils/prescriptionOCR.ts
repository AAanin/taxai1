// প্রেসক্রিপশন OCR এবং পার্সিং সিস্টেম - ডাঃ মিমুর জন্য
// Prescription OCR and Parsing System for Dr. Mimu
// ai.md স্পেসিফিকেশন অনুযায়ী তৈরি
// Based on ai.md specification

// ওষুধের তথ্য এক্সট্র্যাক্ট করার জন্য ইমপোর্ট
// Import for extracting medication information
import { extractMedicationInfo, MedicationInfo } from './medicineTracker';
// অ্যান্টিবায়োটিক সনাক্তকরণের জন্য ইমপোর্ট
// Import for antibiotic detection
import { detectAntibiotic } from './antibioticDetector';

// OCR রেজাল্টের ইন্টারফেস - ছবি থেকে টেক্সট এক্সট্র্যাক্ট করার ফলাফল
// OCR Result interface - result of text extraction from image
export interface OCRResult {
  text: string; // এক্সট্র্যাক্ট করা টেক্সট / Extracted text
  confidence: number; // নির্ভুলতার মাত্রা (০-১) / Confidence level (0-1)
  layout?: { // লেআউট তথ্য (ঐচ্ছিক) / Layout information (optional)
    lines: {
      text: string; // লাইনের টেক্সট / Line text
      bbox: [number, number, number, number]; // বাউন্ডিং বক্স [x, y, width, height]
      confidence: number; // লাইনের নির্ভুলতা / Line confidence
    }[];
  };
}

// প্রেসক্রিপশন পার্স করার ফলাফলের ইন্টারফেস
// Prescription parsing result interface
export interface PrescriptionParseResult {
  medications: MedicationInfo[]; // সনাক্তকৃত ওষুধের তালিকা / List of identified medications
  rawText: string; // মূল OCR টেক্সট / Original OCR text
  confidence: number; // সামগ্রিক নির্ভুলতা / Overall confidence
  needsDisambiguation: boolean; // স্পষ্টীকরণ প্রয়োজন কিনা / Whether disambiguation is needed
  ambiguousMedications: { // অস্পষ্ট ওষুধের তালিকা / List of ambiguous medications
    original: string; // মূল টেক্সট / Original text
    suggestions: string[]; // সম্ভাব্য সাজেশন / Possible suggestions
  }[];
  diagnosis?: string; // রোগ নির্ণয় (ঐচ্ছিক) / Diagnosis (optional)
  doctorName?: string; // ডাক্তারের নাম (ঐচ্ছিক) / Doctor name (optional)
  date?: string; // তারিখ (ঐচ্ছিক) / Date (optional)
}

// মক OCR ফাংশন (বাস্তব বাস্তবায়নে এটি একটি OCR সার্ভিস কল করবে)
// Mock OCR function (in real implementation, this would call an OCR service)
export async function extractTextFromImage(imageFile: File): Promise<OCRResult> {
  // এটি একটি মক বাস্তবায়ন
  // This is a mock implementation
  // বাস্তব অ্যাপে আপনি এই সার্ভিসগুলো ব্যবহার করবেন:
  // In a real app, you would use services like:
  // - Google Cloud Vision API
  // - AWS Textract
  // - Azure Computer Vision
  // - Tesseract.js for client-side OCR
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock OCR result for demonstration
      const mockResult: OCRResult = {
        text: "Azin 500 mg\nOD x 3 days\n\nParacetamol 500 mg\nq6h PRN\n\nZinnat 250 mg\nBD x 5 days",
        confidence: 0.85,
        layout: {
          lines: [
            { text: "Azin 500 mg", bbox: [10, 10, 200, 30], confidence: 0.9 },
            { text: "OD x 3 days", bbox: [10, 35, 150, 55], confidence: 0.8 },
            { text: "Paracetamol 500 mg", bbox: [10, 70, 250, 90], confidence: 0.95 },
            { text: "q6h PRN", bbox: [10, 95, 120, 115], confidence: 0.7 },
            { text: "Zinnat 250 mg", bbox: [10, 130, 200, 150], confidence: 0.85 },
            { text: "BD x 5 days", bbox: [10, 155, 150, 175], confidence: 0.8 }
          ]
        }
      };
      resolve(mockResult);
    }, 2000); // Simulate processing time
  });
}

// প্রেসক্রিপশন টেক্সট থেকে রোগ নির্ণয় এক্সট্র্যাক্ট করা
// Extract diagnosis from prescription text
function extractDiagnosis(text: string): string | undefined {
  const diagnosisPatterns = [
    /(?:diagnosis|dx|condition)\s*:?\s*([^\n]+)/i,
    /(?:chief complaint|cc)\s*:?\s*([^\n]+)/i,
    /(?:impression|imp)\s*:?\s*([^\n]+)/i,
    /(?:problem|issue)\s*:?\s*([^\n]+)/i
  ];
  
  for (const pattern of diagnosisPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return undefined;
}

// প্রেসক্রিপশন টেক্সট থেকে ডাক্তারের নাম এক্সট্র্যাক্ট করা
// Extract doctor name from prescription text
function extractDoctorName(text: string): string | undefined {
  const doctorPatterns = [
    /(?:dr\.?|doctor)\s+([a-z\s\.]+)/i,
    /(?:physician|consultant)\s*:?\s*([^\n]+)/i,
    /(?:prescribed by|by)\s*:?\s*(?:dr\.?\s*)?([a-z\s\.]+)/i
  ];
  
  for (const pattern of doctorPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return undefined;
}

// প্রেসক্রিপশন টেক্সট থেকে তারিখ এক্সট্র্যাক্ট করা
// Extract date from prescription text
function extractPrescriptionDate(text: string): string | undefined {
  const datePatterns = [
    /(?:date|dated)\s*:?\s*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i,
    /(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/,
    /(?:on|dated)\s+(\d{1,2}\s+[a-z]+\s+\d{2,4})/i
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const dateStr = match[1].trim();
      try {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      } catch {
        // Continue to next pattern
      }
    }
  }
  
  return undefined;
}

// OCR টেক্সট পরিষ্কার এবং প্রি-প্রসেসিং
// Clean and preprocess OCR text
function preprocessOCRText(text: string): string {
  return text
    // সাধারণ OCR ত্রুটি সংশোধন / Fix common OCR errors
    .replace(/[0O]/g, '0')
    .replace(/[1Il|]/g, '1')
    .replace(/[5S]/g, '5')
    // হোয়াইটস্পেস নরমালাইজ করা / Normalize whitespace
    .replace(/\s+/g, ' ')
    // সাধারণ ওষুধের নামের ত্রুটি সংশোধন / Fix common medication name errors
    .replace(/\bAzin\b/gi, 'Azin')
    .replace(/\bZinnat\b/gi, 'Zinnat')
    .replace(/\bAugmentin\b/gi, 'Augmentin')
    .replace(/\bParacetamol\b/gi, 'Paracetamol')
    // ডোজেজ প্যাটার্ন সংশোধন / Fix dosage patterns
    .replace(/\b([0-9]+)\s*mg\b/gi, '$1 mg')
    .replace(/\b([0-9]+)\s*ml\b/gi, '$1 ml')
    .replace(/\bOD\b/gi, 'OD')
    .replace(/\bBD\b/gi, 'BD')
    .replace(/\bTID\b/gi, 'TID')
    .replace(/\bQID\b/gi, 'QID')
    .replace(/\bPRN\b/gi, 'PRN')
    .replace(/\bSOS\b/gi, 'SOS')
    .trim();
}

// ওষুধ এক্সট্র্যাকশনের নির্ভুলতা যাচাই করা
// Validate medication extraction confidence
function validateMedicationConfidence(medication: MedicationInfo): number {
  let confidence = 0.5; // বেস নির্ভুলতা / Base confidence
  
  // পরিচিত প্যাটার্নের জন্য নির্ভুলতা বৃদ্ধি / Boost confidence for known patterns
  if (medication.strength.match(/\d+\s*(mg|ml|g)/)) {
    confidence += 0.2;
  }
  
  if (['OD', 'BD', 'TID', 'QID'].includes(medication.frequency.toUpperCase())) {
    confidence += 0.2;
  }
  
  if (medication.duration > 0 && medication.duration <= 30) {
    confidence += 0.1;
  }
  
  // পরিচিত অ্যান্টিবায়োটিকের জন্য বৃদ্ধি / Boost for known antibiotics
  if (medication.isAntibiotic && medication.antibioticInfo?.confidence && medication.antibioticInfo.confidence > 0.8) {
    confidence += 0.1;
  }
  
  return Math.min(confidence, 1.0);
}

// অস্পষ্ট ওষুধ খুঁজে বের করা যার স্পষ্টীকরণ প্রয়োজন
// Find ambiguous medications that need disambiguation
function findAmbiguousMedications(medications: MedicationInfo[]): {
  original: string;
  suggestions: string[];
}[] {
  const ambiguous: { original: string; suggestions: string[] }[] = [];
  
  for (const med of medications) {
    const antibioticResult = detectAntibiotic(med.name);
    
    // If confidence is low, it might be ambiguous
    if (antibioticResult.confidence > 0.3 && antibioticResult.confidence < 0.8) {
      const suggestions = [];
      
      if (antibioticResult.brand_detected) {
        suggestions.push(`${antibioticResult.canonical_generic} (${antibioticResult.brand_detected})`);
      } else {
        suggestions.push(antibioticResult.canonical_generic);
      }
      
      // Add some common alternatives based on partial matches
      if (med.name.toLowerCase().includes('azi')) {
        suggestions.push('Azithromycin 500 mg', 'Azithromycin 250 mg');
      }
      if (med.name.toLowerCase().includes('amox')) {
        suggestions.push('Amoxicillin 500 mg', 'Amoxicillin+Clavulanate 625 mg');
      }
      if (med.name.toLowerCase().includes('cef')) {
        suggestions.push('Cefixime 200 mg', 'Cefuroxime 250 mg');
      }
      
      if (suggestions.length > 0) {
        ambiguous.push({
          original: med.name,
          suggestions: [...new Set(suggestions)] // Remove duplicates
        });
      }
    }
  }
  
  return ambiguous;
}

// মূল প্রেসক্রিপশন পার্সিং ফাংশন - ছবি থেকে
// Main prescription parsing function
export async function parsePrescriptionFromImage(imageFile: File): Promise<PrescriptionParseResult> {
  try {
    // OCR ব্যবহার করে টেক্সট এক্সট্র্যাক্ট করা / Extract text using OCR
    const ocrResult = await extractTextFromImage(imageFile);
    
    // টেক্সট প্রি-প্রসেসিং / Preprocess the text
    const cleanedText = preprocessOCRText(ocrResult.text);
    
    // ওষুধের তথ্য এক্সট্র্যাক্ট করা / Extract medication information
    const medications = extractMedicationInfo(cleanedText);
    
    // নির্ভুলতা যাচাই এবং সামগ্রিক নির্ভুলতা গণনা / Validate and calculate overall confidence
    const medicationConfidences = medications.map(validateMedicationConfidence);
    const averageConfidence = medicationConfidences.length > 0 
      ? medicationConfidences.reduce((a, b) => a + b, 0) / medicationConfidences.length 
      : 0;
    
    const overallConfidence = (ocrResult.confidence + averageConfidence) / 2;
    
    // অস্পষ্ট ওষুধ খুঁজে বের করা / Find ambiguous medications
    const ambiguousMedications = findAmbiguousMedications(medications);
    
    // অতিরিক্ত তথ্য এক্সট্র্যাক্ট করা / Extract additional information
    const diagnosis = extractDiagnosis(cleanedText);
    const doctorName = extractDoctorName(cleanedText);
    const date = extractPrescriptionDate(cleanedText);
    
    return {
      medications,
      rawText: cleanedText,
      confidence: overallConfidence,
      needsDisambiguation: ambiguousMedications.length > 0 || overallConfidence < 0.7,
      ambiguousMedications,
      diagnosis,
      doctorName,
      date
    };
  } catch (error) {
    console.error('Error parsing prescription:', error);
    throw new Error('Failed to parse prescription image');
  }
}

// টেক্সট ইনপুট থেকে প্রেসক্রিপশন পার্স করা (ম্যানুয়াল এন্ট্রি)
// Parse prescription from text input (manual entry)
export function parsePrescriptionFromText(prescriptionText: string): PrescriptionParseResult {
  const cleanedText = preprocessOCRText(prescriptionText);
  const medications = extractMedicationInfo(cleanedText);
  
  const medicationConfidences = medications.map(validateMedicationConfidence);
  const averageConfidence = medicationConfidences.length > 0 
    ? medicationConfidences.reduce((a, b) => a + b, 0) / medicationConfidences.length 
    : 0;
  
  const ambiguousMedications = findAmbiguousMedications(medications);
  
  // Extract additional information
  const diagnosis = extractDiagnosis(cleanedText);
  const doctorName = extractDoctorName(cleanedText);
  const date = extractPrescriptionDate(cleanedText);
  
  return {
    medications,
    rawText: cleanedText,
    confidence: averageConfidence,
    needsDisambiguation: ambiguousMedications.length > 0 || averageConfidence < 0.8,
    ambiguousMedications,
    diagnosis,
    doctorName,
    date
  };
}

// বাংলায় স্পষ্টীকরণ প্রশ্ন তৈরি করা
// Generate disambiguation question in Bengali
export function generateDisambiguationQuestion(
  ambiguous: { original: string; suggestions: string[] },
  language: 'bn' | 'en' = 'bn'
): string {
  if (language === 'en') {
    return `Is "${ambiguous.original}" referring to ${ambiguous.suggestions[0]}?`;
  }
  
  return `"${ambiguous.original}" এটা কি **${ambiguous.suggestions[0]}**?`;
}

// ওষুধের খসড়া নিশ্চিতকরণ বার্তা তৈরি করা
// Generate medication draft confirmation message
export function generateMedicationDraft(
  medications: MedicationInfo[],
  language: 'bn' | 'en' = 'bn'
): string {
  const header = language === 'en' 
    ? "**I found these medications:**\n\n"
    : "**আমি যে ওষুধগুলো পড়েছি:**\n\n";
  
  const medicationList = medications.map((med, index) => {
    const summary = language === 'en'
      ? `${med.name} ${med.strength} — ${med.frequency} — ${med.duration} days`
      : `${med.name} ${med.strength} — ${med.frequency} — ${med.duration} দিন`;
    
    return `${index + 1}. ${summary}`;
  }).join('\n');
  
  const footer = language === 'en'
    ? "\n\n**Are these correct?**"
    : "\n\n**এগুলো কি ঠিক?**";
  
  return header + medicationList + footer;
}

// ইমেজ ফাইল যাচাই করা
// Validate image file
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // ফাইলের ধরন পরীক্ষা করা / Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Please upload a valid image file (JPEG, PNG, or WebP)'
    };
  }
  
  // ফাইলের আকার পরীক্ষা করা (সর্বোচ্চ ১০MB) / Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Image file size should be less than 10MB'
    };
  }
  
  return { valid: true };
}

// OCR প্রসেসিং টিপস পেতে
// Get OCR processing tips
export function getOCRTips(language: 'bn' | 'en' = 'bn'): string[] {
  if (language === 'en') {
    return [
      'Ensure good lighting when taking the photo',
      'Keep the prescription flat and avoid shadows',
      'Make sure the text is clearly visible and not blurry',
      'Capture the entire prescription in the frame',
      'Avoid reflections from glossy paper'
    ];
  }
  
  return [
    'ছবি তোলার সময় ভালো আলোর ব্যবস্থা করুন',
    'প্রেসক্রিপশনটি সমতল রাখুন এবং ছায়া এড়িয়ে চলুন',
    'লেখা স্পষ্ট এবং ঝাপসা নয় তা নিশ্চিত করুন',
    'পুরো প্রেসক্রিপশন ফ্রেমে আনুন',
    'চকচকে কাগজের প্রতিফলন এড়িয়ে চলুন'
  ];
}