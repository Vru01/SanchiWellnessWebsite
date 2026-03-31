import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, ShoppingBag, User } from 'lucide-react';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setOpen(false);
    navigate('/');
  };

  const isAdmin = user?.email === ADMIN_EMAIL;

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-xl shadow-[0_2px_20px_rgba(0,0,0,0.08)] border-b border-gray-100/80'
            : 'bg-gradient-to-b from-black/30 to-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link
            to={user ? (isAdmin ? '/admin' : '/dashboard') : '/'}
            className="flex items-center gap-3 group shrink-0"
          >
            <div className="relative">
              <img
                src="/logo.png"
                alt="Sanchi Wellness"
                className="w-10 h-10 rounded-full object-cover shadow-md ring-2 ring-white/30 group-hover:ring-cyan-400/50 transition-all duration-300"
              />

            </div>
            <div className="flex flex-col leading-none">
              <span className="font-serif text-[17px] font-bold tracking-wide">
                <span style={{color: '#19e5e4'}}>Sanchi</span>{' '}
                <span style={{color: '#6fea6d'}}>Wellness</span>
              </span>
              <span className={`text-[8px] tracking-[0.22em] uppercase font-light mt-0.5 ${scrolled ? 'text-gray-400' : 'text-white/45'}`}>
                Ancient Wisdom · Modern Science
              </span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {!user && (
              <>
                <NavLink href="/#about" scrolled={scrolled}>About</NavLink>
                <NavLink href="/#products" scrolled={scrolled}>Products</NavLink>
              </>
            )}
            {user && !isAdmin && (
              <>
                <NavLink href="/dashboard" scrolled={scrolled} isRouterLink>Dashboard</NavLink>
                <NavLink href="/dashboard#products" scrolled={scrolled}>Shop</NavLink>
              </>
            )}
            {user && isAdmin && (
              <NavLink href="/admin" scrolled={scrolled} isRouterLink>Admin Panel</NavLink>
            )}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  scrolled
                    ? 'border-cyan-200 text-cyan-700 bg-cyan-50/80'
                    : 'border-white/25 text-white/85 bg-white/10 backdrop-blur-sm'
                }`}>
                  <User className="h-3.5 w-3.5" />
                  {user.name}
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className={`p-2 rounded-full transition-all duration-200 ${
                    scrolled
                      ? 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                      : 'text-white/50 hover:text-red-300 hover:bg-white/10'
                  }`}
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className={`text-sm font-medium px-4 py-1.5 rounded-full border transition-all duration-200 ${
                    scrolled
                      ? 'border-gray-200 text-gray-600 hover:border-cyan-400 hover:text-cyan-600 hover:bg-cyan-50/50'
                      : 'border-white/25 text-white/85 hover:border-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-semibold px-5 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-green-500 text-white shadow-md hover:shadow-cyan-500/30 hover:from-cyan-600 hover:to-green-600 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className={`md:hidden p-2 rounded-lg transition-all duration-200 ${
              scrolled
                ? 'text-gray-700 hover:bg-gray-100'
                : 'text-white hover:bg-white/10'
            }`}
            onClick={() => setOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 md:hidden ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />

        {/* Slide-in panel */}
        <div
          className={`absolute top-0 right-0 h-full w-72 bg-white shadow-2xl flex flex-col transition-transform duration-300 ${
            open ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="Sanchi Wellness" className="w-8 h-8 rounded-full object-cover shadow" />
              <span className="font-serif text-base font-bold">
                <span style={{color: '#19e5e4'}}>Sanchi</span>{' '}
                <span style={{color: '#6fea6d'}}>Wellness</span>
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Nav links */}
          <div className="flex flex-col px-4 py-4 gap-1 flex-1">
            {!user && (
              <>
                <MobileNavLink href="/#about" onClick={() => setOpen(false)}>About</MobileNavLink>
                <MobileNavLink href="/#products" onClick={() => setOpen(false)}>Products</MobileNavLink>
              </>
            )}
            {user && !isAdmin && (
              <>
                <MobileNavLink href="/dashboard" onClick={() => setOpen(false)}>Dashboard</MobileNavLink>
                <MobileNavLink href="/dashboard#products" onClick={() => setOpen(false)}>
                  <ShoppingBag className="h-4 w-4" /> Shop
                </MobileNavLink>
              </>
            )}
            {user && isAdmin && (
              <MobileNavLink href="/admin" onClick={() => setOpen(false)}>Admin Panel</MobileNavLink>
            )}
          </div>

          {/* Auth section */}
          <div className="px-4 py-5 border-t border-gray-100">
            {user ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-50 border border-cyan-100">
                  <User className="h-4 w-4 text-cyan-500" />
                  <span className="text-sm font-medium text-cyan-700">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 transition-colors text-sm font-medium"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="text-center py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:border-cyan-400 hover:text-cyan-600 transition-colors text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setOpen(false)}
                  className="text-center py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-green-500 text-white font-semibold text-sm shadow-md"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Desktop nav link with animated underline
function NavLink({ href, children, scrolled, isRouterLink }) {
  const cls = `relative text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200 group ${
    scrolled
      ? 'text-gray-600 hover:text-cyan-600 hover:bg-cyan-50/60'
      : 'text-white/85 hover:text-white hover:bg-white/10'
  }`;

  const underline = (
    <span className={`absolute bottom-1 left-3 right-3 h-0.5 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left ${
      scrolled ? 'bg-cyan-500' : 'bg-white/60'
    }`} />
  );

  if (isRouterLink) {
    return (
      <Link to={href} className={cls}>
        {children}
        {underline}
      </Link>
    );
  }
  return (
    <a href={href} className={cls}>
      {children}
      {underline}
    </a>
  );
}

// Mobile nav link
function MobileNavLink({ href, onClick, children }) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-3 rounded-xl text-gray-700 hover:text-cyan-600 hover:bg-cyan-50/70 font-medium text-[15px] transition-colors"
    >
      {children}
    </a>
  );
}
