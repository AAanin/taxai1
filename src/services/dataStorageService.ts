// Comprehensive Data Storage Service for Medical Data Management
import { v4 as uuidv4 } from 'uuid';

// Data Types
export interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  sender: 'user' | 'mimu';
  timestamp: Date;
  category?: 'consultation' | 'prescription' | 'general' | 'emergency';
  metadata?: {
    symptoms?: string[];
    diagnosis?: string;
    recommendations?: string[];
  };
}

export interface MedicalReport {
  id: string;
  userId: string;
  reportType: 'blood_test' | 'x_ray' | 'mri' | 'ct_scan' | 'ecg' | 'other';
  title: string;
  description: string;
  fileUrl?: string;
  results: {
    parameters: { name: string; value: string; unit: string; normalRange: string; status: 'normal' | 'abnormal' | 'critical' }[];
    summary: string;
    recommendations: string[];
  };
  doctorName?: string;
  hospitalName?: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicineRecord {
  id: string;
  userId: string;
  medicineName: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  duration: string;
  prescribedBy: string;
  prescribedDate: Date;
  startDate: Date;
  endDate?: Date;
  purpose: string;
  sideEffects?: string[];
  effectiveness?: 'very_effective' | 'effective' | 'moderate' | 'ineffective';
  adherence?: number; // percentage
  notes?: string;
  status: 'active' | 'completed' | 'discontinued';
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicalData {
  id: string;
  userId: string;
  dataType: 'vital_signs' | 'symptoms' | 'allergies' | 'medical_history' | 'family_history';
  data: {
    [key: string]: any;
  };
  timestamp: Date;
  source: 'user_input' | 'doctor_visit' | 'self_monitoring' | 'device';
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  bloodGroup?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Storage Keys
const STORAGE_KEYS = {
  CHAT_HISTORY: 'mimu_chat_history',
  MEDICAL_REPORTS: 'mimu_medical_reports',
  MEDICINE_RECORDS: 'mimu_medicine_records',
  MEDICAL_DATA: 'mimu_medical_data',
  USER_PROFILE: 'mimu_user_profile'
};

class DataStorageService {
  private static instance: DataStorageService;

  private constructor() {}

  public static getInstance(): DataStorageService {
    if (!DataStorageService.instance) {
      DataStorageService.instance = new DataStorageService();
    }
    return DataStorageService.instance;
  }

  // Generic storage methods
  private saveToStorage<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

  private getFromStorage<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading from storage:', error);
      return [];
    }
  }

  // Chat History Management
  public saveChatMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
    const chatHistory = this.getFromStorage<ChatMessage>(STORAGE_KEYS.CHAT_HISTORY);
    const newMessage: ChatMessage = {
      ...message,
      id: uuidv4(),
      timestamp: new Date()
    };
    
    chatHistory.push(newMessage);
    this.saveToStorage(STORAGE_KEYS.CHAT_HISTORY, chatHistory);
    return newMessage;
  }

