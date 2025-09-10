// Medical Record Service
// Handles all medical record-related database operations

import { supabase } from '../supabase';
import type { Database } from '../supabase';

// Types
export interface CreateMedicalRecordData {
  userId: string;
  recordType: string;
  title: string;
  description?: string;
  fileUrl?: string;
  fileType?: string;
  doctorName?: string;
  hospitalName?: string;
  dateRecorded: string; // Date in YYYY-MM-DD format
  tags?: string[];
  metadata?: any;
}

export interface UpdateMedicalRecordData {
  recordType?: string;
  title?: string;
  description?: string;
  fileUrl?: string;
  fileType?: string;
  doctorName?: string;
  hospitalName?: string;
  dateRecorded?: string;
  tags?: string[];
  metadata?: any;
}

export interface MedicalRecordWithUser {
  id: string;
  user_id: string;
  record_type: string;
  title: string;
  description?: string;
  file_url?: string;
  file_type?: string;
  doctor_name?: string;
  hospital_name?: string;
  date_recorded: string;
  tags: string[];
  metadata: any;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

class MedicalRecordService {
  // Create a new medical record
  async createMedicalRecord(data: CreateMedicalRecordData): Promise<MedicalRecordWithUser> {
    try {
      // Verify user exists
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', data.userId)
        .single();

      if (userError || !user) {
        throw new Error('User not found');
      }

      const { data: record, error } = await supabase
        .from('medical_records')
        .insert({
          user_id: data.userId,
          record_type: data.recordType,
          title: data.title,
          description: data.description,
          file_url: data.fileUrl,
          file_type: data.fileType,
          doctor_name: data.doctorName,
          hospital_name: data.hospitalName,
          date_recorded: data.dateRecorded,
          tags: data.tags || [],
          metadata: data.metadata || {},
        })
        .select('*')
        .single();

      if (error) {
        throw new Error(`Failed to create medical record: ${error.message}`);
      }

      return record;
    } catch (error) {
      console.error('Error creating medical record:', error);
      throw error;
    }
  }

  // Get medical record by ID
  async getMedicalRecordById(id: string, includeUser = false): Promise<MedicalRecordWithUser | null> {
    try {
      let query = supabase
        .from('medical_records')
        .select('*')
        .eq('id', id);

      if (includeUser) {
        query = supabase
          .from('medical_records')
          .select(`
            *,
            user:users(id, email, name)
          `)
          .eq('id', id);
      }

      const { data: record, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Record not found
        }
        throw new Error(`Failed to fetch medical record: ${error.message}`);
      }

      return record;
    } catch (error) {
      console.error('Error fetching medical record:', error);
      throw error;
    }
  }

  // Get medical records by user ID
  async getMedicalRecordsByUserId(
    userId: string,
    page = 1,
    limit = 10
  ): Promise<{ records: MedicalRecord[]; total: number; pages: number }> {
    try {
      const skip = (page - 1) * limit;
      
      const [records, total] = await Promise.all([
        prisma.medicalRecord.findMany({
          where: { userId },
          skip,
          take: limit,
          orderBy: { recordDate: 'desc' },
        }),
        prisma.medicalRecord.count({ where: { userId } }),
      ]);

      const pages = Math.ceil(total / limit);

      return { records, total, pages };
    } catch (error) {
      throw new Error(`Failed to get medical records: ${error}`);
    }
  }

