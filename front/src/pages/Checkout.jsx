import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/home/Footer';
import { Lock, ShieldCheck, Smartphone, AlertCircle, Info, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import QRCode from 'react-qr-code';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API = `${API_URL}/api`;
const MERCHANT_UPI = import.meta.env.VITE_UPI_ID || import.meta.env.VITE_MERCHANT_UPI || 'yourname@upi';
const MERCHANT_NAME = 'Sanchi Wellness';

export default function Checkout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState('');
  const [txnId, setTxnId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { navigate('/login'); return; }
    const u = JSON.parse(stored);
    setUser(u);
    fetch(`${API}/cart/${u.id}`)
      .then(r => r.json())
      .then(data => {
        if (!data.length) { navigate('/dashboard'); return; }
        setCart(data);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const upiLink = `upi://pay?pa=${MERCHANT_UPI}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${total}&tn=SanchiWellnessOrder&cu=INR`;

  const handleSubmit = async () => {
    setError('');
    if (!address.trim() || address.length < 10) { setError('Please enter a complete shipping address.'); return; }
    if (!/^\d{12}$/.test(txnId)) { setError('UTR must be exactly 12 digits.'); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/checkout`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, transactionId: txnId, address, cartItems: cart }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        window.dispatchEvent(new Event('cartUpdated'));
        setTimeout(() => navigate('/dashboard'), 2500);
      } else { setError(data.error || 'Order failed. Please try again.'); }
    } catch { setError('Server connection failed.'); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-green-600 pt-24 pb-10 px-6">
        <div className="max-w-5xl mx-auto">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </button>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
            <div>
              <p className="text-white/70 text-xs tracking-[0.3em] uppercase font-semibold mb-2">Checkout</p>
              <h1 className="font-serif text-3xl font-bold text-white flex items-center gap-3">
                <Lock className="h-6 w-6 text-white/80" /> Secure Payment
              </h1>
            </div>
            <div className="flex items-center gap-2 text-xs text-white bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-full">
              <ShieldCheck className="h-3.5 w-3.5" /> SSL Encrypted Connection
            </div>
          </div>
        </div>
      </div>

      {success ? (
        <div className="max-w-md mx-auto px-6 py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-gray-900 mb-3">Order Placed!</h2>
          <p className="text-gray-500 leading-relaxed">We'll verify your UPI payment and ship your order shortly. Redirecting to dashboard...</p>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-green-600 text-white text-xs font-bold flex items-center justify-center shadow-sm">1</span>
                <h2 className="font-serif text-lg font-semibold text-gray-900">Shipping Details</h2>
              </div>
              <div className="p-6">
                <label className="text-gray-500 text-xs tracking-widest uppercase mb-2 block font-medium">Delivery Address</label>
                <textarea rows={4} value={address} onChange={e => setAddress(e.target.value)}
                  placeholder="Full Name, House No, Street, Area, City, Pincode"
                  className="w-full border border-gray-200 rounded-xl p-4 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all resize-none bg-gray-50" />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-green-600 text-white text-xs font-bold flex items-center justify-center shadow-sm">2</span>
                <h2 className="font-serif text-lg font-semibold text-gray-900">Order Summary</h2>
              </div>
              <div className="p-6 space-y-3">
                {cart.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 p-1">
                        <img src={item.img} alt={item.name} className="w-full h-full object-contain" />
                      </div>
                      <span className="text-gray-700">{item.name} <span className="text-gray-400">×{item.quantity}</span></span>
                    </div>
                    <span className="font-semibold text-gray-900">₹{item.price * item.quantity}</span>
                  </div>
                ))}
                <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="font-semibold text-gray-600">Total Payable</span>
                  <span className="font-serif text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-green-600">₹{total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right — payment */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-cyan-600" />
                <h2 className="font-serif text-lg font-semibold text-gray-900">Scan & Pay via UPI</h2>
              </div>

              <div className="p-6 flex flex-col items-center gap-5">
                <div className="p-4 bg-gradient-to-br from-cyan-50 to-green-50 rounded-2xl border border-cyan-100 shadow-inner">
                  <QRCode value={upiLink} size={180} />
                </div>

                <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-700 max-w-xs text-center">
                  <Info className="h-4 w-4 shrink-0 mt-0.5 text-yellow-500" />
                  <span>Verify payee name is <strong>"{MERCHANT_NAME}"</strong> before confirming payment.</span>
                </div>

                <div className="text-center">
                  <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Amount to Pay</p>
                  <p className="font-serif text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-green-600">₹{total}</p>
                </div>

                <div className="w-full space-y-4">
                  <div>
                    <label className="text-gray-600 text-xs tracking-widest uppercase mb-2 block font-medium">Transaction ID (UTR)</label>
                    <input value={txnId}
                      onChange={e => { const v = e.target.value.replace(/\D/g, ''); if (v.length <= 12) setTxnId(v); }}
                      maxLength={12} placeholder="Enter 12-digit UTR number"
                      className="w-full border border-gray-200 text-gray-900 placeholder-gray-300 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all bg-gray-50" />
                    <p className="text-gray-400 text-[10px] mt-1.5">Found in your UPI app under "Transaction Details"</p>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 p-3 rounded-xl">
                      <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                    </div>
                  )}

                  <button onClick={handleSubmit} disabled={submitting}
                    className="w-full bg-gradient-to-r from-cyan-500 to-green-600 hover:from-cyan-600 hover:to-green-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-md shadow-cyan-200 disabled:opacity-60">
                    {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Verifying Payment...</> : 'I Have Paid — Place Order'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
