import apiClient from './client';
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from '../types';

const API_BASE_URL = 'https://kanban-internal.vercel.app';

export const authApi = {
  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      data
    );
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/register',
      data
    );
    return response.data;
  },

  refresh: async (refreshToken: string): Promise<ApiResponse<{ accessToken: string }>> => {
    const response = await apiClient.post<ApiResponse<{ accessToken: string }>>(
      '/auth/refresh',
      { refreshToken }
    );
    return response.data;
  },

  logout: async (): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      '/auth/logout'
    );
    return response.data;
  },

  // Google OAuth - Returns the URL to redirect to
  getGoogleAuthUrl: () => {
    return `${API_BASE_URL}/auth/google`;
  },

  // Set password using invitation token
  setPasswordWithInvitation: async (
    invitationToken: string,
    password: string
  ): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/invitation/set-password',
      { invitationToken, password }
    );
    return response.data;
  },

  // Get invitation details (admin only)
  getInvitationDetails: async (
    email: string
  ): Promise<ApiResponse<{ invitationToken: string; expiresAt: string }>> => {
    const response = await apiClient.get<
      ApiResponse<{ invitationToken: string; expiresAt: string }>
    >(`/auth/invitation/details?email=${encodeURIComponent(email)}`);
    return response.data;
  },
};
