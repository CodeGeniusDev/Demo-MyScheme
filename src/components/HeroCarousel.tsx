import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

const HeroCarousel: React.FC = () => {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      image: 'https://images.pexels.com/photos/1595391/pexels-photo-1595391.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      titleKey: 'hero.title',
      subtitleKey: 'hero.subtitle'
    },
    {
      id: 2,
      image: 'https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      titleKey: 'hero.title',
      subtitleKey: 'hero.subtitle'
    },
    {
      id: 3,
      image: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      titleKey: 'hero.title',
      subtitleKey: 'hero.subtitle'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative h-[70vh] lg:h-[80vh] overflow-hidden bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <div className="flex items-center h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row items-center w-full">
                {/* Text Content */}
                <motion.div 
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="lg:w-1/2 text-center lg:text-left mb-8 lg:mb-0 lg:pr-12"
                >
                  <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    {t(slides[currentSlide].titleKey)}
                  </h1>
                  <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                    {t(slides[currentSlide].subtitleKey)}
                  </p>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    {t('hero.cta')}
                  </motion.button>
                  
                  <div className="flex flex-wrap justify-center lg:justify-start gap-3 mt-8">
                    <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-4 py-2 rounded-lg text-sm font-medium">
                      #GOVERNMENTSCHEMES
                    </span>
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-lg text-sm font-medium">
                      #DIGITALINDIA
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
                    {t('hero.stats')}
                  </p>
                </motion.div>

                {/* Diamond-shaped Image */}
                <motion.div 
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="lg:w-1/2 relative"
                >
                  <div className="relative w-80 h-80 mx-auto">
                    <div className="absolute inset-0 transform rotate-45 overflow-hidden rounded-3xl shadow-2xl">
                      <img
                        src={slides[currentSlide].image}
                        alt={t(slides[currentSlide].titleKey)}
                        className="w-full h-full object-cover transform -rotate-45 scale-150"
                      />
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute -top-4 -right-4 w-8 h-8 bg-green-500 rounded-full opacity-80"></div>
                    <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-blue-500 rounded-full opacity-60"></div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 shadow-lg rounded-full p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 z-10 group"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5 text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 shadow-lg rounded-full p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 z-10 group"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5 text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-green-600 scale-125' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;