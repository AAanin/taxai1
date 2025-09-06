// Antibiotic Detection System for Dr. Mimu
// Based on ai.md specification

export interface AntibioticClassification {
  normalized_name: string;
  is_antibiotic: boolean;
  class: string;
  canonical_generic: string;
  confidence: number;
  brand_detected?: string;
}

// Generic antibiotic names
const ANTIBIOTIC_GENERICS = [
  'amoxicillin',
  'amoxicillin+clavulanate',
  'cefixime',
  'cefuroxime',
  'cephalexin',
  'ceftriaxone',
  'azithromycin',
  'clarithromycin',
  'ciprofloxacin',
  'levofloxacin',
  'moxifloxacin',
  'doxycycline',
  'metronidazole',
  'clindamycin',
  'nitrofurantoin',
  'co-trimoxazole',
  'linezolid',
  'erythromycin',
  'roxithromycin',
  'ofloxacin',
  'norfloxacin',
  'cefaclor',
  'cefpodoxime',
  'ceftazidime',
  'imipenem',
  'meropenem',
  'vancomycin',
  'teicoplanin'
];

// Bangladesh common brand names mapped to generics
const BD_BRAND_ALIASES: Record<string, string> = {
  // Azithromycin brands
  'azin': 'azithromycin',
  'zithro': 'azithromycin',
  'azimax': 'azithromycin',
  'azithral': 'azithromycin',
  'azee': 'azithromycin',
  
  // Amoxicillin+Clavulanate brands
  'augmentin': 'amoxicillin+clavulanate',
  'amclav': 'amoxicillin+clavulanate',
  'co-amoxiclav': 'amoxicillin+clavulanate',
  'clavamox': 'amoxicillin+clavulanate',
  
  // Cefuroxime brands
  'zinnat': 'cefuroxime',
  'ceftin': 'cefuroxime',
  
  // Cefixime brands
  'suprax': 'cefixime',
  'cefix': 'cefixime',
  
  // Cephalexin brands
  'keflex': 'cephalexin',
  'cefalex': 'cephalexin',
  
  // Ceftriaxone brands
  'rocephin': 'ceftriaxone',
  'ceftrix': 'ceftriaxone',
  
  // Ciprofloxacin brands
  'cipro': 'ciprofloxacin',
  'ciproxin': 'ciprofloxacin',
  'ciplox': 'ciprofloxacin',
  
  // Levofloxacin brands
  'levoxin': 'levofloxacin',
  'tavanic': 'levofloxacin',
  
  // Moxifloxacin brands
  'avelox': 'moxifloxacin',
  'moxif': 'moxifloxacin',
  
  // Doxycycline brands
  'vibramycin': 'doxycycline',
  'doxicap': 'doxycycline',
  'doxy': 'doxycycline',
  
  // Metronidazole brands
  'flagyl': 'metronidazole',
  'metrogyl': 'metronidazole',
  'metro': 'metronidazole',
  
  // Clindamycin brands
  'dalacin': 'clindamycin',
  'cleocin': 'clindamycin',
  
  // Nitrofurantoin brands
  'furantoin': 'nitrofurantoin',
  'macrobid': 'nitrofurantoin',
  
  // Co-trimoxazole brands
  'cotrim': 'co-trimoxazole',
  'bactrim': 'co-trimoxazole',
  'septran': 'co-trimoxazole'
};

// Antibiotic classes
const ANTIBIOTIC_CLASSES: Record<string, string> = {
  'amoxicillin': 'penicillin',
  'amoxicillin+clavulanate': 'penicillin',
  'cefixime': 'cephalosporin',
  'cefuroxime': 'cephalosporin',
  'cephalexin': 'cephalosporin',
  'ceftriaxone': 'cephalosporin',
  'azithromycin': 'macrolide',
  'clarithromycin': 'macrolide',
  'erythromycin': 'macrolide',
  'roxithromycin': 'macrolide',
  'ciprofloxacin': 'fluoroquinolone',
  'levofloxacin': 'fluoroquinolone',
  'moxifloxacin': 'fluoroquinolone',
  'ofloxacin': 'fluoroquinolone',
  'norfloxacin': 'fluoroquinolone',
  'doxycycline': 'tetracycline',
  'metronidazole': 'nitroimidazole',
  'clindamycin': 'lincosamide',
  'nitrofurantoin': 'nitrofuran',
  'co-trimoxazole': 'sulfonamide',
  'linezolid': 'oxazolidinone'
};

// Levenshtein distance calculation for fuzzy matching
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

// Normalize medication name for comparison
function normalizeMedicationName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[\s\-\.\+]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

