import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, Sparkles, ShieldCheck, Leaf } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email.trim() || !form.password.trim()) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate(data.user.email === ADMIN_EMAIL ? '/admin' : '/dashboard');
      } else { setError(data.error || 'Login failed.'); }
    } catch { setError('Server connection failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel — desktop only */}
      <LeftPanel
        badge="Keeping Wellness In Everyday Life"
        heading={<>Your wellness<br /><span style={{color:'#19e5e4'}}>journey</span> awaits.</>}
        sub="Sign in to access your dashboard, track orders, and explore our curated wellness collection."
        pills={['Premium Products','Fast Delivery','Natural Ingredients','Expert Formulas']}
        quote='"Health is the greatest gift, contentment the greatest wealth." — Buddha'
        tealFirst
      />

      {/* Right — form side */}
      <div className="flex-1 flex flex-col min-h-screen" style={{background: 'linear-gradient(160deg, #f0fffe 0%, #f7fff7 50%, #f0f9ff )'}}>
        {/* Top accent bar */}
        <div className="h-1 w-full" style={{background: 'linear-gradient(90deg, #19e5e4, #6fea6d)'}} />

        <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 md:px-16 lg:px-14 py-10">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <img src="/logo.png" alt="Sanchi Wellness" className="w-10 h-10 rounded-full object-cover shadow ring-2 ring-white" />
            <span className="font-serif text-xl font-bold">
              <span style={{color:'#19e5e4'}}>Sanchi</span>{' '}
              <span style={{color:'#6fea6d'}}>Wellness</span>
            </span>
          </div>

          <div className="max-w-sm w-full mx-auto lg:mx-0">
            {/* Heading */}
            <div className="mb-7">
              <div className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full mb-4"
                style={{background:'#19e5e415', color:'#0cb8b7', border:'1px solid #19e5e430'}}>
                <Sparkles className="h-3 w-3" /> Welcome back
              </div>
              <h1 className="font-serif text-3xl font-bold text-gray-900 mb-1.5">Sign in</h1>
              <p className="text-gray-400 text-sm">Continue your wellness journey</p>
            </div>

            {/* Card */}
            <div className="bg-white rounded-3xl shadow-xl border border-white p-7" style={{boxShadow:'0 8px 40px rgba(25,229,228,0.10), 0 2px 8px rgba(0,0,0,0.06)'}}>
              <form onSubmit={handleSubmit} className="space-y-5">
                <AuthInput label="Email Address" icon={<Mail className="h-4 w-4"/>} focusColor="#19e5e4">
                  <input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} required
                    className="w-full border-2 border-gray-100 text-gray-900 placeholder-gray-300 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none transition-all bg-gray-50/60 hover:border-gray-200 focus:border-[#19e5e4]"
                    placeholder="your@email.com" />
                </AuthInput>

                <AuthInput label="Password" icon={<Lock className="h-4 w-4"/>} focusColor="#19e5e4">
                  <input type={showPw?'text':'password'} value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} required
                    className="w-full border-2 border-gray-100 text-gray-900 placeholder-gray-300 rounded-xl pl-11 pr-12 py-3.5 text-sm focus:outline-none transition-all bg-gray-50/60 hover:border-gray-200 focus:border-[#19e5e4]"
                    placeholder="••••••••" />
                  <button type="button" onClick={()=>setShowPw(v=>!v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors">
                    {showPw ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                  </button>
                </AuthInput>

                {error && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 p-3 rounded-xl">
                    <AlertCircle className="h-4 w-4 shrink-0"/> {error}
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full font-bold py-3.5 rounded-xl text-sm text-gray-900 flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                  style={{background:'linear-gradient(135deg,#19e5e4,#6fea6d)', boxShadow:'0 6px 20px rgba(25,229,228,0.3)'}}>
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin"/>Signing in...</> : <>Sign In <ArrowRight className="h-4 w-4"/></>}
                </button>
              </form>
            </div>

            <p className="text-gray-400 text-sm text-center mt-5">
              New here?{' '}
              <Link to="/signup" className="font-semibold" style={{color:'#19e5e4'}}>Create a free account</Link>
            </p>

            {/* Trust row */}
            <div className="flex items-center justify-center gap-5 mt-6 flex-wrap">
              {[{icon:<ShieldCheck className="h-3.5 w-3.5"/>,label:'Secure',color:'#19e5e4'},{icon:<Leaf className="h-3.5 w-3.5"/>,label:' Natural',color:'#6fea6d'},{icon:<Sparkles className="h-3.5 w-3.5"/>,label:'Ayurveda',color:'#fbbf24'}].map(({icon,label,color})=>(
                <div key={label} className="flex items-center gap-1.5 text-[11px] text-gray-400" style={{color}}>
                  {icon}<span className="text-gray-400">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Shared left panel
function LeftPanel({ badge, heading, sub, pills, quote, tealFirst }) {
  return (
    <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col"
      style={{background: tealFirst
        ? 'linear-gradient(145deg,#0a0f1e 0%,#0d1f1f 50%,#0a1a0a )'
        : 'linear-gradient(145deg,#0a1a0a 0%,#0d1f1f 50%,#0a0f1e )'}}>
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full blur-3xl opacity-25 animate-pulse" style={{background:'#19e5e4'}}/>
      <div className="absolute bottom-1/3 right-1/4 w-56 h-56 rounded-full blur-3xl opacity-20 animate-pulse" style={{background:'#6fea6d',animationDelay:'1s'}}/>
      <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage:'linear-gradient(rgba(255,255,255,0.15) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.15) 1px,transparent 1px)',backgroundSize:'40px 40px'}}/>
      <div className="relative z-10 flex flex-col justify-between h-full p-12">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Sanchi Wellness" className="w-10 h-10 rounded-full object-cover shadow-lg ring-2 ring-white/10"/>
          <span className="font-serif text-xl font-bold">
            <span style={{color:'#19e5e4'}}>Sanchi</span>{' '}
            <span style={{color:'#6fea6d'}}>Wellness</span>
          </span>
        </Link>
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/50 text-xs mb-6">
            <Sparkles className="h-3 w-3" style={{color:'#19e5e4'}}/>{badge}
          </div>
          <h2 className="font-serif text-4xl font-bold text-white leading-tight mb-4">{heading}</h2>
          <p className="text-white/40 text-sm leading-relaxed max-w-xs">{sub}</p>
          {pills && (
            <div className="flex flex-wrap gap-2 mt-8">
              {pills.map(p=>(
                <span key={p} className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-white/40 bg-white/5">{p}</span>
              ))}
            </div>
          )}
        </div>
        <p className="text-white/20 text-xs italic">{quote}</p>
      </div>
    </div>
  );
}

// Shared input wrapper
function AuthInput({ label, icon, children }) {
  return (
    <div>
      <label className="text-gray-500 text-xs tracking-widest uppercase mb-2 block font-semibold">{label}</label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#19e5e4] transition-colors pointer-events-none">{icon}</div>
        {children}
      </div>
    </div>
  );
}
