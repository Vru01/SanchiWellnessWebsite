import Navbar from '@/components/layout/Navbar';
import HeroSlider from '@/components/home/HeroSlider';
import AboutSection from '@/components/home/AboutSection';
import BestSellers from '@/components/home/BestSellers';
import ProductSection from '@/components/home/ProductSection';
import Footer from '@/components/home/Footer';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    // If both pieces of data exist, zip them straight to their dashboard automatically
    if (storedUser && token && token !== "undefined" && token !== "null") {
      try {
        const user = JSON.parse(storedUser);
        if (user.email === import.meta.env.VITE_ADMIN_EMAIL) {
          navigate('/admin');
        } else {
          navigate('/dashboard' + location.hash); // Retain hash parameters if routing dynamically
        }
        return; // Halt logic immediately
      } catch (e) {
        // Clear broken tokens if parsing fails safely
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    
    // Only allow the home components to initialize if the user is genuinely unauthenticated
    setIsCheckingAuth(false);
  }, [navigate, location.hash]);

  // Hash scrolling logic loop execution
  useEffect(() => {
    if (!isCheckingAuth && location.hash === "#products") {
      const timer = setTimeout(() => {
        const element = document.getElementById("products");
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [location, isCheckingAuth]);
  
  // 🟢 CRITICAL GAURD: If logged in, return null instantly. 
  // This completely stops ProductSection from rendering and spamming API fetch queries.
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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