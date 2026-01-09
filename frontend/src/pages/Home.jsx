import React from 'react';
import Navbar from '@/components/layout/Navbar';
import HeroSlider from '@/components/home/HeroSlider';
import AboutSection from '@/components/home/AboutSection';
import ProductSection from '@/components/home/ProductSection';
import Footer from '@/components/home/Footer';

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSlider />
      <AboutSection />
      <ProductSection /> 
      <Footer />
    </div>
  );
};

export default Home;