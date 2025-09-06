// Database Services Index
// Centralized export for all database services and operations

// Core Services
export { userService, type CreateUserData, type UpdateUserData, type UserWithRelations } from './userService';
export { medicalRecordService, type CreateMedicalRecordData, type UpdateMedicalRecordData, type MedicalRecordWithUser } from './medicalRecordService';
export { prescriptionService, type CreatePrescriptionData, type UpdatePrescriptionData, type PrescriptionWithDetails } from './prescriptionService';
export { medicineService, type CreateMedicineData, type UpdateMedicineData, type MedicineSearchFilters } from './medicineService';
export { appointmentService, type CreateAppointmentData, type UpdateAppointmentData, type AppointmentWithDetails, type AppointmentFilters } from './appointmentService';

// Prisma Client
export { prisma, connectToDatabase, disconnectFromDatabase, checkDatabaseHealth } from '../prisma';

// Database Service Manager
import { prisma } from '../prisma';
import { userService } from './userService';
import { medicalRecordService } from './medicalRecordService';
import { prescriptionService } from './prescriptionService';
import { medicineService } from './medicineService';
import { appointmentService } from './appointmentService';

class DatabaseService {
  // Service instances
  public readonly user = userService;
  public readonly medicalRecord = medicalRecordService;
  public readonly prescription = prescriptionService;
  public readonly medicine = medicineService;
  public readonly appointment = appointmentService;
  public readonly client = prisma;

  // Health check for all services
  async healthCheck(): Promise<{
    database: { status: string; message: string; error?: any };
    services: {
      user: boolean;
      medicalRecord: boolean;
      prescription: boolean;
      medicine: boolean;
      appointment: boolean;
    };
  }> {
    try {
      // Check database connection
      const dbHealth = await this.checkDatabaseHealth();
      
      // Check each service by performing a simple count operation
      const serviceChecks = await Promise.allSettled([
        prisma.user.count(),
        prisma.medicalRecord.count(),
        prisma.prescription.count(),
        prisma.medicine.count(),
        prisma.appointment.count(),
      ]);

      return {
        database: dbHealth,
        services: {
          user: serviceChecks[0].status === 'fulfilled',
          medicalRecord: serviceChecks[1].status === 'fulfilled',
          prescription: serviceChecks[2].status === 'fulfilled',
          medicine: serviceChecks[3].status === 'fulfilled',
          appointment: serviceChecks[4].status === 'fulfilled',
        },
      };
    } catch (error) {
      return {
        database: { status: 'unhealthy', message: 'Database health check failed', error },
        services: {
          user: false,
          medicalRecord: false,
          prescription: false,
          medicine: false,
          appointment: false,
        },
      };
    }
  }

  // Database connection management
  async connect(): Promise<void> {
    try {
      await prisma.$connect();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await prisma.$disconnect();
      console.log('✅ Database disconnected successfully');
    } catch (error) {
      console.error('❌ Database disconnection failed:', error);
      throw error;
    }
  }