  // Update medical record
  async updateMedicalRecord(id: string, data: UpdateMedicalRecordData): Promise<MedicalRecordWithUser> {
    try {
      const updateData: any = {};
      
      if (data.recordType !== undefined) updateData.record_type = data.recordType;
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.fileUrl !== undefined) updateData.file_url = data.fileUrl;
      if (data.fileType !== undefined) updateData.file_type = data.fileType;
      if (data.doctorName !== undefined) updateData.doctor_name = data.doctorName;
      if (data.hospitalName !== undefined) updateData.hospital_name = data.hospitalName;
      if (data.dateRecorded !== undefined) updateData.date_recorded = data.dateRecorded;
      if (data.tags !== undefined) updateData.tags = data.tags;
      if (data.metadata !== undefined) updateData.metadata = data.metadata;
      
      updateData.updated_at = new Date().toISOString();

      const { data: record, error } = await supabase
        .from('medical_records')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Medical record not found');
        }
        throw new Error(`Failed to update medical record: ${error.message}`);
      }

      return record;
    } catch (error) {
      console.error('Error updating medical record:', error);
      throw error;
    }
  }

  // Delete medical record
  async deleteMedicalRecord(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('medical_records')
        .delete()
        .eq('id', id);

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Medical record not found');
        }
        throw new Error(`Failed to delete medical record: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting medical record:', error);
      throw error;
    }
  }

  // Search medical records by symptoms or diagnosis
  async searchMedicalRecords(
    userId: string,
    query: string,
    page = 1,
    limit = 10
  ): Promise<{ records: MedicalRecord[]; total: number; pages: number }> {
    try {
      const skip = (page - 1) * limit;
      
      const whereClause = {
        userId,
        OR: [
          { title: { contains: query, mode: 'insensitive' as const } },
          { description: { contains: query, mode: 'insensitive' as const } },
          { diagnosis: { contains: query, mode: 'insensitive' as const } },
          { treatment: { contains: query, mode: 'insensitive' as const } },
          { symptoms: { has: query } },
        ],
      };

      const [records, total] = await Promise.all([
        prisma.medicalRecord.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { recordDate: 'desc' },
        }),
        prisma.medicalRecord.count({ where: whereClause }),
      ]);

      const pages = Math.ceil(total / limit);

      return { records, total, pages };
    } catch (error) {
      throw new Error(`Failed to search medical records: ${error}`);
    }
  }

  // Get medical records by date range
  async getMedicalRecordsByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<MedicalRecord[]> {
    try {
      const records = await prisma.medicalRecord.findMany({
        where: {
          userId,
          recordDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { recordDate: 'desc' },
      });
      return records;
    } catch (error) {
      throw new Error(`Failed to get medical records by date range: ${error}`);
    }
  }

  // Get recent medical records
  async getRecentMedicalRecords(userId: string, limit = 5): Promise<MedicalRecord[]> {
    try {
      const records = await prisma.medicalRecord.findMany({
        where: { userId },
        take: limit,
        orderBy: { recordDate: 'desc' },
      });
      return records;
    } catch (error) {
      throw new Error(`Failed to get recent medical records: ${error}`);
    }
  }

  // Get medical records by diagnosis
  async getMedicalRecordsByDiagnosis(
    userId: string,
    diagnosis: string
  ): Promise<MedicalRecord[]> {
    try {
      const records = await prisma.medicalRecord.findMany({
        where: {
          userId,
          diagnosis: {
            contains: diagnosis,
            mode: 'insensitive',
          },
        },
        orderBy: { recordDate: 'desc' },
      });
      return records;
    } catch (error) {
      throw new Error(`Failed to get medical records by diagnosis: ${error}`);
    }
  }

  // Get medical records statistics
  async getMedicalRecordStats(userId: string): Promise<{
    totalRecords: number;
    recordsThisMonth: number;
    recordsThisYear: number;
    commonSymptoms: string[];
    commonDiagnoses: string[];
  }> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      const [totalRecords, recordsThisMonth, recordsThisYear, allRecords] = await Promise.all([
        prisma.medicalRecord.count({ where: { userId } }),
        prisma.medicalRecord.count({
          where: {
            userId,
            recordDate: { gte: startOfMonth },
          },
        }),
        prisma.medicalRecord.count({
          where: {
            userId,
            recordDate: { gte: startOfYear },
          },
        }),
        prisma.medicalRecord.findMany({
          where: { userId },
          select: { symptoms: true, diagnosis: true },
        }),
      ]);

      // Extract common symptoms and diagnoses
      const symptomsMap = new Map<string, number>();
      const diagnosesMap = new Map<string, number>();

      allRecords.forEach((record) => {
        record.symptoms.forEach((symptom) => {
          symptomsMap.set(symptom, (symptomsMap.get(symptom) || 0) + 1);
        });
        
        if (record.diagnosis) {
          diagnosesMap.set(record.diagnosis, (diagnosesMap.get(record.diagnosis) || 0) + 1);
        }
      });

      const commonSymptoms = Array.from(symptomsMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([symptom]) => symptom);

      const commonDiagnoses = Array.from(diagnosesMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([diagnosis]) => diagnosis);

      return {
        totalRecords,
        recordsThisMonth,
        recordsThisYear,
        commonSymptoms,
        commonDiagnoses,
      };
    } catch (error) {
      throw new Error(`Failed to get medical record stats: ${error}`);
    }
  }
}

export const medicalRecordService = new MedicalRecordService();
export default medicalRecordService;