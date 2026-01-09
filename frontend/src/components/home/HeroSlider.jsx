import React from 'react';
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const HeroSlider = () => {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false })
  );

  // ✅ UPDATED: We removed API_URL and used your direct Cloudinary links
  const images = [
    "https://res.cloudinary.com/dfqgwgehn/image/upload/v1767970064/S1_rvzr1o.jpg",
    "https://res.cloudinary.com/dfqgwgehn/image/upload/v1767970063/S2_tzlapo.jpg",
    "https://res.cloudinary.com/dfqgwgehn/image/upload/v1767970063/S3_v7gbae.jpg",
    "https://res.cloudinary.com/dfqgwgehn/image/upload/v1767970062/S4_jgwriv.jpg",
    "https://res.cloudinary.com/dfqgwgehn/image/upload/v1767970062/S5_btzcqb.jpg",
    "https://res.cloudinary.com/dfqgwgehn/image/upload/v1767970062/S6_p8jzfm.jpg",
  ];

  return (
    <section className="relative w-full bg-gray-900">
      
      {/* --- CENTERED TEXT OVERLAY --- */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none px-2 md:px-4">
        
        <h1 className="text-[8vw] md:text-8xl lg:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-500 drop-shadow-[0_4px_4px_rgba(0,0,0,0.6)] text-center whitespace-nowrap pb-2">
          SANCHI WELLNESS
        </h1>

        {/* TAGLINE */}
        <div className="mt-2 md:mt-8 bg-black/40 backdrop-blur-sm border border-white/10 px-4 md:px-6 py-1 md:py-2 rounded-full">
            <span className="text-white/90 text-[10px] sm:text-xs md:text-sm font-medium tracking-[0.15em] md:tracking-[0.2em] uppercase text-center whitespace-nowrap">
                Keeping Wellness In Everyday Life
            </span>
        </div>

      </div>

      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        opts={{
          loop: true,
          align: "center",
        }}
      >
        <CarouselContent>
          {images.map((imgUrl, index) => (
            <CarouselItem key={index} className="p-0">
              {/* HEIGHT SETTINGS */}
              <div className="relative w-full h-full md:h-[105vh] overflow-hidden">
                
                {/* 1. THE IMAGE */}
                <img 
                  src={imgUrl} 
                  alt={`Sanchi Wellness Product ${index + 1}`} 
                  className="w-full h-full object-fill object-center"
                />

                {/* 2. THE GREY/DULL OVERLAY */}
                <div className="absolute inset-0 bg-black/50" />
                
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Navigation Arrows */}
        <CarouselPrevious className="hidden md:flex left-4 bg-white/20 hover:bg-white/40 text-white border-none" />
        <CarouselNext className="hidden md:flex right-4 bg-white/20 hover:bg-white/40 text-white border-none" />
      </Carousel>
    </section>
  );
};

export default HeroSlider;