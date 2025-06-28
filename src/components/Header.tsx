import React, { useState } from 'react';
import { Search, Sun, Moon, Languages, ArrowRight, Menu, X, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Header: React.FC = () => {
  const { t, language, setLanguage, isLoading } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  const handleSearchClick = () => {
    navigate('/search');
  };

  const gotoadminpanel = () => {
    navigate('/admin');
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleLanguageChange = async (newLang: 'en' | 'hi') => {
    setIsLanguageMenuOpen(false);
    await setLanguage(newLang);
  };

  const languageOptions = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' }
  ];

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            <div 
              className="flex items-center space-x-3 cursor-pointer group" 
              onClick={handleLogoClick}
            >
              <img 
                src="https://images.pexels.com/photos/8828593/pexels-photo-8828593.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop" 
                alt="Government Emblem" 
                className="h-8 w-8 rounded-lg group-hover:scale-105 transition-transform duration-200"
              />
              <div className="flex items-center">
                <span className="text-xl font-bold text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-200">
                  {t('header.title').split('')[0].toLowerCase()}
                </span>
                <span className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-200">
                  {t('header.title').slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div 
              className="relative w-full cursor-pointer group" 
              onClick={handleSearchClick}
            >
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-200" />
              </div>
              <div className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-all duration-200 text-sm">
                {t('header.search.placeholder')}
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Search Icon - Mobile */}
            <button
              onClick={handleSearchClick}
              className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
              aria-label={t('header.search.placeholder')}
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Sign In Button */}
            <button onclick={gotoadminpanel} className="hidden sm:flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium hover:shadow-md transform hover:scale-105">
              <span>{t('header.signin')}</span>
              <ArrowRight className="h-3 w-3" />
            </button>

            {/* Language Toggle */}
            <div className="relative">
              <button
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                disabled={isLoading}
                className="flex items-center space-x-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-3 py-2 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-all duration-200 disabled:opacity-50"
                aria-label="Change Language"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600"></div>
                ) : (
                  <Globe className="h-3 w-3" />
                )}
                <span className="text-xs font-medium">
                  {language === 'en' ? 'EN' : 'हि'}
                </span>
              </button>

              <AnimatePresence>
                {isLanguageMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                  >
                    <div className="py-2">
                      {languageOptions.map((option) => (
                        <button
                          key={option.code}
                          onClick={() => handleLanguageChange(option.code as 'en' | 'hi')}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                            language === option.code 
                              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{option.name}</span>
                            <span className="text-xs opacity-75">{option.nativeName}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
              aria-label={isMobileMenuOpen ? t('header.close') : t('header.menu')}
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="sm:hidden border-t border-gray-200 dark:border-gray-800 py-4"
            >
              <button className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors duration-200 text-sm font-medium">
                <span>{t('header.signin')}</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Click outside to close language menu */}
      {isLanguageMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsLanguageMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;