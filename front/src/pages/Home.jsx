import Navbar from '@/components/layout/Navbar';
import HeroSlider from '@/components/home/HeroSlider';
import AboutSection from '@/components/home/AboutSection';
import BestSellers from '@/components/home/BestSellers';
import ProductSection from '@/components/home/ProductSection';
import Footer from '@/components/home/Footer';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    // If both pieces of data exist, zip them straight to their dashboard automatically
    if (storedUser && token) {
      const user = JSON.parse(storedUser);
      if (user.email === import.meta.env.VITE_ADMIN_EMAIL) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [navigate]);
  
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSlider />
      <AboutSection />
      <BestSellers />
      <ProductSection />
      <Footer />
    </div>
  );
}
