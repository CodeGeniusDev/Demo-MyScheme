import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Scheme, filterOptions, mockSchemes as fallbackSchemes } from '../data/schemes';
import { apiService } from '../services/api';
import { useRealTimeStore } from '../store/realTimeStore';
import toast from 'react-hot-toast';

interface Translation {
  en: string;
  hi: string;
  complete: boolean;
}

interface SiteSettings {
  defaultTheme: 'light' | 'dark' | 'system';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  borderColor: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  borderRadius: string;
  spacing: string;
  maxWidth: string;
  headerHeight: string;
  shadowIntensity: string;
  animationSpeed: string;
  lastUpdated: string;
}

interface ContentContextType {
  schemes: Scheme[];
  filterOptions: typeof filterOptions;
  siteSettings: SiteSettings;
  loading: boolean;
  demoMode: boolean;
  
  // Scheme Management
  addScheme: (scheme: Omit<Scheme, 'id' | 'createdBy' | 'lastUpdated'>) => Promise<void>;
  updateScheme: (id: string, scheme: Partial<Scheme>) => Promise<void>;
  deleteScheme: (id: string) => Promise<void>;
  getSchemeById: (id: string) => Scheme | undefined;
  loadSchemes: () => Promise<void>;
  
  // Site Settings
  updateSiteSettings: (settings: Partial<SiteSettings>) => Promise<void>;
  loadSiteSettings: () => Promise<void>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const { sendMessage } = useRealTimeStore();
  
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    defaultTheme: 'system',
    primaryColor: '#16a34a',
    secondaryColor: '#3b82f6',
    accentColor: '#f59e0b',
    backgroundColor: '#ffffff',
    surfaceColor: '#f9fafb',
    textColor: '#111827',
    borderColor: '#e5e7eb',
    fontFamily: 'Inter',
    fontSize: '16',
    fontWeight: '400',
    lineHeight: '1.5',
    borderRadius: '8',
    spacing: '16',
    maxWidth: '1200',
    headerHeight: '64',
    shadowIntensity: 'medium',
    animationSpeed: 'normal',
    lastUpdated: new Date().toISOString()
  });

  useEffect(() => {
    loadSchemes();
    loadSiteSettings();
  }, []);

  const checkDatabaseStatus = async () => {
    try {
      const response = await fetch('/api/db-status');
      const data = await response.json();
      return data.connected;
    } catch (error) {
      console.error('Failed to check database status:', error);
      return false;
    }
  };

  const loadSchemes = async () => {
    try {
      setLoading(true);
      
      // First check if database is available
      const dbConnected = await checkDatabaseStatus();
      
      if (!dbConnected) {
        // Database not available, use fallback data
        console.warn('Database not connected, using demo data');
        setDemoMode(true);
        setSchemes(fallbackSchemes);
        toast('Running in demo mode - database not connected', {
          icon: '⚠️',
          duration: 4000,
        });
        return;
      }

      // Database is available, try to fetch from API
      const response = await apiService.getSchemes({ status: 'published' });
      if (response.success && response.data) {
        setSchemes(response.data.schemes || response.data.items || []);
        setDemoMode(false);
      } else {
        // API call succeeded but no data, fall back to demo data
        console.warn('No schemes data received, using demo data');
        setDemoMode(true);
        setSchemes(fallbackSchemes);
      }
    } catch (error: any) {
      console.error('Failed to load schemes:', error);
      
      // Check if it's a 503 error (service unavailable)
      if (error.response?.status === 503) {
        console.warn('Service unavailable, using demo data');
        setDemoMode(true);
        setSchemes(fallbackSchemes);
        toast('Database service unavailable - using demo data', {
          icon: '⚠️',
          duration: 4000,
        });
      } else {
        // Other errors, still try to use demo data
        console.warn('API error, falling back to demo data');
        setDemoMode(true);
        setSchemes(fallbackSchemes);
        toast.error('Failed to load schemes - using demo data');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadSiteSettings = async () => {
    try {
      const response = await apiService.getPublicSettings();
      if (response.success && response.data) {
        setSiteSettings(prev => ({ ...prev, ...response.data }));
      }
    } catch (error) {
      console.error('Failed to load site settings:', error);
      // Don't show error toast for site settings as it's not critical
      // Use default settings which are already set in state
    }
  };

  const addScheme = async (schemeData: Omit<Scheme, 'id' | 'createdBy' | 'lastUpdated'>) => {
    if (demoMode) {
      toast.error('Cannot add schemes in demo mode - database not connected');
      throw new Error('Demo mode: database not connected');
    }

    try {
      const response = await apiService.createScheme({
        ...schemeData,
        status: 'published',
        lastUpdated: new Date().toISOString()
      });
      
      if (response.success && response.data) {
        setSchemes(prev => [response.data, ...prev]);
        sendMessage('scheme_updated', { 
          action: 'created', 
          scheme: response.data,
          schemeId: response.data.id 
        });
        toast.success('Scheme created successfully!');
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to create scheme';
      toast.error(message);
      throw error;
    }
  };

  const updateScheme = async (id: string, updates: Partial<Scheme>) => {
    if (demoMode) {
      toast.error('Cannot update schemes in demo mode - database not connected');
      throw new Error('Demo mode: database not connected');
    }

    try {
      const response = await apiService.updateScheme(id, {
        ...updates,
        lastUpdated: new Date().toISOString()
      });
      
      if (response.success && response.data) {
        setSchemes(prev => prev.map(scheme => 
          scheme.id === id ? response.data : scheme
        ));
        sendMessage('scheme_updated', { 
          action: 'updated', 
          scheme: response.data,
          schemeId: id 
        });
        toast.success('Scheme updated successfully!');
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update scheme';
      toast.error(message);
      throw error;
    }
  };

  const deleteScheme = async (id: string) => {
    if (demoMode) {
      toast.error('Cannot delete schemes in demo mode - database not connected');
      throw new Error('Demo mode: database not connected');
    }

    try {
      const response = await apiService.deleteScheme(id);
      
      if (response.success) {
        setSchemes(prev => prev.filter(scheme => scheme.id !== id));
        sendMessage('scheme_updated', { 
          action: 'deleted', 
          schemeId: id 
        });
        toast.success('Scheme deleted successfully!');
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to delete scheme';
      toast.error(message);
      throw error;
    }
  };

  const getSchemeById = (id: string) => {
    return schemes.find(scheme => scheme.id === id);
  };

  const updateSiteSettings = async (newSettings: Partial<SiteSettings>) => {
    if (demoMode) {
      // In demo mode, still allow theme changes locally
      const updatedSettings = {
        ...siteSettings,
        ...newSettings,
        lastUpdated: new Date().toISOString()
      };
      
      setSiteSettings(updatedSettings);
      applyThemeSettings(updatedSettings);
      
      toast('Theme updated locally (demo mode)', {
        icon: '🎨',
        duration: 3000,
      });
      return;
    }

    try {
      const updatedSettings = {
        ...siteSettings,
        ...newSettings,
        lastUpdated: new Date().toISOString()
      };
      
      // Update multiple settings
      for (const [key, value] of Object.entries(newSettings)) {
        await apiService.updateSystemSetting(`theme.${key}`, value);
      }
      
      setSiteSettings(updatedSettings);
      
      // Apply theme changes immediately
      applyThemeSettings(updatedSettings);
      
      // Send real-time update to all users
      sendMessage('theme_updated', updatedSettings);
      
      toast.success('Theme settings updated successfully!');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update theme settings';
      toast.error(message);
      throw error;
    }
  };

  const applyThemeSettings = (settings: SiteSettings) => {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    root.style.setProperty('--color-primary', settings.primaryColor);
    root.style.setProperty('--color-secondary', settings.secondaryColor);
    root.style.setProperty('--color-accent', settings.accentColor);
    root.style.setProperty('--color-background', settings.backgroundColor);
    root.style.setProperty('--color-surface', settings.surfaceColor);
    root.style.setProperty('--color-text', settings.textColor);
    root.style.setProperty('--color-border', settings.borderColor);
    root.style.setProperty('--font-family', settings.fontFamily);
    root.style.setProperty('--font-size-base', `${settings.fontSize}px`);
    root.style.setProperty('--font-weight-normal', settings.fontWeight);
    root.style.setProperty('--line-height', settings.lineHeight);
    root.style.setProperty('--border-radius', `${settings.borderRadius}px`);
    root.style.setProperty('--spacing-base', `${settings.spacing}px`);
    root.style.setProperty('--max-width', `${settings.maxWidth}px`);
    root.style.setProperty('--header-height', `${settings.headerHeight}px`);
  };

  // Apply theme settings on load
  useEffect(() => {
    applyThemeSettings(siteSettings);
  }, [siteSettings]);

  return (
    <ContentContext.Provider value={{
      schemes,
      filterOptions,
      siteSettings,
      loading,
      demoMode,
      addScheme,
      updateScheme,
      deleteScheme,
      getSchemeById,
      loadSchemes,
      updateSiteSettings,
      loadSiteSettings
    }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};