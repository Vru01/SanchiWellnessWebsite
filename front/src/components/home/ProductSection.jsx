import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Check, AlertCircle, Loader2, Star, Leaf } from 'lucide-react';
import { toast } from '@/components/ui/Toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ProductSection({ onAddToCart }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedId, setAddedId] = useState(null);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => {
        console.log("MY BACKEND PRODUCTS:", data);
        setProducts(data);
      })
      .catch(() => setError('Could not load products.'))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const filtered = products
    .filter(p => filter === 'All' || p.category === filter);

  const handleAdd = async (product) => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!stored || !token) { navigate('/login'); return; }
    const user = JSON.parse(stored);

    if (onAddToCart) {
      onAddToCart(product);
    } else {
      await fetch(`${API_URL}/api/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: user.id, productId: product._id }),
      });
      window.dispatchEvent(new Event('cartUpdated'));
    }
    setAddedId(product._id);
    toast.success(`${product.name} added to cart!`);
    setTimeout(() => setAddedId(null), 1800);
  };

  if (loading) return (
    <div className="py-32 flex justify-center bg-gray-50">
      <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
    </div>
  );

  if (error) return (
    <div className="py-32 flex justify-center items-center gap-2 text-red-500 bg-gray-50">
      <AlertCircle className="h-5 w-5" /> {error}
    </div>
  );

  return (
    <>
      <section id="products" className="bg-gray-50 py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          {!onAddToCart && (
            <div className="text-center mb-14">
              <span className="text-cyan-600 text-xs tracking-[0.3em] uppercase font-semibold">Our Collection</span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mt-3">Premium Wellness Products</h2>
              <p className="text-gray-500 mt-4 max-w-xl mx-auto">Each product crafted with intention, backed by science, rooted in nature.</p>
            </div>
          )}

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {!onAddToCart && categories.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)}
                className={`px-4 py-2.5 rounded-2xl text-sm font-medium transition-all ${filter === cat
                    ? 'bg-gradient-to-r from-cyan-500 to-green-600 text-white shadow-md shadow-cyan-200'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-cyan-300 hover:text-cyan-600 shadow-sm'
                  }`}>
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(product => {
              const discount = product.discountPrice && Number(product.discountPrice) < Number(product.price)
                ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : null;
              const isAdded = addedId === product._id;
              const imageUrl = product.images?.[0]?.url || product.img;

              return (
                <div key={product._id} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-cyan-200 flex flex-col cursor-pointer"
                  onClick={() => navigate(`/product/${product.slug}`)}>
                  {/* Image */}
                  {/* Image Section inside filtered.map */}
                  <div className="relative h-72 bg-gradient-to-br from-cyan-50/50 to-green-50/50 overflow-hidden">
                    <img src={imageUrl} alt={product.name} className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500" />
                    {discount && (
                      <div className="absolute top-3 left-3 bg-rose-500 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
                        {discount}% OFF
                      </div>
                    )}
                    {product.tag && (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-cyan-500 to-green-600 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
                        {product.tag}
                      </div>
                    )}

                    {/* UPGRADED: Added pointer-events-none to prevent touch trapping on mobile */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    {/* UPGRADED: Added pointer-events-none so mobile taps fall straight through to the main onClick handler */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 pointer-events-none">
                      <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
                        Click to view details
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-7 flex flex-col flex-grow">
                    <span className="text-cyan-600 text-xs font-semibold tracking-widest uppercase mb-2">{product.category}</span>
                    <h3 className="font-serif text-xl font-semibold text-gray-900 leading-snug mb-2">{product.name}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed flex-grow mb-6 line-clamp-2">{product.description}</p>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                      <div>
                        <span className="text-2xl font-bold text-gray-900">₹{product.discountPrice || product.price}</span>
                        {product.discountPrice && (
                          <span className="text-sm text-gray-400 line-through ml-2">₹{product.price}</span>
                        )}
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); handleAdd(product); }}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm ${isAdded
                            ? 'bg-green-600 text-white shadow-green-200'
                            : 'bg-gradient-to-r from-cyan-500 to-green-600 text-white hover:from-cyan-600 hover:to-green-700 shadow-cyan-200'
                          }`}>
                        {isAdded ? <><Check className="h-4 w-4" /> Added</> : <><ShoppingCart className="h-4 w-4" /> Add to Cart</>}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}