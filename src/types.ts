export type Language = 'bn' | 'en';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  language: Language;
}

export interface MedicalResponse {
  diagnosis?: string;
  recommendations?: string[];
  medications?: string[];
  warnings?: string[];
  followUp?: string;
}

export interface AIProvider {
  name: 'gemini' | 'gpt';
  response: string;
  confidence: number;
}

export interface CombinedAIResponse {
  finalResponse: string;
  providers: AIProvider[];
  consensus: boolean;
}

export interface ChatConfig {
  geminiApiKey?: string;
  openaiApiKey?: string;
  maxTokens: number;
  temperature: number;
}

// Doctor Directory Types
export interface Doctor {
  id: string;
  name: string;
  nameEn: string;
  specialty: string;
  specialtyEn: string;
  qualifications: string[];
  experience: number;
  hospital: string;
  hospitalEn: string;
  address: string;
  addressEn: string;
  phone: string;
  email?: string;
  consultationFee: number;
  availableDays: string[];
  availableTime: string;
  rating: number;
  totalReviews: number;
  image?: string;
  languages: string[];
  chamberLocation?: string;
  onlineConsultation: boolean;
}

export interface Appointment {
  id: string;
  doctorId: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  appointmentDate: string;
  appointmentTime: string;
  consultationType: 'chamber' | 'online';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  createdAt: Date;
}

// Medicine Directory Types
export interface Medicine {
  id: string;
  name: string;
  nameEn: string;
  genericName: string;
  brandNames: string[];
  category: string;
  categoryEn: string;
  uses: string[];
  usesEn: string[];
  dosage: {
    adult: string;
    adultEn: string;
    child: string;
    childEn: string;
    maxDaily: string;
    maxDailyEn: string;
  };
  sideEffects: string[];
  sideEffectsEn: string[];
  contraindications: string[];
  contraindicationsEn: string[];
  availability: {
    prescription: boolean;
    pharmacies: string[];
    pharmaciesEn: string[];
    price: string;
    priceEn: string;
    inStock: boolean;
  };
  manufacturer: string;
  manufacturerEn: string;
  warnings: string[];
  warningsEn: string[];
  prescriptionRequired: boolean;
  image?: string;
  expiryDate?: string;
  batchNumber?: string;
  storage: string;
  storageEn: string;
}

export interface MedicineSearch {
  query: string;
  category?: string;
  manufacturer?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  availability?: 'available' | 'limited' | 'out_of_stock';
  prescriptionRequired?: boolean;
}

export interface DoctorSearch {
  query: string;
  specialty?: string;
  location?: string;
  consultationFee?: {
    min: number;
    max: number;
  };
  rating?: number;
  availableToday?: boolean;
  onlineConsultation?: boolean;
}