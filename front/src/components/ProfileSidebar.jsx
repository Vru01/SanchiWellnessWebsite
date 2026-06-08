import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, Package, ShoppingBag, ArrowRight, UserCheck, Edit2 } from 'lucide-react';
import { toast } from '@/components/ui/Toast';

export default function ProfileSidebar({ user, setUser, orders, cart, total, cartItemCount, API }) {
  const navigate = useNavigate();
  const [profileModal, setProfileModal] = useState({ isOpen: false, name: '', phone: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  const openEditProfile = () => {
    setProfileModal({
      isOpen: true,
      name: user?.name || '',
      phone: user?.phone || ''
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileModal.name.trim() || !/^\d{10}$/.test(profileModal.phone)) {
      toast.error("Please enter a valid name and 10-digit phone number.");
      return;
    }

    setProfileLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/auth/update-profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ userId: user.id, name: profileModal.name, phone: profileModal.phone })
      });
      const data = await res.json();

      if (res.ok) {
        const updatedUser = { ...user, name: data.user.name, phone: data.user.phone };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        toast.success("Profile updated successfully!");
        setProfileModal({ ...profileModal, isOpen: false });
      } else {
        toast.error(data.error || "Failed to update profile");
      }
    } catch {
      toast.error("Server communication error.");
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Profile Info Card */}
      <div className="rounded-2xl shadow-sm border border-gray-100 overflow-hidden bg-white p-1">
        <div className="px-5 pt-5 pb-4 rounded-xl relative" style={{background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 70%, #0f2027 100%)'}}>
          <div className="absolute inset-0 pointer-events-none" style={{backgroundImage: 'radial-gradient(circle at 10% 80%, #19e5e425 0%, transparent 50%), radial-gradient(circle at 90% 20%, #6fea6d18 0%, transparent 50%)'}} />
          
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg text-xl font-bold text-white shrink-0"
              style={{background: 'linear-gradient(135deg, #19e5e4, #6fea6d)'}}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <h3 className="font-serif text-base font-bold text-white leading-tight truncate">{user?.name || 'Loading...'}</h3>
              <p className="text-white/40 text-xs mt-0.5">Sanchi Wellness</p>
              <span className="inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{color: '#19e5e4', background: '#19e5e415', border: '1px solid #19e5e430'}}>
                Member
              </span>
            </div>
          </div>
        </div>

        {/* Profile Info Rows Stack */}
        <div className="px-4 py-4 space-y-2.5">
          <InfoRow icon={<Mail className="h-3.5 w-3.5" />} color="#19e5e4" bg="#19e5e410" label="Email" value={user?.email || 'Loading...'} truncate />
          <InfoRow icon={<Phone className="h-3.5 w-3.5" />} color="#6fea6d" bg="#6fea6d10" label="Phone" value={user?.phone ? `+91 ${user.phone}` : 'Not provided'} />
          <InfoRow icon={<Package className="h-3.5 w-3.5" />} color="#a78bfa" bg="#a78bfa10" label="Orders" value={`${orders?.length || 0} placed`} />
          <InfoRow icon={<ShoppingBag className="h-3.5 w-3.5" />} color="#fb923c" bg="#fb923c10" label="Cart" value={cartItemCount > 0 ? `${cartItemCount} item${cartItemCount > 1 ? 's' : ''} · ₹${total}` : 'Empty'} />
          
          {/* 🔥 NEW: Prominent, 100% visible Edit Profile Button */}
          <button 
            type="button"
            onClick={openEditProfile}
            className="w-full flex items-center justify-center gap-2 mt-2 py-3 px-4 rounded-xl bg-gray-50 hover:bg-cyan-50/50 text-gray-600 hover:text-cyan-600 border border-gray-100 font-semibold text-xs transition-all active:scale-[0.98]"
          >
            <Edit2 className="h-3.5 w-3.5" />
            Edit Profile Details
          </button>
        </div>
      </div>

      {/* Quick Aggregation Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm text-center">
          <p className="font-serif text-2xl font-bold text-gray-900">{orders?.length || 0}</p>
          <p className="text-gray-400 text-xs mt-0.5">Total Orders</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm text-center">
          <p className="font-serif text-2xl font-bold text-gray-900">
            ₹{orders ? orders.filter(o => o.status === 'Processing' || o.status === 'Shipped' || o.status === 'Delivered').reduce((s, o) => s + o.totalAmount, 0) : 0}
          </p>
          <p className="text-gray-400 text-xs mt-0.5">Total Spent</p>
        </div>
      </div>

      {/* Dynamic Action Checkout Banner */}
      {cartItemCount > 0 && (
        <div className="rounded-2xl p-5 shadow-sm overflow-hidden relative" style={{background: 'linear-gradient(135deg, #0f172a, #1e293b)'}}>
          <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(circle at 80% 20%, #19e5e4, transparent 60%)'}} />
          <div className="relative">
            <p className="text-white/50 text-[10px] uppercase tracking-widest mb-1">Ready to order?</p>
            <p className="font-serif text-white text-lg font-bold mb-0.5">{cartItemCount} item{cartItemCount > 1 ? 's' : ''}</p>
            <p className="font-serif text-2xl font-bold mb-4" style={{color: '#6fea6d'}}>₹{total}</p>
            <button onClick={() => navigate('/checkout')}
              className="w-full text-gray-900 font-bold py-3 rounded-xl text-sm transition-all hover:opacity-90 flex items-center justify-center gap-2"
              style={{background: 'linear-gradient(135deg, #19e5e4, #6fea6d)'}}>
              Checkout Now <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Integrated Profile Edit Overlay Form */}
      {profileModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-serif text-xl font-bold text-gray-900">Edit Profile</h2>
              <button 
                type="button"
                onClick={() => setProfileModal({ ...profileModal, isOpen: false })} 
                className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={profileModal.name} 
                  onChange={e => setProfileModal({ ...profileModal, name: e.target.value })} 
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3 text-sm mt-1 focus:ring-2 focus:ring-cyan-100 focus:border-cyan-400 outline-none transition-all" 
                />
              </div>
              
              <div>
                <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Phone Number (+91)</label>
                <input 
                  type="text" 
                  required 
                  maxLength={10}
                  value={profileModal.phone} 
                  onChange={e => setProfileModal({ ...profileModal, phone: e.target.value.replace(/\D/g, '') })} 
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl p-3 text-sm mt-1 focus:ring-2 focus:ring-green-100 focus:border-green-400 outline-none transition-all" 
                />
              </div>
              
              <button 
                type="submit" 
                disabled={profileLoading}
                className="w-full mt-4 py-3.5 bg-gradient-to-r from-cyan-500 to-green-600 hover:from-cyan-600 hover:to-green-700 text-white rounded-xl text-sm font-bold flex justify-center items-center gap-2 transition-all shadow-md shadow-cyan-100 disabled:opacity-50"
              >
                {profileLoading ? "Saving Changes..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
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