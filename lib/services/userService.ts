// User Service - CRUD operations for User model
// Handles user management, profile updates, and user-related queries

import { prisma } from '../prisma';
import { User, Prisma } from '@prisma/client';

export interface CreateUserData {
  email: string;
  name?: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: Date;
  gender?: string;
  address?: string;
  emergencyContact?: string;
  bloodGroup?: string;
  allergies?: string[];
  chronicConditions?: string[];
}

export interface UpdateUserData {
  name?: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: Date;
  gender?: string;
  address?: string;
  emergencyContact?: string;
  bloodGroup?: string;
  allergies?: string[];
  chronicConditions?: string[];
}

export interface UserWithRelations extends User {
  medicalRecords?: any[];
  prescriptions?: any[];
  appointments?: any[];
  medicineReminders?: any[];
  reports?: any[];
  chatSessions?: any[];
}

class UserService {
  // Create a new user
  async createUser(data: CreateUserData): Promise<User> {
    try {
      const user = await prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          phone: data.phone,
          avatar: data.avatar,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          address: data.address,
          emergencyContact: data.emergencyContact,
          bloodGroup: data.bloodGroup,
          allergies: data.allergies || [],
          chronicConditions: data.chronicConditions || [],
        },
      });
      return user;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('User with this email already exists');
        }
      }
      throw new Error(`Failed to create user: ${error}`);
    }
  }

  // Get user by ID
  async getUserById(id: string, includeRelations = false): Promise<UserWithRelations | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: includeRelations ? {
          medicalRecords: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          prescriptions: {
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: {
              medicines: {
                include: {
                  medicine: true,
                },
              },
            },
          },
          appointments: {
            orderBy: { appointmentDate: 'desc' },
            take: 10,
            include: {
              doctor: true,
            },
          },
          medicineReminders: {
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
          },
          reports: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          chatSessions: {
            where: { isActive: true },
            orderBy: { updatedAt: 'desc' },
            take: 5,
          },
        } : undefined,
      });
      return user;
    } catch (error) {
      throw new Error(`Failed to get user: ${error}`);
    }
  }

  // Get user by email
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });
      return user;
    } catch (error) {
      throw new Error(`Failed to get user by email: ${error}`);
    }
  }

  // Update user
  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: {
          name: data.name,
          phone: data.phone,
          avatar: data.avatar,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          address: data.address,
          emergencyContact: data.emergencyContact,
          bloodGroup: data.bloodGroup,
          allergies: data.allergies,
          chronicConditions: data.chronicConditions,
        },
      });
      return user;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('User not found');
        }
      }
      throw new Error(`Failed to update user: ${error}`);
    }
  }

  // Delete user
  async deleteUser(id: string): Promise<void> {
    try {
      await prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('User not found');
        }
      }
      throw new Error(`Failed to delete user: ${error}`);
    }
  }

  // Get all users with pagination
  async getUsers(page = 1, limit = 10): Promise<{ users: User[]; total: number; pages: number }> {
    try {
      const skip = (page - 1) * limit;
      
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count(),
      ]);

      const pages = Math.ceil(total / limit);

      return { users, total, pages };
    } catch (error) {
      throw new Error(`Failed to get users: ${error}`);
    }
  }

  // Search users by name or email
  async searchUsers(query: string, page = 1, limit = 10): Promise<{ users: User[]; total: number; pages: number }> {
    try {
      const skip = (page - 1) * limit;
      
      const whereClause = {
        OR: [
          { name: { contains: query, mode: 'insensitive' as const } },
          { email: { contains: query, mode: 'insensitive' as const } },
        ],
      };

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where: whereClause }),
      ]);

      const pages = Math.ceil(total / limit);

      return { users, total, pages };
    } catch (error) {
      throw new Error(`Failed to search users: ${error}`);
    }
  }

  // Get user statistics
  async getUserStats(userId: string): Promise<{
    totalMedicalRecords: number;
    totalPrescriptions: number;
    totalAppointments: number;
    activeMedicineReminders: number;
    totalReports: number;
  }> {
    try {
      const [medicalRecords, prescriptions, appointments, medicineReminders, reports] = await Promise.all([
        prisma.medicalRecord.count({ where: { userId } }),
        prisma.prescription.count({ where: { userId } }),
        prisma.appointment.count({ where: { userId } }),
        prisma.medicineReminder.count({ where: { userId, isActive: true } }),
        prisma.report.count({ where: { userId } }),
      ]);

      return {
        totalMedicalRecords: medicalRecords,
        totalPrescriptions: prescriptions,
        totalAppointments: appointments,
        activeMedicineReminders: medicineReminders,
        totalReports: reports,
      };
    } catch (error) {
      throw new Error(`Failed to get user stats: ${error}`);
    }
  }

  // Check if user exists
  async userExists(email: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });
      return !!user;
    } catch (error) {
      throw new Error(`Failed to check if user exists: ${error}`);
    }
  }
}

export const userService = new UserService();
export default userService;