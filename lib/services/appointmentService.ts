// Appointment Service - CRUD operations for Appointments
// Handles appointment scheduling, management, and doctor-patient interactions

import { prisma } from '../prisma';
import { Appointment, AppointmentStatus, AppointmentType, Prisma } from '@prisma/client';

export interface CreateAppointmentData {
  userId: string;
  doctorId: string;
  title?: string;
  description?: string;
  appointmentDate: Date;
  duration?: number;
  type?: AppointmentType;
  notes?: string;
}

export interface UpdateAppointmentData {
  title?: string;
  description?: string;
  appointmentDate?: Date;
  duration?: number;
  status?: AppointmentStatus;
  type?: AppointmentType;
  notes?: string;
}

export interface AppointmentWithDetails extends Appointment {
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
  };
  doctor: {
    id: string;
    name: string;
    specialization: string;
    phone: string | null;
    hospital: string | null;
  };
}

export interface AppointmentFilters {
  status?: AppointmentStatus;
  type?: AppointmentType;
  dateRange?: {
    start: Date;
    end: Date;
  };
  doctorId?: string;
}

class AppointmentService {
  // Create a new appointment
  async createAppointment(data: CreateAppointmentData): Promise<AppointmentWithDetails> {
    try {
      // Check if the time slot is available
      const conflictingAppointment = await this.checkTimeSlotAvailability(
        data.doctorId,
        data.appointmentDate,
        data.duration || 30
      );

      if (conflictingAppointment) {
        throw new Error('Time slot is not available');
      }

      const appointment = await prisma.appointment.create({
        data: {
          userId: data.userId,
          doctorId: data.doctorId,
          title: data.title,
          description: data.description,
          appointmentDate: data.appointmentDate,
          duration: data.duration || 30,
          type: data.type || AppointmentType.CONSULTATION,
          notes: data.notes,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          doctor: {
            select: {
              id: true,
              name: true,
              specialization: true,
              phone: true,
              hospital: true,
            },
          },
        },
      });
      return appointment;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new Error('User or Doctor not found');
        }
      }
      throw new Error(`Failed to create appointment: ${error}`);
    }
  }

  // Get appointment by ID
  async getAppointmentById(id: string): Promise<AppointmentWithDetails | null> {
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          doctor: {
            select: {
              id: true,
              name: true,
              specialization: true,
              phone: true,
              hospital: true,
            },
          },
        },
      });
      return appointment;
    } catch (error) {
      throw new Error(`Failed to get appointment: ${error}`);
    }
  }

  // Get appointments by user ID
  async getAppointmentsByUserId(
    userId: string,
    page = 1,
    limit = 10,
    filters: AppointmentFilters = {}
  ): Promise<{ appointments: AppointmentWithDetails[]; total: number; pages: number }> {
    try {
      const skip = (page - 1) * limit;
      
      const whereClause: any = { userId };
      
      if (filters.status) {
        whereClause.status = filters.status;
      }
      
      if (filters.type) {
        whereClause.type = filters.type;
      }
      
      if (filters.dateRange) {
        whereClause.appointmentDate = {
          gte: filters.dateRange.start,
          lte: filters.dateRange.end,
        };
      }
      
      if (filters.doctorId) {
        whereClause.doctorId = filters.doctorId;
      }

      const [appointments, total] = await Promise.all([
        prisma.appointment.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { appointmentDate: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            doctor: {
              select: {
                id: true,
                name: true,
                specialization: true,
                phone: true,
                hospital: true,
              },
            },
          },
        }),
        prisma.appointment.count({ where: whereClause }),
      ]);

      const pages = Math.ceil(total / limit);

      return { appointments, total, pages };
    } catch (error) {
      throw new Error(`Failed to get appointments: ${error}`);
    }
  }

  // Get appointments by doctor ID
  async getAppointmentsByDoctorId(
    doctorId: string,
    page = 1,
    limit = 10,
    filters: AppointmentFilters = {}
  ): Promise<{ appointments: AppointmentWithDetails[]; total: number; pages: number }> {
    try {
      const skip = (page - 1) * limit;
      
      const whereClause: any = { doctorId };
      
      if (filters.status) {
        whereClause.status = filters.status;
      }
      
      if (filters.type) {
        whereClause.type = filters.type;
      }
      
      if (filters.dateRange) {
        whereClause.appointmentDate = {
          gte: filters.dateRange.start,
          lte: filters.dateRange.end,
        };
      }

      const [appointments, total] = await Promise.all([
        prisma.appointment.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { appointmentDate: 'asc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            doctor: {
              select: {
                id: true,
                name: true,
                specialization: true,
                phone: true,
                hospital: true,
              },
            },
          },
        }),
        prisma.appointment.count({ where: whereClause }),
      ]);

      const pages = Math.ceil(total / limit);

      return { appointments, total, pages };
    } catch (error) {
      throw new Error(`Failed to get doctor appointments: ${error}`);
    }
  }

  // Update appointment
  async updateAppointment(id: string, data: UpdateAppointmentData): Promise<AppointmentWithDetails> {
    try {
      // If updating appointment date, check availability
      if (data.appointmentDate) {
        const existingAppointment = await prisma.appointment.findUnique({
          where: { id },
          select: { doctorId: true, duration: true },
        });

        if (existingAppointment) {
          const conflictingAppointment = await this.checkTimeSlotAvailability(
            existingAppointment.doctorId,
            data.appointmentDate,
            data.duration || existingAppointment.duration || 30,
            id // Exclude current appointment from conflict check
          );

          if (conflictingAppointment) {
            throw new Error('Time slot is not available');
          }
        }
      }

      const appointment = await prisma.appointment.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          appointmentDate: data.appointmentDate,
          duration: data.duration,
          status: data.status,
          type: data.type,
          notes: data.notes,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          doctor: {
            select: {
              id: true,
              name: true,
              specialization: true,
              phone: true,
              hospital: true,
            },
          },
        },
      });
      return appointment;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Appointment not found');
        }
      }
      throw new Error(`Failed to update appointment: ${error}`);
    }
  }

  // Cancel appointment
  async cancelAppointment(id: string, notes?: string): Promise<AppointmentWithDetails> {
    try {
      const appointment = await prisma.appointment.update({
        where: { id },
        data: {
          status: AppointmentStatus.CANCELLED,
          notes: notes || 'Appointment cancelled',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          doctor: {
            select: {
              id: true,
              name: true,
              specialization: true,
              phone: true,
              hospital: true,
            },
          },
        },
      });
      return appointment;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Appointment not found');
        }
      }
      throw new Error(`Failed to cancel appointment: ${error}`);
    }
  }

  // Delete appointment
  async deleteAppointment(id: string): Promise<void> {
    try {
      await prisma.appointment.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Appointment not found');
        }
      }
      throw new Error(`Failed to delete appointment: ${error}`);
    }
  }

  // Check time slot availability
  async checkTimeSlotAvailability(
    doctorId: string,
    appointmentDate: Date,
    duration: number,
    excludeAppointmentId?: string
  ): Promise<boolean> {
    try {
      const startTime = new Date(appointmentDate);
      const endTime = new Date(startTime.getTime() + duration * 60000); // duration in minutes

      const whereClause: any = {
        doctorId,
        status: {
          in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED, AppointmentStatus.IN_PROGRESS],
        },
        OR: [
          {
            appointmentDate: {
              gte: startTime,
              lt: endTime,
            },
          },
          {
            AND: [
              { appointmentDate: { lte: startTime } },
              {
                appointmentDate: {
                  gte: new Date(startTime.getTime() - 60 * 60000), // Check 1 hour before
                },
              },
            ],
          },
        ],
      };

      if (excludeAppointmentId) {
        whereClause.id = { not: excludeAppointmentId };
      }

      const conflictingAppointment = await prisma.appointment.findFirst({
        where: whereClause,
      });

      return !!conflictingAppointment;
    } catch (error) {
      throw new Error(`Failed to check time slot availability: ${error}`);
    }
  }

  // Get upcoming appointments
  async getUpcomingAppointments(
    userId: string,
    limit = 5
  ): Promise<AppointmentWithDetails[]> {
    try {
      const appointments = await prisma.appointment.findMany({
        where: {
          userId,
          appointmentDate: { gte: new Date() },
          status: {
            in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED],
          },
        },
        take: limit,
        orderBy: { appointmentDate: 'asc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          doctor: {
            select: {
              id: true,
              name: true,
              specialization: true,
              phone: true,
              hospital: true,
            },
          },
        },
      });
      return appointments;
    } catch (error) {
      throw new Error(`Failed to get upcoming appointments: ${error}`);
    }
  }

  // Get appointment statistics
  async getAppointmentStats(userId: string): Promise<{
    totalAppointments: number;
    upcomingAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    appointmentsThisMonth: number;
  }> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [totalAppointments, upcomingAppointments, completedAppointments, cancelledAppointments, appointmentsThisMonth] = await Promise.all([
        prisma.appointment.count({ where: { userId } }),
        prisma.appointment.count({
          where: {
            userId,
            appointmentDate: { gte: now },
            status: {
              in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED],
            },
          },
        }),
        prisma.appointment.count({
          where: {
            userId,
            status: AppointmentStatus.COMPLETED,
          },
        }),
        prisma.appointment.count({
          where: {
            userId,
            status: AppointmentStatus.CANCELLED,
          },
        }),
        prisma.appointment.count({
          where: {
            userId,
            appointmentDate: { gte: startOfMonth },
          },
        }),
      ]);

      return {
        totalAppointments,
        upcomingAppointments,
        completedAppointments,
        cancelledAppointments,
        appointmentsThisMonth,
      };
    } catch (error) {
      throw new Error(`Failed to get appointment stats: ${error}`);
    }
  }

  // Get available time slots for a doctor
  async getAvailableTimeSlots(
    doctorId: string,
    date: Date,
    duration = 30
  ): Promise<Date[]> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(9, 0, 0, 0); // Start at 9 AM
      
      const endOfDay = new Date(date);
      endOfDay.setHours(17, 0, 0, 0); // End at 5 PM

      const existingAppointments = await prisma.appointment.findMany({
        where: {
          doctorId,
          appointmentDate: {
            gte: startOfDay,
            lt: endOfDay,
          },
          status: {
            in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED, AppointmentStatus.IN_PROGRESS],
          },
        },
        orderBy: { appointmentDate: 'asc' },
      });

      const availableSlots: Date[] = [];
      const currentTime = new Date(startOfDay);

      while (currentTime < endOfDay) {
        const slotEnd = new Date(currentTime.getTime() + duration * 60000);
        
        // Check if this slot conflicts with any existing appointment
        const hasConflict = existingAppointments.some(appointment => {
          const appointmentStart = new Date(appointment.appointmentDate);
          const appointmentEnd = new Date(appointmentStart.getTime() + (appointment.duration || 30) * 60000);
          
          return (
            (currentTime >= appointmentStart && currentTime < appointmentEnd) ||
            (slotEnd > appointmentStart && slotEnd <= appointmentEnd) ||
            (currentTime <= appointmentStart && slotEnd >= appointmentEnd)
          );
        });

        if (!hasConflict) {
          availableSlots.push(new Date(currentTime));
        }

        currentTime.setMinutes(currentTime.getMinutes() + duration);
      }

      return availableSlots;
    } catch (error) {
      throw new Error(`Failed to get available time slots: ${error}`);
    }
  }
}

export const appointmentService = new AppointmentService();
export default appointmentService;