// Medicine Service - CRUD operations for Medicine management
// Handles medicine database, inventory, and medicine information

import { prisma } from '../prisma';
import { Medicine, Prisma } from '@prisma/client';

export interface CreateMedicineData {
  name: string;
  genericName?: string;
  brand?: string;
  category?: string;
  dosageForm?: string;
  strength?: string;
  manufacturer?: string;
  price?: number;
  description?: string;
  sideEffects?: string[];
  contraindications?: string[];
  isAvailable?: boolean;
}

export interface UpdateMedicineData {
  name?: string;
  genericName?: string;
  brand?: string;
  category?: string;
  dosageForm?: string;
  strength?: string;
  manufacturer?: string;
  price?: number;
  description?: string;
  sideEffects?: string[];
  contraindications?: string[];
  isAvailable?: boolean;
}

export interface MedicineSearchFilters {
  category?: string;
  dosageForm?: string;
  manufacturer?: string;
  priceRange?: {
    min?: number;
    max?: number;
  };
  isAvailable?: boolean;
}

class MedicineService {
  // Create a new medicine
  async createMedicine(data: CreateMedicineData): Promise<Medicine> {
    try {
      const medicine = await prisma.medicine.create({
        data: {
          name: data.name,
          genericName: data.genericName,
          brand: data.brand,
          category: data.category,
          dosageForm: data.dosageForm,
          strength: data.strength,
          manufacturer: data.manufacturer,
          price: data.price,
          description: data.description,
          sideEffects: data.sideEffects || [],
          contraindications: data.contraindications || [],
          isAvailable: data.isAvailable ?? true,
        },
      });
      return medicine;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('Medicine with this name already exists');
        }
      }
      throw new Error(`Failed to create medicine: ${error}`);
    }
  }

  // Get medicine by ID
  async getMedicineById(id: string): Promise<Medicine | null> {
    try {
      const medicine = await prisma.medicine.findUnique({
        where: { id },
      });
      return medicine;
    } catch (error) {
      throw new Error(`Failed to get medicine: ${error}`);
    }
  }

  // Get all medicines with pagination and filters
  async getMedicines(
    page = 1,
    limit = 20,
    filters: MedicineSearchFilters = {}
  ): Promise<{ medicines: Medicine[]; total: number; pages: number }> {
    try {
      const skip = (page - 1) * limit;
      
      const whereClause: any = {};
      
      if (filters.category) {
        whereClause.category = {
          contains: filters.category,
          mode: 'insensitive',
        };
      }
      
      if (filters.dosageForm) {
        whereClause.dosageForm = {
          contains: filters.dosageForm,
          mode: 'insensitive',
        };
      }
      
      if (filters.manufacturer) {
        whereClause.manufacturer = {
          contains: filters.manufacturer,
          mode: 'insensitive',
        };
      }
      
      if (filters.priceRange) {
        whereClause.price = {};
        if (filters.priceRange.min !== undefined) {
          whereClause.price.gte = filters.priceRange.min;
        }
        if (filters.priceRange.max !== undefined) {
          whereClause.price.lte = filters.priceRange.max;
        }
      }
      
      if (filters.isAvailable !== undefined) {
        whereClause.isAvailable = filters.isAvailable;
      }

      const [medicines, total] = await Promise.all([
        prisma.medicine.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { name: 'asc' },
        }),
        prisma.medicine.count({ where: whereClause }),
      ]);

      const pages = Math.ceil(total / limit);

      return { medicines, total, pages };
    } catch (error) {
      throw new Error(`Failed to get medicines: ${error}`);
    }
  }

  // Search medicines by name or generic name
  async searchMedicines(
    query: string,
    page = 1,
    limit = 20,
    filters: MedicineSearchFilters = {}
  ): Promise<{ medicines: Medicine[]; total: number; pages: number }> {
    try {
      const skip = (page - 1) * limit;
      
      const whereClause: any = {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { genericName: { contains: query, mode: 'insensitive' } },
          { brand: { contains: query, mode: 'insensitive' } },
        ],
      };
      
      // Apply additional filters
      if (filters.category) {
        whereClause.category = {
          contains: filters.category,
          mode: 'insensitive',
        };
      }
      
      if (filters.dosageForm) {
        whereClause.dosageForm = {
          contains: filters.dosageForm,
          mode: 'insensitive',
        };
      }
      
      if (filters.manufacturer) {
        whereClause.manufacturer = {
          contains: filters.manufacturer,
          mode: 'insensitive',
        };
      }
      
      if (filters.priceRange) {
        whereClause.price = {};
        if (filters.priceRange.min !== undefined) {
          whereClause.price.gte = filters.priceRange.min;
        }
        if (filters.priceRange.max !== undefined) {
          whereClause.price.lte = filters.priceRange.max;
        }
      }
      
      if (filters.isAvailable !== undefined) {
        whereClause.isAvailable = filters.isAvailable;
      }

      const [medicines, total] = await Promise.all([
        prisma.medicine.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { name: 'asc' },
        }),
        prisma.medicine.count({ where: whereClause }),
      ]);

      const pages = Math.ceil(total / limit);

      return { medicines, total, pages };
    } catch (error) {
      throw new Error(`Failed to search medicines: ${error}`);
    }
  }

  // Update medicine
  async updateMedicine(id: string, data: UpdateMedicineData): Promise<Medicine> {
    try {
      const medicine = await prisma.medicine.update({
        where: { id },
        data: {
          name: data.name,
          genericName: data.genericName,
          brand: data.brand,
          category: data.category,
          dosageForm: data.dosageForm,
          strength: data.strength,
          manufacturer: data.manufacturer,
          price: data.price,
          description: data.description,
          sideEffects: data.sideEffects,
          contraindications: data.contraindications,
          isAvailable: data.isAvailable,
        },
      });
      return medicine;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Medicine not found');
        }
        if (error.code === 'P2002') {
          throw new Error('Medicine with this name already exists');
        }
      }
      throw new Error(`Failed to update medicine: ${error}`);
    }
  }

  // Delete medicine
  async deleteMedicine(id: string): Promise<void> {
    try {
      await prisma.medicine.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Medicine not found');
        }
        if (error.code === 'P2003') {
          throw new Error('Cannot delete medicine that is referenced in prescriptions');
        }
      }
      throw new Error(`Failed to delete medicine: ${error}`);
    }
  }

  // Get medicines by category
  async getMedicinesByCategory(category: string): Promise<Medicine[]> {
    try {
      const medicines = await prisma.medicine.findMany({
        where: {
          category: {
            contains: category,
            mode: 'insensitive',
          },
          isAvailable: true,
        },
        orderBy: { name: 'asc' },
      });
      return medicines;
    } catch (error) {
      throw new Error(`Failed to get medicines by category: ${error}`);
    }
  }

  // Get available medicines
  async getAvailableMedicines(page = 1, limit = 20): Promise<{ medicines: Medicine[]; total: number; pages: number }> {
    try {
      const skip = (page - 1) * limit;
      
      const [medicines, total] = await Promise.all([
        prisma.medicine.findMany({
          where: { isAvailable: true },
          skip,
          take: limit,
          orderBy: { name: 'asc' },
        }),
        prisma.medicine.count({ where: { isAvailable: true } }),
      ]);

      const pages = Math.ceil(total / limit);

      return { medicines, total, pages };
    } catch (error) {
      throw new Error(`Failed to get available medicines: ${error}`);
    }
  }

  // Get medicine categories
  async getMedicineCategories(): Promise<string[]> {
    try {
      const categories = await prisma.medicine.findMany({
        select: { category: true },
        where: {
          category: { not: null },
        },
        distinct: ['category'],
      });
      return categories.map(c => c.category!).filter(Boolean).sort();
    } catch (error) {
      throw new Error(`Failed to get medicine categories: ${error}`);
    }
  }

  // Get medicine manufacturers
  async getMedicineManufacturers(): Promise<string[]> {
    try {
      const manufacturers = await prisma.medicine.findMany({
        select: { manufacturer: true },
        where: {
          manufacturer: { not: null },
        },
        distinct: ['manufacturer'],
      });
      return manufacturers.map(m => m.manufacturer!).filter(Boolean).sort();
    } catch (error) {
      throw new Error(`Failed to get medicine manufacturers: ${error}`);
    }
  }

  // Get medicine dosage forms
  async getMedicineDosageForms(): Promise<string[]> {
    try {
      const dosageForms = await prisma.medicine.findMany({
        select: { dosageForm: true },
        where: {
          dosageForm: { not: null },
        },
        distinct: ['dosageForm'],
      });
      return dosageForms.map(d => d.dosageForm!).filter(Boolean).sort();
    } catch (error) {
      throw new Error(`Failed to get medicine dosage forms: ${error}`);
    }
  }

  // Get medicine statistics
  async getMedicineStats(): Promise<{
    totalMedicines: number;
    availableMedicines: number;
    unavailableMedicines: number;
    totalCategories: number;
    totalManufacturers: number;
    averagePrice: number;
  }> {
    try {
      const [totalMedicines, availableMedicines, categories, manufacturers, priceStats] = await Promise.all([
        prisma.medicine.count(),
        prisma.medicine.count({ where: { isAvailable: true } }),
        prisma.medicine.findMany({
          select: { category: true },
          where: { category: { not: null } },
          distinct: ['category'],
        }),
        prisma.medicine.findMany({
          select: { manufacturer: true },
          where: { manufacturer: { not: null } },
          distinct: ['manufacturer'],
        }),
        prisma.medicine.aggregate({
          _avg: { price: true },
          where: { price: { not: null } },
        }),
      ]);

      return {
        totalMedicines,
        availableMedicines,
        unavailableMedicines: totalMedicines - availableMedicines,
        totalCategories: categories.length,
        totalManufacturers: manufacturers.length,
        averagePrice: priceStats._avg.price || 0,
      };
    } catch (error) {
      throw new Error(`Failed to get medicine stats: ${error}`);
    }
  }

  // Check medicine availability
  async checkMedicineAvailability(id: string): Promise<boolean> {
    try {
      const medicine = await prisma.medicine.findUnique({
        where: { id },
        select: { isAvailable: true },
      });
      return medicine?.isAvailable || false;
    } catch (error) {
      throw new Error(`Failed to check medicine availability: ${error}`);
    }
  }

  // Update medicine availability
  async updateMedicineAvailability(id: string, isAvailable: boolean): Promise<Medicine> {
    try {
      const medicine = await prisma.medicine.update({
        where: { id },
        data: { isAvailable },
      });
      return medicine;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('Medicine not found');
        }
      }
      throw new Error(`Failed to update medicine availability: ${error}`);
    }
  }
}

export const medicineService = new MedicineService();
export default medicineService;