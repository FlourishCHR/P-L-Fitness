/**
 * API Related Types
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: 'user' | 'admin';
  };
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  bio?: string;
  dateOfBirth?: string;
  height?: number;
  weight?: number;
  fitnessGoal?: string;
}

export interface PaymentData {
  amount: number;
  method: 'cash' | 'card' | 'online';
  membershipPlanId?: number;
  description: string;
}

export interface Payment {
  id: number;
  userId: number;
  amount: number;
  method: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  reference?: string;
  description: string;
  createdAt: string;
}
