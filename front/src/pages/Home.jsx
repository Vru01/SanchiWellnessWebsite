import Navbar from '@/components/layout/Navbar';
import HeroSlider from '@/components/home/HeroSlider';
import AboutSection from '@/components/home/AboutSection';
import BestSellers from '@/components/home/BestSellers';
import ProductSection from '@/components/home/ProductSection';
import Footer from '@/components/home/Footer';

export default function Home() {
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
