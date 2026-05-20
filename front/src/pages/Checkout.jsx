import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/home/Footer';
import { Lock, ShieldCheck, Smartphone, AlertCircle, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API = `${API_URL}/api`;
const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID; 

// Helper function to load Razorpay script
const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Checkout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 1. Updated state to hold structured address data
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: ''
  });
  
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

  // Helper to handle input changes for address
  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleRazorpayPayment = async () => {
    setError('');
    
    // 2. Updated Validation for the new structured address
    if (!address.street.trim() || !address.city.trim() || !address.state.trim() || !address.pincode.trim()) {
      setError('Please fill in all shipping address fields.');
      return;
    }
    
    if (!/^\d{6}$/.test(address.pincode.trim())) {
      setError('Please enter a valid 6-digit Pincode.');
      return;
    }

    setSubmitting(true);

    // 1. Load Razorpay script
    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
    if (!res) {
      setError("Razorpay SDK failed to load. Are you online?");
      setSubmitting(false);
      return;
    }

    try {
      // 2. Create order on backend
      const orderRes = await fetch(`${API}/create-razorpay-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItems: cart }),
      });
      const orderData = await orderRes.json();

      if (!orderData.success) {
        setError("Failed to create order on server.");
        setSubmitting(false);
        return;
      }

      // 3. Initialize Razorpay Checkout
      const options = {
        key: RAZORPAY_KEY, 
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Sanchi Wellness",
        description: "Wellness Products Purchase",
        order_id: orderData.order.id, // The order_id created by backend
        handler: async function (response) {
          // 4. Verify payment on backend
          try {
            const verifyRes = await fetch(`${API}/verify-razorpay-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: user.id,
                address, // This now correctly passes the structured object
                cartItems: cart
              }),
            });
            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              setSuccess(true);
              window.dispatchEvent(new Event('cartUpdated'));
              setTimeout(() => navigate('/dashboard'), 2500);
            } else {
              setError("Payment verification failed.");
            }
          } catch (err) {
            setError("Server error during verification.");
          }
        },
        prefill: {
          name: user.name || "",
          email: user.email || "",
          contact: user.phone || ""
        },
        theme: {
          color: "#06b6d4" // Cyan-500 to match your UI
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on("payment.failed", function (response) {
        setError(response.error.description);
      });
      paymentObject.open();

    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
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
          <h2 className="font-serif text-3xl font-bold text-gray-900 mb-3">Payment Successful!</h2>
          <p className="text-gray-500 leading-relaxed">Your order has been placed. Redirecting to your dashboard...</p>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left: Shipping & Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-green-600 text-white text-xs font-bold flex items-center justify-center shadow-sm">1</span>
                <h2 className="font-serif text-lg font-semibold text-gray-900">Shipping Details</h2>
              </div>
              <div className="p-6 space-y-4">
                {/* 3. Updated UI for structured address inputs */}
                <div>
                  <label className="text-gray-500 text-xs tracking-widest uppercase mb-2 block font-medium">Street Address / Area</label>
                  <input type="text" name="street" value={address.street} onChange={handleAddressChange}
                    placeholder="House No, Building, Street Name"
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all bg-gray-50" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-500 text-xs tracking-widest uppercase mb-2 block font-medium">City</label>
                    <input type="text" name="city" value={address.city} onChange={handleAddressChange}
                      placeholder="e.g. Mumbai"
                      className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all bg-gray-50" />
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs tracking-widest uppercase mb-2 block font-medium">State</label>
                    <input type="text" name="state" value={address.state} onChange={handleAddressChange}
                      placeholder="e.g. Maharashtra"
                      className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all bg-gray-50" />
                  </div>
                </div>

                <div>
                  <label className="text-gray-500 text-xs tracking-widest uppercase mb-2 block font-medium">Pincode</label>
                  <input type="text" name="pincode" value={address.pincode} onChange={handleAddressChange} maxLength={6}
                    placeholder="6-digit Pincode"
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all bg-gray-50" />
                </div>
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
              </div>
            </div>
          </div>

          {/* Right: Payment Action */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-cyan-600" />
                <h2 className="font-serif text-lg font-semibold text-gray-900">Payment</h2>
              </div>

              <div className="p-6 flex flex-col items-center gap-5">
                <div className="text-center w-full pb-4 border-b border-gray-100">
                  <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Total Payable</p>
                  <p className="font-serif text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-green-600">₹{total}</p>
                </div>

                <div className="w-full space-y-4">
                  {error && (
                    <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 p-3 rounded-xl">
                      <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                    </div>
                  )}

                  <button onClick={handleRazorpayPayment} disabled={submitting}
                    className="w-full bg-[#02042b] hover:bg-gray-900 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-md disabled:opacity-60">
                    {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</> : 'Pay securely with Razorpay'}
                  </button>
                  <p className="text-center text-[10px] text-gray-400 font-medium">Cards, UPI, NetBanking & Wallets accepted</p>
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