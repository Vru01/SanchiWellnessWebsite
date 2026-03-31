import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/home/Footer';
import { Trash2, Edit, Plus, Image as ImageIcon, Loader2, X, AlertCircle, CheckCircle2, XCircle, Clock, Package, ShoppingBag, TrendingUp, Phone, MapPin } from 'lucide-react';
import { toast } from '@/components/ui/Toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API = `${API_URL}/api`;
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dfqgwgehn';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'sanchi_wellness_uploads';
const EMPTY = { id: '', name: '', price: '', discountPrice: '', category: '', description: '', img: '', tag: '' };

const StatusBadge = ({ status }) => {
  if (status === 'Paid') return <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200"><CheckCircle2 className="h-3 w-3" />{status}</span>;
  if (status === 'Rejected') return <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-200"><XCircle className="h-3 w-3" />{status}</span>;
  return <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200"><Clock className="h-3 w-3" />{status}</span>;
};

const borderAccent = (s) => s === 'Paid' ? 'border-l-green-500' : s === 'Rejected' ? 'border-l-red-400' : 'border-l-yellow-400';

export default function AdminPanel() {
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [product, setProduct] = useState(EMPTY);
  const [formError, setFormError] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [oRes, pRes] = await Promise.all([fetch(`${API}/admin/all-orders`), fetch(`${API}/products`)]);
      setOrders(await oRes.json());
      setProducts(await pRes.json());
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const updateStatus = async (orderId, status) => {
    await fetch(`${API}/admin/update-status`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId, status }) });
    fetchAll();
    toast.success(`Order marked as ${status}`);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', UPLOAD_PRESET);
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.secure_url) setProduct(p => ({ ...p, img: data.secure_url }));
      else setFormError('Upload failed. Check Cloudinary config.');
    } catch { setFormError('Image upload failed.'); }
    finally { setUploading(false); }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const { id, ...payload } = product;
    const url = isEditing ? `${API}/products/admin/update/${id}` : `${API}/products/admin/add`;
    try {
      const res = await fetch(url, { method: isEditing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) { setShowForm(false); fetchAll(); toast.success(isEditing ? 'Product updated!' : 'Product created!'); }
      else { const d = await res.json(); setFormError(d.error || 'Operation failed.'); }
    } catch { setFormError('Server error.'); }
  };

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    await fetch(`${API}/products/admin/delete/${id}`, { method: 'DELETE' });
    fetchAll();
    toast.info('Product deleted');
  };

  const openEdit = (p) => {
    setProduct({ id: p._id, name: p.name, price: p.price, discountPrice: p.discountPrice || '', category: p.category, description: p.description, img: p.img, tag: p.tag || '' });
    setIsEditing(true); setFormError(''); setShowForm(true);
  };

  const deleteOrder = async (orderId) => {
    if (!confirm('Delete this order permanently? This cannot be undone.')) return;
    await fetch(`${API}/admin/delete-order/${orderId}`, { method: 'DELETE' });
    fetchAll();
    toast.info('Order deleted');
  };
  const openAdd = () => { setProduct(EMPTY); setIsEditing(false); setFormError(''); setShowForm(true); };
  const calcDiscount = (orig, disc) => (!disc || Number(disc) >= Number(orig)) ? null : Math.round(((orig - disc) / orig) * 100);
  const getEmail = (u) => !u || typeof u === 'string' ? '' : u.email;
  const getPhone = (u) => !u || typeof u === 'string' ? '' : u.phone || '';

  const getName = (u) => !u ? 'Unknown' : typeof u === 'string' ? `ID:${u.slice(-4)}` : u.name;
  const revenue = orders.filter(o => o.status === 'Paid').reduce((s, o) => s + o.totalAmount, 0);

  const pendingCount = orders.filter(o => o.status === 'Pending Verification').length;

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="relative bg-gray-900 pt-24 pb-10 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 20% 50%, #06b6d4 0%, transparent 50%), radial-gradient(circle at 80% 20%, #16a34a 0%, transparent 40%)'}} />
        <div className="relative max-w-7xl mx-auto">
          <p className="text-white/40 text-xs tracking-[0.3em] uppercase font-semibold mb-2">Admin</p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-8">Control Panel</h1>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: ShoppingBag, label: 'Total Orders', value: orders.length },
              { icon: Clock, label: 'Pending', value: pendingCount },
              { icon: TrendingUp, label: 'Revenue', value: `₹${revenue.toLocaleString()}` },
              { icon: Package, label: 'Products', value: products.length },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
                <Icon className="h-5 w-5 text-white/40 mb-2" />
                <p className="font-serif text-2xl font-bold text-white">{value}</p>
                <p className="text-white/40 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white rounded-xl p-1.5 shadow-sm border border-gray-100 w-fit">
          {['orders', 'products'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all ${tab === t ? 'bg-gradient-to-r from-cyan-500 to-green-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
              {t} ({t === 'orders' ? orders.length : products.length})
            </button>
          ))}
        </div>

        {/* Orders */}
        {tab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 && (
              <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
                <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No orders yet.</p>
              </div>
            )}
            {orders.map((order, idx) => (
              <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                {/* Card header — customer name + date + status */}
                <div className={`px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-l-4 ${borderAccent(order.status)}`}
                  style={{background: order.status === 'Paid' ? '#f0fdf4' : order.status === 'Rejected' ? '#fff5f5' : '#fffbeb'}}>
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Order number */}
                    <span className="text-xs font-bold text-gray-400 bg-white border border-gray-200 px-2 py-0.5 rounded-md">
                      Order #{orders.length - idx}
                    </span>
                    {/* Customer name */}
                    <span className="font-semibold text-gray-900 text-sm">{getName(order.userId)}</span>
                    <span className="text-gray-300">·</span>
                    {/* Date */}
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {' '}
                      {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                {/* Card body — 4 columns */}
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

                  {/* Payment */}
                  <div className="bg-slate-50 border border-gray-100 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Payment</p>
                    <p className="font-serif text-2xl font-bold text-gray-900">₹{order.totalAmount}</p>
                    <div className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-lg px-2 py-1.5 mt-2">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold shrink-0">UTR</span>
                      <span className="text-xs font-mono text-gray-700 font-semibold truncate">{order.transactionId || '—'}</span>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="bg-slate-50 border border-gray-100 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Contact</p>
                    <p className="text-xs text-gray-500 truncate mb-2">{getEmail(order.userId) || '—'}</p>
                    {getPhone(order.userId) ? (
                      <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                        <Phone className="h-3.5 w-3.5 text-green-500 shrink-0" />
                        <span className="text-green-800 text-sm font-bold">+91 {getPhone(order.userId)}</span>
                      </div>
                    ) : (
                      <p className="text-gray-300 text-xs italic">No phone on file</p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="bg-slate-50 border border-gray-100 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Ship To</p>
                    {order.shippingAddress ? (
                      <div className="flex items-start gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-gray-700 leading-relaxed">{order.shippingAddress}</p>
                      </div>
                    ) : (
                      <p className="text-gray-300 text-xs italic">No address</p>
                    )}
                  </div>

                  {/* Items + actions */}
                  <div className="flex flex-col gap-3">
                    {/* Items list */}
                    <div className="bg-slate-50 border border-gray-100 rounded-xl p-4 flex-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Items</p>
                      <div className="space-y-1.5">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between items-center text-xs">
                            <span className="text-gray-700 font-medium truncate mr-2">{item.name}
                              <span className="text-gray-400 font-normal"> ×{item.quantity}</span>
                            </span>
                            <span className="font-semibold text-gray-900 shrink-0">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status actions — always visible */}
                    <div className="bg-slate-50 border border-gray-100 rounded-xl p-3 space-y-2">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Update Status</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateStatus(order._id, 'Paid')}
                          disabled={order.status === 'Paid'}
                          className="flex-1 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          style={order.status === 'Paid'
                            ? {background:'#f0fdf4', color:'#16a34a', border:'1px solid #bbf7d0'}
                            : {background:'linear-gradient(135deg,#19e5e4,#6fea6d)', color:'#0f172a'}}>
                          ✓ Paid
                        </button>
                        <button
                          onClick={() => updateStatus(order._id, 'Rejected')}
                          disabled={order.status === 'Rejected'}
                          className="flex-1 py-2 rounded-lg text-xs font-bold border border-red-200 text-red-500 hover:bg-red-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent">
                          ✕ Reject
                        </button>
                        {order.status !== 'Pending Verification' && (
                          <button
                            onClick={() => updateStatus(order._id, 'Pending Verification')}
                            className="flex-1 py-2 rounded-lg text-xs font-bold border border-yellow-200 text-yellow-600 hover:bg-yellow-50 transition-all">
                            ↺ Pending
                          </button>
                        )}
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => deleteOrder(order._id)}
                        className="w-full py-2 rounded-lg text-xs font-bold border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-1.5">
                        <Trash2 className="h-3.5 w-3.5" /> Delete Order
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products */}
        {tab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-500 text-sm">{products.length} products in inventory</p>
              <button onClick={openAdd}
                className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-green-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:from-cyan-600 hover:to-green-700 transition-all text-sm shadow-md shadow-cyan-200">
                <Plus className="h-4 w-4" /> Add Product
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(p => {
                const disc = calcDiscount(p.price, p.discountPrice);
                return (
                  <div key={p._id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:border-cyan-200 transition-all group flex flex-col">
                    <div className="relative h-64 bg-gradient-to-br from-cyan-50/50 to-green-50/50 overflow-hidden">
                      <img src={p.img} alt={p.name} className="w-full h-full object-contain p-5 group-hover:scale-105 transition-transform duration-300" />
                      {disc && (
                        <div className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                          {disc}% OFF
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-gray-100 shadow-sm">
                        {p.category}
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="font-serif font-semibold text-gray-900 leading-snug mb-1 text-lg">{p.name}</h3>
                      <p className="text-gray-400 text-sm line-clamp-2 mb-4 flex-grow">{p.description}</p>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <span className="font-bold text-gray-900 text-lg">₹{p.discountPrice || p.price}</span>
                          {p.discountPrice && <span className="text-sm text-gray-300 line-through ml-1.5">₹{p.price}</span>}
                        </div>
                        {p.tag && <span className="text-xs bg-cyan-50 text-cyan-700 border border-cyan-200 px-2.5 py-1 rounded-full font-semibold">{p.tag}</span>}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)}
                          className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 text-gray-600 hover:border-cyan-300 hover:text-cyan-600 py-2 rounded-xl text-xs font-semibold transition-all">
                          <Edit className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button onClick={() => deleteProduct(p._id)}
                          className="border border-red-100 text-red-400 hover:bg-red-50 p-2 rounded-xl transition-all">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl my-4">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-serif text-xl font-bold text-gray-900">{isEditing ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[['name', 'Product Name'], ['category', 'Category']].map(([key, label]) => (
                  <div key={key}>
                    <label className="text-gray-500 text-xs tracking-widest uppercase mb-1.5 block font-medium">{label} *</label>
                    <input required value={product[key]} onChange={e => setProduct(p => ({ ...p, [key]: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all bg-gray-50" />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-500 text-xs tracking-widest uppercase mb-1.5 block font-medium">MRP (₹) *</label>
                  <input required type="number" value={product.price} onChange={e => setProduct(p => ({ ...p, price: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all bg-gray-50" />
                </div>
                <div>
                  <label className="text-green-600 text-xs tracking-widest uppercase mb-1.5 block font-medium">Sale Price (₹)</label>
                  <input type="number" placeholder="Optional" value={product.discountPrice} onChange={e => setProduct(p => ({ ...p, discountPrice: e.target.value }))}
                    className="w-full border border-green-200 bg-green-50/30 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all" />
                </div>
              </div>

              <div>
                <label className="text-gray-500 text-xs tracking-widest uppercase mb-1.5 block font-medium">Description *</label>
                <input required value={product.description} onChange={e => setProduct(p => ({ ...p, description: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all bg-gray-50" />
              </div>

              <div>
                <label className="text-gray-500 text-xs tracking-widest uppercase mb-1.5 block font-medium">Tag</label>
                <input placeholder="e.g. Best Seller" value={product.tag} onChange={e => setProduct(p => ({ ...p, tag: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all bg-gray-50" />
              </div>

              <div>
                <label className="text-gray-500 text-xs tracking-widest uppercase mb-1.5 block font-medium">Product Image</label>
                <div className="flex gap-3 items-center bg-gray-50 border border-dashed border-gray-200 rounded-xl p-3">
                  <div className="w-20 h-20 shrink-0 bg-white border border-gray-100 rounded-xl flex items-center justify-center overflow-hidden relative shadow-sm">
                    {product.img ? <img src={product.img} alt="preview" className="w-full h-full object-contain p-1" /> : <ImageIcon className="h-7 w-7 text-gray-200" />}
                    {uploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl"><Loader2 className="h-5 w-5 text-cyan-500 animate-spin" /></div>}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading}
                      className="w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gradient-to-r file:from-cyan-500 file:to-green-600 file:text-white hover:file:from-cyan-600 hover:file:to-green-700 cursor-pointer" />
                    <input placeholder="Or paste image URL" value={product.img} onChange={e => setProduct(p => ({ ...p, img: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-500 focus:outline-none focus:border-cyan-400 transition-colors bg-white" />
                  </div>
                </div>
              </div>

              {formError && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 p-3 rounded-xl">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {formError}
                </div>
              )}

              <button type="submit" disabled={uploading}
                className="w-full bg-gradient-to-r from-cyan-500 to-green-600 hover:from-cyan-600 hover:to-green-700 text-white font-bold py-4 rounded-xl transition-all text-sm shadow-md shadow-cyan-200 disabled:opacity-60">
                {uploading ? 'Uploading...' : isEditing ? 'Save Changes' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
