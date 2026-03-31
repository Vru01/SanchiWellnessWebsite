import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Check, Flame, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/Toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Products with these tags are featured
const FEATURED_TAGS = ['Best Seller', 'Premium', 'Trending', 'New'];

export default function BestSellers() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then(r => r.json())
      .then(data => {
        const featured = data.filter(p => p.tag && FEATURED_TAGS.includes(p.tag)).slice(0, 4);
        setProducts(featured.length >= 2 ? featured : data.slice(0, 4));
      })
      .catch(() => {});
  }, []);

  const handleAdd = async (product) => {
    const stored = localStorage.getItem('user');
    if (!stored) { navigate('/login'); return; }
    const user = JSON.parse(stored);
    await fetch(`${API_URL}/api/cart/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, product: { id: product._id, name: product.name, price: product.discountPrice || product.price, img: product.img } }),
    });
    window.dispatchEvent(new Event('cartUpdated'));
    setAddedId(product._id);
    toast.success(`${product.name} added to cart!`);
    setTimeout(() => setAddedId(null), 1800);
  };

  if (!products.length) return null;

  return (
    <section className="bg-white py-20 md:py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="text-cyan-600 text-xs tracking-[0.3em] uppercase font-semibold">Most Popular</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900">Best Sellers</h2>
          </div>
          <a href="#products" className="hidden md:flex items-center gap-1 text-sm text-cyan-600 font-semibold hover:text-cyan-700 transition-colors">
            View All →
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, idx) => {
            const isAdded = addedId === product._id;
            const discount = product.discountPrice && Number(product.discountPrice) < Number(product.price)
              ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : null;

            return (
              <div key={product._id} className="group relative bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:border-cyan-200 hover:shadow-xl transition-all duration-300 flex flex-col">
                {idx === 0 && (
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                    <Flame className="h-3 w-3" /> #1 Best Seller
                  </div>
                )}
                <div className="h-52 bg-gradient-to-br from-cyan-50 to-green-50 flex items-center justify-center p-4 overflow-hidden">
                  <img src={product.img} alt={product.name} className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <span className="text-cyan-600 text-[10px] font-semibold tracking-widest uppercase mb-1">{product.category}</span>
                  <h3 className="font-serif font-semibold text-gray-900 text-base leading-snug mb-1">{product.name}</h3>
                  <p className="text-gray-400 text-xs line-clamp-2 mb-4 flex-grow">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-900">₹{product.discountPrice || product.price}</span>
                      {discount && <span className="text-xs text-rose-500 font-semibold ml-1.5">-{discount}%</span>}
                    </div>
                    <button onClick={() => handleAdd(product)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all ${
                        isAdded ? 'bg-green-600 text-white' : 'bg-gradient-to-r from-cyan-500 to-green-600 text-white hover:from-cyan-600 hover:to-green-700'
                      } shadow-sm`}>
                      {isAdded ? <><Check className="h-3.5 w-3.5" /> Added</> : <><ShoppingCart className="h-3.5 w-3.5" /> Add</>}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
