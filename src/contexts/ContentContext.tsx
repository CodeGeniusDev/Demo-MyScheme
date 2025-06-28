import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Scheme, filterOptions } from '../data/schemes';
import { mockSchemes } from '../data/schemes';
import toast from 'react-hot-toast';

interface Translation {
  en: string;
  hi: string;
  complete: boolean;
}

interface CarouselImage {
  id: number;
  url: string;
  title: string;
  subtitle: string;
  order: number;
  active: boolean;
}

interface SiteSettings {
  defaultTheme: 'light' | 'dark' | 'system';
  primaryColor: string;
  accentColor: string;
  borderRadius: string;
  fontFamily: string;
  enableAnimations: boolean;
  enableTransitions: boolean;
  compactMode: boolean;
  lastUpdated: string;
}

interface ContentContextType {
  schemes: Scheme[];
  filterOptions: typeof filterOptions;
  translations: Record<string, Translation>;
  carouselImages: CarouselImage[];
  siteSettings: SiteSettings;
  analytics: {
    totalSchemes: number;
    totalVisitors: number;
    recentUpdates: number;
    monthlyVisitors: number[];
    popularSchemes: { name: string; views: number }[];
    searchQueries: { query: string; count: number }[];
    deviceStats: { desktop: number; mobile: number; tablet: number };
  };
  footerContent: {
    quickLinks: string[];
    usefulLinks: { name: string; logo: string; url: string }[];
    contact: {
      address: string;
      email: string;
      phone: string;
    };
  };
  
  // Scheme Management
  addScheme: (scheme: Omit<Scheme, 'id'>) => void;
  updateScheme: (id: string, scheme: Partial<Scheme>) => void;
  deleteScheme: (id: string) => void;
  getSchemeById: (id: string) => Scheme | undefined;
  
  // Filter Management
  updateFilterOptions: (category: string, options: string[]) => void;
  
  // Translation Management
  updateTranslation: (key: string, translation: Translation) => void;
  addTranslationKey: (key: string, enText: string, hiText: string) => void;
  
  // Carousel Management
  updateCarouselImages: (images: CarouselImage[]) => void;
  
  // Site Settings
  updateSiteSettings: (settings: Partial<SiteSettings>) => void;
  
  // Footer Management
  updateFooterContent: (content: any) => void;
  
  // Analytics
  trackPageView: (page: string) => void;
  trackSearch: (query: string) => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [schemes, setSchemes] = useState<Scheme[]>(mockSchemes);
  const [currentFilterOptions, setCurrentFilterOptions] = useState(filterOptions);
  
