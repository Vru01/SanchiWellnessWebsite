import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ShoppingCart,
    Check,
    Star,
    Leaf,
    ArrowLeft,
    ShieldCheck,
    Heart,
    Truck,
    RefreshCw,
    Clock,
    Droplets,
    Zap,
    Sparkles,
    Info,
    X,
    ChevronDown,
    AlertTriangle
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { getCombinedProductData } from '@/data/extendedProductDetails';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ProductDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdded, setIsAdded] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');
    const [isImageOpen, setIsImageOpen] = useState(false);

    // Both ingredient dropdowns open by default so people see the ingredients right away
    const [openAccordions, setOpenAccordions] = useState(new Set([0, 1]));

    const toggleAccordion = (idx) => {
        setOpenAccordions(prev => {
            const next = new Set(prev);
            if (next.has(idx)) next.delete(idx);
            else next.add(idx);
            return next;
        });
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        setLoading(true);

        fetch(`${API_URL}/api/products`)
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(data => {
                const foundBackendProduct = data.find(p => p.slug === id || p._id === id);

                if (foundBackendProduct) {
                    const combinedData = getCombinedProductData(foundBackendProduct);
                    setProduct(combinedData);
                    if (combinedData.imageGallery?.length > 0) {
                        setSelectedImage(combinedData.imageGallery[0]);
                    }
                    // Make sure every ingredient section is open by default, even if there are more than 2
                    if (combinedData.highlights?.length > 0) {
                        setOpenAccordions(new Set(combinedData.highlights.map((_, i) => i)));
                    }
                } else {
                    toast.error('We couldn\'t find that product.');
                }
            })
            .catch(() => toast.error('Something went wrong loading this product.'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleAdd = async () => {
        const stored = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (!stored || !token) { navigate('/login'); return; }
        const user = JSON.parse(stored);

        try {
            await fetch(`${API_URL}/api/cart/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ userId: user.id, productId: product._id, quantity: 1 }),
            });
            window.dispatchEvent(new Event('cartUpdated'));
            setIsAdded(true);
            toast.success(`${product.name} added to cart!`);
            setTimeout(() => setIsAdded(false), 2000);
        } catch (err) {
            toast.error('Couldn\'t add this to your cart. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!product) return null;

    const discount = product.price > 0 && product.discountPrice && product.discountPrice < product.price
        ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
        : null;

    const benefitIcons = [Sparkles, Zap, ShieldCheck, Leaf];

    // Swap technical section titles for plain, everyday language — no "formulation," "matrix," "synergy," etc.
    const cleanFriendlyTitle = (title) => {
        const checkLower = title.toLowerCase();
        if (checkLower.includes('active ingredients')) return "What's Inside Each Serving";
        if (checkLower.includes('other formulation') || checkLower.includes('other ingredients')) return "Other Natural Ingredients";
        if (checkLower.includes('key biochemical') || checkLower.includes('nutritional facts')) return "Key Healthy Ingredients";
        if (checkLower.includes('full ingredients') || checkLower.includes('composition')) return "Full Ingredient List";
        if (checkLower.includes('quantity matrix') || checkLower.includes('pack volume')) return "Pack Size & Details";
        if (checkLower.includes('synergy elements') || checkLower.includes('focus parameters')) return "Where These Ingredients Come From";
        if (checkLower.includes('caution') || checkLower.includes('safety') || checkLower.includes('warning')) return "Cautions";
        return title;
    };

    const cautionHighlights = product.highlights?.filter(hl =>
        hl.title.toLowerCase().includes('caution') || hl.title.toLowerCase().includes('safety') || hl.title.toLowerCase().includes('warning')
    ) || [];

    const generalHighlights = product.highlights?.filter(hl =>
        !hl.title.toLowerCase().includes('caution') && !hl.title.toLowerCase().includes('safety') && !hl.title.toLowerCase().includes('warning')
    ) || [];

    return (
        <div className="bg-gradient-to-b from-slate-50/60 via-white to-slate-100/40 min-h-screen pb-28 selection:bg-cyan-100 font-sans tracking-normal antialiased">
            
            <style>{`
                @layer utilities {
                    @keyframes scaleUp { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
                    .animate-scaleUp { animation: scaleUp 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                }
            `}</style>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
                
                {/* Back Link Row */}
                <button
                    onClick={() => {
                        const token = localStorage.getItem("token");
                        const storedUser = localStorage.getItem("user");
                        if (token && storedUser) {
                            navigate({ pathname: "/dashboard", hash: "#products" });
                        } else {
                            navigate({ pathname: "/", hash: "#products" });
                        }
                    }}
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-cyan-600 font-bold mb-8 transition-colors group text-sm tracking-wide"
                >
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Products
                </button>

                {/* Main Product Panel */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100/90 shadow-xl shadow-slate-200/40 overflow-hidden mb-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">

                        {/* Interactive Gallery Panel */}
                        <div className="lg:col-span-7 bg-gradient-to-br from-slate-50/50 via-white to-cyan-50/10 p-4 sm:p-10 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-100">
                            <div className="relative bg-white border border-slate-100 rounded-3xl shadow-sm group overflow-hidden aspect-[3/4] sm:aspect-square lg:aspect-[4/5]">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(8,145,178,0.06),transparent_65%)]" />
                                
                                <div className="absolute top-0 inset-x-0 p-3 sm:p-6 flex flex-wrap justify-between items-start gap-2 z-20 pointer-events-none">
                                    {discount ? (
                                        <span className="bg-rose-500 text-white text-[10px] sm:text-xs font-black tracking-widest uppercase px-3 py-1.5 rounded-xl shadow-lg shadow-rose-500/30">
                                            Save {discount}% Now
                                        </span>
                                    ) : <div />}
                                    {product.badge && (
                                        <span className="hidden sm:inline-flex bg-slate-900 text-white text-[11px] font-black tracking-widest uppercase px-4 py-2 rounded-xl shadow-sm">
                                            {product.badge}
                                        </span>
                                    )}
                                </div>

                                <div className="absolute inset-0 flex items-center justify-center p-8 pt-16">
                                    <img
                                        src={selectedImage}
                                        alt={product.name}
                                        onClick={() => setIsImageOpen(true)}
                                        className="max-h-full max-w-full w-auto h-auto object-contain transition-all duration-500 transform group-hover:scale-[1.03] drop-shadow-[0_12px_24px_rgba(15,23,42,0.08)] cursor-zoom-in"
                                    />
                                </div>
                                
                                <button
                                    onClick={() => setIsWishlisted(!isWishlisted)}
                                    className="absolute bottom-6 right-6 bg-white shadow-lg border border-slate-100 p-3.5 rounded-full hover:scale-110 transition-transform z-20"
                                >
                                    <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                                </button>
                            </div>

                            {/* Gallery Thumbnails */}
                            {product.imageGallery?.length > 1 && (
                                <div className="flex items-center justify-center gap-3 mt-8 overflow-x-auto py-2">
                                    {product.imageGallery.map((imgUrl, index) => (
                                        <button
                                          key={index}
                                          onClick={() => setSelectedImage(imgUrl)}
                                          className={`w-20 h-20 rounded-2xl p-1.5 bg-white border-2 transition-all transform hover:scale-103 shadow-xs ${selectedImage === imgUrl ? 'border-cyan-500 ring-4 ring-cyan-50' : 'border-slate-100 hover:border-slate-300'}`}
                                        >
                                          <img src={imgUrl} alt="Product view" className="w-full h-full object-contain rounded-xl" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Buying & Pricing Panel */}
                        <div className="lg:col-span-5 p-6 sm:p-10 lg:p-12 flex flex-col justify-between bg-white">
                            <div>
                                <span className="text-xs font-extrabold tracking-[0.2em] text-cyan-600 bg-cyan-50 px-4 py-2 rounded-xl border border-cyan-100 w-max block mb-6 uppercase">
                                    {product.category}
                                </span>

                                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-4">
                                    {product.name}
                                </h1>

                                <div className="flex items-center gap-3 mb-6">
                                    <div className="flex text-amber-400 gap-0.5">
                                        <Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-700 tracking-wide">5.0 <span className="text-slate-400 font-semibold">(Customer Reviews)</span></span>
                                </div>

                                <div className="bg-gradient-to-br from-slate-950 to-slate-900 text-white rounded-3xl p-6 border border-slate-950 shadow-xl mb-6 relative overflow-hidden">
                                    <div className="absolute -right-4 -bottom-4 p-4 opacity-5"><Sparkles className="h-24 w-24 text-cyan-400" /></div>
                                    <div className="relative">
                                        <div className="text-[10px] font-extrabold tracking-[0.25em] text-cyan-400 uppercase mb-1">Special Price</div>
                                        <div className="flex items-baseline gap-3">
                                            <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">₹{product.discountPrice || product.price}</span>
                                            {product.discountPrice && <span className="text-base font-bold text-slate-500 line-through">₹{product.price}</span>}
                                        </div>
                                    </div>
                                </div>

                                <p className="text-slate-600 text-base leading-relaxed mb-6 border-l-4 border-cyan-500/20 bg-slate-50/50 p-4 rounded-r-xl font-medium">
                                    {product.summary}
                                </p>
                            </div>

                            {/* Cart CTA Controls */}
                            <div className="space-y-4 mt-auto">
                                <button
                                    onClick={handleAdd}
                                    className={`w-full py-4 rounded-2xl font-extrabold text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 border shadow-sm ${
                                        isAdded 
                                          ? 'bg-emerald-600 text-white border-emerald-600' 
                                          : 'bg-[#0B1F1A] hover:bg-slate-800 text-white shadow-md'
                                    }`}
                                >
                                  {isAdded ? <Check size={14} /> : <ShoppingCart size={14} />} 
                                  {isAdded ? 'Added to Cart' : 'Add to Cart'}
                                </button>
                                
                                <div className="grid grid-cols-2 gap-2 text-center text-[11px] font-bold text-slate-500 pt-1">
                                  <div className="flex items-center justify-center gap-1.5 bg-slate-50 py-2.5 rounded-xl border border-slate-100"><Truck size={14} className="text-emerald-500" /><span>Free Shipping</span></div>
                                  <div className="flex items-center justify-center gap-1.5 bg-slate-50 py-2.5 rounded-xl border border-slate-100"><RefreshCw size={14} className="text-emerald-500" /><span>Secure Checkout</span></div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* VERTICAL STACKED INFORMATION SECTIONS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mt-12">

                    {/* LEFT AREA: Ingredients & Benefits */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Ingredient Dropdowns — both open by default */}
                        {generalHighlights && generalHighlights.length > 0 && (
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                                <div className="flex items-center gap-3 py-4 px-6 bg-slate-50/50 border-b border-slate-100">
                                    <Droplets className="h-5 w-5 text-cyan-600 shrink-0" />
                                    <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                                        Ingredients & Product Details
                                    </h3>
                                </div>
                                <div className="p-5 sm:p-6 space-y-2.5">
                                    {generalHighlights.map((hl, idx) => {
                                        const isAccordionOpen = openAccordions.has(idx);
                                        return (
                                            <div key={idx} className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs transition-all duration-300">
                                                <button
                                                    onClick={() => toggleAccordion(idx)}
                                                    className="w-full bg-slate-50/50 hover:bg-slate-50 px-5 py-3.5 flex justify-between items-center font-extrabold text-xs sm:text-sm text-slate-700 uppercase tracking-wide"
                                                >
                                                    <span>{cleanFriendlyTitle(hl.title)}</span>
                                                    <ChevronDown size={16} className={`text-slate-400 transform transition-transform duration-300 ${isAccordionOpen ? 'rotate-180' : ''}`} />
                                                </button>
                                                {isAccordionOpen && (
                                                    <div className="p-4 sm:p-5 bg-white border-t border-slate-100 flex flex-wrap gap-2 animate-scaleUp">
                                                        {hl.items?.map((item, itemIdx) => (
                                                            <span key={itemIdx} className="text-xs bg-slate-50 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-xl font-bold">
                                                                {item}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Product Benefits */}
                        {product.sections && product.sections.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="font-serif text-2xl font-bold text-slate-900 flex items-center gap-2.5 tracking-tight pl-1">
                                    <Sparkles className="h-5 w-5 text-cyan-500 stroke-[2.5]" /> Why You'll Love It
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {product.sections.map((section, idx) => {
                                        const Icon = benefitIcons[idx % benefitIcons.length];
                                        return (
                                            <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-md">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-100 shadow-xs"><Icon className="h-4 w-4 stroke-[2.5]" /></div>
                                                    <h4 className="font-serif font-bold text-slate-900 text-lg tracking-tight">{section.title}</h4>
                                                </div>
                                                <ul className="space-y-3">
                                                    {section.points.map((pt, pIdx) => (
                                                        <li key={pIdx} className="text-sm text-slate-600 leading-relaxed flex items-start gap-2.5 font-medium">
                                                            <span className="text-cyan-500 font-black text-base mt-0.5">•</span>
                                                            <span>{pt}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT AREA: Usage & Safety Sidebar */}
                    <div className="space-y-6 lg:sticky lg:top-24">
                        
                        {/* Suggested Daily Usage */}
                        {product.suggestedUsage && (
                            <div className="bg-gradient-to-br from-amber-50 to-orange-100/30 rounded-3xl p-6 border border-amber-200/60 shadow-xs">
                                <div className="flex items-center gap-2 mb-3">
                                    <Clock className="h-5 w-5 text-amber-800 stroke-[2.5]" />
                                    <h3 className="font-serif text-base font-bold text-amber-900 tracking-tight">How to Use It</h3>
                                </div>
                                <div className="bg-white rounded-2xl p-4 border border-amber-200/30 text-sm sm:text-base text-slate-700 leading-relaxed font-bold shadow-xs">
                                    {product.suggestedUsage}
                                </div>
                            </div>
                        )}

                        {/* Safety Notes */}
                        {cautionHighlights && cautionHighlights.length > 0 ? (
                            cautionHighlights.map((cautionBlock, cIdx) => (
                                <div key={cIdx} className="bg-rose-50 border border-rose-200/80 p-5 rounded-3xl space-y-3 shadow-xs animate-scaleUp">
                                    <div className="flex items-center gap-2 text-rose-900 font-bold text-sm tracking-wide uppercase font-serif">
                                        <AlertTriangle size={18} className="text-rose-600 shrink-0" />
                                        <span>{cleanFriendlyTitle(cautionBlock.title)}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {cautionBlock.items?.map((item, iIdx) => (
                                            <div key={iIdx} className="text-xs bg-white text-rose-900 border border-rose-100 p-3 rounded-xl font-semibold leading-relaxed w-full shadow-xs">
                                                • {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-emerald-50 border border-emerald-200/80 p-5 rounded-3xl space-y-3 shadow-xs animate-scaleUp">
                                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm tracking-wide uppercase font-serif">
                                    <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
                                    <span>Safety Notes</span>
                                </div>
                                <div className="text-sm text-emerald-900 leading-relaxed font-semibold">
                                    This product is generally considered safe for most adults when used as directed. Please read the label and consult your healthcare provider if you have any concerns or pre-existing conditions.
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Fullscreen Image View */}
            {isImageOpen && (
                <div
                    className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 transition-all"
                    onClick={() => setIsImageOpen(false)}
                >
                    <button
                        onClick={() => setIsImageOpen(false)}
                        className="absolute top-5 right-5 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    <div className="bg-white p-4 rounded-3xl max-w-2xl max-h-[80vh] flex items-center justify-center overflow-hidden border shadow-2xl">
                        <img src={selectedImage} alt={product.name} onClick={(e) => e.stopPropagation()} className="max-h-[70vh] max-w-full object-contain" />
                    </div>
                </div>
            )}

            {/* Mobile Bottom Buying Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 shadow-2xl lg:hidden z-50">
                <div className="max-w-md mx-auto flex items-center justify-between gap-4">
                    <div>
                        <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Total Price</div>
                        <div className="text-2xl font-black text-slate-900 tracking-tight mt-1">₹{product.discountPrice || product.price}</div>
                    </div>
                    <button onClick={handleAdd} className="flex-1 py-3.5 bg-slate-950 hover:bg-slate-800 text-white rounded-xl font-extrabold text-xs uppercase tracking-widest shadow-lg">
                        {isAdded ? "Added" : "Buy Now"}
                    </button>
                </div>
            </div>

        </div>
    );
}