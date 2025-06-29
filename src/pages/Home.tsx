import React, { useState, useEffect } from 'react';
import { HeroCarousel } from '../components/HeroCarousel';
import { CategoryGrid } from '../components/CategoryGrid';
import { PopularSchemes } from '../components/PopularSchemes';
import { HowItWorks } from '../components/HowItWorks';
import { Testimonials } from '../components/Testimonials';
import { CTABanner } from '../components/CTABanner';
import { DemoModeNotice } from '../components/common/DemoModeNotice';
import { useContent } from '../contexts/ContentContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const Home: React.FC = () => {
  const { loading } = useContent();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={`transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <DemoModeNotice />
      <HeroCarousel />
      <CategoryGrid />
      <PopularSchemes />
      <HowItWorks />
      <Testimonials />
      <CTABanner />
    </div>
  );
};