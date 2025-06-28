import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { ApiResponse, PaginatedResponse, FilterParams, SchemeSearchParams } from '../types/api';

class ApiService {
  private api: AxiosInstance;
  private baseUrl: string;
  private retryAttempts: number;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    this.retryAttempts = 3;
    
    this.api = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request ID for tracking
        config.headers['X-Request-ID'] = this.generateRequestId();
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Handle token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await this.refreshToken();
              if (response.success && response.data) {
                localStorage.setItem('accessToken', response.data.accessToken);
                originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
                return this.api(originalRequest);
              }
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            this.handleAuthFailure();
            return Promise.reject(refreshError);
          }
        }

        // Handle network errors with retry
        if (this.shouldRetry(error) && originalRequest._retryCount < this.retryAttempts) {
          originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
          
          const delay = Math.pow(2, originalRequest._retryCount) * 1000;
          await this.delay(delay);
          
          return this.api(originalRequest);
        }

        return Promise.reject(error);
      }
    );
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private shouldRetry(error: AxiosError): boolean {
    return (
      !error.response ||
      error.response.status >= 500 ||
      error.code === 'NETWORK_ERROR' ||
      error.code === 'TIMEOUT'
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private handleAuthFailure() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  }

  // Authentication
  async login(credentials: { identifier: string; password: string; rememberMe?: boolean }): Promise<ApiResponse<{ token: string; refreshToken: string; user: any }>> {
    const response = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<ApiResponse<any>> {
    const response = await this.api.post('/auth/register', userData);
    return response.data;
  }

  async logout(): Promise<ApiResponse<void>> {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await this.api.post('/auth/logout', { refreshToken });
    return response.data;
  }

  async refreshToken(): Promise<ApiResponse<{ accessToken: string }>> {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await this.api.post('/auth/refresh', { refreshToken });
    return response.data;
  }

  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    const response = await this.api.post('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse<void>> {
    const response = await this.api.post('/auth/reset-password', { token, password });
    return response.data;
  }

  // User Management
  async getUsers(params: FilterParams = {}): Promise<ApiResponse<PaginatedResponse<any>>> {
    const response = await this.api.get('/users', { params });
    return response.data;
  }

  async getUser(id: string): Promise<ApiResponse<any>> {
    const response = await this.api.get(`/users/${id}`);
    return response.data;
  }

  async updateUser(id: string, updates: any): Promise<ApiResponse<any>> {
    const response = await this.api.put(`/users/${id}`, updates);
    return response.data;
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/users/${id}`);
    return response.data;
  }

  async updateProfile(updates: any): Promise<ApiResponse<any>> {
    const response = await this.api.put('/users/profile', updates);
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    const response = await this.api.put('/users/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  }

  // Schemes
  async getSchemes(params: SchemeSearchParams = {}): Promise<ApiResponse<PaginatedResponse<any>>> {
    const response = await this.api.get('/schemes', { params });
    return response.data;
  }

  async getScheme(id: string, language = 'en'): Promise<ApiResponse<any>> {
    const response = await this.api.get(`/schemes/${id}`, { params: { language } });
    return response.data;
  }

  async createScheme(scheme: any): Promise<ApiResponse<any>> {
    const response = await this.api.post('/schemes', scheme);
    return response.data;
  }

  async updateScheme(id: string, updates: any): Promise<ApiResponse<any>> {
    const response = await this.api.put(`/schemes/${id}`, updates);
    return response.data;
  }

  async deleteScheme(id: string): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/schemes/${id}`);
    return response.data;
  }

  async getTrendingSchemes(limit = 10, language = 'en'): Promise<ApiResponse<any[]>> {
    const response = await this.api.get('/schemes/trending/list', { 
      params: { limit, language } 
    });
    return response.data;
  }

  async getSchemeStats(): Promise<ApiResponse<any>> {
    const response = await this.api.get('/schemes/stats/overview');
    return response.data;
  }

  // Analytics
  async getLiveAnalytics(): Promise<ApiResponse<any>> {
    const response = await this.api.get('/analytics/live');
    return response.data;
  }

  async getDashboardAnalytics(dateRange = 30): Promise<ApiResponse<any>> {
    const response = await this.api.get('/analytics/dashboard', { 
      params: { dateRange } 
    });
    return response.data;
  }

  async getPopularSearches(limit = 10, dateRange = 30): Promise<ApiResponse<any[]>> {
    const response = await this.api.get('/analytics/popular-searches', { 
      params: { limit, dateRange } 
    });
    return response.data;
  }

  async getDeviceStats(dateRange = 30): Promise<ApiResponse<any[]>> {
    const response = await this.api.get('/analytics/device-stats', { 
      params: { dateRange } 
    });
    return response.data;
  }

  async trackPageView(page: string, metadata?: any): Promise<void> {
    try {
      await this.api.post('/analytics/track', {
        type: 'page_view',
        page,
        metadata
      });
    } catch (error) {
      console.warn('Failed to track page view:', error);
    }
  }

  async trackSearch(query: string, filters: any, resultsCount: number): Promise<void> {
    try {
      await this.api.post('/analytics/track', {
        type: 'search',
        query,
        filters,
        resultsCount
      });
    } catch (error) {
      console.warn('Failed to track search:', error);
    }
  }

  async trackSchemeView(schemeId: string, timeOnPage?: number): Promise<void> {
    try {
      await this.api.post('/analytics/track', {
        type: 'scheme_view',
        schemeId,
        timeOnPage
      });
    } catch (error) {
      console.warn('Failed to track scheme view:', error);
    }
  }

  // File Upload
  async uploadFile(file: File, type: 'image' | 'document' | 'avatar'): Promise<ApiResponse<{ url: string; filename: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await this.api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Admin Operations
  async getAuditLogs(params: FilterParams = {}): Promise<ApiResponse<PaginatedResponse<any>>> {
    const response = await this.api.get('/admin/audit-logs', { params });
    return response.data;
  }

  async getSystemStats(): Promise<ApiResponse<any>> {
    const response = await this.api.get('/admin/system-stats');
    return response.data;
  }

  async getSystemSettings(category?: string): Promise<ApiResponse<any>> {
    const params = category ? { category } : {};
    const response = await this.api.get('/admin/settings', { params });
    return response.data;
  }

  async updateSystemSetting(key: string, value: any): Promise<ApiResponse<any>> {
    const response = await this.api.put(`/admin/settings/${key}`, { value });
    return response.data;
  }

  async exportData(type: string, filters?: any): Promise<ApiResponse<string>> {
    const response = await this.api.post('/admin/export', { type, filters });
    return response.data;
  }

  // Public Settings (no auth required)
  async getPublicSettings(): Promise<ApiResponse<any>> {
    const response = await this.api.get('/public-settings');
    return response.data;
  }

  // Health Check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    const response = await this.api.get('/health');
    return response.data;
  }

  // Real-time connection status
  async getConnectionStatus(): Promise<{ connected: boolean; latency?: number }> {
    try {
      const start = Date.now();
      await this.healthCheck();
      const latency = Date.now() - start;
      return { connected: true, latency };
    } catch (error) {
      return { connected: false };
    }
  }
}

export const apiService = new ApiService();
export default apiService;