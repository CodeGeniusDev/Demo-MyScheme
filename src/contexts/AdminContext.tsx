import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

// Production admin credentials - In real production, these would be in a secure database
const ADMIN_CREDENTIALS = [
  {
    username: 'admin',
    password: 'SecureAdmin2024!',
    user: {
      id: '1',
      username: 'admin',
      email: 'admin@myscheme.gov.in',
      role: 'admin' as const,
      lastLogin: new Date().toISOString(),
      permissions: ['all']
    }
  },
  {
    username: 'editor',
    password: 'SecureEditor2024!',
    user: {
      id: '2',
      username: 'editor',
      email: 'editor@myscheme.gov.in',
      role: 'editor' as const,
      lastLogin: new Date().toISOString(),
      permissions: ['articles.read', 'articles.write', 'theme.read', 'theme.write']
    }
  }
];

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const savedAuth = localStorage.getItem('admin_auth');
    const sessionToken = sessionStorage.getItem('admin_session');
    
    if (savedAuth && sessionToken) {
      try {
        const authData = JSON.parse(savedAuth);
        const sessionData = JSON.parse(sessionToken);
        
        // Verify session is still valid (8 hours for production)
        const sessionAge = Date.now() - sessionData.timestamp;
        if (sessionAge < 8 * 60 * 60 * 1000) {
          setIsAuthenticated(true);
          setUser(authData.user);
        } else {
          // Session expired
          localStorage.removeItem('admin_auth');
          sessionStorage.removeItem('admin_session');
        }
      } catch (error) {
        localStorage.removeItem('admin_auth');
        sessionStorage.removeItem('admin_session');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const credential = ADMIN_CREDENTIALS.find(
      cred => cred.username === username && cred.password === password
    );
    
    if (credential) {
      const authData = {
        user: {
          ...credential.user,
          lastLogin: new Date().toISOString()
        }
      };
      
      const sessionData = {
        token: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        userId: credential.user.id
      };
      
      localStorage.setItem('admin_auth', JSON.stringify(authData));
      sessionStorage.setItem('admin_session', JSON.stringify(sessionData));
      
      setIsAuthenticated(true);
      setUser(authData.user);
      setLoading(false);
      
      toast.success(`Welcome back, ${credential.user.username}!`);
      return true;
    } else {
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_auth');
    sessionStorage.removeItem('admin_session');
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