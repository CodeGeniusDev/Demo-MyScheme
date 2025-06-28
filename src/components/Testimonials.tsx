import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

const Testimonials: React.FC = () => {
  const { t } = useLanguage();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: 'Rajesh Kumar',
      location: 'Uttar Pradesh',
      scheme: 'PM-KISAN',
      rating: 5,
      textEn: 'PM-KISAN has been a game-changer for my farming. The direct transfer of ₹6,000 annually helps me buy seeds and fertilizers without any hassle.',
      textHi: 'पीएम-किसान मेरी खेती के लिए गेम-चेंजर रहा है। सालाना ₹6,000 का सीधा ट्रांसफर मुझे बिना किसी परेशानी के बीज और उर्वरक खरीदने में मदद करता है।',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    },
    {
      id: 2,
      name: 'Priya Sharma',
      location: 'Maharashtra',
      scheme: 'Beti Bachao Beti Padhao',
      rating: 5,
      textEn: 'Thanks to Beti Bachao Beti Padhao, my daughter received educational support and scholarships. This scheme truly empowers girl children.',
      textHi: 'बेटी बचाओ बेटी पढ़ाओ के कारण, मेरी बेटी को शैक्षिक सहायता और छात्रवृत्ति मिली। यह योजना वास्तव में बालिकाओं को सशक्त बनाती है।',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    },
    {
      id: 3,
      name: 'Dr. Amit Patel',
      location: 'Gujarat',
      scheme: 'ICMR Fellowship',
      rating: 5,
      textEn: 'The ICMR fellowship provided me with excellent research opportunities and financial support during my post-doctoral studies.',
      textHi: 'आईसीएमआर फेलोशिप ने मुझे अपनी पोस्ट-डॉक्टरल पढ़ाई के दौरान उत्कृष्ट अनुसंधान अवसर और वित्तीय सहायता प्रदान की।',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop'
    }
  ];

  const { language } = useLanguage();

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-16 lg:py-24 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('testimonials.title')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {t('testimonials.subtitle')}
          </p>
        </motion.div>

        <div className="relative">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="flex items-start space-x-4"
              >
                <Quote className="h-8 w-8 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6">
                    {language === 'hi' 
                      ? testimonials[currentTestimonial].textHi 
                      : testimonials[currentTestimonial].textEn
                    }
                  </p>
                  
                  <div className="flex items-center space-x-4">
                    <img
                      src={testimonials[currentTestimonial].avatar}
                      alt={testimonials[currentTestimonial].name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {testimonials[currentTestimonial].name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {testimonials[currentTestimonial].location} • {testimonials[currentTestimonial].scheme}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={prevTestimonial}
              className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 group"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200" />
            </button>

            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial 
                      ? 'bg-green-600 scale-125' 
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 group"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;