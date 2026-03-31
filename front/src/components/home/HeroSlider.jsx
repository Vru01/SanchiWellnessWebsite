import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const slides = [
  { img: 'https://res.cloudinary.com/dfqgwgehn/image/upload/v1767970064/S1_rvzr1o.jpg', tag: 'Premium Wellness' },
  { img: 'https://res.cloudinary.com/dfqgwgehn/image/upload/v1767970063/S2_tzlapo.jpg', tag: 'Natural Healing' },
  { img: 'https://res.cloudinary.com/dfqgwgehn/image/upload/v1767970063/S3_v7gbae.jpg', tag: 'Ancient Wisdom' },
  { img: 'https://res.cloudinary.com/dfqgwgehn/image/upload/v1767970062/S4_jgwriv.jpg', tag: 'Pure Ingredients' },
  { img: 'https://res.cloudinary.com/dfqgwgehn/image/upload/v1767970062/S5_btzcqb.jpg', tag: 'Holistic Care' },
  { img: 'https://res.cloudinary.com/dfqgwgehn/image/upload/v1767970062/S6_p8jzfm.jpg', tag: 'Modern Science' },
];

export default function HeroSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000, stopOnInteraction: false })]);
  const [selected, setSelected] = useState(0);

  const prev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const next = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    return () => emblaApi.off('select', onSelect);
  }, [emblaApi]);

  return (
    <section className="relative w-full h-screen overflow-hidden bg-gray-900">
      {/* Carousel */}
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((s, i) => (
            <div key={i} className="flex-[0_0_100%] relative h-full">
              <img src={s.img} alt={s.tag} className="w-full h-full object-fill object-center opacity-50" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70" />
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6 text-center">
        <div className="inline-flex items-center gap-2 border border-cyan-400/50 text-cyan-300 text-xs tracking-[0.3em] uppercase px-5 py-2 rounded-full mb-8 backdrop-blur-sm bg-white/5">
          {slides[selected].tag}
        </div>
        <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-wide mb-4">
          <span style={{color: '#19e5e4'}}>Sanchi</span>{' '}
          <span style={{color: '#6fea6d'}}>Wellness</span>
        </h1>
        <p className="text-white/70 text-lg md:text-xl max-w-xl mb-10 font-light leading-relaxed">
          Ancient Ayurvedic wisdom meets modern science. Pure, potent, and purposeful.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/signup" className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-green-600 text-white font-semibold px-8 py-4 rounded-full hover:from-cyan-600 hover:to-green-700 transition-all shadow-lg shadow-cyan-500/25 text-sm tracking-wide">
            Shop Now <ArrowRight className="h-4 w-4" />
          </Link>
          <a href="#about" className="flex items-center gap-2 border border-white/30 text-white px-8 py-4 rounded-full hover:border-cyan-400 hover:text-cyan-300 transition-all text-sm tracking-wide backdrop-blur-sm">
            Our Story
          </a>
        </div>
      </div>

      {/* Arrows */}
      <button onClick={prev} className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm items-center justify-center text-white hover:border-cyan-400 hover:text-cyan-300 transition-all">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button onClick={next} className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm items-center justify-center text-white hover:border-cyan-400 hover:text-cyan-300 transition-all">
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button key={i} onClick={() => emblaApi?.scrollTo(i)}
            className={`rounded-full transition-all duration-300 ${i === selected ? 'w-8 h-2 bg-gradient-to-r from-cyan-400 to-green-400' : 'w-2 h-2 bg-white/30 hover:bg-white/60'}`}
          />
        ))}
      </div>
    </section>
  );
}
