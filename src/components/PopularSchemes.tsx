import React from 'react';
import { ArrowRight, MapPin, Calendar } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const PopularSchemes: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const popularSchemes = [
    {
      id: '4',
      titleKey: 'PM-KISAN',
      title: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
      descriptionKey: 'Direct income support of ₹6,000 per year to farmer families across India.',
      state: 'All India',
      category: 'Agriculture',
      lastUpdated: '2024-12-12',
      tags: ['Farmer', 'Income Support', 'DBT']
    },
    {
      id: '5',
      titleKey: 'BBBP',
      title: 'Beti Bachao Beti Padhao Scheme',
      descriptionKey: 'Addressing declining child sex ratio and promoting welfare of girl child.',
      state: 'All India',
      category: 'Women Empowerment',
      lastUpdated: '2024-12-05',
      tags: ['Girl Child', 'Education', 'Women Empowerment']
    },
    {
      id: '2',
      titleKey: 'ICMR',
      title: 'ICMR- Post Doctoral Fellowship',
      descriptionKey: 'Fellowship for Ph.D./MD/MS holders in medical research areas.',
      state: 'All India',
      category: 'Research & Development',
      lastUpdated: '2024-12-10',
      tags: ['Fellowship', 'Research', 'Medical']
    },
    {
      id: '1',
      titleKey: 'Disability',
      title: 'Financial Assistance To Disabled Students',
      descriptionKey: 'Financial support for disabled students pursuing secondary education.',
      state: 'Kerala',
      category: 'Education',
      lastUpdated: '2024-12-15',
      tags: ['Disabled', 'Student', 'Financial Assistance']
    }
  ];

  const handleSchemeClick = (schemeId: string) => {
    navigate(`/scheme/${schemeId}`);
  };

  return (
    <section className="py-16 lg:py-24 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('popular.title')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t('popular.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {popularSchemes.map((scheme, index) => (
            <motion.div
              key={scheme.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              onClick={() => handleSchemeClick(scheme.id)}
              className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-green-300 dark:hover:border-green-600 transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <MapPin className="h-3 w-3" />
                  <span>{scheme.state}</span>
                </div>
                <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-xs font-medium">
                  {scheme.category}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                {scheme.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm leading-relaxed">
                {scheme.descriptionKey}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {scheme.tags.map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-lg text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                  <Calendar className="h-3 w-3" />
                  <span>Updated: {scheme.lastUpdated}</span>
                </div>
                <div className="flex items-center space-x-2 text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-300">
                  <span className="text-sm font-medium">{t('popular.checkeligibility')}</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <button
            onClick={() => navigate('/search')}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl transition-all duration-300 text-sm font-medium hover:shadow-lg transform hover:scale-105"
          >
            {t('popular.viewall')}
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default PopularSchemes;