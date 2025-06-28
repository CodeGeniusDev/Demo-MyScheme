import React from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const CTABanner: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSearchClick = () => {
    navigate('/search');
  };

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Search className="h-16 w-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            {t('cta.title')}
          </h2>
          <p className="text-lg lg:text-xl opacity-90 max-w-2xl mx-auto">
            {t('cta.description')}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSearchClick}
            className="bg-white text-green-600 hover:bg-gray-100 px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl"
          >
            <span>{t('cta.button')}</span>
            <ArrowRight className="h-4 w-4" />
          </motion.button>
          
          <div className="text-sm opacity-75">
            {t('cta.stats')}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTABanner;