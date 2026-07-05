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
    BookOpen,
    Info,
    X,
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

    useEffect(() => {
        window.scrollTo(0, 0);
        setLoading(true);

        // Fetch live production values (such as prices, naming updates, and catalog parameters)
        fetch(`${API_URL}/api/products`)
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(data => {
                const foundBackendProduct = data.find(p => p.slug === id || p._id === id);

                if (foundBackendProduct) {
                    // Execute the hybrid data merger mapping block
                    const combinedData = getCombinedProductData(foundBackendProduct);
                    setProduct(combinedData);
                    if (combinedData.imageGallery?.length > 0) {
                        setSelectedImage(combinedData.imageGallery[0]);
                    }
                } else {
                    toast.error('Product could not be localized.');
                }
            })
            .catch(() => toast.error('Pricing synchronization offline.'))
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
            setSelectedImage(product.imageGallery[0]);
            setTimeout(() => setIsAdded(false), 2000);
        } catch (err) {
            toast.error('Failed to update cart.');
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

    const discount = product.discountPrice && product.discountPrice < product.price
        ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
        : null;

    const ingredientsContent = product.highlights?.[0]?.items?.join(' · ') || 'Premium natural nutrients sourced sustainably.';

    const benefitIcons = [Sparkles, Zap, ShieldCheck, Leaf];

    return (
        <div className="bg-gradient-to-b from-slate-50/60 via-white to-slate-100/40 min-h-screen pb-28 selection:bg-cyan-100 font-sans tracking-normal antialiased">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
                {/* Back to Collection Button with explicit route and hash guards */}
                <button
                    onClick={() => {
                        const token = localStorage.getItem("token");
                        const storedUser = localStorage.getItem("user");

                        const isLoggedIn =
                            token && token !== "undefined" && token !== "null" && token !== "" &&
                            storedUser && storedUser !== "undefined" && storedUser !== "null";

                        if (isLoggedIn) {
                            navigate({ pathname: "/dashboard", hash: "#products" });
                        } else {
                            navigate({ pathname: "/", hash: "#products" });
                        }
                    }}
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-cyan-600 font-semibold mb-8 transition-colors group text-sm tracking-wide"
                >
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Collection
                </button>

                {/* Master Showcase Grid Layout Block */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100/90 shadow-xl shadow-slate-200/40 overflow-hidden mb-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">

                        {/* Interactive Gallery Panel */}
                        <div className="lg:col-span-7 bg-gradient-to-br from-slate-50/50 via-white to-cyan-50/10 p-4 sm:p-10 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-100">
                            {/* Fixed-ratio stage: taller on mobile so the product shows bigger, back to the original ratios from sm up */}
                            <div className="relative bg-white border border-slate-100 rounded-3xl shadow-sm group overflow-hidden aspect-[3/4] sm:aspect-square lg:aspect-[4/5]">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(8,145,178,0.06),transparent_65%)]" />
                                
                                {/* Badge Grid: only the discount badge shows on mobile; the secondary badge is desktop-only */}
                                <div className="absolute top-0 inset-x-0 p-3 sm:p-6 flex flex-wrap justify-between items-start gap-2 sm:gap-4 z-20 pointer-events-none">
                                    {discount ? (
                                        <span className="bg-rose-500 text-white text-[10px] sm:text-xs font-black tracking-widest uppercase px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl shadow-lg shadow-rose-500/30 shrink-0 whitespace-nowrap">
                                            Save {discount}% Now
                                        </span>
                                    ) : <div />}
                                    {product.badge && (
                                        <span className="hidden sm:inline-flex bg-slate-900 text-white text-[11px] font-black tracking-widest uppercase px-4 py-2 rounded-xl shadow-sm whitespace-nowrap shrink-0">
                                            {product.badge}
                                        </span>
                                    )}
                                </div>

                                <div className="absolute inset-0 flex items-center justify-center p-8 pt-16 sm:p-14">
                                    <img
                                        src={selectedImage}
                                        alt={product.name}
                                        onClick={() => setIsImageOpen(true)}
                                        className="max-h-full max-w-full w-auto h-auto object-contain transition-all duration-500 ease-out transform group-hover:scale-[1.06] drop-shadow-[0_18px_30px_rgba(15,23,42,0.12)] cursor-zoom-in"
                                    />
                                </div>
                                
                                <button
                                    onClick={() => setIsWishlisted(!isWishlisted)}
                                    aria-label="Toggle wishlist"
                                    className="absolute bottom-6 right-6 bg-white shadow-lg border border-slate-100 p-3.5 rounded-full hover:scale-110 active:scale-95 transition-transform z-20"
                                >
                                    <Heart className={`h-5 w-5 transition-colors ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                                </button>
                            </div>

                            {/* Multi-Image Gallery Thumbnail Switcher */}
                            {product.imageGallery?.length > 1 && (
                                <div className="flex items-center justify-center gap-4 mt-8 overflow-x-auto py-2">
                                    {product.imageGallery.map((imgUrl, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImage(imgUrl)}
                                            className={`w-20 h-20 rounded-2xl p-1.5 bg-white border-2 transition-all shadow-md transform hover:scale-105 ${selectedImage === imgUrl ? 'border-cyan-500 ring-4 ring-cyan-50' : 'border-slate-100 hover:border-slate-300'}`}
                                        >
                                            <img src={imgUrl} alt="Gallery Angle" className="w-full h-full object-contain rounded-xl" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* High-Impact Copywriting & Conversion Pricing Panel */}
                        <div className="lg:col-span-5 p-6 sm:p-10 lg:p-14 flex flex-col justify-between bg-white">
                            <div>
                                <span className="text-xs font-extrabold tracking-[0.25em] text-cyan-600 uppercase bg-cyan-50 px-4 py-2 rounded-xl border border-cyan-100 w-max block mb-6">
                                    {product.category}
                                </span>

                                <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-5">
                                    {product.name}
                                </h1>

                                <div className="flex items-center gap-3 mb-8">
                                    <div className="flex text-amber-400 gap-0.5">
                                        <Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" />
                                    </div>
                                    <span className="text-sm font-bold text-slate-800 tracking-wide">5.0 <span className="text-slate-400 font-semibold">(Customer Reviews)</span></span>
                                </div>

                                {/* Premium Campaign Pricing Box */}
                                <div className="bg-gradient-to-br from-slate-950 to-slate-900 text-white rounded-[2rem] p-6 sm:p-8 border border-slate-950 shadow-xl mb-8 relative overflow-hidden">
                                    <div className="absolute -right-6 -bottom-6 p-4 opacity-10"><Sparkles className="h-32 w-32 text-cyan-400" /></div>
                                    <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full bg-cyan-500/10 blur-2xl" />
                                    <div className="relative">
                                        <div className="text-xs font-extrabold tracking-[0.3em] text-cyan-400 uppercase mb-2">Special Offer Price</div>
                                        <div className="flex items-baseline gap-4">
                                            <span className="text-5xl sm:text-6xl font-extrabold text-white tracking-tight">₹{product.discountPrice || product.price}</span>
                                            {product.discountPrice && <span className="text-lg font-bold text-slate-400 line-through">₹{product.price}</span>}
                                        </div>
                                    </div>
                                </div>

                                <p className="text-slate-700 text-base sm:text-lg leading-relaxed mb-8 border-l-4 border-cyan-500/30 bg-slate-50/50 p-4 rounded-r-xl font-medium">
                                    {product.summary}
                                </p>
                            </div>

                            {/* Direct Marketing Actions Grid */}
                            <div className="space-y-5 mt-auto">
                                <button
                                    onClick={handleAdd}
                                    className={`w-full py-5 rounded-2xl font-extrabold text-sm tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] ${isAdded ? 'bg-emerald-600 text-white shadow-emerald-100' : 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5'}`}
                                >
                                    {isAdded ? <><Check className="h-5 w-5 stroke-[3.5]" /> Added to Cart</> : <><ShoppingCart className="h-5 w-5 stroke-[2.5]" /> Add to Cart</>}
                                </button>

                                <div className="grid grid-cols-2 gap-3 text-xs font-extrabold text-slate-600 uppercase tracking-wider">
                                    <div className="flex items-center gap-2.5 p-4 bg-slate-50 rounded-2xl border border-slate-100"><Truck className="h-5 w-5 text-cyan-600 shrink-0" /> Fast Delivery</div>
                                    <div className="flex items-center gap-2.5 p-4 bg-slate-50 rounded-2xl border border-slate-100"><RefreshCw className="h-5 w-5 text-cyan-600 shrink-0" /> Easy Returns</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Extended Information Matrix Architecture */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start mt-16">

                    {/* Primary Content and Framework Grids */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* Ingredients Only Block — serif heading, larger body copy */}
                        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
                            <div className="flex items-center gap-3 py-5 px-7 bg-slate-50/50 border-b border-slate-100">
                                <Droplets className="h-5 w-5 text-cyan-600 shrink-0" />
                                <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                                    Ingredients & Nutrition
                                </h3>
                            </div>
                            <div className="p-8 text-slate-700 text-lg sm:text-xl leading-relaxed font-medium">
                                <p className="whitespace-pre-line">{ingredientsContent}</p>
                            </div>
                        </div>

                        {/* Comprehensive Therapeutic Action Framework — serif heading, bigger card copy */}
                        {product.sections && product.sections.length > 0 && (
                            <div className="space-y-6">
                                <h3 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 flex items-center gap-3 tracking-tight">
                                    <Sparkles className="h-7 w-7 text-cyan-500 stroke-[2.5]" /> Key Product Benefits
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {product.sections.map((section, idx) => {
                                        const Icon = benefitIcons[idx % benefitIcons.length];
                                        return (
                                            <div key={idx} className="bg-white rounded-[1.75rem] p-6 sm:p-8 border border-slate-100/90 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                                <div className="flex items-center gap-3 mb-5">
                                                    <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-100 shadow-sm"><Icon className="h-5 w-5 stroke-[2.5]" /></div>
                                                    <h4 className="font-serif font-bold text-slate-900 text-xl tracking-tight">{section.title}</h4>
                                                </div>
                                                <ul className="space-y-4">
                                                    {section.points.map((pt, pIdx) => (
                                                        <li key={pIdx} className="text-base text-slate-600 leading-relaxed flex items-start gap-3 font-medium">
                                                            <span className="text-cyan-500 font-black text-lg mt-0.5">•</span>
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

                    {/* Secondary Information Sidebar Panel — serif headings, larger body copy */}
                    <div className="space-y-8 lg:sticky lg:top-24">

                        {/* Clinical Administration Box */}
                        <div className="bg-gradient-to-br from-amber-50 to-orange-100/40 rounded-[2rem] p-6 sm:p-8 border border-amber-200/70 shadow-sm relative overflow-hidden">
                            <div className="flex items-center gap-2.5 mb-4">
                                <Clock className="h-5 w-5 text-amber-800 stroke-[2.5]" />
                                <h3 className="font-serif text-lg sm:text-xl font-bold text-amber-900 tracking-tight">Suggested Dosage</h3>
                            </div>
                            <div className="bg-white rounded-2xl p-5 border border-amber-200/40 shadow-inner">
                                <p className="text-lg font-bold text-slate-800 leading-relaxed">
                                    {product.suggestedUsage}
                                </p>
                            </div>
                        </div>

                        {/* Nutrient Tag Highlights Matrix */}
                        {product.highlights && product.highlights.map((hl, idx) => (
                            <div key={idx} className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/10">
                                <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-800 tracking-tight mb-5 flex items-center gap-2.5">
                                    <Info className="h-5 w-5 text-slate-300 stroke-[2.5]" /> {hl.title}
                                </h3>
                                <div className="flex flex-wrap gap-2.5">
                                    {hl.items.map((item, iIdx) => (
                                        <span key={iIdx} className="bg-slate-50 text-slate-800 text-sm font-bold px-4 py-2.5 rounded-xl border border-slate-100 shadow-sm">
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Fullscreen Image Lightbox */}
            {isImageOpen && (
                <div
                    className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-6"
                    onClick={() => setIsImageOpen(false)}
                >
                    <button
                        onClick={() => setIsImageOpen(false)}
                        aria-label="Close image"
                        className="absolute top-5 right-5 bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    <img
                        src={selectedImage}
                        alt={product.name}
                        onClick={(e) => e.stopPropagation()}
                        className="max-h-full max-w-full object-contain rounded-2xl"
                    />
                </div>
            )}

            {/* Sticky Mobile Buy Drawer Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 p-4 shadow-2xl lg:hidden z-50">
                <div className="max-w-md mx-auto flex items-center justify-between gap-6">
                    <div>
                        <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Total Price</div>
                        <div className="text-3xl font-extrabold text-slate-900 tracking-tight">₹{product.discountPrice || product.price}</div>
                    </div>
                    <div className="flex-1">
                        <button onClick={handleAdd} className="w-full py-4 bg-slate-950 hover:bg-slate-800 text-white rounded-xl font-extrabold text-sm uppercase tracking-widest shadow-lg active:scale-[0.98] transition-transform">
                            {isAdded ? "Added" : "Buy Now"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}