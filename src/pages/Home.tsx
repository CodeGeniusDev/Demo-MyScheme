import React from 'react';
import HeroCarousel from '../components/HeroCarousel';
import HowItWorks from '../components/HowItWorks';
import CategoryGrid from '../components/CategoryGrid';
import PopularSchemes from '../components/PopularSchemes';
import Testimonials from '../components/Testimonials';
import CTABanner from '../components/CTABanner';

const Home: React.FC = () => {
  return (
    <main>
      <HeroCarousel />
      <HowItWorks />
      <CategoryGrid />
      <PopularSchemes />
      <Testimonials />
      <CTABanner />
    </main>
  );
};

export default Home;