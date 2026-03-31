import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Check, AlertCircle, Loader2, X, Star, Leaf } from 'lucide-react';
import { toast } from '@/components/ui/Toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function ProductModal({ product, onClose, onAddToCart, addedId }) {
  const discount = product.discountPrice && Number(product.discountPrice) < Number(product.price)
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : null;
  const isAdded = addedId === product._id;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200"
        onClick={e => e.stopPropagation()}>
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="relative bg-gradient-to-br from-cyan-50 to-green-50 p-8 flex items-center justify-center min-h-[280px]">
            <img src={product.img} alt={product.name} className="w-full max-h-64 object-contain" />
            {discount && (
              <div className="absolute top-4 left-4 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                {discount}% OFF
              </div>
            )}
            {product.tag && (
              <div className="absolute top-4 right-4 bg-gradient-to-r from-cyan-500 to-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                {product.tag}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-8 flex flex-col justify-between">
            <div>
              <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                <X className="h-4 w-4 text-gray-500" />
              </button>
              <span className="text-cyan-600 text-xs font-semibold tracking-widest uppercase">{product.category}</span>
              <h2 className="font-serif text-2xl font-bold text-gray-900 mt-2 mb-3 leading-tight">{product.name}</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">{product.description}</p>

              <div className="flex items-center gap-1 mb-4">
                {[1,2,3,4,5].map(s => <Star key={s} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
                <span className="text-xs text-gray-400 ml-1">5.0 · Verified</span>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <span className="font-serif text-3xl font-bold text-gray-900">₹{product.discountPrice || product.price}</span>
                {product.discountPrice && (
                  <span className="text-lg text-gray-400 line-through">₹{product.price}</span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
                <Leaf className="h-3.5 w-3.5 text-green-500" />
                <span>100% Natural · Lab Tested · Ayurveda Rooted</span>
              </div>
            </div>

            <button onClick={() => onAddToCart(product)}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold transition-all shadow-md ${
                isAdded
                  ? 'bg-green-600 text-white shadow-green-200'
                  : 'bg-gradient-to-r from-cyan-500 to-green-600 text-white hover:from-cyan-600 hover:to-green-700 shadow-cyan-200'
              }`}>
              {isAdded ? <><Check className="h-4 w-4" /> Added to Cart!</> : <><ShoppingCart className="h-4 w-4" /> Add to Cart</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductSection({ onAddToCart }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedId, setAddedId] = useState(null);
  const [filter, setFilter] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setProducts)
      .catch(() => setError('Could not load products.'))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const filtered = products
    .filter(p => filter === 'All' || p.category === filter);

  const handleAdd = async (product) => {
    const stored = localStorage.getItem('user');
    if (!stored) { navigate('/login'); return; }
    const user = JSON.parse(stored);
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      await fetch(`${API_URL}/api/cart/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, product: { id: product._id, name: product.name, price: product.discountPrice || product.price, img: product.img } }),
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
                className={`px-4 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                  filter === cat
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

              return (
                <div key={product._id} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-cyan-200 flex flex-col cursor-pointer"
                  onClick={() => setSelectedProduct(product)}>
                  {/* Image */}
                  <div className="relative h-72 bg-gradient-to-br from-cyan-50/50 to-green-50/50 overflow-hidden">
                    <img src={product.img} alt={product.name} className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500" />
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
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
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm ${
                          isAdded
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

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(p) => { handleAdd(p); }}
          addedId={addedId}
        />
      )}
    </>
  );
}
