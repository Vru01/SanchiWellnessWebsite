import React from 'react';
import { Separator } from "@/components/ui/separator";
import { MapPin, Phone, Mail } from "lucide-react"; 

// Import your Logo
import Logo from '@/assets/logo.png'; 

const Footer = () => {
  return (
    <footer id='footer' className="bg-gray-950 text-gray-300 py-16 border-t border-gray-800">
      <div className="container mx-auto px-6">
        
        {/* CHANGED: grid-cols-3 instead of 4 since we removed newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          {/* 1. Brand Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <img 
                src={Logo} 
                alt="Sanchi Wellness" 
                className="h-12 w-12 rounded-lg object-cover p-0.5" 
              />
              <div className="flex flex-col">
                <h3 className="text-xl font-black tracking-tight">
                    <span className="text-cyan-500">SANCHI</span>{' '}
                    <span className="text-green-600">WELLNESS</span>
                </h3>
              </div>
            </div>
            
            <p className="text-sm leading-relaxed text-gray-400 max-w-xs">
              Merging ancient wisdom with modern science to bring you pure, effective medicinal solutions for a balanced life.
            </p>

            {/* Social Icons */}
            <div className="flex gap-4">
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-cyan-600 hover:text-white transition-all group">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-blue-600 hover:text-white transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-cyan-500 hover:text-white transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* 2. Quick Links */}
          <div className="md:pl-10">
            <h4 className="text-white font-bold mb-6">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-cyan-400 transition-colors flex items-center gap-2">Home</a></li>
              <li><a href="#about" className="hover:text-cyan-400 transition-colors flex items-center gap-2">About Us</a></li>
              <li><a href="#products" className="hover:text-cyan-400 transition-colors flex items-center gap-2">Shop Medicines</a></li>
            </ul>
          </div>

          {/* 3. Contact Info (UPDATED) */}
          <div>
            <h4 className="text-white font-bold mb-6">Contact Us</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-green-500 shrink-0" />
                <span>Khopoli, Maharashtra,<br/>India</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-green-500 shrink-0" />
                <span>+91 9765382367</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-green-500 shrink-0" />
                <span>sanchiwellness@gmail.com</span>
              </li>
            </ul>
          </div>

        </div>

        <Separator className="bg-gray-800 mb-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>&copy; 2025 Sanchi Wellness. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;