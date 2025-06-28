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
  isEmailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  profile: {
    firstName: string;
    lastName: string;
    fullName?: string;
    avatar?: string;
    bio?: string;
    location?: string;
    website?: string;
    preferences: {
      language: 'en' | 'hi';
      theme: 'light' | 'dark' | 'system';
      notifications: {
        email: boolean;
        push: boolean;
        sms: boolean;
      };
      privacy: {
        profileVisible: boolean;
        activityVisible: boolean;
      };
    };
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginAttempts: number;
  lastLoginAttempt: number | null;
  
  // Actions
  login: (credentials: { identifier: string; password: string; rememberMe?: boolean }) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  updateProfile: (updates: Partial<User['profile']>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  refreshToken: () => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, password: string) => Promise<boolean>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string | string[]) => boolean;
  clearAuthData: () => void;
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      loginAttempts: 0,
      lastLoginAttempt: null,

      login: async (credentials) => {
        const state = get();
        
        // Check for rate limiting
        const now = Date.now();
        if (state.lastLoginAttempt && now - state.lastLoginAttempt < 60000 && state.loginAttempts >= 5) {
          toast.error('Too many login attempts. Please wait a minute before trying again.');
          return false;
        }

        set({ isLoading: true });
        
        try {
          const response = await apiService.login(credentials);
          
          if (response.success && response.data) {
            const { accessToken, refreshToken, user } = response.data;
            
            // Store tokens
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            
            set({
              user,
              token: accessToken,
              refreshToken,
              isAuthenticated: true,
              isLoading: false,
              loginAttempts: 0,
              lastLoginAttempt: null
            });
            
            // Set up token refresh
            setTimeout(() => {
              get().refreshToken();
            }, 14 * 60 * 1000); // Refresh after 14 minutes (token expires in 15)
            
            toast.success(`Welcome back, ${user.profile.firstName || user.username}!`);
            return true;
          }
          
          return false;
        } catch (error: any) {
          set(state => ({
            isLoading: false,
            loginAttempts: state.loginAttempts + 1,
            lastLoginAttempt: now
          }));
          
          const message = error.response?.data?.error || 'Login failed. Please check your credentials.';
          toast.error(message);
          return false;
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        
        try {
          const response = await apiService.register(userData);
          
          if (response.success) {
            set({ isLoading: false });
            toast.success('Registration successful! Please check your email to verify your account.');
            return true;
          }
          
          return false;
        } catch (error: any) {
          set({ isLoading: false });
          const message = error.response?.data?.error || 'Registration failed. Please try again.';
          toast.error(message);
          return false;
        }
      },

      logout: async () => {
        try {
          await apiService.logout();
        } catch (error) {
          console.warn('Logout API call failed:', error);
        }
        
        // Clear local storage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false
        });
        
        toast.success('Logged out successfully');
      },

      logoutAll: async () => {
        try {
          await apiService.logout(); // This will logout from all devices on the backend
        } catch (error) {
          console.warn('Logout all API call failed:', error);
        }
        
        // Clear local storage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false
        });
        
        toast.success('Logged out from all devices successfully');
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
        } catch (error: any) {
          const message = error.response?.data?.error || 'Failed to update profile';
          toast.error(message);
        }
      },

      changePassword: async (currentPassword, newPassword) => {
        try {
          const response = await apiService.changePassword(currentPassword, newPassword);
          
          if (response.success) {
            toast.success('Password changed successfully');
            return true;
          }
          
          return false;
        } catch (error: any) {
          const message = error.response?.data?.error || 'Failed to change password';
          toast.error(message);
          return false;
        }
      },

      refreshToken: async () => {
        try {
          const response = await apiService.refreshToken();
          
          if (response.success && response.data) {
            const { accessToken } = response.data;
            localStorage.setItem('accessToken', accessToken);
            
            set({ token: accessToken });
            
            // Schedule next refresh
            setTimeout(() => {
              get().refreshToken();
            }, 14 * 60 * 1000);
          }
        } catch (error) {
          console.warn('Token refresh failed:', error);
          // If refresh fails, logout user
          get().logout();
        }
      },

      forgotPassword: async (email) => {
        try {
          const response = await apiService.forgotPassword(email);
          
          if (response.success) {
            toast.success('Password reset instructions sent to your email');
            return true;
          }
          
          return false;
        } catch (error: any) {
          const message = error.response?.data?.error || 'Failed to send password reset email';
          toast.error(message);
          return false;
        }
      },

      resetPassword: async (token, password) => {
        try {
          const response = await apiService.resetPassword(token, password);
          
          if (response.success) {
            toast.success('Password reset successfully. Please login with your new password.');
            return true;
          }
          
          return false;
        } catch (error: any) {
          const message = error.response?.data?.error || 'Failed to reset password';
          toast.error(message);
          return false;
        }
      },

      hasPermission: (permission) => {
        const { user } = get();
        if (!user) return false;
        return user.permissions.includes('all') || user.permissions.includes(permission);
      },

      hasRole: (roles) => {
        const { user } = get();
        if (!user) return false;
        const roleArray = Array.isArray(roles) ? roles : [roles];
        return roleArray.includes(user.role);
      },

      clearAuthData: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          loginAttempts: 0,
          lastLoginAttempt: null
        });
      },

      setUser: (user) => {
        set({ user });
      },

      setTokens: (accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        
        set({
          token: accessToken,
          refreshToken,
          isAuthenticated: true
        });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        loginAttempts: state.loginAttempts,
        lastLoginAttempt: state.lastLoginAttempt
      })
    }
  )
);

// Initialize auth state from localStorage on app start
const initializeAuth = () => {
  const token = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (token && refreshToken) {
    useAuthStore.getState().setTokens(token, refreshToken);
    
    // Start token refresh cycle
    setTimeout(() => {
      useAuthStore.getState().refreshToken();
    }, 14 * 60 * 1000);
  }
};

// Call initialization
initializeAuth();