// Extract medication name from full prescription text
function extractMedicationName(prescriptionText: string): string {
  // Remove dosage information (numbers + mg/ml/g etc.)
  const cleaned = prescriptionText
    .replace(/\d+\s*(mg|ml|g|mcg|iu|tab|cap|tabs|caps)\b/gi, '')
    .replace(/\b(od|bd|tid|qid|q\d+h|prn|sos|stat)\b/gi, '')
    .replace(/\b(x\d+|for\s+\d+|\d+\s*days?)\b/gi, '')
    .replace(/[\d\s\-\.\+]+$/, '')
    .trim();
  
  return cleaned;
}

// Main antibiotic detection function
export function detectAntibiotic(medicationInput: string): AntibioticClassification {
  const medicationName = extractMedicationName(medicationInput);
  const normalized = normalizeMedicationName(medicationName);
  
  let bestMatch = {
    normalized_name: medicationName,
    is_antibiotic: false,
    class: 'unknown',
    canonical_generic: medicationName,
    confidence: 0,
    brand_detected: undefined as string | undefined
  };
  
  // Check exact brand match first
  for (const [brand, generic] of Object.entries(BD_BRAND_ALIASES)) {
    const normalizedBrand = normalizeMedicationName(brand);
    if (normalized === normalizedBrand || normalized.includes(normalizedBrand)) {
      return {
        normalized_name: generic,
        is_antibiotic: true,
        class: ANTIBIOTIC_CLASSES[generic] || 'unknown',
        canonical_generic: generic,
        confidence: 0.95,
        brand_detected: brand
      };
    }
  }
  
  // Check exact generic match
  for (const generic of ANTIBIOTIC_GENERICS) {
    const normalizedGeneric = normalizeMedicationName(generic);
    if (normalized === normalizedGeneric || normalized.includes(normalizedGeneric)) {
      return {
        normalized_name: generic,
        is_antibiotic: true,
        class: ANTIBIOTIC_CLASSES[generic] || 'unknown',
        canonical_generic: generic,
        confidence: 0.98
      };
    }
  }
  
  // Fuzzy matching for brands (Levenshtein distance ≤ 2)
  for (const [brand, generic] of Object.entries(BD_BRAND_ALIASES)) {
    const normalizedBrand = normalizeMedicationName(brand);
    const distance = levenshteinDistance(normalized, normalizedBrand);
    
    if (distance <= 2 && distance < normalized.length / 2) {
      const confidence = Math.max(0.7, 1 - (distance / Math.max(normalized.length, normalizedBrand.length)));
      
      if (confidence > bestMatch.confidence) {
        bestMatch = {
          normalized_name: generic,
          is_antibiotic: true,
          class: ANTIBIOTIC_CLASSES[generic] || 'unknown',
          canonical_generic: generic,
          confidence,
          brand_detected: brand
        };
      }
    }
  }
  
  // Fuzzy matching for generics
  for (const generic of ANTIBIOTIC_GENERICS) {
    const normalizedGeneric = normalizeMedicationName(generic);
    const distance = levenshteinDistance(normalized, normalizedGeneric);
    
    if (distance <= 2 && distance < normalized.length / 2) {
      const confidence = Math.max(0.75, 1 - (distance / Math.max(normalized.length, normalizedGeneric.length)));
      
      if (confidence > bestMatch.confidence) {
        bestMatch = {
          normalized_name: generic,
          is_antibiotic: true,
          class: ANTIBIOTIC_CLASSES[generic] || 'unknown',
          canonical_generic: generic,
          confidence
        };
      }
    }
  }
  
  return bestMatch;
}

// Batch detection for multiple medications
export function detectAntibioticsInList(medications: string[]): AntibioticClassification[] {
  return medications.map(med => detectAntibiotic(med));
}

// Check if any medication in the list is an antibiotic
export function hasAntibiotics(medications: string[]): boolean {
  return medications.some(med => {
    const result = detectAntibiotic(med);
    return result.is_antibiotic && result.confidence > 0.7;
  });
}

// Get antibiotic education message in Bengali
export function getAntibioticEducationMessage(language: 'bn' | 'en' = 'bn'): string {
  if (language === 'en') {
    return "⚠️ **Important:** This is an **antibiotic**. It's crucial to **complete the full course** even if you feel better. Stopping early can make bacteria resistant to treatment.";
  }
  
  return "⚠️ **খেয়াল রাখুন:** এটি **অ্যান্টিবায়োটিক**। ভালো লাগলেও **পুরো কোর্স শেষ করা জরুরি**। মাঝপথে বন্ধ করলে ভবিষ্যতে ওষুধ কম কাজ করতে পারে।";
}

// Get early stop warning message
export function getEarlyStopWarning(language: 'bn' | 'en' = 'bn'): string {
  if (language === 'en') {
    return "Even if you feel better, **stopping antibiotics early can make bacteria stronger**. Please complete the full course as prescribed.";
  }
  
  return "ভালো লাগলেও **অ্যান্টিবায়োটিক কোর্স শেষ না করলে** জীবাণু শক্তিশালী হয়ে যায়। অনুগ্রহ করে কোর্স সম্পূর্ণ করুন।";
}