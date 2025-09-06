// Prescription Service - CRUD operations for Prescriptions and Medicines
// Handles prescription management, medicine tracking, and dosage information

import { prisma } from '../prisma';
import { Prescription, PrescriptionMedicine, Medicine, Prisma } from '@prisma/client';

export interface CreatePrescriptionData {
  userId: string;
  doctorId?: string;
  title: string;
  instructions?: string;
  diagnosis?: string;
  prescriptionDate?: Date;
  validUntil?: Date;
  medicines: {
    medicineId: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }[];
}

export interface UpdatePrescriptionData {
  title?: string;
  instructions?: string;
  diagnosis?: string;
  prescriptionDate?: Date;
  validUntil?: Date;
  isActive?: boolean;
}

export interface PrescriptionWithDetails extends Prescription {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  doctor?: {
    id: string;
    name: string;
    specialization: string;
  } | null;
  medicines: (PrescriptionMedicine & {
    medicine: Medicine;
  })[];
}

class PrescriptionService {
  // Create a new prescription with medicines
  async createPrescription(data: CreatePrescriptionData): Promise<PrescriptionWithDetails> {
    try {
      const prescription = await prisma.prescription.create({
        data: {
          userId: data.userId,
          doctorId: data.doctorId,
          title: data.title,
          instructions: data.instructions,
          diagnosis: data.diagnosis,
          prescriptionDate: data.prescriptionDate || new Date(),
          validUntil: data.validUntil,
          medicines: {
            create: data.medicines.map((med) => ({
              medicineId: med.medicineId,
              dosage: med.dosage,
              frequency: med.frequency,
              duration: med.duration,
              instructions: med.instructions,
            })),
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          doctor: {
            select: {
              id: true,
              name: true,
              specialization: true,
            },
          },
          medicines: {
            include: {
              medicine: true,
            },
          },
        },
      });
      return prescription;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new Error('User or Doctor not found');
        }
      }
      throw new Error(`Failed to create prescription: ${error}`);
    }
  }

  // Get prescription by ID
  async getPrescriptionById(id: string): Promise<PrescriptionWithDetails | null> {
    try {
      const prescription = await prisma.prescription.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          doctor: {
            select: {
              id: true,
              name: true,
              specialization: true,
            },
          },
          medicines: {
            include: {
              medicine: true,
            },
          },
        },
      });
      return prescription;
    } catch (error) {
      throw new Error(`Failed to get prescription: ${error}`);
    }
  }

  // Get prescriptions by user ID
  async getPrescriptionsByUserId(
    userId: string,
    page = 1,
    limit = 10,
    activeOnly = false
  ): Promise<{ prescriptions: PrescriptionWithDetails[]; total: number; pages: number }> {
    try {
      const skip = (page - 1) * limit;
      const whereClause = {
        userId,
        ...(activeOnly && { isActive: true }),
      };
      
      const [prescriptions, total] = await Promise.all([
        prisma.prescription.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { prescriptionDate: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            doctor: {
              select: {
                id: true,
                name: true,
                specialization: true,
              },
            },
            medicines: {
              include: {
                medicine: true,
              },
            },
          },
        }),
        prisma.prescription.count({ where: whereClause }),
      ]);

      const pages = Math.ceil(total / limit);

      return { prescriptions, total, pages };
    } catch (error) {
      throw new Error(`Failed to get prescriptions: ${error}`);
    }
  }

  // Update prescription
  async updatePrescription(id: string, data: UpdatePrescriptionData): Promise<PrescriptionWithDetails> {
    try {
      const prescription = await prisma.prescription.update({
        where: { id },
        data: {
          title: data.title,
          instructions: data.instructions,
          diagnosis: data.diagnosis,
          prescriptionDate: data.prescriptionDate,
          validUntil: data.validUntil,
          isActive: data.isActive,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          doctor: {
            select: {
              id: true,
              name: true,
              specialization: true,
            },
          },
          medicines: {
            include: {
              medicine: true,
            },
          },
        },
      });
      return prescription;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Prescription not found');
        }
      }
      throw new Error(`Failed to update prescription: ${error}`);
    }
  }

  // Delete prescription
  async deletePrescription(id: string): Promise<void> {
    try {
      await prisma.prescription.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Prescription not found');
        }
      }
      throw new Error(`Failed to delete prescription: ${error}`);
    }
  }

  // Add medicine to prescription
  async addMedicineToPrescription(
    prescriptionId: string,
    medicineData: {
      medicineId: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions?: string;
    }
  ): Promise<PrescriptionMedicine> {
    try {
      const prescriptionMedicine = await prisma.prescriptionMedicine.create({
        data: {
          prescriptionId,
          medicineId: medicineData.medicineId,
          dosage: medicineData.dosage,
          frequency: medicineData.frequency,
          duration: medicineData.duration,
          instructions: medicineData.instructions,
        },
      });
      return prescriptionMedicine;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('Medicine already exists in this prescription');
        }
        if (error.code === 'P2003') {
          throw new Error('Prescription or Medicine not found');
        }
      }
      throw new Error(`Failed to add medicine to prescription: ${error}`);
    }
  }

  // Remove medicine from prescription
  async removeMedicineFromPrescription(prescriptionId: string, medicineId: string): Promise<void> {
    try {
      await prisma.prescriptionMedicine.delete({
        where: {
          prescriptionId_medicineId: {
            prescriptionId,
            medicineId,
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Medicine not found in prescription');
        }
      }
      throw new Error(`Failed to remove medicine from prescription: ${error}`);
    }
  }

  // Get active prescriptions for a user
  async getActivePrescriptions(userId: string): Promise<PrescriptionWithDetails[]> {
    try {
      const prescriptions = await prisma.prescription.findMany({
        where: {
          userId,
          isActive: true,
          OR: [
            { validUntil: null },
            { validUntil: { gte: new Date() } },
          ],
        },
        orderBy: { prescriptionDate: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          doctor: {
            select: {
              id: true,
              name: true,
              specialization: true,
            },
          },
          medicines: {
            include: {
              medicine: true,
            },
          },
        },
      });
      return prescriptions;
    } catch (error) {
      throw new Error(`Failed to get active prescriptions: ${error}`);
    }
  }

  // Search prescriptions
  async searchPrescriptions(
    userId: string,
    query: string,
    page = 1,
    limit = 10
  ): Promise<{ prescriptions: PrescriptionWithDetails[]; total: number; pages: number }> {
    try {
      const skip = (page - 1) * limit;
      
      const whereClause = {
        userId,
        OR: [
          { title: { contains: query, mode: 'insensitive' as const } },
          { diagnosis: { contains: query, mode: 'insensitive' as const } },
          { instructions: { contains: query, mode: 'insensitive' as const } },
        ],
      };

      const [prescriptions, total] = await Promise.all([
        prisma.prescription.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { prescriptionDate: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            doctor: {
              select: {
                id: true,
                name: true,
                specialization: true,
              },
            },
            medicines: {
              include: {
                medicine: true,
              },
            },
          },
        }),
        prisma.prescription.count({ where: whereClause }),
      ]);

      const pages = Math.ceil(total / limit);

      return { prescriptions, total, pages };
    } catch (error) {
      throw new Error(`Failed to search prescriptions: ${error}`);
    }
  }

  // Get prescription statistics
  async getPrescriptionStats(userId: string): Promise<{
    totalPrescriptions: number;
    activePrescriptions: number;
    expiredPrescriptions: number;
    totalMedicines: number;
    commonMedicines: string[];
  }> {
    try {
      const now = new Date();
      
      const [totalPrescriptions, activePrescriptions, expiredPrescriptions, prescriptionMedicines] = await Promise.all([
        prisma.prescription.count({ where: { userId } }),
        prisma.prescription.count({
          where: {
            userId,
            isActive: true,
            OR: [
              { validUntil: null },
              { validUntil: { gte: now } },
            ],
          },
        }),
        prisma.prescription.count({
          where: {
            userId,
            validUntil: { lt: now },
          },
        }),
        prisma.prescriptionMedicine.findMany({
          where: {
            prescription: { userId },
          },
          include: {
            medicine: {
              select: { name: true },
            },
          },
        }),
      ]);

      const medicineCount = new Map<string, number>();
      prescriptionMedicines.forEach((pm) => {
        const medicineName = pm.medicine.name;
        medicineCount.set(medicineName, (medicineCount.get(medicineName) || 0) + 1);
      });

      const commonMedicines = Array.from(medicineCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name]) => name);

      return {
        totalPrescriptions,
        activePrescriptions,
        expiredPrescriptions,
        totalMedicines: prescriptionMedicines.length,
        commonMedicines,
      };
    } catch (error) {
      throw new Error(`Failed to get prescription stats: ${error}`);
    }
  }
}

export const prescriptionService = new PrescriptionService();
export default prescriptionService;