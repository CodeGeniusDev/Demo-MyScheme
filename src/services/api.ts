import { ApiResponse, PaginatedResponse, FilterParams, SchemeSearchParams } from '../types/api';

class ApiService {
  private baseUrl: string;
  private timeout: number;
  private retryAttempts: number;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || '/api';
    this.timeout = 10000;
    this.retryAttempts = 3;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': this.generateRequestId(),
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (retryCount < this.retryAttempts && this.shouldRetry(error)) {
        await this.delay(Math.pow(2, retryCount) * 1000);
        return this.request(endpoint, options, retryCount + 1);
      }

      throw error;
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private shouldRetry(error: any): boolean {
    return error.name === 'AbortError' || 
           (error.message && error.message.includes('fetch'));
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v.toString()));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    return searchParams.toString();
  }

  // Authentication
  async login(credentials: { username: string; password: string }): Promise<ApiResponse<{ token: string; user: any }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: any): Promise<ApiResponse<any>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return this.request('/auth/refresh', { method: 'POST' });
  }

  // User Management
  async getUsers(params: FilterParams = {}): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryString = this.buildQueryString(params);
    return this.request(`/users?${queryString}`);
  }

  async getUser(id: string): Promise<ApiResponse<any>> {
    return this.request(`/users/${id}`);
  }

  async updateUser(id: string, updates: any): Promise<ApiResponse<any>> {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return this.request(`/users/${id}`, { method: 'DELETE' });
  }

  async updateProfile(updates: any): Promise<ApiResponse<any>> {
    return this.request('/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Schemes
  async getSchemes(params: SchemeSearchParams = {}): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryString = this.buildQueryString(params);
    return this.request(`/schemes?${queryString}`);
  }

  async getScheme(id: string, language = 'en'): Promise<ApiResponse<any>> {
    return this.request(`/schemes/${id}?lang=${language}`);
  }

  async createScheme(scheme: any): Promise<ApiResponse<any>> {
    return this.request('/schemes', {
      method: 'POST',
      body: JSON.stringify(scheme),
    });
  }

  async updateScheme(id: string, updates: any): Promise<ApiResponse<any>> {
    return this.request(`/schemes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteScheme(id: string): Promise<ApiResponse<void>> {
    return this.request(`/schemes/${id}`, { method: 'DELETE' });
  }

  // Real-time Data
  async getLiveAnalytics(): Promise<ApiResponse<any>> {
    return this.request('/analytics/live');
  }

  async getAuditLogs(params: FilterParams = {}): Promise<ApiResponse<PaginatedResponse<any>>> {
    const queryString = this.buildQueryString(params);
    return this.request(`/audit-logs?${queryString}`);
  }

  async exportAuditLogs(params: FilterParams = {}): Promise<ApiResponse<string>> {
    const queryString = this.buildQueryString(params);
    return this.request(`/audit-logs/export?${queryString}`);
  }

  // File Upload
  async uploadFile(file: File, type: 'image' | 'document' | 'avatar'): Promise<ApiResponse<{ url: string; filename: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.request('/upload', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  // System Settings
  async getSettings(category?: string): Promise<ApiResponse<any>> {
    const query = category ? `?category=${category}` : '';
    return this.request(`/settings${query}`);
  }

  async updateSetting(key: string, value: any): Promise<ApiResponse<any>> {
    return this.request(`/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });
  }

  // Health Check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.request('/health');
  }
}

export const apiService = new ApiService();