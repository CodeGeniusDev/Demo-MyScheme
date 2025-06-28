import React, { useState, useEffect } from 'react';
import { Save, Palette, Type, Layout, Eye, RotateCcw } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useRealTimeStore } from '../../store/realTimeStore';
import toast from 'react-hot-toast';

const ThemeCustomizer: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { sendMessage } = useRealTimeStore();
  
  const [themeSettings, setThemeSettings] = useState({
    // Colors
    primaryColor: '#16a34a',
    secondaryColor: '#3b82f6',
    accentColor: '#f59e0b',
    backgroundColor: '#ffffff',
    surfaceColor: '#f9fafb',
    textColor: '#111827',
    borderColor: '#e5e7eb',
    
    // Typography
    fontFamily: 'Inter',
    fontSize: '16',
    fontWeight: '400',
    lineHeight: '1.5',
    
    // Layout
    borderRadius: '8',
    spacing: '16',
    maxWidth: '1200',
    headerHeight: '64',
    
    // Effects
    shadowIntensity: 'medium',
    animationSpeed: 'normal'
  });

  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    // Load saved theme settings
    const saved = localStorage.getItem('customThemeSettings');
    if (saved) {
      try {
        setThemeSettings(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load theme settings:', error);
      }
    }
  }, []);

  const applyTheme = () => {
    const root = document.documentElement;
    
    // Apply color variables
    root.style.setProperty('--color-primary', themeSettings.primaryColor);
    root.style.setProperty('--color-secondary', themeSettings.secondaryColor);
    root.style.setProperty('--color-accent', themeSettings.accentColor);
    root.style.setProperty('--color-background', themeSettings.backgroundColor);
    root.style.setProperty('--color-surface', themeSettings.surfaceColor);
    root.style.setProperty('--color-text', themeSettings.textColor);
    root.style.setProperty('--color-border', themeSettings.borderColor);
    
    // Apply typography
    root.style.setProperty('--font-family', themeSettings.fontFamily);
    root.style.setProperty('--font-size-base', `${themeSettings.fontSize}px`);
    root.style.setProperty('--font-weight-normal', themeSettings.fontWeight);
    root.style.setProperty('--line-height', themeSettings.lineHeight);
    
    // Apply layout
    root.style.setProperty('--border-radius', `${themeSettings.borderRadius}px`);
    root.style.setProperty('--spacing-base', `${themeSettings.spacing}px`);
    root.style.setProperty('--max-width', `${themeSettings.maxWidth}px`);
    root.style.setProperty('--header-height', `${themeSettings.headerHeight}px`);
  };

  const handleSave = () => {
    localStorage.setItem('customThemeSettings', JSON.stringify(themeSettings));
    applyTheme();
    
    // Send real-time update to all users
    sendMessage('theme_updated', themeSettings);
    
    toast.success('Theme settings saved and applied!');
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all theme settings to default?')) {
      const defaultSettings = {
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
        animationSpeed: 'normal'
      };
      
      setThemeSettings(defaultSettings);
      localStorage.setItem('customThemeSettings', JSON.stringify(defaultSettings));
      applyTheme();
      
      sendMessage('theme_reset', defaultSettings);
      toast.success('Theme reset to default settings!');
    }
  };

  const updateSetting = (key: string, value: string) => {
    setThemeSettings(prev => ({ ...prev, [key]: value }));
    
    if (previewMode) {
      // Apply changes immediately in preview mode
      const root = document.documentElement;
      
      switch (key) {
        case 'primaryColor':
          root.style.setProperty('--color-primary', value);
          break;
        case 'secondaryColor':
          root.style.setProperty('--color-secondary', value);
          break;
        case 'accentColor':
          root.style.setProperty('--color-accent', value);
          break;
        case 'backgroundColor':
          root.style.setProperty('--color-background', value);
          break;
        case 'surfaceColor':
          root.style.setProperty('--color-surface', value);
          break;
        case 'textColor':
          root.style.setProperty('--color-text', value);
          break;
        case 'borderColor':
          root.style.setProperty('--color-border', value);
          break;
        case 'fontFamily':
          root.style.setProperty('--font-family', value);
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
    }
  };

  const colorPresets = [
    { name: 'Default Green', primary: '#16a34a', secondary: '#3b82f6', accent: '#f59e0b' },
    { name: 'Ocean Blue', primary: '#0ea5e9', secondary: '#3b82f6', accent: '#06b6d4' },
    { name: 'Purple Pro', primary: '#8b5cf6', secondary: '#a855f7', accent: '#d946ef' },
    { name: 'Sunset Orange', primary: '#f97316', secondary: '#ea580c', accent: '#fb923c' },
    { name: 'Forest Green', primary: '#059669', secondary: '#10b981', accent: '#34d399' },
    { name: 'Royal Purple', primary: '#7c3aed', secondary: '#8b5cf6', accent: '#a78bfa' }
  ];

  const fontOptions = [
    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'Montserrat', 'Source Sans Pro', 'Nunito'
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Theme Customization</h1>
          <p className="text-gray-600 dark:text-gray-400">Customize colors, typography, and layout with real-time preview</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 ${
              previewMode 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Eye className="h-4 w-4" />
            <span>{previewMode ? 'Live Preview ON' : 'Live Preview OFF'}</span>
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </button>
          <button
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
          >
            <Save className="h-4 w-4" />
            <span>Save & Apply</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Color Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Palette className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Colors</h3>
          </div>

          {/* Color Presets */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Color Presets
            </label>
            <div className="grid grid-cols-2 gap-2">
              {colorPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    updateSetting('primaryColor', preset.primary);
                    updateSetting('secondaryColor', preset.secondary);
                    updateSetting('accentColor', preset.accent);
                  }}
                  className="flex items-center space-x-2 p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.primary }} />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.secondary }} />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.accent }} />
                  </div>
                  <span className="text-xs text-gray-700 dark:text-gray-300">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Individual Colors */}
          <div className="space-y-4">
            {[
              { key: 'primaryColor', label: 'Primary Color' },
              { key: 'secondaryColor', label: 'Secondary Color' },
              { key: 'accentColor', label: 'Accent Color' },
              { key: 'backgroundColor', label: 'Background Color' },
              { key: 'surfaceColor', label: 'Surface Color' },
              { key: 'textColor', label: 'Text Color' },
              { key: 'borderColor', label: 'Border Color' }
            ].map((color) => (
              <div key={color.key} className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {color.label}
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={themeSettings[color.key as keyof typeof themeSettings]}
                    onChange={(e) => updateSetting(color.key, e.target.value)}
                    className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600"
                  />
                  <input
                    type="text"
                    value={themeSettings[color.key as keyof typeof themeSettings]}
                    onChange={(e) => updateSetting(color.key, e.target.value)}
                    className="w-20 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Typography Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Type className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Typography</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Font Family
              </label>
              <select
                value={themeSettings.fontFamily}
                onChange={(e) => updateSetting('fontFamily', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {fontOptions.map((font) => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Base Font Size: {themeSettings.fontSize}px
              </label>
              <input
                type="range"
                min="12"
                max="20"
                value={themeSettings.fontSize}
                onChange={(e) => updateSetting('fontSize', e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Font Weight
              </label>
              <select
                value={themeSettings.fontWeight}
                onChange={(e) => updateSetting('fontWeight', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="300">Light (300)</option>
                <option value="400">Normal (400)</option>
                <option value="500">Medium (500)</option>
                <option value="600">Semi Bold (600)</option>
                <option value="700">Bold (700)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Line Height: {themeSettings.lineHeight}
              </label>
              <input
                type="range"
                min="1.2"
                max="2.0"
                step="0.1"
                value={themeSettings.lineHeight}
                onChange={(e) => updateSetting('lineHeight', e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Layout Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Layout className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Layout</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Border Radius: {themeSettings.borderRadius}px
              </label>
              <input
                type="range"
                min="0"
                max="20"
                value={themeSettings.borderRadius}
                onChange={(e) => updateSetting('borderRadius', e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Base Spacing: {themeSettings.spacing}px
              </label>
              <input
                type="range"
                min="8"
                max="32"
                value={themeSettings.spacing}
                onChange={(e) => updateSetting('spacing', e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Width: {themeSettings.maxWidth}px
              </label>
              <input
                type="range"
                min="1000"
                max="1600"
                step="50"
                value={themeSettings.maxWidth}
                onChange={(e) => updateSetting('maxWidth', e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Header Height: {themeSettings.headerHeight}px
              </label>
              <input
                type="range"
                min="48"
                max="80"
                value={themeSettings.headerHeight}
                onChange={(e) => updateSetting('headerHeight', e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Live Preview</h3>
          
          <div className="space-y-4">
            <div 
              className="p-4 rounded-lg border"
              style={{
                backgroundColor: themeSettings.surfaceColor,
                borderColor: themeSettings.borderColor,
                borderRadius: `${themeSettings.borderRadius}px`
              }}
            >
              <h4 
                className="font-semibold mb-2"
                style={{
                  color: themeSettings.textColor,
                  fontFamily: themeSettings.fontFamily,
                  fontSize: `${parseInt(themeSettings.fontSize) + 2}px`,
                  fontWeight: themeSettings.fontWeight,
                  lineHeight: themeSettings.lineHeight
                }}
              >
                Sample Card Title
              </h4>
              <p 
                className="mb-3"
                style={{
                  color: themeSettings.textColor,
                  fontFamily: themeSettings.fontFamily,
                  fontSize: `${themeSettings.fontSize}px`,
                  lineHeight: themeSettings.lineHeight,
                  opacity: 0.8
                }}
              >
                This is how your content will look with the current theme settings.
              </p>
              <button
                className="px-4 py-2 rounded text-white font-medium"
                style={{
                  backgroundColor: themeSettings.primaryColor,
                  borderRadius: `${themeSettings.borderRadius}px`,
                  fontFamily: themeSettings.fontFamily
                }}
              >
                Primary Button
              </button>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400">
              {previewMode ? 'Live preview is active - changes apply immediately' : 'Enable live preview to see changes in real-time'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeCustomizer;