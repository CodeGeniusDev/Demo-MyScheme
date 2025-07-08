import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AdminProvider } from './contexts/AdminContext';
import { ContentProvider } from './contexts/ContentContext';
import { useAuthStore } from './store/authStore';
import { useRealTimeStore } from './store/realTimeStore';
import ErrorBoundary from './components/common/ErrorBoundary';
import PWAInstallPrompt from './components/common/PWAInstallPrompt';
import Header from './components/Header';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import { Home } from './pages/Home';
import Search from './pages/Search';
import SchemeDetail from './pages/SchemeDetail';
import AdminLogin from './components/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/admin/ProtectedRoute';
import ArticleEditor from './pages/admin/ArticleEditor';
import ThemeCustomizer from './pages/admin/ThemeCustomizer';

function App() {
  const { isAuthenticated, token } = useAuthStore();
  const { connect, disconnect } = useRealTimeStore();

  useEffect(() => {
    // Initialize real-time connection for authenticated users
    if (isAuthenticated && token) {
      connect(token);
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, token, connect, disconnect]);

  // Listen for real-time theme updates
  useEffect(() => {
    const handleThemeUpdate = (event: CustomEvent) => {
      const themeSettings = event.detail;
      const root = document.documentElement;
      
      // Apply theme changes in real-time
      Object.entries(themeSettings).forEach(([key, value]) => {
        switch (key) {
          case 'primaryColor':
            root.style.setProperty('--color-primary', value as string);
            break;
          case 'secondaryColor':
            root.style.setProperty('--color-secondary', value as string);
            break;
          case 'accentColor':
            root.style.setProperty('--color-accent', value as string);
            break;
          case 'backgroundColor':
            root.style.setProperty('--color-background', value as string);
            break;
          case 'surfaceColor':
            root.style.setProperty('--color-surface', value as string);
            break;
          case 'textColor':
            root.style.setProperty('--color-text', value as string);
            break;
          case 'borderColor':
            root.style.setProperty('--color-border', value as string);
            break;
          case 'fontFamily':
            root.style.setProperty('--font-family', value as string);
            break;
          case 'fontSize':
            root.style.setProperty('--font-size-base', `${value}px`);
            break;
          case 'borderRadius':
            root.style.setProperty('--border-radius', `${value}px`);
            break;
          case 'spacing':
            root.style.setProperty('--spacing-base', `${value}px`);
            break;
        }
      });
    };

    window.addEventListener('theme_updated', handleThemeUpdate as EventListener);
    
    return () => {
      window.removeEventListener('theme_updated', handleThemeUpdate as EventListener);
    };
  }, []);

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <ThemeProvider>
          <LanguageProvider>
            <AdminProvider>
              <ContentProvider>
                <Router>
                  <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
                    <Routes>
                      {/* Admin Routes */}
                      <Route path="/admin/login" element={<AdminLogin />} />
                      <Route path="/admin/*" element={
                        <ProtectedRoute>
                          <AdminLayout />
                        </ProtectedRoute>
                      }>
                        <Route index element={<ArticleEditor />} />
                        <Route path="articles" element={<ArticleEditor />} />
                        <Route path="theme" element={<ThemeCustomizer />} />
                      </Route>

                      {/* Public Routes */}
                      <Route path="/*" element={
                        <>
                          <Header />
                          <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/search" element={<Search />} />
                            <Route path="/scheme/:id" element={<SchemeDetail />} />
                          </Routes>
                          <Footer />
                          <Chatbot />
                          <PWAInstallPrompt />
                        </>
                      } />
                    </Routes>
                    <Toaster 
                      position="top-right"
                      toastOptions={{
                        duration: 4000,
                        style: {
                          background: 'var(--color-surface)',
                          color: 'var(--color-text)',
                          border: '1px solid var(--color-border)'
                        }
                      }}
                    />
                  </div>
                </Router>
              </ContentProvider>
            </AdminProvider>
          </LanguageProvider>
        </ThemeProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;