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
  initialize: () => Promise<void>;
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
initialize: async () => {
  set({ isLoading: true, error: null });

  const { accessToken, refreshToken } = getTokens();

  const loadMe = async () => {
    const meRes = await authApi.me(); // ✅ /auth/me
    if (meRes.success) {
      set({
        user: meRes.data.user, // ✅ includes avatarUrl
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    }
    return false;
  };

  try {
    // Try /me using current access token
    if (accessToken) {
      try {
        const ok = await loadMe();
        if (ok) return;
      } catch {
        // access token might be expired -> refresh below
      }
    }

    // Refresh then call /me
    if (refreshToken) {
      const refreshRes = await authApi.refresh(refreshToken);
      if (refreshRes.success) {
        setTokens(refreshRes.data.accessToken, refreshToken);
        await loadMe();
        return;
      }
    }

    clearTokens();
    set({ user: null, isAuthenticated: false, isLoading: false });
  } catch {
    clearTokens();
    set({ user: null, isAuthenticated: false, isLoading: false });
  }
},


  clearError: () => set({ error: null }),
}));
