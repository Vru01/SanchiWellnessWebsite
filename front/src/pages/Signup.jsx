import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, CheckCircle2, Sparkles, ShieldCheck, Leaf, Zap } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()||!form.email.trim()||!form.password.trim()) { setError('Please fill in all fields.'); return; }
    if (form.phone && !/^\d{10}$/.test(form.phone)) { setError('Enter a valid 10-digit phone number.'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/signup`, {
        method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('user', JSON.stringify({id:data.userId, name:form.name, email:form.email, phone:form.phone}));
        setSuccess(true);
        setTimeout(()=>navigate('/dashboard'), 1200);
      } else { setError(data.error||'Signup failed.'); }
    } catch { setError('Server connection failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      <LeftPanel />

      {/* Right — form side */}
      <div className="flex-1 flex flex-col min-h-screen" style={{background:'linear-gradient(160deg,#f7fff7 0%,#f0fffe 50%,#f7f0ff 100%)'}}>
        <div className="h-1 w-full" style={{background:'linear-gradient(90deg,#6fea6d,#19e5e4)'}}/>

        <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 md:px-16 lg:px-14 py-10">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <img src="/logo.png" alt="Sanchi Wellness" className="w-10 h-10 rounded-full object-cover shadow ring-2 ring-white"/>
            <span className="font-serif text-xl font-bold">
              <span style={{color:'#19e5e4'}}>Sanchi</span>{' '}
              <span style={{color:'#6fea6d'}}>Wellness</span>
            </span>
          </div>

          <div className="max-w-sm w-full mx-auto lg:mx-0">
            {success ? (
              <div className="flex flex-col items-center gap-5 py-16 text-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-xl"
                  style={{background:'linear-gradient(135deg,#19e5e4,#6fea6d)'}}>
                  <CheckCircle2 className="h-10 w-10 text-white"/>
                </div>
                <h2 className="font-serif text-3xl font-bold text-gray-900">Welcome aboard!</h2>
                <p className="text-gray-400 text-sm">Taking you to your dashboard...</p>
                <div className="w-32 h-1 rounded-full overflow-hidden bg-gray-100">
                  <div className="h-full rounded-full animate-pulse" style={{background:'linear-gradient(90deg,#19e5e4,#6fea6d)'}}/>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <div className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full mb-4"
                    style={{background:'#6fea6d15', color:'#3db83b', border:'1px solid #6fea6d30'}}>
                    <Sparkles className="h-3 w-3"/> Join for free
                  </div>
                  <h1 className="font-serif text-3xl font-bold text-gray-900 mb-1.5">Create account</h1>
                  <p className="text-gray-400 text-sm">Start your wellness journey today</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-3xl shadow-xl border border-white p-7" style={{boxShadow:'0 8px 40px rgba(111,234,109,0.10), 0 2px 8px rgba(0,0,0,0.06)'}}>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <AuthInput label="Full Name" icon={<User className="h-4 w-4"/>}>
                      <input type="text" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required
                        className="w-full border-2 border-gray-100 text-gray-900 placeholder-gray-300 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none transition-all bg-gray-50/60 hover:border-gray-200 focus:border-[#19e5e4]"
                        placeholder="Your full name"/>
                    </AuthInput>

                    <AuthInput label="Email Address" icon={<Mail className="h-4 w-4"/>}>
                      <input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} required
                        className="w-full border-2 border-gray-100 text-gray-900 placeholder-gray-300 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none transition-all bg-gray-50/60 hover:border-gray-200 focus:border-[#19e5e4]"
                        placeholder="your@email.com"/>
                    </AuthInput>

                    {/* Phone */}
                    <div>
                      <label className="text-gray-500 text-xs tracking-widest uppercase mb-2 flex items-center gap-1.5 font-semibold">
                        Phone <span className="text-gray-300 normal-case tracking-normal text-[11px] font-normal">(optional)</span>
                      </label>
                      <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 group-focus-within:text-[#6fea6d] transition-colors"/>
                        <span className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-300 text-sm select-none border-r border-gray-200 pr-2.5">+91</span>
                        <input type="tel" value={form.phone}
                          onChange={e=>{const v=e.target.value.replace(/\D/g,''); if(v.length<=10) setForm(f=>({...f,phone:v}));}}
                          maxLength={10}
                          className="w-full border-2 border-gray-100 text-gray-900 placeholder-gray-300 rounded-xl pl-20 pr-4 py-3.5 text-sm focus:outline-none transition-all bg-gray-50/60 hover:border-gray-200 focus:border-[#6fea6d]"
                          placeholder="10-digit mobile number"/>
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="text-gray-500 text-xs tracking-widest uppercase mb-2 block font-semibold">Password</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 group-focus-within:text-[#19e5e4] transition-colors"/>
                        <input type={showPw?'text':'password'} value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} required
                          className="w-full border-2 border-gray-100 text-gray-900 placeholder-gray-300 rounded-xl pl-11 pr-12 py-3.5 text-sm focus:outline-none transition-all bg-gray-50/60 hover:border-gray-200 focus:border-[#19e5e4]"
                          placeholder="Min. 8 characters"/>
                        <button type="button" onClick={()=>setShowPw(v=>!v)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors">
                          {showPw ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 p-3 rounded-xl">
                        <AlertCircle className="h-4 w-4 shrink-0"/> {error}
                      </div>
                    )}

                    <button type="submit" disabled={loading}
                      className="w-full font-bold py-3.5 rounded-xl text-sm text-gray-900 flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 mt-1"
                      style={{background:'linear-gradient(135deg,#19e5e4,#6fea6d)', boxShadow:'0 6px 20px rgba(111,234,109,0.3)'}}>
                      {loading ? <><Loader2 className="h-4 w-4 animate-spin"/>Creating...</> : <>Create Account <ArrowRight className="h-4 w-4"/></>}
                    </button>
                  </form>
                </div>

                <p className="text-gray-400 text-sm text-center mt-5">
                  Already have an account?{' '}
                  <Link to="/login" className="font-semibold" style={{color:'#19e5e4'}}>Sign in</Link>
                </p>

                {/* Trust row */}
                <div className="flex items-center justify-center gap-5 mt-5 flex-wrap">
                  {[{icon:<ShieldCheck className="h-3.5 w-3.5"/>,label:'Secure',color:'#19e5e4'},{icon:<Leaf className="h-3.5 w-3.5"/>,label:'100% Natural',color:'#6fea6d'},{icon:<Zap className="h-3.5 w-3.5"/>,label:'Fast Delivery',color:'#fbbf24'}].map(({icon,label,color})=>(
                    <div key={label} className="flex items-center gap-1.5 text-[11px]" style={{color}}>
                      {icon}<span className="text-gray-400">{label}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LeftPanel() {
  return (
    <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col"
      style={{background:'linear-gradient(145deg,#0a1a0a 0%,#0d1f1f 50%,#0a0f1e 100%)'}}>
      <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full blur-3xl opacity-25 animate-pulse" style={{background:'#6fea6d'}}/>
      <div className="absolute bottom-1/4 left-1/4 w-56 h-56 rounded-full blur-3xl opacity-20 animate-pulse" style={{background:'#19e5e4',animationDelay:'1.5s'}}/>
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
            <Sparkles className="h-3 w-3" style={{color:'#6fea6d'}}/>Join the wellness community
          </div>
          <h2 className="font-serif text-4xl font-bold text-white leading-tight mb-4">
            Begin your path<br/>to <span style={{color:'#6fea6d'}}>true wellness.</span>
          </h2>
          <p className="text-white/40 text-sm leading-relaxed max-w-xs">
            Join thousands who've discovered the power of Ayurveda-backed wellness products.
          </p>
          <div className="mt-8 space-y-3">
            {[{icon:<ShieldCheck className="h-4 w-4"/>,text:'Secure & private account',color:'#19e5e4'},{icon:<Leaf className="h-4 w-4"/>,text:'100% natural ingredients',color:'#6fea6d'},{icon:<Zap className="h-4 w-4"/>,text:'Fast order tracking',color:'#fbbf24'}].map(({icon,text,color})=>(
              <div key={text} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:`${color}15`,color}}>{icon}</div>
                <span className="text-white/50 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/20 text-xs italic">"Let food be thy medicine." — Hippocrates</p>
      </div>
    </div>
  );
}

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
