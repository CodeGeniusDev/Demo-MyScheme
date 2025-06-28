import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer' | 'user';
  permissions: string[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    preferences: {
      language: 'en' | 'hi';
      theme: 'light' | 'dark' | 'system';
      notifications: boolean;
    };
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (credentials: { email: string; password: string }) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User['profile']>) => Promise<void>;
  refreshToken: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const response = await apiService.login(credentials);
          if (response.success && response.data) {
            const { token, user } = response.data;
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false
            });
            
            // Set up token refresh
            setTimeout(() => {
              get().refreshToken();
            }, 50 * 60 * 1000); // Refresh after 50 minutes
            
            toast.success(`Welcome back, ${user.profile.firstName}!`);
            return true;
          }
          return false;
        } catch (error) {
          set({ isLoading: false });
          toast.error('Login failed. Please check your credentials.');
          return false;
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        try {
          const response = await apiService.register(userData);
          if (response.success) {
            toast.success('Registration successful! Please log in.');
            set({ isLoading: false });
            return true;
          }
          return false;
        } catch (error) {
          set({ isLoading: false });
          toast.error('Registration failed. Please try again.');
          return false;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false
        });
        toast.success('Logged out successfully');
      },

      updateProfile: async (updates) => {
        const { user } = get();
        if (!user) return;

        try {
          const response = await apiService.updateProfile(updates);
          if (response.success && response.data) {
            set({
              user: {
                ...user,
                profile: { ...user.profile, ...updates }
              }
            });
            toast.success('Profile updated successfully');
          }
        } catch (error) {
          toast.error('Failed to update profile');
        }
      },

      refreshToken: async () => {
        try {
          const response = await apiService.refreshToken();
          if (response.success && response.data) {
            set({ token: response.data.token });
          }
        } catch (error) {
          // Token refresh failed, logout user
          get().logout();
        }
      },

      hasPermission: (permission) => {
        const { user } = get();
        if (!user) return false;
        return user.permissions.includes('all') || user.permissions.includes(permission);
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);