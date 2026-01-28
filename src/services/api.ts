/// <reference types="vite/client" />
/**
 * API Service
 *
 * Centralized API client for all backend communication.
 * Handles authentication, error handling, and request formatting.
 *
 * Base URL: /api (proxied to http://localhost:5000 in development)
 * Authentication: JWT token from cookies, sent as Bearer token in headers
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Helper function to get auth token from cookies
const getAuthToken = (): string | null => {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'token') {
      return value;
    }
  }
  return null;
};

// Helper function to make API requests
const request = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    let errorMessage = 'Request failed';
    try {
      const error = await response.json();
      errorMessage = error.message || error.error || `HTTP ${response.status}: ${response.statusText}`;
    } catch {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    
    const error = new Error(errorMessage);
    (error as any).status = response.status;
    throw error;
  }

  // Handle empty responses
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const text = await response.text();
    return text ? JSON.parse(text) : (null as unknown as T);
  }

  return response.json();
};

// API Service
export const api = {
  // Auth
  login: (credentials: { username: string; password: string }) =>
    request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (data: {
    username: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  }) =>
    request<{ message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Users
  getProfile: () => request<any>('/users/profile'),
  updateProfile: (data: any) =>
    request<any>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getPoints: () => request<{ points: number }>('/users/points'),

  // Sessions
  loadSessions: () => request<any[]>('/sessions/load'),
  createSession: (data: any) =>
    request<any>('/sessions/insert', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateSession: (data: any) =>
    request<any>('/sessions/update', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteSession: (data: any) =>
    request<any>('/sessions/delete', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Memberships
  loadMemberships: () => request<any[]>('/memberships/load'),
  createMembership: (data: any) =>
    request<any>('/memberships/insert', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateMembership: (data: any) =>
    request<any>('/memberships/update', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteMembership: (data: any) =>
    request<any>('/memberships/delete', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Attendance
  loadAttendance: () => request<any[]>('/attendance/load'),
  checkin: (data: any) =>
    request<any>('/attendance/checkin', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  checkout: (data: any) =>
    request<any>('/attendance/checkout', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteAttendance: (data: any) =>
    request<any>('/attendance/delete', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Rewards
  loadRewards: () => request<any[]>('/rewards/load'),
  adminLoadRewards: () => request<any[]>('/rewards/admin-load'),
  convertAttendance: (data: any) =>
    request<any>('/rewards/convert-attendance', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  redeemVoucher: (data: any) =>
    request<any>('/rewards/redeem-voucher', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Payments
  loadPayments: () => request<any[]>('/payments/load'),
  createPayment: (data: any) =>
    request<any>('/payments/insert', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updatePayment: (data: any) =>
    request<any>('/payments/update', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deletePayment: (data: any) =>
    request<any>('/payments/delete', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Vouchers
  loadVouchers: () => request<any[]>('/vouchers/load'),
  createVoucher: (data: any) =>
    request<any>('/vouchers/insert', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateVoucher: (data: any) =>
    request<any>('/vouchers/update', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteVoucher: (data: any) =>
    request<any>('/vouchers/delete', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Equipment
  loadEquipment: () => request<any[]>('/equipment/load'),
  createEquipment: (data: any) =>
    request<any>('/equipment/insert', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateEquipment: (data: any) =>
    request<any>('/equipment/update', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteEquipment: (data: any) =>
    request<any>('/equipment/delete', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Access Logs
  loadAccessLogs: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    severity?: string;
    action?: string;
    userId?: number;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    return request<any>(`/access-logs/load${queryString ? `?${queryString}` : ''}`);
  },
  getAccessLogAnalytics: (period?: string) =>
    request<any>(`/access-logs/analytics${period ? `?period=${period}` : ''}`),
  getUserActivity: (userId: number, limit?: number) =>
    request<any>(`/access-logs/user-activity/${userId}${limit ? `?limit=${limit}` : ''}`),

  // Admin
  loadUsers: () => request<any[]>('/admin/load'),
  createUser: (data: any) =>
    request<any>('/admin/insert', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateUser: (data: any) =>
    request<any>('/admin/update', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteUser: (data: any) =>
    request<any>('/admin/delete', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  bulkDeleteUsers: (data: { ids: number[] }) =>
    request<any>('/admin/bulk-delete', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  bulkUpdateUsers: (data: { ids: number[]; updates: any }) =>
    request<any>('/admin/bulk-update', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  sendEmail: (data: { userIds: number[]; subject: string; message: string }) =>
    request<any>('/admin/send-email', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  importUsersFromCSV: (data: { users: any[] }) =>
    request<any>('/admin/import-csv', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getDashboardAnalytics: () => request<any>('/admin/dashboard-analytics'),
  getAdvancedAnalytics: () => request<any>('/admin/advanced-analytics'),
  seedAdmin: () =>
    request<any>('/admin/seed-admin', {
      method: 'POST',
    }),
};

export default api;