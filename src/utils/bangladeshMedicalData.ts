import { Language } from '../types';

// Common diseases in Bangladesh with bilingual names
export const commonDiseases = {
  'fever': { bn: 'জ্বর', en: 'Fever' },
  'diarrhea': { bn: 'ডায়রিয়া', en: 'Diarrhea' },
  'dengue': { bn: 'ডেঙ্গু', en: 'Dengue' },
  'typhoid': { bn: 'টাইফয়েড', en: 'Typhoid' },
  'malaria': { bn: 'ম্যালেরিয়া', en: 'Malaria' },
  'hepatitis': { bn: 'হেপাটাইটিস', en: 'Hepatitis' },
  'tuberculosis': { bn: 'যক্ষ্মা', en: 'Tuberculosis' },
  'diabetes': { bn: 'ডায়াবেটিস', en: 'Diabetes' },
  'hypertension': { bn: 'উচ্চ রক্তচাপ', en: 'Hypertension' },
  'asthma': { bn: 'হাঁপানি', en: 'Asthma' }
};

// Common medicines available in Bangladesh
export const commonMedicines = {
  'paracetamol': { bn: 'প্যারাসিটামল', en: 'Paracetamol', brands: ['Napa', 'Ace', 'Fast'] },
  'omeprazole': { bn: 'ওমিপ্রাজল', en: 'Omeprazole', brands: ['Losec', 'Omez', 'Seclo'] },
  'metformin': { bn: 'মেটফরমিন', en: 'Metformin', brands: ['Glucophage', 'Metfo'] },
  'amlodipine': { bn: 'অ্যামলোডিপিন', en: 'Amlodipine', brands: ['Amdocal', 'Amlovas'] },
  'azithromycin': { bn: 'অ্যাজিথ্রোমাইসিন', en: 'Azithromycin', brands: ['Azithral', 'Zithromax'] }
};

// Major hospitals in Bangladesh
export const majorHospitals = {
  dhaka: {
    bn: 'ঢাকা',
    en: 'Dhaka',
    hospitals: [
      { bn: 'ঢাকা মেডিকেল কলেজ হাসপাতাল', en: 'Dhaka Medical College Hospital' },
      { bn: 'বঙ্গবন্ধু শেখ মুজিব মেডিকেল বিশ্ববিদ্যালয়', en: 'Bangabandhu Sheikh Mujib Medical University' },
      { bn: 'স্কয়ার হাসপাতাল', en: 'Square Hospital' },
      { bn: 'ইউনাইটেড হাসপাতাল', en: 'United Hospital' },
      { bn: 'আপোলো হাসপাতাল', en: 'Apollo Hospital' }
    ]
  },
  chittagong: {
    bn: 'চট্টগ্রাম',
    en: 'Chittagong',
    hospitals: [
      { bn: 'চট্টগ্রাম মেডিকেল কলেজ হাসপাতাল', en: 'Chittagong Medical College Hospital' },
      { bn: 'চেভরন ক্লিনিক্যাল ল্যাবরেটরি', en: 'Chevron Clinical Laboratory' }
    ]
  },
  sylhet: {
    bn: 'সিলেট',
    en: 'Sylhet',
    hospitals: [
      { bn: 'সিলেট এমএজি ওসমানী মেডিকেল কলেজ হাসপাতাল', en: 'Sylhet MAG Osmani Medical College Hospital' }
    ]
  }
};

// Emergency numbers in Bangladesh
export const emergencyNumbers = {
  bn: {
    ambulance: '999 (জাতীয় জরুরি সেবা)',
    fire: '999',
    police: '999',
    hospital: '16263 (স্বাস্থ্য বাতায়ন)'
  },
  en: {
    ambulance: '999 (National Emergency Service)',
    fire: '999',
    police: '999',
    hospital: '16263 (Health Helpline)'
  }
};

// Health tips specific to Bangladesh climate and conditions
export const healthTips = {
  monsoon: {
    bn: [
      'বর্ষাকালে পানিবাহিত রোগ থেকে বাঁচতে ফুটানো পানি পান করুন',
      'মশার কামড় থেকে বাঁচতে মশারি ব্যবহার করুন',
      'ডেঙ্গু প্রতিরোধে ঘরের আশেপাশে পানি জমতে দেবেন না'
    ],
    en: [
      'Drink boiled water to prevent waterborne diseases during monsoon',
      'Use mosquito nets to protect from mosquito bites',
      'Prevent dengue by not allowing water to stagnate around your home'
    ]
  },
  summer: {
    bn: [
      'গরমে প্রচুর পানি পান করুন',
      'রোদে বের হওয়ার সময় ছাতা বা টুপি ব্যবহার করুন',
      'হালকা রঙের ঢিলেঢালা কাপড় পরুন'
    ],
    en: [
      'Drink plenty of water during summer',
      'Use umbrella or hat when going out in the sun',
      'Wear light-colored loose clothing'
    ]
  },
  winter: {
    bn: [
      'শীতে গরম কাপড় পরুন',
      'ভিটামিন সি সমৃদ্ধ খাবার খান',
      'ঠান্ডা লাগলে গরম পানি পান করুন'
    ],
    en: [
      'Wear warm clothes during winter',
      'Eat vitamin C rich foods',
      'Drink warm water if you catch cold'
    ]
  }
};

// Common symptoms in local language
export const symptoms = {
  'headache': { bn: 'মাথাব্যথা', en: 'Headache' },
  'stomach_pain': { bn: 'পেটব্যথা', en: 'Stomach Pain' },
  'cough': { bn: 'কাশি', en: 'Cough' },
  'cold': { bn: 'সর্দি', en: 'Cold' },
  'vomiting': { bn: 'বমি', en: 'Vomiting' },
  'weakness': { bn: 'দুর্বলতা', en: 'Weakness' },
  'chest_pain': { bn: 'বুকে ব্যথা', en: 'Chest Pain' },
  'breathing_difficulty': { bn: 'শ্বাসকষ্ট', en: 'Breathing Difficulty' }
};

export const getLocalizedText = (key: string, language: Language, data: any) => {
  return data[key] ? data[key][language] : key;
};

export const getEmergencyInfo = (language: Language) => {
  return emergencyNumbers[language];
};

export const getSeasonalTips = (season: 'monsoon' | 'summer' | 'winter', language: Language) => {
  return healthTips[season][language];
};

export const getCurrentSeason = (): 'monsoon' | 'summer' | 'winter' => {
  const month = new Date().getMonth() + 1; // 1-12
  
  if (month >= 6 && month <= 9) {
    return 'monsoon';
  } else if (month >= 3 && month <= 5) {
    return 'summer';
  } else {
    return 'winter';
  }
};