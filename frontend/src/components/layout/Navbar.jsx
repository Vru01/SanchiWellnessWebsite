import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Menu, LogOut } from "lucide-react"; 
import Logo from '@/assets/logo.png'; 
import { Link, useNavigate, useLocation } from 'react-router-dom'; 

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Useful if we need to check current path
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Check for logged-in user on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user'); 
    localStorage.removeItem('cart'); 
    setUser(null);
    navigate('/'); 
  };

  // --- 1. DEFINE TWO SETS OF LINKS ---
  
  // For Guests (Public Home Page)
  const guestLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/#about" },
    { name: "Products", href: "/#products" },
  ];

  // For Logged In Users (Dashboard Only)
  const authLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Shop Products", href: "/dashboard#products" }, // Points to dashboard's product section
  ];

  // Choose which links to show
  const navLinks = user ? authLinks : guestLinks;

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="container mx-auto flex justify-between items-center py-3 px-6">
        
        {/* LOGO - Always goes to Home (or Dashboard if logged in? kept as Home for now) */}
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-3 group">
          <img src={Logo} alt="Sanchi Wellness" className="h-10 w-auto object-contain" />
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-green-600">
              SANCHI WELLNESS
            </span>
          </div>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              className="text-sm font-semibold text-gray-600 hover:text-cyan-600 transition-colors"
            >
              {link.name}
            </a>
          ))}
          
          {user ? (
            <div className="flex items-center gap-4">
              {/* User Badge */}
              <span className="border border-cyan-500 text-cyan-600 bg-cyan-50/30 px-4 py-1.5 rounded-full text-sm font-medium transition-colors">
                Hi, {user.name}
              </span>
              
              <Button onClick={handleLogout} variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button className="bg-gradient-to-r from-cyan-500 to-green-600 hover:from-cyan-600 hover:to-green-700 text-white rounded-full px-6 shadow-md">
                Login
              </Button>
            </Link>
          )}
        </div>

        {/* MOBILE MENU */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon"><Menu className="h-7 w-7" /></Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader className="mb-8 text-left">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-6">
                {navLinks.map((link) => (
                  <a 
                    key={link.name} 
                    href={link.href} 
                    onClick={() => setIsOpen(false)} 
                    className="text-lg font-medium text-gray-700"
                  >
                    {link.name}
                  </a>
                ))}
                
                {user ? (
                  <Button onClick={() => { handleLogout(); setIsOpen(false); }} className="w-full bg-red-100 text-red-600 hover:bg-red-200 mt-4">
                    Logout
                  </Button>
                ) : (
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-cyan-500 to-green-600 text-white mt-4">
                      Login
                    </Button>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;