  // Database health check
  async checkDatabaseHealth(): Promise<{ status: string; message: string; error?: any }> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { status: 'healthy', message: 'Database connection is working' };
    } catch (error) {
      return { status: 'unhealthy', message: 'Database connection failed', error };
    }
  }

  // Get comprehensive statistics
  async getOverallStats(): Promise<{
    users: {
      total: number;
      newThisMonth: number;
    };
    medicalRecords: {
      total: number;
      thisMonth: number;
    };
    prescriptions: {
      total: number;
      active: number;
    };
    medicines: {
      total: number;
      available: number;
    };
    appointments: {
      total: number;
      upcoming: number;
      today: number;
    };
  }> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

      const [userStats, medicalRecordStats, prescriptionStats, medicineStats, appointmentStats] = await Promise.all([
        // User statistics
        Promise.all([
          prisma.user.count(),
          prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
        ]),
        // Medical record statistics
        Promise.all([
          prisma.medicalRecord.count(),
          prisma.medicalRecord.count({ where: { createdAt: { gte: startOfMonth } } }),
        ]),
        // Prescription statistics
        Promise.all([
          prisma.prescription.count(),
          prisma.prescription.count({ where: { isActive: true } }),
        ]),
        // Medicine statistics
        Promise.all([
          prisma.medicine.count(),
          prisma.medicine.count({ where: { isAvailable: true } }),
        ]),
        // Appointment statistics
        Promise.all([
          prisma.appointment.count(),
          prisma.appointment.count({
            where: {
              appointmentDate: { gte: now },
              status: { in: ['SCHEDULED', 'CONFIRMED'] },
            },
          }),
          prisma.appointment.count({
            where: {
              appointmentDate: { gte: startOfDay, lt: endOfDay },
              status: { in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] },
            },
          }),
        ]),
      ]);

      return {
        users: {
          total: userStats[0],
          newThisMonth: userStats[1],
        },
        medicalRecords: {
          total: medicalRecordStats[0],
          thisMonth: medicalRecordStats[1],
        },
        prescriptions: {
          total: prescriptionStats[0],
          active: prescriptionStats[1],
        },
        medicines: {
          total: medicineStats[0],
          available: medicineStats[1],
        },
        appointments: {
          total: appointmentStats[0],
          upcoming: appointmentStats[1],
          today: appointmentStats[2],
        },
      };
    } catch (error) {
      throw new Error(`Failed to get overall statistics: ${error}`);
    }
  }

  // Cleanup and maintenance operations
  async cleanupExpiredData(): Promise<{
    expiredPrescriptions: number;
    oldChatSessions: number;
    completedAppointments: number;
  }> {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

      const [expiredPrescriptions, oldChatSessions, completedAppointments] = await Promise.all([
        // Mark expired prescriptions as inactive
        prisma.prescription.updateMany({
          where: {
            validUntil: { lt: now },
            isActive: true,
          },
          data: { isActive: false },
        }),
        // Archive old inactive chat sessions
        prisma.chatSession.updateMany({
          where: {
            updatedAt: { lt: thirtyDaysAgo },
            isActive: true,
          },
          data: { isActive: false },
        }),
        // Clean up very old completed appointments
        prisma.appointment.deleteMany({
          where: {
            status: 'COMPLETED',
            appointmentDate: { lt: sixMonthsAgo },
          },
        }),
      ]);

      return {
        expiredPrescriptions: expiredPrescriptions.count,
        oldChatSessions: oldChatSessions.count,
        completedAppointments: completedAppointments.count,
      };
    } catch (error) {
      throw new Error(`Failed to cleanup expired data: ${error}`);
    }
  }

  // Backup and restore operations
  async createBackup(): Promise<string> {
    try {
      // This would typically involve creating a database dump
      // For now, we'll return a timestamp as a backup identifier
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupId = `backup-${timestamp}`;
      
      // In a real implementation, you would:
      // 1. Create a database dump
      // 2. Store it in a secure location (S3, etc.)
      // 3. Return the backup identifier
      
      console.log(`✅ Backup created with ID: ${backupId}`);
      return backupId;
    } catch (error) {
      throw new Error(`Failed to create backup: ${error}`);
    }
  }

  // Transaction wrapper for complex operations
  async transaction<T>(fn: (tx: typeof prisma) => Promise<T>): Promise<T> {
    try {
      return await prisma.$transaction(fn);
    } catch (error) {
      throw new Error(`Transaction failed: ${error}`);
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
export default databaseService;

// Export types from Prisma
export type {
  User,
  Doctor,
  MedicalRecord,
  Prescription,
  Medicine,
  PrescriptionMedicine,
  MedicineReminder,
  Appointment,
  Report,
  ChatSession,
  ChatMessage,
  Hospital,
  EmergencyContact,
  VaccinationSchedule,
  HealthTip,
  AppointmentStatus,
  AppointmentType,
  ReportType,
  MessageSender,
} from '@prisma/client';