  const [translations, setTranslations] = useState<Record<string, Translation>>({
    'header.search.placeholder': {
      en: 'Enter scheme name to search…',
      hi: 'योजना का नाम खोजने के लिए दर्ज करें…',
      complete: true
    },
    'header.signin': {
      en: 'Sign In',
      hi: 'साइन इन',
      complete: true
    },
    'hero.title': {
      en: 'Discover government schemes for you…',
      hi: 'आपके लिए सरकारी योजनाएं खोजें…',
      complete: true
    },
    'hero.subtitle': {
      en: 'Find personalized schemes based on eligibility',
      hi: 'पात्रता के आधार पर व्यक्तिगत योजनाएं खोजें',
      complete: true
    },
    'categories.title': {
      en: 'Browse by Category',
      hi: 'श्रेणी के अनुसार ब्राउज़ करें',
      complete: true
    },
    'popular.title': {
      en: 'Popular Schemes',
      hi: 'लोकप्रिय योजनाएं',
      complete: true
    },
    'footer.quicklinks': {
      en: 'Quick Links',
      hi: 'त्वरित लिंक',
      complete: true
    }
  });

  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([
    {
      id: 1,
      url: 'https://images.pexels.com/photos/1595391/pexels-photo-1595391.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop',
      title: 'Discover government schemes for you…',
      subtitle: 'Find personalized schemes based on eligibility',
      order: 1,
      active: true
    },
    {
      id: 2,
      url: 'https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop',
      title: 'Empowering Citizens',
      subtitle: 'Access benefits designed for your needs',
      order: 2,
      active: true
    },
    {
      id: 3,
      url: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop',
      title: 'Digital India Initiative',
      subtitle: 'Technology for transparent governance',
      order: 3,
      active: true
    }
  ]);

  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    defaultTheme: 'system',
    primaryColor: '#16a34a',
    accentColor: '#3b82f6',
    borderRadius: '2px',
    fontFamily: 'Inter',
    enableAnimations: true,
    enableTransitions: true,
    compactMode: false,
    lastUpdated: new Date().toISOString()
  });

  const [analytics, setAnalytics] = useState({
    totalSchemes: mockSchemes.length,
    totalVisitors: 125847,
    recentUpdates: 12,
    monthlyVisitors: [8500, 9200, 8800, 9500, 10200, 11000, 10800, 11500, 12000, 12500, 13000, 12800],
    popularSchemes: [
      { name: 'PM-KISAN', views: 15420 },
      { name: 'Beti Bachao Beti Padhao', views: 12350 },
      { name: 'ICMR Fellowship', views: 9870 },
      { name: 'Financial Assistance to Disabled Students', views: 8650 },
      { name: 'Tool Kit Grant for Handicrafts', views: 7230 }
    ],
    searchQueries: [
      { query: 'education scheme', count: 2340 },
      { query: 'farmer benefits', count: 1890 },
      { query: 'women empowerment', count: 1560 },
      { query: 'disability assistance', count: 1230 },
      { query: 'employment scheme', count: 980 }
    ],
    deviceStats: { desktop: 45, mobile: 40, tablet: 15 }
  });

  const [footerContent, setFooterContent] = useState({
    quickLinks: [
      'About Us',
      'Contact Us',
      'Screen Reader',
      'Accessibility Statement',
      'FAQ',
      'Disclaimer',
      'Terms & Conditions'
    ],
    usefulLinks: [
      { name: 'Digital India', logo: 'https://images.pexels.com/photos/8828593/pexels-photo-8828593.jpeg?auto=compress&cs=tinysrgb&w=100&h=50&fit=crop', url: 'https://digitalindia.gov.in' },
      { name: 'DigiLocker', logo: 'https://images.pexels.com/photos/8828593/pexels-photo-8828593.jpeg?auto=compress&cs=tinysrgb&w=100&h=50&fit=crop', url: 'https://digilocker.gov.in' },
      { name: 'UMANG', logo: 'https://images.pexels.com/photos/8828593/pexels-photo-8828593.jpeg?auto=compress&cs=tinysrgb&w=100&h=50&fit=crop', url: 'https://umang.gov.in' },
      { name: 'India.gov.in', logo: 'https://images.pexels.com/photos/8828593/pexels-photo-8828593.jpeg?auto=compress&cs=tinysrgb&w=100&h=50&fit=crop', url: 'https://india.gov.in' },
      { name: 'MyGov', logo: 'https://images.pexels.com/photos/8828593/pexels-photo-8828593.jpeg?auto=compress&cs=tinysrgb&w=100&h=50&fit=crop', url: 'https://mygov.in' },
      { name: 'Data.gov.in', logo: 'https://images.pexels.com/photos/8828593/pexels-photo-8828593.jpeg?auto=compress&cs=tinysrgb&w=100&h=50&fit=crop', url: 'https://data.gov.in' }
    ],
    contact: {
      address: '4th Floor, NeGD, Electronics Niketan, 6 CGO Complex, Lodhi Road, New Delhi - 110003, India',
      email: 'support-myscheme[at]digitalindia[dot]gov[dot]in',
      phone: '(011) 24303714 (9:00 AM to 5:30 PM)'
    }
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const savedSchemes = localStorage.getItem('admin_schemes');
    const savedTranslations = localStorage.getItem('admin_translations');
    const savedCarousel = localStorage.getItem('admin_carousel');
    const savedSettings = localStorage.getItem('admin_settings');
    const savedFooter = localStorage.getItem('admin_footer');
    const savedAnalytics = localStorage.getItem('admin_analytics');

    if (savedSchemes) {
      try {
        setSchemes(JSON.parse(savedSchemes));
      } catch (error) {
        console.error('Error loading schemes:', error);
      }
    }

    if (savedTranslations) {
      try {
        setTranslations(JSON.parse(savedTranslations));
      } catch (error) {
        console.error('Error loading translations:', error);
      }
    }

    if (savedCarousel) {
      try {
        setCarouselImages(JSON.parse(savedCarousel));
      } catch (error) {
        console.error('Error loading carousel:', error);
      }
    }

    if (savedSettings) {
      try {
        setSiteSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }

    if (savedFooter) {
      try {
        setFooterContent(JSON.parse(savedFooter));
      } catch (error) {
        console.error('Error loading footer:', error);
      }
    }

    if (savedAnalytics) {
      try {
        setAnalytics(JSON.parse(savedAnalytics));
      } catch (error) {
        console.error('Error loading analytics:', error);
      }
    }
  }, []);

  // Scheme Management
  const addScheme = (schemeData: Omit<Scheme, 'id'>) => {
    const newScheme: Scheme = {
      ...schemeData,
      id: Date.now().toString(),
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    
    const updatedSchemes = [newScheme, ...schemes];
    setSchemes(updatedSchemes);
    localStorage.setItem('admin_schemes', JSON.stringify(updatedSchemes));
    
    setAnalytics(prev => {
      const updated = {
        ...prev,
        totalSchemes: prev.totalSchemes + 1,
        recentUpdates: prev.recentUpdates + 1
      };
      localStorage.setItem('admin_analytics', JSON.stringify(updated));
      return updated;
    });
    
    toast.success('Scheme added successfully!');
  };

  const updateScheme = (id: string, updates: Partial<Scheme>) => {
    const updatedSchemes = schemes.map(scheme => 
      scheme.id === id 
        ? { ...scheme, ...updates, lastUpdated: new Date().toISOString().split('T')[0] }
        : scheme
    );
    
    setSchemes(updatedSchemes);
    localStorage.setItem('admin_schemes', JSON.stringify(updatedSchemes));
    
    setAnalytics(prev => {
      const updated = {
        ...prev,
        recentUpdates: prev.recentUpdates + 1
      };
      localStorage.setItem('admin_analytics', JSON.stringify(updated));
      return updated;
    });
    
    toast.success('Scheme updated successfully!');
  };

  const deleteScheme = (id: string) => {
    const updatedSchemes = schemes.filter(scheme => scheme.id !== id);
    setSchemes(updatedSchemes);
    localStorage.setItem('admin_schemes', JSON.stringify(updatedSchemes));
    
    setAnalytics(prev => {
      const updated = {
        ...prev,
        totalSchemes: prev.totalSchemes - 1
      };
      localStorage.setItem('admin_analytics', JSON.stringify(updated));
      return updated;
    });
    
    toast.success('Scheme deleted successfully!');
  };

  const getSchemeById = (id: string) => {
    return schemes.find(scheme => scheme.id === id);
  };

  // Filter Management
  const updateFilterOptions = (category: string, options: string[]) => {
    const updated = {
      ...currentFilterOptions,
      [category]: options
    };
    setCurrentFilterOptions(updated);
    localStorage.setItem('admin_filters', JSON.stringify(updated));
    toast.success('Filter options updated successfully!');
  };

  // Translation Management
  const updateTranslation = (key: string, translation: Translation) => {
    const updated = {
      ...translations,
      [key]: translation
    };
    setTranslations(updated);
    localStorage.setItem('admin_translations', JSON.stringify(updated));
    toast.success('Translation updated successfully!');
  };

  const addTranslationKey = (key: string, enText: string, hiText: string) => {
    const updated = {
      ...translations,
      [key]: {
        en: enText,
        hi: hiText,
        complete: enText.trim() !== '' && hiText.trim() !== ''
      }
    };
    setTranslations(updated);
    localStorage.setItem('admin_translations', JSON.stringify(updated));
    toast.success('Translation key added successfully!');
  };

  // Carousel Management
  const updateCarouselImages = (images: CarouselImage[]) => {
    setCarouselImages(images);
    localStorage.setItem('admin_carousel', JSON.stringify(images));
    toast.success('Carousel updated successfully!');
  };

  // Site Settings
  const updateSiteSettings = (newSettings: Partial<SiteSettings>) => {
    const updated = {
      ...siteSettings,
      ...newSettings,
      lastUpdated: new Date().toISOString()
    };
    setSiteSettings(updated);
    localStorage.setItem('admin_settings', JSON.stringify(updated));
    toast.success('Site settings updated successfully!');
  };

  // Footer Management
  const updateFooterContent = (content: any) => {
    setFooterContent(content);
    localStorage.setItem('admin_footer', JSON.stringify(content));
    toast.success('Footer content updated successfully!');
  };

  // Analytics
  const trackPageView = (page: string) => {
    // In a real app, this would send to analytics service
    console.log('Page view tracked:', page);
  };

  const trackSearch = (query: string) => {
    setAnalytics(prev => {
      const existingQuery = prev.searchQueries.find(q => q.query === query);
      let updatedQueries;
      
      if (existingQuery) {
        updatedQueries = prev.searchQueries.map(q => 
          q.query === query ? { ...q, count: q.count + 1 } : q
        );
      } else {
        updatedQueries = [...prev.searchQueries, { query, count: 1 }];
      }
      
      const updated = {
        ...prev,
        searchQueries: updatedQueries.sort((a, b) => b.count - a.count).slice(0, 10)
      };
      
      localStorage.setItem('admin_analytics', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <ContentContext.Provider value={{
      schemes,
      filterOptions: currentFilterOptions,
      translations,
      carouselImages,
      siteSettings,
      analytics,
      footerContent,
      addScheme,
      updateScheme,
      deleteScheme,
      getSchemeById,
      updateFilterOptions,
      updateTranslation,
      addTranslationKey,
      updateCarouselImages,
      updateSiteSettings,
      updateFooterContent,
      trackPageView,
      trackSearch
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