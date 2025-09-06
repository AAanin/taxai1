// API client for Dr. Mimu frontend to communicate with backend
// Provides typed interfaces for all backend endpoints

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Types for API responses
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User types
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  bloodType?: string;
  allergies?: string[];
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  profilePicture?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateUserData {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  bloodType?: string;
  allergies?: string[];
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

// Medical Record types
interface MedicalRecord {
  id: string;
  userId: string;
  diagnosis: string;
  symptoms: string[];
  treatment: string;
  medications: string[];
  notes?: string;
  visitDate: string;
  doctorName?: string;
  hospitalName?: string;
  followUpDate?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateMedicalRecordData {
  userId: string;
  diagnosis: string;
  symptoms: string[];
  treatment: string;
  medications: string[];
  notes?: string;
  visitDate: string;
  doctorName?: string;
  hospitalName?: string;
  followUpDate?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

// API client class
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    return this.request<{
      status: string;
      timestamp: string;
      uptime: number;
      database: any;
      services: any;
    }>('/health');
  }

  // Statistics
  async getStats() {
    return this.request<ApiResponse<any>>('/api/stats');
  }

  // User API methods
  async getUsers(page = 1, limit = 10) {
    return this.request<PaginatedResponse<User>>(
      `/api/users?page=${page}&limit=${limit}`
    );
  }

  async getUserById(id: string) {
    return this.request<ApiResponse<User>>(`/api/users/${id}`);
  }

  async createUser(userData: CreateUserData) {
    return this.request<ApiResponse<User>>('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: Partial<CreateUserData>) {
    return this.request<ApiResponse<User>>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string) {
    return this.request<ApiResponse<void>>(`/api/users/${id}`, {
      method: 'DELETE',
    });
  }

  async checkEmailExists(email: string) {
    return this.request<ApiResponse<{ exists: boolean }>>(
      `/api/users/check-email/${encodeURIComponent(email)}`
    );
  }

  async getUserStats() {
    return this.request<ApiResponse<any>>('/api/users/stats');
  }

  // Medical Records API methods
  async getMedicalRecordsByUserId(userId: string, page = 1, limit = 10) {
    return this.request<PaginatedResponse<MedicalRecord>>(
      `/api/medical-records/user/${userId}?page=${page}&limit=${limit}`
    );
  }

  async getMedicalRecordById(id: string) {
    return this.request<ApiResponse<MedicalRecord>>(`/api/medical-records/${id}`);
  }

  async createMedicalRecord(recordData: CreateMedicalRecordData) {
    return this.request<ApiResponse<MedicalRecord>>('/api/medical-records', {
      method: 'POST',
      body: JSON.stringify(recordData),
    });
  }

  async updateMedicalRecord(id: string, recordData: Partial<CreateMedicalRecordData>) {
    return this.request<ApiResponse<MedicalRecord>>(`/api/medical-records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(recordData),
    });
  }

  async deleteMedicalRecord(id: string) {
    return this.request<ApiResponse<void>>(`/api/medical-records/${id}`, {
      method: 'DELETE',
    });
  }

  async getRecentMedicalRecords(userId: string, limit = 5) {
    return this.request<ApiResponse<MedicalRecord[]>>(
      `/api/medical-records/user/${userId}/recent?limit=${limit}`
    );
  }

  async getMedicalRecordsByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ) {
    return this.request<ApiResponse<MedicalRecord[]>>(
      `/api/medical-records/user/${userId}/date-range?startDate=${startDate}&endDate=${endDate}`
    );
  }

  async searchMedicalRecords(userId: string, query: string) {
    return this.request<ApiResponse<MedicalRecord[]>>(
      `/api/medical-records/user/${userId}/search?q=${encodeURIComponent(query)}`
    );
  }
}

// Create and export API client instance
export const apiClient = new ApiClient();

// Export types for use in components
export type {
  User,
  CreateUserData,
  MedicalRecord,
  CreateMedicalRecordData,
  ApiResponse,
  PaginatedResponse,
};

// Export API client class for custom instances
export { ApiClient };