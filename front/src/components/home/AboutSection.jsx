import { Leaf, FlaskConical, HeartHandshake, Award } from 'lucide-react';

const stats = [
  { label: 'Natural Ingredients' },
  { label: 'Premium Products' },
  { label: 'Delivered Happiness' },
  { label: 'Years Of Research' },
];

const pillars = [
  { icon: Leaf, title: 'Pure & Organic', desc: 'Sourced from certified organic farms with zero synthetic additives.' },
  { icon: FlaskConical, title: 'Lab Verified', desc: 'Every batch tested for potency, purity, and safety.' },
  { icon: HeartHandshake, title: 'Ethically Made', desc: 'Fair trade practices and sustainable sourcing at every step.' },
  { icon: Award, title: 'Ayurveda Rooted', desc: 'Formulations grounded in 5000 years of Ayurvedic tradition.' },
];

export default function AboutSection() {
  return (
    <section id="about" className="bg-white">
      {/* Stats bar */}
      <div className="bg-gradient-to-r from-cyan-500 to-green-600 py-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <p className="font-serif text-lg md:text-xl font-bold text-white tracking-widest uppercase">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image collage */}
          <div className="relative h-[500px] hidden lg:block">
            <div className="absolute top-0 left-0 w-64 h-80 rounded-2xl overflow-hidden shadow-2xl">
              <img src="/aboutSection.jpg" alt="Sanchi Wellness" className="w-full h-full object-cover" />
            </div>
            <div className="absolute top-16 right-0 w-56 h-72 rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
              <img src="/forAboutSection.jpg" alt="Natural ingredients" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-0 left-20 w-52 h-56 rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
              <img src="/herbal.jpeg" alt="Herbal wellness" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-8 right-8 w-24 h-24 rounded-full bg-gradient-to-br from-cyan-50 to-green-50 border-2 border-cyan-200 flex items-center justify-center shadow-lg">
              <Leaf className="h-10 w-10 text-green-600" />
            </div>
          </div>

          {/* Text */}
          <div className="space-y-8">
            <div>
              <span className="text-cyan-600 text-xs tracking-[0.3em] uppercase font-semibold">Our Philosophy</span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mt-3 leading-tight">
                Where Ancient Wisdom<br />Meets Modern Healing
              </h2>
            </div>
            <p className="text-gray-600 text-lg leading-relaxed">
              At <span className="font-semibold text-gray-900">Sanchi Wellness</span>, we don't just create supplements —
              we craft experiences of healing. Every product bridges the timeless knowledge of Ayurveda
              with the precision of contemporary science.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pillars.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-cyan-200 hover:bg-cyan-50/30 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-green-600 flex items-center justify-center shrink-0 shadow-sm">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
                    <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
