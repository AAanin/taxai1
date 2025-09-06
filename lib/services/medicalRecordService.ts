// Medical Record Service - CRUD operations for Medical Records
// Handles patient medical history, diagnoses, treatments, and symptoms

import { prisma } from '../prisma';
import { MedicalRecord, Prisma } from '@prisma/client';

export interface CreateMedicalRecordData {
  userId: string;
  title: string;
  description: string;
  diagnosis?: string;
  symptoms?: string[];
  treatment?: string;
  notes?: string;
  recordDate?: Date;
}

export interface UpdateMedicalRecordData {
  title?: string;
  description?: string;
  diagnosis?: string;
  symptoms?: string[];
  treatment?: string;
  notes?: string;
  recordDate?: Date;
}

export interface MedicalRecordWithUser extends MedicalRecord {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

class MedicalRecordService {
  // Create a new medical record
  async createMedicalRecord(data: CreateMedicalRecordData): Promise<MedicalRecord> {
    try {
      const medicalRecord = await prisma.medicalRecord.create({
        data: {
          userId: data.userId,
          title: data.title,
          description: data.description,
          diagnosis: data.diagnosis,
          symptoms: data.symptoms || [],
          treatment: data.treatment,
          notes: data.notes,
          recordDate: data.recordDate || new Date(),
        },
      });
      return medicalRecord;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new Error('User not found');
        }
      }
      throw new Error(`Failed to create medical record: ${error}`);
    }
  }

  // Get medical record by ID
  async getMedicalRecordById(id: string, includeUser = false): Promise<MedicalRecordWithUser | MedicalRecord | null> {
    try {
      const medicalRecord = await prisma.medicalRecord.findUnique({
        where: { id },
        include: includeUser ? {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        } : undefined,
      });
      return medicalRecord;
    } catch (error) {
      throw new Error(`Failed to get medical record: ${error}`);
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
  async updateMedicalRecord(id: string, data: UpdateMedicalRecordData): Promise<MedicalRecord> {
    try {
      const medicalRecord = await prisma.medicalRecord.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          diagnosis: data.diagnosis,
          symptoms: data.symptoms,
          treatment: data.treatment,
          notes: data.notes,
          recordDate: data.recordDate,
        },
      });
      return medicalRecord;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Medical record not found');
        }
      }
      throw new Error(`Failed to update medical record: ${error}`);
    }
  }

  // Delete medical record
  async deleteMedicalRecord(id: string): Promise<void> {
    try {
      await prisma.medicalRecord.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Medical record not found');
        }
      }
      throw new Error(`Failed to delete medical record: ${error}`);
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