import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'editor';
  lastLogin: string;
  permissions: string[];
}

interface AdminContextType {
  isAuthenticated: boolean;
  user: AdminUser | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  hasPermission: (permission: string) => boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in via main auth system
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role === 'admin' || parsedUser.role === 'editor') {
          setIsAuthenticated(true);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userData');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      const response = await apiService.login({
        identifier: username,
        password: password
      });
      
      if (response.success && response.data) {
        const { user: userData, token } = response.data;
        
        // Check if user has admin/editor role
        if (userData.role === 'admin' || userData.role === 'editor') {
          localStorage.setItem('accessToken', token);
          localStorage.setItem('userData', JSON.stringify(userData));
          
          setIsAuthenticated(true);
          setUser(userData);
          setLoading(false);
          
          toast.success(`Welcome back, ${userData.username}!`);
          return true;
        } else {
          toast.error('Access denied. Admin privileges required.');
          setLoading(false);
          return false;
        }
      }
      
      setLoading(false);
      return false;
    } catch (error: any) {
      setLoading(false);
      const message = error.response?.data?.error || 'Login failed';
      toast.error(message);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userData');
    setIsAuthenticated(false);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.permissions.includes('all')) return true;
    return user.permissions.includes(permission);
  };

  return (
    <AdminContext.Provider value={{ 
      isAuthenticated, 
      user, 
      login, 
      logout, 
      loading, 
      hasPermission 
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};