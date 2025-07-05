import React from 'react';
import { Linkedin, Facebook, Twitter, Instagram } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();

  const quickLinks = [
    t('footer.aboutus'),
    t('footer.contactus'),
    t('footer.screenreader'),
    t('footer.accessibility'),
    t('footer.faq'),
    t('footer.disclaimer'),
    t('footer.terms')
  ];

  const usefulLinks = [
    { name: 'Digital India', logo: 'https://images.pexels.com/photos/8828593/pexels-photo-8828593.jpeg?auto=compress&cs=tinysrgb&w=100&h=50&fit=crop' },
    { name: 'DigiLocker', logo: 'https://images.pexels.com/photos/8828593/pexels-photo-8828593.jpeg?auto=compress&cs=tinysrgb&w=100&h=50&fit=crop' },
    { name: 'UMANG', logo: 'https://images.pexels.com/photos/8828593/pexels-photo-8828593.jpeg?auto=compress&cs=tinysrgb&w=100&h=50&fit=crop' },
    { name: 'India.gov.in', logo: 'https://images.pexels.com/photos/8828593/pexels-photo-8828593.jpeg?auto=compress&cs=tinysrgb&w=100&h=50&fit=crop' },
    { name: 'MyGov', logo: 'https://images.pexels.com/photos/8828593/pexels-photo-8828593.jpeg?auto=compress&cs=tinysrgb&w=100&h=50&fit=crop' },
    { name: 'Data.gov.in', logo: 'https://images.pexels.com/photos/8828593/pexels-photo-8828593.jpeg?auto=compress&cs=tinysrgb&w=100&h=50&fit=crop' }
  ];

  return (
    <footer className="bg-gray-900 dark:bg-black text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <span className="text-2xl font-bold text-green-400">my</span>
              <span className="text-2xl font-bold">Scheme</span>
            </div>
            <p className="text-gray-300 mb-6 text-sm">
              ©2025
            </p>
            <div className="mb-6">
              <p className="text-sm text-gray-300 mb-2">{t('footer.powered')}</p>
              <div className="flex items-center space-x-2">
                <img 
                  src="https://images.pexels.com/photos/8828593/pexels-photo-8828593.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop" 
                  alt="Digital India" 
                  className="h-6 w-6 rounded-lg"
                />
                <span className="text-sm text-green-400">Digital India Corporation</span>
              </div>
            </div>
            <div className="text-sm text-gray-400 leading-relaxed mb-6">
              <p>Digital India Corporation(DIC)</p>
              <p>Ministry of Electronics & IT (MeitY)</p>
              <p>Government of India®</p>
            </div>
            <div className="flex space-x-3">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 p-2 bg-gray-800 rounded-lg">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 p-2 bg-gray-800 rounded-lg">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 p-2 bg-gray-800 rounded-lg">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 p-2 bg-gray-800 rounded-lg">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">{t('footer.quicklinks')}</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Useful Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">{t('footer.usefullinks')}</h3>
            <div className="grid grid-cols-2 gap-3">
              {usefulLinks.map((link, index) => (
                <a 
                  key={index} 
                  href="#" 
                  className="block bg-white p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <img 
                    src={link.logo} 
                    alt={link.name} 
                    className="w-full h-6 object-contain"
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6">{t('footer.contact')}</h3>
            <div className="space-y-4 text-sm text-gray-300">
              <p className="leading-relaxed">
                {t('footer.address')}
              </p>
              <p>
                support-myscheme[at]digitalindia[dot]gov[dot]in
              </p>
              <p>
                {t('footer.phone')}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="text-center text-sm text-gray-400">
            {t('footer.lastupdate')}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;