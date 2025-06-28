import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRealTimeStore } from '../store/realTimeStore';

interface Translation {
  en: string;
  hi: string;
}

interface LanguageContextType {
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isLoading: boolean;
  translations: Record<string, Translation>;
  addTranslation: (key: string, en: string, hi: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Comprehensive translation database
const translations: Record<string, Translation> = {
  // Header & Navigation
  'header.title': { en: 'MyScheme', hi: 'मायस्कीम' },
  'header.search.placeholder': { en: 'Enter scheme name to search…', hi: 'योजना का नाम खोजने के लिए दर्ज करें…' },
  'header.signin': { en: 'Sign In', hi: 'साइन इन' },
  'header.menu': { en: 'Menu', hi: 'मेन्यू' },
  'header.close': { en: 'Close', hi: 'बंद करें' },

  // Hero Section
  'hero.title': { en: 'Discover Government Schemes Designed for You', hi: 'आपके लिए डिज़ाइन की गई सरकारी योजनाएं खोजें' },
  'hero.subtitle': { en: 'Find personalized schemes based on your eligibility criteria and access benefits that can transform your life', hi: 'अपनी पात्रता मानदंडों के आधार पर व्यक्तिगत योजनाएं खोजें और उन लाभों तक पहुंचें जो आपके जीवन को बदल सकते हैं' },
  'hero.cta': { en: 'Explore Schemes', hi: 'योजनाएं देखें' },
  'hero.stats': { en: '3,614+ schemes available across India', hi: 'भारत भर में 3,614+ योजनाएं उपलब्ध' },

  // How It Works
  'howitworks.title': { en: 'How It Works', hi: 'यह कैसे काम करता है' },
  'howitworks.subtitle': { en: 'Simple steps to find and access government schemes', hi: 'सरकारी योजनाओं को खोजने और पहुंचने के सरल चरण' },
  'howitworks.step1.title': { en: 'Search & Discover', hi: 'खोजें और जानें' },
  'howitworks.step1.description': { en: 'Use our advanced search to find schemes relevant to your needs and circumstances', hi: 'अपनी आवश्यकताओं और परिस्थितियों के अनुसार योजनाएं खोजने के लिए हमारी उन्नत खोज का उपयोग करें' },
  'howitworks.step2.title': { en: 'Check Eligibility', hi: 'पात्रता जांचें' },
  'howitworks.step2.description': { en: 'Apply filters and check eligibility criteria to find schemes you qualify for', hi: 'फ़िल्टर लगाएं और पात्रता मानदंड जांचें ताकि आप उन योजनाओं को खोज सकें जिनके लिए आप योग्य हैं' },
  'howitworks.step3.title': { en: 'Learn Details', hi: 'विवरण जानें' },
  'howitworks.step3.description': { en: 'Read comprehensive information about benefits, application process, and requirements', hi: 'लाभ, आवेदन प्रक्रिया और आवश्यकताओं के बारे में व्यापक जानकारी पढ़ें' },
  'howitworks.step4.title': { en: 'Apply & Benefit', hi: 'आवेदन करें और लाभ उठाएं' },
  'howitworks.step4.description': { en: 'Follow the step-by-step application process to access your benefits', hi: 'अपने लाभों तक पहुंचने के लिए चरण-दर-चरण आवेदन प्रक्रिया का पालन करें' },

  // Categories
  'categories.title': { en: 'Browse by Category', hi: 'श्रेणी के अनुसार ब्राउज़ करें' },
  'categories.subtitle': { en: 'Explore schemes organized by different categories and sectors', hi: 'विभिन्न श्रेणियों और क्षेत्रों के अनुसार व्यवस्थित योजनाओं का अन्वेषण करें' },
  'categories.education': { en: 'Education', hi: 'शिक्षा' },
  'categories.health': { en: 'Health', hi: 'स्वास्थ्य' },
  'categories.employment': { en: 'Employment', hi: 'रोजगार' },
  'categories.housing': { en: 'Housing', hi: 'आवास' },
  'categories.social': { en: 'Social Welfare', hi: 'सामाजिक कल्याण' },
  'categories.skill': { en: 'Skill Development', hi: 'कौशल विकास' },
  'categories.women': { en: 'Women Empowerment', hi: 'महिला सशक्तिकरण' },
  'categories.child': { en: 'Child Welfare', hi: 'बाल कल्याण' },
  'categories.schemes': { en: 'schemes', hi: 'योजनाएं' },

  // Popular Schemes
  'popular.title': { en: 'Popular Schemes', hi: 'लोकप्रिय योजनाएं' },
  'popular.subtitle': { en: 'Most accessed government schemes by citizens across India', hi: 'भारत भर के नागरिकों द्वारा सबसे अधिक एक्सेस की जाने वाली सरकारी योजनाएं' },
  'popular.viewall': { en: 'View All Schemes', hi: 'सभी योजनाएं देखें' },
  'popular.checkeligibility': { en: 'Check Eligibility', hi: 'पात्रता जांचें' },

  // Testimonials
  'testimonials.title': { en: 'What Citizens Say', hi: 'नागरिक क्या कहते हैं' },
  'testimonials.subtitle': { en: 'Real experiences from scheme beneficiaries across the country', hi: 'देश भर के योजना लाभार्थियों के वास्तविक अनुभव' },

  // CTA Section
  'cta.title': { en: 'Ready to Find Your Schemes?', hi: 'अपनी योजनाएं खोजने के लिए तैयार हैं?' },
  'cta.description': { en: 'Start exploring government schemes tailored specifically for your needs today', hi: 'आज ही अपनी आवश्यकताओं के लिए विशेष रूप से तैयार की गई सरकारी योजनाओं की खोज शुरू करें' },
  'cta.button': { en: 'Start Searching', hi: 'खोज शुरू करें' },

  // Footer
  'footer.powered': { en: 'Powered by', hi: 'द्वारा संचालित' },
  'footer.quicklinks': { en: 'Quick Links', hi: 'त्वरित लिंक' },
  'footer.usefullinks': { en: 'Useful Links', hi: 'उपयोगी लिंक' },
  'footer.contact': { en: 'Get in touch', hi: 'संपर्क में रहें' },
  'footer.aboutus': { en: 'About Us', hi: 'हमारे बारे में' },
  'footer.contactus': { en: 'Contact Us', hi: 'संपर्क करें' },
  'footer.accessibility': { en: 'Accessibility Statement', hi: 'पहुंच वक्तव्य' },
  'footer.faq': { en: 'Frequently Asked Questions', hi: 'अक्सर पूछे जाने वाले प्रश्न' },
  'footer.disclaimer': { en: 'Disclaimer', hi: 'अस्वीकरण' },
  'footer.terms': { en: 'Terms & Conditions', hi: 'नियम और शर्तें' },
  'footer.privacy': { en: 'Privacy Policy', hi: 'गोपनीयता नीति' },
  'footer.lastupdate': { en: 'Last Updated On', hi: 'अंतिम अपडेट' },

  // Search Page
  'search.title': { en: 'Search Government Schemes', hi: 'सरकारी योजनाएं खोजें' },
  'search.filter': { en: 'Filter By', hi: 'फ़िल्टर करें' },
  'search.reset': { en: 'Reset Filters', hi: 'फ़िल्टर रीसेट करें' },
  'search.total': { en: 'Total', hi: 'कुल' },
  'search.available': { en: 'schemes available', hi: 'योजनाएं उपलब्ध' },
  'search.sort': { en: 'Sort by', hi: 'क्रमबद्ध करें' },
  'search.relevance': { en: 'Relevance', hi: 'प्रासंगिकता' },
  'search.newest': { en: 'Newest First', hi: 'नवीनतम पहले' },
  'search.oldest': { en: 'Oldest First', hi: 'पुराने पहले' },
  'search.noresults': { en: 'No schemes found', hi: 'कोई योजना नहीं मिली' },
  'search.adjustfilters': { en: 'Try adjusting your search criteria or filters', hi: 'अपने खोज मानदंड या फ़िल्टर को समायोजित करने का प्रयास करें' },

  // Search Tabs
  'search.tabs.all': { en: 'All Schemes', hi: 'सभी योजनाएं' },
  'search.tabs.state': { en: 'State Schemes', hi: 'राज्य योजनाएं' },
  'search.tabs.central': { en: 'Central Schemes', hi: 'केंद्रीय योजनाएं' },

  // Search Filters
  'search.filters.state': { en: 'State', hi: 'राज्य' },
  'search.filters.category': { en: 'Scheme Category', hi: 'योजना श्रेणी' },
  'search.filters.gender': { en: 'Gender', hi: 'लिंग' },
  'search.filters.age': { en: 'Age Group', hi: 'आयु समूह' },
  'search.filters.caste': { en: 'Caste', hi: 'जाति' },
  'search.filters.ministry': { en: 'Ministry', hi: 'मंत्रालय' },
  'search.filters.select': { en: 'Select', hi: 'चुनें' },

  // Scheme Detail Page
  'scheme.back': { en: 'Back', hi: 'वापस' },
  'scheme.share': { en: 'Share', hi: 'साझा करें' },
  'scheme.details': { en: 'Details', hi: 'विवरण' },
  'scheme.benefits': { en: 'Benefits', hi: 'लाभ' },
  'scheme.eligibility': { en: 'Eligibility', hi: 'पात्रता' },
  'scheme.process': { en: 'Application Process', hi: 'आवेदन प्रक्रिया' },
  'scheme.documents': { en: 'Documents Required', hi: 'आवश्यक दस्तावेज' },
  'scheme.faqs': { en: 'FAQs', hi: 'अक्सर पूछे जाने वाले प्रश्न' },
  'scheme.sources': { en: 'Sources & References', hi: 'स्रोत और संदर्भ' },
  'scheme.feedback': { en: 'Feedback', hi: 'प्रतिक्रिया' },
  'scheme.checkeligibility': { en: 'Check Eligibility', hi: 'पात्रता जांचें' },
  'scheme.apply': { en: 'Apply Now', hi: 'अभी आवेदन करें' },

  // Common Actions
  'common.loading': { en: 'Loading...', hi: 'लोड हो रहा है...' },
  'common.error': { en: 'Error', hi: 'त्रुटि' },
  'common.success': { en: 'Success', hi: 'सफलता' },
  'common.save': { en: 'Save', hi: 'सेव करें' },
  'common.cancel': { en: 'Cancel', hi: 'रद्द करें' },
  'common.submit': { en: 'Submit', hi: 'जमा करें' },
  'common.edit': { en: 'Edit', hi: 'संपादित करें' },
  'common.delete': { en: 'Delete', hi: 'हटाएं' },
  'common.view': { en: 'View', hi: 'देखें' },
  'common.close': { en: 'Close', hi: 'बंद करें' },
  'common.next': { en: 'Next', hi: 'अगला' },
  'common.previous': { en: 'Previous', hi: 'पिछला' },
  'common.continue': { en: 'Continue', hi: 'जारी रखें' },

  // Form Labels
  'form.name': { en: 'Name', hi: 'नाम' },
  'form.email': { en: 'Email', hi: 'ईमेल' },
  'form.phone': { en: 'Phone Number', hi: 'फोन नंबर' },
  'form.address': { en: 'Address', hi: 'पता' },
  'form.message': { en: 'Message', hi: 'संदेश' },
  'form.required': { en: 'Required', hi: 'आवश्यक' },
  'form.optional': { en: 'Optional', hi: 'वैकल्पिक' },

  // Status Messages
  'status.published': { en: 'Published', hi: 'प्रकाशित' },
  'status.draft': { en: 'Draft', hi: 'मसौदा' },
  'status.active': { en: 'Active', hi: 'सक्रिय' },
  'status.inactive': { en: 'Inactive', hi: 'निष्क्रिय' },
  'status.pending': { en: 'Pending', hi: 'लंबित' },
  'status.approved': { en: 'Approved', hi: 'अनुमोदित' },
  'status.rejected': { en: 'Rejected', hi: 'अस्वीकृत' },

  // Admin Panel
  'admin.title': { en: 'Admin Panel', hi: 'एडमिन पैनल' },
  'admin.dashboard': { en: 'Dashboard', hi: 'डैशबोर्ड' },
  'admin.articles': { en: 'Article Editor', hi: 'लेख संपादक' },
  'admin.theme': { en: 'Theme Customization', hi: 'थीम अनुकूलन' },
  'admin.logout': { en: 'Logout', hi: 'लॉगआउट' },
  'admin.login': { en: 'Admin Login', hi: 'एडमिन लॉगिन' },
  'admin.username': { en: 'Username', hi: 'उपयोगकर्ता नाम' },
  'admin.password': { en: 'Password', hi: 'पासवर्ड' },

  // Chatbot
  'chatbot.title': { en: 'MyScheme Assistant', hi: 'मायस्कीम सहायक' },
  'chatbot.placeholder': { en: 'Type your message...', hi: 'अपना संदेश टाइप करें...' },
  'chatbot.help': { en: 'How can I help you?', hi: 'मैं आपकी कैसे सहायता कर सकता हूं?' },
  'chatbot.greeting': { en: 'Hello! I\'m here to help you find government schemes. What are you looking for?', hi: 'नमस्ते! मैं यहां आपको सरकारी योजनाएं खोजने में मदद करने के लिए हूं। आप क्या खोज रहे हैं?' },

  // Features Section
  'features.personalized.title': { en: 'Personalized Search', hi: 'व्यक्तिगत खोज' },
  'features.personalized.description': { en: 'Find schemes tailored to your specific needs and eligibility criteria with our advanced filtering system', hi: 'हमारी उन्नत फ़िल्टरिंग सिस्टम के साथ अपनी विशिष्ट आवश्यकताओं और पात्रता मानदंडों के अनुरूप योजनाएं खोजें' },
  'features.browse.title': { en: 'Easy Browsing', hi: 'आसान ब्राउज़िंग' },
  'features.browse.description': { en: 'Browse through categorized schemes with intuitive navigation and user-friendly interface design', hi: 'सहज नेवीगेशन और उपयोगकर्ता-अनुकूल इंटरफेस डिज़ाइन के साथ श्रेणीबद्ध योजनाओं के माध्यम से ब्राउज़ करें' },
  'features.benefits.title': { en: 'Comprehensive Benefits', hi: 'व्यापक लाभ' },
  'features.benefits.description': { en: 'Access detailed information about financial and non-financial benefits for each government scheme', hi: 'प्रत्येक सरकारी योजना के लिए वित्तीय और गैर-वित्तीय लाभों के बारे में विस्तृत जानकारी प्राप्त करें' },
  'features.howit.title': { en: 'Simple Process', hi: 'सरल प्रक्रिया' },
  'features.howit.description': { en: 'Follow step-by-step guidance for easy application and access to government benefits', hi: 'आसान आवेदन और सरकारी लाभों तक पहुंच के लिए चरण-दर-चरण मार्गदर्शन का पालन करें' }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<'en' | 'hi'>(() => {
    const saved = localStorage.getItem('language');
    return (saved as 'en' | 'hi') || 'en';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [dynamicTranslations, setDynamicTranslations] = useState<Record<string, Translation>>({});
  const { sendMessage } = useRealTimeStore();

  const allTranslations = { ...translations, ...dynamicTranslations };

  const setLanguage = async (lang: 'en' | 'hi') => {
    setIsLoading(true);
    
    try {
      // Simulate loading for smooth transition
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setLanguageState(lang);
      localStorage.setItem('language', lang);
      
      // Update document attributes
      document.documentElement.lang = lang;
      document.documentElement.dir = 'ltr'; // Both languages are LTR
      
      // Send real-time language change to other users
      sendMessage('language_changed', { language: lang });
      
      // Dispatch custom event for components to listen
      window.dispatchEvent(new CustomEvent('languagechange', { 
        detail: { language: lang } 
      }));
      
    } finally {
      setIsLoading(false);
    }
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const translation = allTranslations[key];
    let text = translation ? translation[language] : key;
    
    // Handle missing translations gracefully
    if (!translation) {
      console.warn(`Missing translation for key: ${key}`);
      // Return the key as fallback, formatted nicely
      text = key.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim() || key;
    }
    
    // Handle parameter interpolation
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        text = text.replace(new RegExp(`{{${param}}}`, 'g'), String(value));
      });
    }
    
    return text;
  };

  const addTranslation = (key: string, en: string, hi: string) => {
    setDynamicTranslations(prev => ({
      ...prev,
      [key]: { en, hi }
    }));
    
    // Save to localStorage for persistence
    const saved = JSON.parse(localStorage.getItem('dynamicTranslations') || '{}');
    saved[key] = { en, hi };
    localStorage.setItem('dynamicTranslations', JSON.stringify(saved));
  };

  // Load dynamic translations on mount
  useEffect(() => {
    const saved = localStorage.getItem('dynamicTranslations');
    if (saved) {
      try {
        setDynamicTranslations(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load dynamic translations:', error);
      }
    }
  }, []);

  // Listen for real-time language changes from other users
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      const { language: newLang } = event.detail;
      if (newLang !== language) {
        setLanguageState(newLang);
        localStorage.setItem('language', newLang);
        document.documentElement.lang = newLang;
      }
    };

    window.addEventListener('language_changed', handleLanguageChange as EventListener);
    
    return () => {
      window.removeEventListener('language_changed', handleLanguageChange as EventListener);
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      t, 
      isLoading,
      translations: allTranslations,
      addTranslation
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};