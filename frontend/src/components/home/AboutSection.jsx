import React from 'react';
import { Button } from "@/components/ui/button";
import { Leaf, FlaskConical, HeartHandshake } from "lucide-react"; 

// IMPORT IMAGE (Make sure this path is correct)
// import AboutImage from '@/assets/Products/P1.jpeg'; 
import AboutImage from '@/assets/image.png';
const AboutSection = () => {
  return (
    <section id="about" className="py-16 md:py-24 bg-stone-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:grid md:grid-cols-2 gap-12 items-center">
          
          {/* =========================================
              LEFT: IMAGE SECTION
              On Mobile: Takes full width (w-full)
          ========================================== */}
          <div className="relative w-full group">
            {/* Image Container 
                aspect-square: Makes it a big box on mobile
                md:aspect-square: Keeps it square on desktop too
            */}
            <div className="w-full aspect-square rounded-3xl overflow-hidden shadow-2xl relative z-10">
              <img 
                src={AboutImage}
                alt="Sanchi Wellness Philosophy" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>
            
            {/* Decorative Border Box (Behind Image) */}
            <div className="absolute -z-0 top-4 left-4 md:top-6 md:left-6 w-full h-full border-2 border-green-200 rounded-3xl"></div>
          </div>
          
          {/* =========================================
              RIGHT: CONTENT SECTION
          ========================================== */}
          <div className="w-full space-y-6 md:space-y-8">
            
            {/* Header Group */}
            <div className="space-y-3">
              <span className="inline-block bg-green-100 text-green-800 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase">
                Our Philosophy
              </span>
              
              <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight">
                Bridging <span className="text-green-700">Ancient Wisdom</span> with Modern Science
              </h2>
            </div>

            {/* Description */}
            <p className="text-base md:text-lg text-gray-600 leading-relaxed">
              At <span className="font-semibold text-gray-900">Sanchi Wellness</span>, we believe healing comes from the source. 
              We don't just sell supplements; we curate a lifestyle of holistic well-being. 
              By combining time-tested Ayurvedic traditions with clinical research, we ensure every drop brings you closer to balance.
            </p>

            {/* Feature Icons Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-stone-100">
                <Leaf className="w-5 h-5 text-green-600" />
                <h4 className="font-bold text-gray-900 text-sm">100% Organic</h4>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-stone-100">
                <FlaskConical className="w-5 h-5 text-green-600" />
                <h4 className="font-bold text-gray-900 text-sm">Lab Tested</h4>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-stone-100">
                <HeartHandshake className="w-5 h-5 text-green-600" />
                <h4 className="font-bold text-gray-900 text-sm">Ethical</h4>
              </div>
            </div>

            {/* Button */}
            <div className="pt-2">
              <Button className="w-full md:w-auto bg-stone-900 hover:bg-stone-800 text-white rounded-full px-10 py-6 text-lg shadow-lg hover:shadow-xl transition-all">
                Read Our Story
              </Button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;