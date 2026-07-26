import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Menu, X, LogOut, ShoppingBag, User, Store, Loader2, CheckCircle2 } from 'lucide-react';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
const SCRIPT_URL = import.meta.env.VITE_FRANCHISE_SCRIPT_URL;

export default function Navbar() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Modal open status derived directly from URL query param (?franchise=true)
  const isFranchiseOpen = searchParams.get('franchise') === 'true';

  // Open modal by adding query param to URL
  const openFranchiseModal = () => {
    setSearchParams(prev => {
      prev.set('franchise', 'true');
      return prev;
    });
  };

  // Close modal by deleting query param from URL without page reload
  const closeFranchiseModal = () => {
    setSearchParams(prev => {
      prev.delete('franchise');
      return prev;
    });
  };

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Prevent body scroll when mobile menu or modal is open
  useEffect(() => {
    document.body.style.overflow = (open || isFranchiseOpen) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open, isFranchiseOpen]);

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
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled
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
                alt="SANCHI WELLNESS"
                className="w-10 h-10 rounded-full object-cover shadow-md ring-2 ring-white/30 group-hover:ring-cyan-400/50 transition-all duration-300"
              />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-serif text-[17px] font-bold tracking-wide">
                <span style={{ color: '#19e5e4' }}>SANCHI</span>{' '}
                <span style={{ color: '#6fea6d' }}>WELLNESS</span>
              </span>
              <span className={`text-[8px] tracking-[0.22em] uppercase font-light mt-0.5 ${scrolled ? 'text-gray-400' : 'text-white/45'}`}>
                Keeping Wellness In Everyday Life
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
                <NavLink href="#products" scrolled={scrolled}>Shop</NavLink>
              </>
            )}
            {user && isAdmin && (
              <NavLink href="/admin" scrolled={scrolled} isRouterLink>Admin Panel</NavLink>
            )}

            {/* Franchise trigger button */}
            <button
              onClick={openFranchiseModal}
              className={`flex items-center gap-1.5 text-sm font-semibold px-3.5 py-1.5 rounded-full border transition-all duration-200 ml-2 ${scrolled
                  ? 'border-emerald-500/30 text-emerald-600 hover:bg-emerald-50'
                  : 'border-emerald-400/50 text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200'
                }`}
            >
              <Store className="h-4 w-4" />
              <span>Start a Franchise</span>
            </button>
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${scrolled
                    ? 'border-cyan-200 text-cyan-700 bg-cyan-50/80'
                    : 'border-white/25 text-white/85 bg-white/10 backdrop-blur-sm'
                  }`}>
                  <User className="h-3.5 w-3.5" />
                  {user.name}
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className={`p-2 rounded-full transition-all duration-200 ${scrolled
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
                  className={`text-sm font-medium px-4 py-1.5 rounded-full border transition-all duration-200 ${scrolled
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
            className={`md:hidden p-2 rounded-lg transition-all duration-200 ${scrolled
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

      {/* Mobile Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40 md:hidden">
        <button
          onClick={openFranchiseModal}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-full shadow-[0_10px_25px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20"
        >
          <Store className="h-4 w-4" />
          <span>Connect with us</span>
        </button>
      </div>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 md:hidden ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
      >
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />

        <div
          className={`absolute top-0 right-0 h-full w-72 bg-white shadow-2xl flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="Sanchi Wellness" className="w-8 h-8 rounded-full object-cover shadow" />
              <span className="font-serif text-base font-bold">
                <span style={{ color: '#19e5e4' }}>Sanchi</span>{' '}
                <span style={{ color: '#6fea6d' }}>Wellness</span>
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

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
                <MobileNavLink href="#products" onClick={() => setOpen(false)}>
                  <ShoppingBag className="h-4 w-4" /> Shop
                </MobileNavLink>
              </>
            )}
            {user && isAdmin && (
              <MobileNavLink href="/admin" onClick={() => setOpen(false)}>Admin Panel</MobileNavLink>
            )}
          </div>

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

      {/* Franchise Application Modal */}
      <FranchiseModal
        isOpen={isFranchiseOpen}
        onClose={closeFranchiseModal}
      />
    </>
  );
}

// Franchise Modal Component
function FranchiseModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({ name: '', mobile: '', email: '', city: '', goal: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Please enter a valid full name';
    }

    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(formData.mobile.trim())) {
      newErrors.mobile = 'Enter a valid 10-digit mobile number';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!formData.city.trim() || formData.city.trim().length < 2) {
      newErrors.city = 'Please enter your city';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setStatus('loading');

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(formData),
      });

      setStatus('success');
      setFormData({ name: '', mobile: '', email: '', city: '', goal: '' });
      setErrors({});
    } catch (err) {
      console.error('Error submitting franchise request:', err);
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-[60] animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-md w-full shadow-2xl relative text-white overflow-hidden">

        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800/50 hover:bg-slate-800 transition-colors z-10"
        >
          <X className="h-5 w-5" />
        </button>

        {status === 'success' ? (
          <div className="flex flex-col items-center text-center py-6 space-y-4 animate-in zoom-in-95 duration-300">
            <div className="relative">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 ring-8 ring-emerald-500/10">
                <CheckCircle2 className="h-10 w-10 animate-bounce" />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-white tracking-tight">
              Request Received!
            </h3>

            <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 p-4 rounded-2xl text-sm leading-relaxed shadow-inner">
              Thank For Showing Your Interest, Our Team Will Contact You Soon.
            </div>

            <button
              onClick={() => {
                setStatus('idle');
                onClose();
              }}
              className="mt-2 w-full py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold rounded-xl shadow-lg hover:opacity-95 transition-all duration-200 active:scale-98"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-1 bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Know More About Franchise Benefits
            </h2>
            <p className="text-slate-400 text-sm mb-6">Start partnership with Sanchi Wellness.We love to know about you.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={`w-full bg-slate-800/80 border ${errors.name ? 'border-red-500' : 'border-slate-700/80'} rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition`}
                />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1">Mobile</label>
                  <input
                    type="tel"
                    name="mobile"
                    maxLength={10}
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className={`w-full bg-slate-800/80 border ${errors.mobile ? 'border-red-500' : 'border-slate-700/80'} rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition`}
                  />
                  {errors.mobile && <p className="text-red-400 text-xs mt-1">{errors.mobile}</p>}
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className={`w-full bg-slate-800/80 border ${errors.email ? 'border-red-500' : 'border-slate-700/80'} rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition`}
                  />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1">City / Location</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Mumbai"
                  className={`w-full bg-slate-800/80 border ${errors.city ? 'border-red-500' : 'border-slate-700/80'} rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition`}
                />
                {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wide text-slate-400 mb-1">
                  Goal / Vision <span className="text-slate-500 font-normal lowercase">(optional)</span>
                </label>
                <textarea
                  name="goal"
                  rows="3"
                  value={formData.goal}
                  onChange={handleChange}
                  placeholder="We would love to here your vision..."
                  className={`w-full bg-slate-800/80 border ${errors.goal ? 'border-red-500' : 'border-slate-700/80'} rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none transition`}
                />
                {errors.goal && <p className="text-red-400 text-xs mt-1">{errors.goal}</p>}
              </div>

              {status === 'error' && (
                <p className="text-red-400 text-xs text-center">Something went wrong. Please try submitting again.</p>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold py-3 rounded-xl hover:opacity-95 transition-all duration-200 active:scale-98 disabled:opacity-50 shadow-lg shadow-cyan-500/10"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit'
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// Desktop nav link
function NavLink({ href, children, scrolled, isRouterLink }) {
  const cls = `relative text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200 group ${scrolled
      ? 'text-gray-600 hover:text-cyan-600 hover:bg-cyan-50/60'
      : 'text-white/85 hover:text-white hover:bg-white/10'
    }`;

  const underline = (
    <span className={`absolute bottom-1 left-3 right-3 h-0.5 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left ${scrolled ? 'bg-cyan-500' : 'bg-white/60'
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