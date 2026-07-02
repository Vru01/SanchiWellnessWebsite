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
    const [activeTab, setActiveTab] = useState('description');
    const [selectedImage, setSelectedImage] = useState('');

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

    const tabs = [
        { id: 'description', label: 'Product Overview', icon: BookOpen, content: product.summary },
        { id: 'ingredients', label: 'Ingredients & Nutrition', icon: Droplets, content: product.highlights?.[0]?.items?.join(' · ') || 'Premium natural nutrients sourced sustainably.' },
        { id: 'usage', label: 'How to Use', icon: Clock, content: product.suggestedUsage },
    ];

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
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-cyan-600 font-medium mb-8 transition-colors group text-sm"
                >
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Collection
                </button>

                {/* Master Showcase Grid Layout Block */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100/90 shadow-xl shadow-slate-200/40 overflow-hidden mb-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">

                        {/* Interactive Gallery Panel */}
                        <div className="lg:col-span-7 bg-gradient-to-br from-slate-50/50 via-white to-cyan-50/10 p-6 sm:p-10 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-100">
                            {/* Fixed-ratio stage keeps the image proportioned regardless of source dimensions */}
                            <div className="relative bg-white border border-slate-100 rounded-3xl shadow-sm group overflow-hidden aspect-[4/5] sm:aspect-square lg:aspect-[4/5]">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(8,145,178,0.06),transparent_65%)]" />
                                
                                {/* Refined Badge Grid: Columns stack up cleanly on mobile to prevent overlapping or hiding flags */}
                                <div className="absolute top-0 inset-x-0 p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 z-20 pointer-events-none">
                                    {discount ? (
                                        <span className="bg-rose-500 text-white text-xs font-black tracking-widest uppercase px-4 py-2 rounded-xl shadow-lg shadow-rose-500/30 shrink-0 whitespace-nowrap">
                                            Save {discount}% Now
                                        </span>
                                    ) : <div />}
                                    {product.badge && (
                                        <span className="bg-slate-900 text-white text-[11px] font-black tracking-widest uppercase px-4 py-2 rounded-xl shadow-sm whitespace-nowrap shrink-0">
                                            {product.badge}
                                        </span>
                                    )}
                                </div>

                                <div className="absolute inset-0 flex items-center justify-center p-10 sm:p-14">
                                    <img
                                        src={selectedImage}
                                        alt={product.name}
                                        className="max-h-full max-w-full w-auto h-auto object-contain transition-all duration-500 ease-out transform group-hover:scale-[1.06] drop-shadow-[0_18px_30px_rgba(15,23,42,0.12)]"
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
                                <span className="text-[11px] font-black tracking-[0.2em] text-cyan-600 uppercase bg-cyan-50 px-4 py-2 rounded-xl border border-cyan-100 w-max block mb-6">
                                    {product.category}
                                </span>

                                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.2] mb-4">
                                    {product.name}
                                </h1>

                                <div className="flex items-center gap-3 mb-8">
                                    <div className="flex text-amber-400 gap-0.5">
                                        <Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" /><Star className="h-5 w-5 fill-current" />
                                    </div>
                                    <span className="text-xs font-black text-slate-800 tracking-wide">5.0 (Customer Reviews)</span>
                                </div>

                                {/* Premium Campaign Pricing Box */}
                                <div className="bg-gradient-to-br from-slate-950 to-slate-900 text-white rounded-[2rem] p-6 sm:p-8 border border-slate-950 shadow-xl mb-8 relative overflow-hidden">
                                    <div className="absolute -right-6 -bottom-6 p-4 opacity-10"><Sparkles className="h-32 w-32 text-cyan-400" /></div>
                                    <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full bg-cyan-500/10 blur-2xl" />
                                    <div className="relative">
                                        <div className="text-[10px] font-black tracking-[0.25em] text-cyan-400 uppercase mb-2">Special Offer Price</div>
                                        <div className="flex items-baseline gap-4">
                                            <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">₹{product.discountPrice || product.price}</span>
                                            {product.discountPrice && <span className="text-base font-bold text-slate-400 line-through">₹{product.price}</span>}
                                        </div>
                                    </div>
                                </div>

                                <p className="text-slate-700 text-[15px] sm:text-base leading-relaxed mb-8 border-l-4 border-cyan-500/30 bg-slate-50/50 p-4 rounded-r-xl font-medium">
                                    {product.summary}
                                </p>
                            </div>

                            {/* Direct Marketing Actions Grid */}
                            <div className="space-y-5 mt-auto">
                                <button
                                    onClick={handleAdd}
                                    className={`w-full py-5 rounded-2xl font-black text-xs tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] ${isAdded ? 'bg-emerald-600 text-white shadow-emerald-100' : 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5'}`}
                                >
                                    {isAdded ? <><Check className="h-5 w-5 stroke-[3.5]" /> Added to Cart</> : <><ShoppingCart className="h-5 w-5 stroke-[2.5]" /> Add to Cart</>}
                                </button>

                                <div className="grid grid-cols-2 gap-3 text-xs font-black text-slate-600 uppercase tracking-wider">
                                    <div className="flex items-center gap-2.5 p-4 bg-slate-50 rounded-2xl border border-slate-100"><Truck className="h-5 w-5 text-cyan-600 shrink-0" /> Fast Delivery</div>
                                    <div className="flex items-center gap-2.5 p-4 bg-slate-50 rounded-2xl border border-slate-100"><RefreshCw className="h-5 w-5 text-cyan-600 shrink-0" /> Easy Returns</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Extended Information Matrix Architecture */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start mt-16">

                    {/* Primary Tabbed Content and Framework Grids */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* Tab Content Block */}
                        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
                            <div className="flex border-b border-slate-100 bg-slate-50/50 p-1.5 overflow-x-auto scrollbar-none">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex-1 flex items-center justify-center gap-2.5 py-4 px-4 rounded-xl text-xs font-black transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-cyan-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-700'}`}
                                    >
                                        <tab.icon className="h-4 w-4 shrink-0" />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                            <div className="p-8 text-slate-700 text-[15px] sm:text-base leading-relaxed font-medium">
                                <p className="whitespace-pre-line">{tabs.find((t) => t.id === activeTab)?.content}</p>
                            </div>
                        </div>

                        {/* Comprehensive Therapeutic Action Framework */}
                        {product.sections && product.sections.length > 0 && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
                                    <Sparkles className="h-6 w-6 text-cyan-500 stroke-[2.5]" /> Key Product Benefits
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {product.sections.map((section, idx) => {
                                        const Icon = benefitIcons[idx % benefitIcons.length];
                                        return (
                                            <div key={idx} className="bg-white rounded-[1.75rem] p-6 sm:p-8 border border-slate-100/90 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-100 shadow-sm"><Icon className="h-4 w-4 stroke-[2.5]" /></div>
                                                    <h4 className="font-black text-slate-800 text-base tracking-tight">{section.title}</h4>
                                                </div>
                                                <ul className="space-y-4">
                                                    {section.points.map((pt, pIdx) => (
                                                        <li key={pIdx} className="text-[13px] sm:text-sm text-slate-600 leading-relaxed flex items-start gap-3 font-medium">
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

                    {/* Secondary Information Sidebar Panel */}
                    <div className="space-y-8 lg:sticky lg:top-24">

                        {/* Clinical Administration Box */}
                        <div className="bg-gradient-to-br from-amber-50 to-orange-100/40 rounded-[2rem] p-6 sm:p-8 border border-amber-200/70 shadow-sm relative overflow-hidden">
                            <div className="flex items-center gap-2.5 text-xs font-black tracking-widest text-amber-900 uppercase mb-4">
                                <Clock className="h-4 w-4 text-amber-800 stroke-[2.5]" /> Suggested Dosage
                            </div>
                            <div className="bg-white rounded-2xl p-5 border border-amber-200/40 shadow-inner">
                                <p className="text-sm font-bold text-slate-800 leading-relaxed">
                                    {product.suggestedUsage}
                                </p>
                            </div>
                        </div>

                        {/* Nutrient Tag Highlights Matrix */}
                        {product.highlights && product.highlights.map((hl, idx) => (
                            <div key={idx} className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/10">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
                                    <Info className="h-4 w-4 text-slate-300 stroke-[2.5]" /> {hl.title}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {hl.items.map((item, iIdx) => (
                                        <span key={iIdx} className="bg-slate-50 text-slate-800 text-xs font-black px-4 py-2.5 rounded-xl border border-slate-100 shadow-sm">
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sticky Mobile Buy Drawer Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 p-4 shadow-2xl lg:hidden z-50">
                <div className="max-w-md mx-auto flex items-center justify-between gap-6">
                    <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Price</div>
                        <div className="text-2xl font-black text-slate-900 tracking-tight">₹{product.discountPrice || product.price}</div>
                    </div>
                    <div className="flex-1">
                        <button onClick={handleAdd} className="w-full py-4 bg-slate-950 hover:bg-slate-800 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-[0.98] transition-transform">
                            {isAdded ? "Added" : "Buy Now"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}