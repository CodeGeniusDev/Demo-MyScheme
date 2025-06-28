import React from 'react';
import { 
  GraduationCap, 
  Heart, 
  Briefcase, 
  Home, 
  Users, 
  Wrench,
  Award,
  Baby
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const CategoryGrid: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const categories = [
    {
      icon: GraduationCap,
      titleKey: 'categories.education',
      count: '245',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      hoverColor: 'hover:bg-blue-200 dark:hover:bg-blue-900/40'
    },
    {
      icon: Heart,
      titleKey: 'categories.health',
      count: '189',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      hoverColor: 'hover:bg-red-200 dark:hover:bg-red-900/40'
    },
    {
      icon: Briefcase,
      titleKey: 'categories.employment',
      count: '156',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      hoverColor: 'hover:bg-green-200 dark:hover:bg-green-900/40'
    },
    {
      icon: Home,
      titleKey: 'categories.housing',
      count: '98',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      hoverColor: 'hover:bg-orange-200 dark:hover:bg-orange-900/40'
    },
    {
      icon: Users,
      titleKey: 'categories.social',
      count: '234',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      hoverColor: 'hover:bg-purple-200 dark:hover:bg-purple-900/40'
    },
    {
      icon: Wrench,
      titleKey: 'categories.skill',
      count: '167',
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/20',
      hoverColor: 'hover:bg-indigo-200 dark:hover:bg-indigo-900/40'
    },
    {
      icon: Award,
      titleKey: 'categories.women',
      count: '123',
      color: 'text-pink-600 dark:text-pink-400',
      bgColor: 'bg-pink-100 dark:bg-pink-900/20',
      hoverColor: 'hover:bg-pink-200 dark:hover:bg-pink-900/40'
    },
    {
      icon: Baby,
      titleKey: 'categories.child',
      count: '89',
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
      hoverColor: 'hover:bg-yellow-200 dark:hover:bg-yellow-900/40'
    }
  ];

  const handleCategoryClick = (titleKey: string) => {
    const category = t(titleKey);
    navigate(`/search?category=${encodeURIComponent(category)}`);
  };

  return (
    <section className="py-16 lg:py-24 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('categories.title')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t('categories.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              onClick={() => handleCategoryClick(category.titleKey)}
              className={`bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 ${category.hoverColor} transition-all duration-300 cursor-pointer group`}
            >
              <div className={`w-12 h-12 ${category.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <category.icon className={`h-6 w-6 ${category.color}`} />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">
                {t(category.titleKey)}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {category.count} {t('categories.schemes')}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;