  public getChatHistory(userId: string, limit?: number): ChatMessage[] {
    const chatHistory = this.getFromStorage<ChatMessage>(STORAGE_KEYS.CHAT_HISTORY);
    const userChats = chatHistory
      .filter(chat => chat.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return limit ? userChats.slice(0, limit) : userChats;
  }

  public getChatsByDateRange(userId: string, startDate: Date, endDate: Date): ChatMessage[] {
    const chatHistory = this.getFromStorage<ChatMessage>(STORAGE_KEYS.CHAT_HISTORY);
    return chatHistory.filter(chat => 
      chat.userId === userId &&
      new Date(chat.timestamp) >= startDate &&
      new Date(chat.timestamp) <= endDate
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public searchChatHistory(userId: string, query: string): ChatMessage[] {
    const chatHistory = this.getFromStorage<ChatMessage>(STORAGE_KEYS.CHAT_HISTORY);
    return chatHistory.filter(chat => 
      chat.userId === userId &&
      (chat.message.toLowerCase().includes(query.toLowerCase()) ||
       chat.metadata?.symptoms?.some(symptom => symptom.toLowerCase().includes(query.toLowerCase())) ||
       chat.metadata?.diagnosis?.toLowerCase().includes(query.toLowerCase()))
    );
  }

  // Medical Reports Management
  public saveMedicalReport(report: Omit<MedicalReport, 'id' | 'createdAt' | 'updatedAt'>): MedicalReport {
    const reports = this.getFromStorage<MedicalReport>(STORAGE_KEYS.MEDICAL_REPORTS);
    const newReport: MedicalReport = {
      ...report,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    reports.push(newReport);
    this.saveToStorage(STORAGE_KEYS.MEDICAL_REPORTS, reports);
    return newReport;
  }

  public getMedicalReports(userId: string): MedicalReport[] {
    const reports = this.getFromStorage<MedicalReport>(STORAGE_KEYS.MEDICAL_REPORTS);
    return reports
      .filter(report => report.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public updateMedicalReport(reportId: string, updates: Partial<MedicalReport>): MedicalReport | null {
    const reports = this.getFromStorage<MedicalReport>(STORAGE_KEYS.MEDICAL_REPORTS);
    const reportIndex = reports.findIndex(report => report.id === reportId);
    
    if (reportIndex !== -1) {
      reports[reportIndex] = {
        ...reports[reportIndex],
        ...updates,
        updatedAt: new Date()
      };
      this.saveToStorage(STORAGE_KEYS.MEDICAL_REPORTS, reports);
      return reports[reportIndex];
    }
    return null;
  }

  // Medicine Records Management
  public saveMedicineRecord(record: Omit<MedicineRecord, 'id' | 'createdAt' | 'updatedAt'>): MedicineRecord {
    const records = this.getFromStorage<MedicineRecord>(STORAGE_KEYS.MEDICINE_RECORDS);
    const newRecord: MedicineRecord = {
      ...record,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    records.push(newRecord);
    this.saveToStorage(STORAGE_KEYS.MEDICINE_RECORDS, records);
    return newRecord;
  }

  public getMedicineRecords(userId: string): MedicineRecord[] {
    const records = this.getFromStorage<MedicineRecord>(STORAGE_KEYS.MEDICINE_RECORDS);
    return records
      .filter(record => record.userId === userId)
      .sort((a, b) => new Date(b.prescribedDate).getTime() - new Date(a.prescribedDate).getTime());
  }

  public getActiveMedicines(userId: string): MedicineRecord[] {
    const records = this.getMedicineRecords(userId);
    return records.filter(record => record.status === 'active');
  }

  public updateMedicineRecord(recordId: string, updates: Partial<MedicineRecord>): MedicineRecord | null {
    const records = this.getFromStorage<MedicineRecord>(STORAGE_KEYS.MEDICINE_RECORDS);
    const recordIndex = records.findIndex(record => record.id === recordId);
    
    if (recordIndex !== -1) {
      records[recordIndex] = {
        ...records[recordIndex],
        ...updates,
        updatedAt: new Date()
      };
      this.saveToStorage(STORAGE_KEYS.MEDICINE_RECORDS, records);
      return records[recordIndex];
    }
    return null;
  }

  // Medical Data Management
  public saveMedicalData(data: Omit<MedicalData, 'id' | 'createdAt' | 'updatedAt'>): MedicalData {
    const medicalData = this.getFromStorage<MedicalData>(STORAGE_KEYS.MEDICAL_DATA);
    const newData: MedicalData = {
      ...data,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    medicalData.push(newData);
    this.saveToStorage(STORAGE_KEYS.MEDICAL_DATA, medicalData);
    return newData;
  }

  public getMedicalData(userId: string, dataType?: string): MedicalData[] {
    const medicalData = this.getFromStorage<MedicalData>(STORAGE_KEYS.MEDICAL_DATA);
    let filtered = medicalData.filter(data => data.userId === userId);
    
    if (dataType) {
      filtered = filtered.filter(data => data.dataType === dataType);
    }
    
    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Data Analysis Methods
  public getDataSummary(userId: string): {
    totalChats: number;
    totalReports: number;
    activeMedicines: number;
    lastChatDate: Date | null;
    lastReportDate: Date | null;
  } {
    const chats = this.getChatHistory(userId);
    const reports = this.getMedicalReports(userId);
    const activeMedicines = this.getActiveMedicines(userId);
    
    return {
      totalChats: chats.length,
      totalReports: reports.length,
      activeMedicines: activeMedicines.length,
      lastChatDate: chats.length > 0 ? new Date(chats[0].timestamp) : null,
      lastReportDate: reports.length > 0 ? new Date(reports[0].timestamp) : null
    };
  }

  // Export functionality
  public exportUserData(userId: string): {
    chatHistory: ChatMessage[];
    medicalReports: MedicalReport[];
    medicineRecords: MedicineRecord[];
    medicalData: MedicalData[];
    exportDate: Date;
  } {
    return {
      chatHistory: this.getChatHistory(userId),
      medicalReports: this.getMedicalReports(userId),
      medicineRecords: this.getMedicineRecords(userId),
      medicalData: this.getMedicalData(userId),
      exportDate: new Date()
    };
  }

  // Clear data methods (for testing or user request)
  public clearUserData(userId: string): void {
    const keys = Object.values(STORAGE_KEYS);
    keys.forEach(key => {
      const data = this.getFromStorage<any>(key);
      const filteredData = data.filter((item: any) => item.userId !== userId);
      this.saveToStorage(key, filteredData);
    });
  }
}

// Export singleton instance
const dataStorageService = DataStorageService.getInstance();
export default dataStorageService;