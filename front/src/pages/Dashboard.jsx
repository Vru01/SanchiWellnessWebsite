import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import ProductSection from '@/components/home/ProductSection';
import Footer from '@/components/home/Footer';
import { ShoppingBag, Package, Plus, Minus, Trash2, Loader2, User, ArrowRight, Clock, CheckCircle2, XCircle, Mail, Phone } from 'lucide-react';
import { toast } from '@/components/ui/Toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API = `${API_URL}/api`;

const StatusBadge = ({ status }) => {
  if (status === 'Paid') return <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200"><CheckCircle2 className="h-3 w-3" />{status}</span>;
  if (status === 'Rejected') return <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-200"><XCircle className="h-3 w-3" />{status}</span>;
  return <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200"><Clock className="h-3 w-3" />{status}</span>;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { navigate('/login'); return; }
    const u = JSON.parse(stored);
    setUser(u);
    fetchCart(u.id);
    fetchOrders(u.id);
  }, [navigate]);

  const fetchCart = async (id) => {
    setCartLoading(true);
    try { const r = await fetch(`${API}/cart/${id}`); if (r.ok) setCart(await r.json()); }
    finally { setCartLoading(false); }
  };

  const fetchOrders = async (id) => {
    try { const r = await fetch(`${API}/orders/${id}`); if (r.ok) setOrders(await r.json()); } catch {}
  };

  const addToCart = async (product) => {
    if (!user) return;
    const id = product.productId || product._id || product.id;
    await fetch(`${API}/cart/add`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, product: { id, name: product.name, price: product.discountPrice || product.price, img: product.img } }),
    });
    fetchCart(user.id);
    window.dispatchEvent(new Event('cartUpdated'));
    toast.success(`${product.name} added to cart!`);
  };

  const decreaseQty = async (productId) => {
    await fetch(`${API}/cart/decrease`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id, productId }) });
    fetchCart(user.id);
  };

  const removeItem = async (productId, name) => {
    await fetch(`${API}/cart/remove`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id, productId }) });
    fetchCart(user.id);
    window.dispatchEvent(new Event('cartUpdated'));
    toast.info(`${name || 'Item'} removed from cart`);
  };

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="relative bg-gray-900 pt-24 pb-14 px-6 overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 20% 50%, #06b6d4 0%, transparent 50%), radial-gradient(circle at 80% 20%, #16a34a 0%, transparent 40%)'}} />
        <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <p className="text-white/40 text-xs tracking-[0.3em] uppercase font-semibold mb-2">My Account</p>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-white">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400">{user.name.split(' ')[0]}</span>
            </h1>
            <p className="text-white/40 text-sm mt-1.5">Manage your cart, orders, and wellness journey.</p>
          </div>
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-green-500 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">{user.name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <p className="text-white text-sm font-semibold">{user.name}</p>
              <p className="text-white/40 text-xs">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-cyan-600" />
                <h2 className="font-serif text-xl font-semibold text-gray-900">Your Cart</h2>
                {cartLoading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
              </div>
              {cart.length > 0 && <span className="text-sm text-gray-400">{cart.length} item{cart.length > 1 ? 's' : ''}</span>}
            </div>

            <div className="p-6">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="h-7 w-7 text-gray-300" />
                  </div>
                  <p className="text-gray-400 text-sm">Your cart is empty</p>
                  <p className="text-gray-300 text-xs mt-1">Explore our products below</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.productId} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="w-16 h-16 rounded-lg bg-white border border-gray-100 p-1.5 shrink-0">
                        <img src={item.img} alt={item.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h4>
                        <p className="text-gray-400 text-xs mt-0.5">₹{item.price} each</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm">
                          <button onClick={() => decreaseQty(item.productId)} disabled={item.quantity <= 1}
                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold text-gray-900">{item.quantity}</span>
                          <button onClick={() => addToCart(item)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-cyan-600 transition-colors">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="font-bold text-gray-900 text-sm w-16 text-right">₹{item.price * item.quantity}</span>
                        <button onClick={() => removeItem(item.productId, item.name)} className="text-gray-300 hover:text-red-500 transition-colors ml-1">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="font-semibold text-gray-600">Total</span>
                    <span className="font-serif text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-green-600">₹{total}</span>
                  </div>
                  <button onClick={() => navigate('/checkout')}
                    className="w-full bg-gradient-to-r from-cyan-500 to-green-600 hover:from-cyan-600 hover:to-green-700 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-md shadow-cyan-200">
                    Proceed to Checkout <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Orders */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-2">
              <Package className="h-5 w-5 text-green-600" />
              <h2 className="font-serif text-xl font-semibold text-gray-900">Order History</h2>
            </div>
            <div className="p-6">
              {orders.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <Package className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No orders yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="border border-gray-100 rounded-xl p-4 hover:border-cyan-200 hover:bg-cyan-50/20 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">#{String(order.id).slice(-6).toUpperCase()}</p>
                          <p className="text-gray-400 text-xs mt-0.5">{new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 text-sm mb-1">₹{order.total}</p>
                          <StatusBadge status={order.status} />
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-xs text-gray-500">
                            <span>{item.name} <span className="text-gray-300">×{item.qty}</span></span>
                            <span>₹{item.price * item.qty}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">

          {/* Profile Card */}
          <div className="rounded-2xl shadow-sm border border-gray-100 overflow-hidden bg-white">
            {/* Top section — dark with avatar inside */}
            <div className="px-5 pt-5 pb-4 relative" style={{background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 70%, #0f2027 100%)'}}>
              <div className="absolute inset-0 pointer-events-none" style={{backgroundImage: 'radial-gradient(circle at 10% 80%, #19e5e425 0%, transparent 50%), radial-gradient(circle at 90% 20%, #6fea6d18 0%, transparent 50%)'}} />
              <div className="relative flex items-center gap-4">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg text-xl font-bold text-white shrink-0"
                  style={{background: 'linear-gradient(135deg, #19e5e4, #6fea6d)'}}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="font-serif text-base font-bold text-white leading-tight truncate">{user.name}</h3>
                  <p className="text-white/40 text-xs mt-0.5">Sanchi Wellness</p>
                  <span className="inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{color: '#19e5e4', background: '#19e5e415', border: '1px solid #19e5e430'}}>
                    Member
                  </span>
                </div>
              </div>
            </div>

            {/* Info rows */}
            <div className="px-5 py-4 space-y-2.5">
              <InfoRow icon={<Mail className="h-3.5 w-3.5" />} color="#19e5e4" bg="#19e5e410" label="Email" value={user.email} truncate />
              {user.phone && (
                <InfoRow icon={<Phone className="h-3.5 w-3.5" />} color="#6fea6d" bg="#6fea6d10" label="Phone" value={`+91 ${user.phone}`} />
              )}
              <InfoRow icon={<Package className="h-3.5 w-3.5" />} color="#a78bfa" bg="#a78bfa10" label="Orders" value={`${orders.length} placed`} />
              <InfoRow icon={<ShoppingBag className="h-3.5 w-3.5" />} color="#fb923c" bg="#fb923c10" label="Cart" value={cart.length > 0 ? `${cart.length} item${cart.length > 1 ? 's' : ''} · ₹${total}` : 'Empty'} />
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm text-center">
              <p className="font-serif text-2xl font-bold text-gray-900">{orders.length}</p>
              <p className="text-gray-400 text-xs mt-0.5">Total Orders</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm text-center">
              <p className="font-serif text-2xl font-bold text-gray-900">
                ₹{orders.filter(o => o.status === 'Paid').reduce((s, o) => s + o.total, 0)}
              </p>
              <p className="text-gray-400 text-xs mt-0.5">Total Spent</p>
            </div>
          </div>

          {/* Checkout CTA */}
          {cart.length > 0 && (
            <div className="rounded-2xl p-5 shadow-sm overflow-hidden relative" style={{background: 'linear-gradient(135deg, #0f172a, #1e293b)'}}>
              <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(circle at 80% 20%, #19e5e4, transparent 60%)'}} />
              <div className="relative">
                <p className="text-white/50 text-[10px] uppercase tracking-widest mb-1">Ready to order?</p>
                <p className="font-serif text-white text-lg font-bold mb-0.5">{cart.length} item{cart.length > 1 ? 's' : ''}</p>
                <p className="font-serif text-2xl font-bold mb-4" style={{color: '#6fea6d'}}>₹{total}</p>
                <button onClick={() => navigate('/checkout')}
                  className="w-full text-gray-900 font-bold py-3 rounded-xl text-sm transition-all hover:opacity-90 flex items-center justify-center gap-2"
                  style={{background: 'linear-gradient(135deg, #19e5e4, #6fea6d)'}}>
                  Checkout Now <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Wellness tip */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-4">
            <p className="text-amber-700 text-[10px] uppercase tracking-widest font-semibold mb-1">Daily Tip</p>
            <p className="text-amber-900 text-sm font-medium leading-relaxed">"Consistency is the key to wellness. Small daily habits create lasting change."</p>
          </div>
        </div>
      </div>

      {/* Shop */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 pt-10 pb-2">
          <span className="text-cyan-600 text-xs tracking-[0.3em] uppercase font-semibold">Continue Shopping</span>
          <h3 className="font-serif text-2xl font-bold text-gray-900 mt-1">Browse Products</h3>
        </div>
        <ProductSection onAddToCart={addToCart} />
      </div>

      <Footer />
    </div>
  );
}

function InfoRow({ icon, color, bg, label, value, truncate }) {
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-xl" style={{background: bg}}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{background: `${color}20`, color}}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">{label}</p>
        <p className={`text-gray-800 text-xs font-semibold mt-0.5 ${truncate ? 'truncate' : ''}`}>{value}</p>
      </div>
    </div>
  );
}
