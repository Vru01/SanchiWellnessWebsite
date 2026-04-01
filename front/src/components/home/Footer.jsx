import { MapPin, Phone, Mail } from 'lucide-react';

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gray-950 text-gray-400 overflow-hidden">
      {/* Top glow accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

      {/* Background radial glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-8">

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-14">

          {/* Brand — wide column */}
          <div className="md:col-span-5 space-y-6">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Sanchi Wellness"
                className="w-11 h-11 rounded-full object-cover shadow-lg shadow-cyan-900/40 ring-2 ring-white/10"
              />
              <div>
                <p className="font-serif text-xl font-bold">
                  <span style={{color: '#19e5e4'}}>Sanchi</span>{' '}
                  <span style={{color: '#6fea6d'}}>Wellness</span>
                </p>
                <p className="text-[9px] tracking-[0.22em] uppercase text-gray-600">Keeping Wellness In Everyday Life</p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-gray-500 max-w-sm">
              Bridging the timeless knowledge of Ayurveda with modern clinical research to bring you wellness solutions that truly work — naturally.
            </p>

            {/* Social links */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-3 font-medium">Follow Us</p>
              <div className="flex gap-3">
                <SocialLink
                  href="https://www.instagram.com/sanchi.wellness?igsh=MWY3ZDVydjVxOW1kdw%3D%3D&utm_source=qr"
                  label="Instagram"
                  color="hover:border-pink-500 hover:text-pink-400 hover:bg-pink-500/10"
                >
                  <InstagramIcon />
                </SocialLink>

                <SocialLink
                  href="https://youtube.com/@sanchiwellness3246?si=lVx7UKQmVEDzuOmH"
                  label="YouTube"
                  color="hover:border-red-500 hover:text-red-400 hover:bg-red-500/10"
                >
                  <YouTubeIcon />
                </SocialLink>

                <SocialLink
                  href="https://wa.me/917387382367"
                  label="WhatsApp"
                  color="hover:border-green-500 hover:text-green-400 hover:bg-green-500/10"
                >
                  <WhatsAppIcon />
                </SocialLink>
              </div>
            </div>
          </div>

          {/* Navigate */}
          <div className="md:col-span-3">
            <h4 className="text-white font-semibold mb-5 text-sm tracking-wide">Navigate</h4>
            <ul className="space-y-3">
              {[
                ['Home', '/'],
                ['About Us', '/#about'],
                ['Products', '/#products'],
                ['Sign In', '/login'],
                ['Create Account', '/signup'],
              ].map(([name, href]) => (
                <li key={name}>
                  <a
                    href={href}
                    className="group flex items-center gap-2 text-sm text-gray-500 hover:text-cyan-400 transition-colors duration-200"
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-700 group-hover:bg-cyan-400 group-hover:w-2 transition-all duration-200" />
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-4">
            <h4 className="text-white font-semibold mb-5 text-sm tracking-wide">Get In Touch</h4>
            <ul className="space-y-4">
              <ContactItem icon={<MapPin className="h-4 w-4" />} color="text-cyan-500">
                Khopoli, Maharashtra, India
              </ContactItem>
              <ContactItem
                icon={<Phone className="h-4 w-4" />}
                color="text-green-500"
                href="tel:+917387382367"
              >
                +91 73873 82367
              </ContactItem>
              <ContactItem
                icon={<Mail className="h-4 w-4" />}
                color="text-cyan-500"
                href="mailto:sanchiwellness@gmail.com"
              >
                sanchiwellness@gmail.com
              </ContactItem>
            </ul>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/917387382367"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex items-center gap-2.5 bg-green-500/10 border border-green-500/20 hover:border-green-500/50 hover:bg-green-500/15 text-green-400 text-sm font-medium px-4 py-3 rounded-xl transition-all duration-300 group w-fit"
            >
              <WhatsAppIcon />
              <span>Chat on WhatsApp</span>
              <span className="ml-auto text-green-600 group-hover:translate-x-0.5 transition-transform">→</span>
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent mb-8" />

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
          <p>&copy; {currentYear} Sanchi Wellness. All rights reserved.</p>
          <div className="flex items-center gap-1 text-gray-700">
            <span>Made with</span>
            <span className="text-red-500 animate-pulse mx-0.5">♥</span>
            <span>for your wellness</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, label, color, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={`w-10 h-10 rounded-xl border border-gray-800 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-0.5 ${color}`}
    >
      {children}
    </a>
  );
}

function ContactItem({ icon, color, href, children }) {
  const cls = `flex items-start gap-3 text-sm text-gray-500 group ${href ? 'hover:text-gray-300 transition-colors cursor-pointer' : ''}`;
  const inner = (
    <>
      <span className={`${color} mt-0.5 shrink-0 group-hover:scale-110 transition-transform duration-200`}>{icon}</span>
      <span>{children}</span>
    </>
  );
  return href ? <a href={href} className={cls}>{inner}</a> : <li className={cls}>{inner}</li>;
}
