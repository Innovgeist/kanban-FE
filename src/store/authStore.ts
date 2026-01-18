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
    const { accessToken, refreshToken: storedRefreshToken } = getTokens();
    
    if (!accessToken) {
      // No access token, check if we have refresh token to attempt refresh
      if (storedRefreshToken) {
        try {
          const response = await authApi.refresh(storedRefreshToken);
          if (response.success) {
            const newAccessToken = response.data.accessToken;
            setTokens(newAccessToken, storedRefreshToken);
            // Decode the new token to get user info
            try {
              const payload = JSON.parse(atob(newAccessToken.split('.')[1]));
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
            } catch {
              clearTokens();
            }
          }
        } catch {
          clearTokens();
        }
      }
      return;
    }

    // Decode JWT to get user info
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      // Check if token is expired
      if (payload.exp * 1000 > Date.now()) {
        // Token is valid, set user state
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
        // Token is expired, try to refresh if we have refresh token
        if (storedRefreshToken) {
          try {
            const response = await authApi.refresh(storedRefreshToken);
            if (response.success) {
              const newAccessToken = response.data.accessToken;
              setTokens(newAccessToken, storedRefreshToken);
              // Decode the new token to get user info
              try {
                const newPayload = JSON.parse(atob(newAccessToken.split('.')[1]));
                set({
                  user: {
                    _id: newPayload.userId || newPayload._id,
                    name: newPayload.name || '',
                    email: newPayload.email || '',
                    role: newPayload.role || 'USER',
                    createdAt: '',
                  },
                  isAuthenticated: true,
                });
              } catch {
                clearTokens();
              }
            } else {
              clearTokens();
            }
          } catch {
            clearTokens();
          }
        } else {
          // No refresh token, clear everything
          clearTokens();
        }
      }
    } catch {
      // Invalid token format, try to refresh if we have refresh token
      if (storedRefreshToken) {
        try {
          const response = await authApi.refresh(storedRefreshToken);
          if (response.success) {
            const newAccessToken = response.data.accessToken;
            setTokens(newAccessToken, storedRefreshToken);
            // Decode the new token to get user info
            try {
              const payload = JSON.parse(atob(newAccessToken.split('.')[1]));
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
            } catch {
              clearTokens();
            }
          }
        } catch {
          clearTokens();
        }
      } else {
        clearTokens();
      }
    }
  },

  clearError: () => set({ error: null }),
}));
