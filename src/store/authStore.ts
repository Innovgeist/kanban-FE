import { create } from 'zustand';
import type { User, LoginRequest, RegisterRequest } from '../types';
import { authApi, setTokens, clearTokens, getTokens } from '../api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (data: LoginRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(data);
      if (response.success) {
        const { user, tokens } = response.data;
        setTokens(tokens.accessToken, tokens.refreshToken);
        set({ user, isAuthenticated: true, isLoading: false });
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Login failed. Please try again.';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  register: async (data: RegisterRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.register(data);
      if (response.success) {
        const { user, tokens } = response.data;
        setTokens(tokens.accessToken, tokens.refreshToken);
        set({ user, isAuthenticated: true, isLoading: false });
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Registration failed. Please try again.';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors - we still want to clear local state
    } finally {
      clearTokens();
      set({ user: null, isAuthenticated: false });
    }
  },

  initialize: () => {
    const { accessToken } = getTokens();
    if (accessToken) {
      // Decode JWT to get user info
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        // Check if token is expired
        if (payload.exp * 1000 > Date.now()) {
          set({
            user: {
              _id: payload.userId || payload._id,
              name: payload.name || '',
              email: payload.email || '',
              role: payload.role || 'USER',
              createdAt: '',
            },
            isAuthenticated: true,
          });
        } else {
          clearTokens();
        }
      } catch {
        clearTokens();
      }
    }
  },

  clearError: () => set({ error: null }),
}));
