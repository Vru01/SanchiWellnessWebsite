import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ShoppingCart,
    Check,
    AlertCircle,
    Loader2,
    Star,
    Leaf,
    ArrowLeft,
    ShieldCheck,
    HelpCircle,
    Heart,
    Truck,
    RefreshCw,
    Clock,
    Droplets,
    Zap,
    Sparkles,
    Award,
    BookOpen,
    Info,
    Layers,
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { getExtendedDetails } from '@/data/extendedProductDetails';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ProductDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdded, setIsAdded] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [activeTab, setActiveTab] = useState('description');

    useEffect(() => {
        fetch(`${API_URL}/api/products`)
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(data => {
                // UPGRADED: Smart fallback that matches by slug OR by backend ID string
                const foundProduct = data.find(p => p.slug === id || p._id === id);

                if (foundProduct) {
                    setProduct(foundProduct);
                } else {
                    throw new Error('Product not found in system array.');
                }
            })
            .catch(() => setError('Could not load product data.'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleAdd = async () => {
        const stored = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (!stored || !token) {
            navigate('/login');
            return;
        }
        const user = JSON.parse(stored);

        try {
            await fetch(`${API_URL}/api/cart/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ userId: user.id, productId: product._id, quantity: 1 }),
            });
            window.dispatchEvent(new Event('cartUpdated'));
            setIsAdded(true);
            toast.success(`${product.name} added to cart!`);
            setTimeout(() => setIsAdded(false), 2000);
        } catch (err) {
            toast.error('Failed to update cart.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50/60 py-16">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="bg-white rounded-3xl p-10 min-h-[480px] animate-pulse">
                            <div className="w-full h-full bg-slate-200 rounded-2xl" />
                        </div>
                        <div className="space-y-6">
                            <div className="h-4 w-24 bg-slate-200 rounded-full" />
                            <div className="h-12 w-3/4 bg-slate-200 rounded-xl" />
                            <div className="h-6 w-1/2 bg-slate-200 rounded-full" />
                            <div className="space-y-3">
                                <div className="h-4 w-full bg-slate-200 rounded" />
                                <div className="h-4 w-5/6 bg-slate-200 rounded" />
                                <div className="h-4 w-2/3 bg-slate-200 rounded" />
                            </div>
                            <div className="h-16 w-full bg-slate-200 rounded-2xl" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50/50 p-6">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-rose-100 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="h-8 w-8 text-rose-500" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-slate-900 mb-2">
                        Product Unavailable
                    </h3>
                    <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                        We couldn't retrieve this product. It may have been removed or updated.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-3.5 bg-slate-900 text-white rounded-2xl text-sm font-semibold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 group"
                    >
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Return to Shop
                    </button>
                </div>
            </div>
        );
    }

    const extraInfo = getExtendedDetails(product);
    const imageUrl = product.images?.[0]?.url || product.img;
    const discount =
        product.discountPrice && Number(product.discountPrice) < Number(product.price)
            ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
            : null;

    const tabs = [
        { id: 'description', label: 'Description', icon: BookOpen, content: product.description },
        { id: 'ingredients', label: 'Ingredients', icon: Droplets, content: extraInfo.ingredients || 'Premium natural ingredients sourced sustainably.' },
        { id: 'usage', label: 'How to Use', icon: Clock, content: extraInfo.suggestedUsage },
    ];

    // Map icons for benefits
    const benefitIcons = [Sparkles, Zap, ShieldCheck, Leaf];

    return (
        <div className="bg-gradient-to-b from-slate-50/80 to-white min-h-screen py-8 md:py-16 selection:bg-cyan-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-cyan-600 font-medium mb-8 transition-colors group text-sm"
                >
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Collection
                </button>

                {/* Main Product Card */}
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100/80 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                        {/* Image Section */}
                        <div className="relative bg-gradient-to-br from-cyan-50/40 via-transparent to-emerald-50/30 p-8 flex items-center justify-center min-h-[400px] lg:min-h-[500px]">
                            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
                            <img
                                src={imageUrl}
                                alt={product.name}
                                className="w-full max-h-96 object-contain mix-blend-multiply drop-shadow-2xl z-10"
                            />
                            {/* Badges */}
                            {discount && (
                                <div className="absolute top-6 left-6 bg-rose-500 text-white text-xs font-bold tracking-wider px-4 py-2 rounded-full shadow-lg shadow-rose-500/30 z-20">
                                    {discount}% OFF
                                </div>
                            )}
                            {(product.tag || extraInfo.badge) && (
                                <div className="absolute top-6 right-6 bg-slate-900 text-white text-xs font-semibold tracking-wide px-4 py-2 rounded-full shadow-md z-20">
                                    {product.tag || extraInfo.badge}
                                </div>
                            )}
                            <button
                                onClick={() => setIsWishlisted(!isWishlisted)}
                                className="absolute bottom-6 left-6 bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg border border-slate-200 z-20 hover:scale-110 transition-transform"
                            >
                                <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-600'}`} />
                            </button>
                        </div>

                        {/* Details Section */}
                        <div className="p-8 md:p-10 lg:p-12 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-3 flex-wrap mb-3">
                                    <span className="text-cyan-600 text-xs font-bold tracking-widest uppercase bg-cyan-50 px-3 py-1 rounded-full">
                                        {product.category}
                                    </span>
                                    <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                                        In Stock
                                    </span>
                                </div>

                                <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.1] mb-4">
                                    {product.name}
                                </h1>

                                <div className="flex items-center gap-4 mb-5">
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star key={s} className="h-5 w-5 fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>
                                    <span className="text-sm font-bold text-slate-700">5.0</span>
                                    <span className="text-sm text-slate-400">|</span>
                                    <span className="text-sm font-medium text-cyan-600">100% Certified</span>
                                </div>

                                <p className="text-slate-600 text-base leading-relaxed mb-6">
                                    {product.description}
                                </p>

                                <div className="flex items-end gap-4 mb-6">
                                    <span className="font-serif text-4xl font-black text-slate-900">
                                        ₹{product.discountPrice || product.price}
                                    </span>
                                    {product.discountPrice && (
                                        <span className="text-base text-slate-400 line-through font-medium mb-1">
                                            ₹{product.price}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Add to Cart - No quantity selector */}
                            <button
                                onClick={handleAdd}
                                className={`w-full flex items-center justify-center gap-3 py-4 px-8 rounded-2xl font-bold text-sm tracking-widest uppercase transition-all duration-300 transform active:scale-[0.98] shadow-lg ${isAdded
                                    ? 'bg-emerald-600 text-white shadow-emerald-200'
                                    : 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40'
                                    }`}
                            >
                                {isAdded ? (
                                    <>
                                        <Check className="h-5 w-5 stroke-[3]" />
                                        <span>Added to Cart!</span>
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart className="h-5 w-5" />
                                        <span>Add to Cart</span>
                                    </>
                                )}
                            </button>

                            {/* Trust badges */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                                {[
                                    { icon: Leaf, label: '100% Natural' },
                                    { icon: ShieldCheck, label: 'Lab Tested' },
                                    { icon: Truck, label: 'Free Shipping' },
                                    { icon: RefreshCw, label: 'Easy Returns' },
                                ].map((badge, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-semibold text-slate-700"
                                    >
                                        <badge.icon className="h-4 w-4 text-cyan-600 flex-shrink-0" />
                                        <span>{badge.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Extended Information */}
                <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main content: Tabs + Benefits */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Tabs */}
                        {/* Upgraded Responsive Tabs Block */}
                        {/* Upgraded Responsive Tabs Block - Premium Cyan Accent with Dark Base */}
<div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.01)] overflow-hidden">
    
    {/* Header Navigation Tab Switcher Row */}
    <div className="flex border-b border-slate-100 bg-slate-50/20 overflow-x-auto scrollbar-none">
        <div className="flex w-full min-w-[320px] sm:min-w-0">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-3.5 sm:py-4 text-xs sm:text-sm font-bold transition-all whitespace-nowrap relative ${
                        activeTab === tab.id
                            ? 'text-cyan-600 bg-white border-b-2 border-cyan-500 font-black'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
                    }`}
                >
                    <tab.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 transition-colors ${
                        activeTab === tab.id ? 'text-cyan-500' : 'text-slate-400'
                    }`} />
                    <span>{tab.label}</span>
                </button>
            ))}
        </div>
    </div>

    {/* Content Area Panel */}
    <div className="p-5 sm:p-6 text-slate-600 leading-relaxed font-medium text-xs sm:text-sm transition-opacity duration-200">
        <p className="whitespace-pre-line">
            {tabs.find((t) => t.id === activeTab)?.content}
        </p>
    </div>
</div>

                        {/* Benefits / Key Features */}
                        {extraInfo.sections && extraInfo.sections.length > 0 && (
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                <h3 className="font-serif text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <Sparkles className="h-6 w-6 text-cyan-500" />
                                    Why Choose This
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {extraInfo.sections.map((section, idx) => {
                                        const Icon = benefitIcons[idx % benefitIcons.length];
                                        return (
                                            <div
                                                key={idx}
                                                className="bg-slate-50 rounded-xl p-5 border border-slate-100 hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center">
                                                        <Icon className="h-4 w-4" />
                                                    </div>
                                                    <h4 className="font-bold text-slate-800">{section.title}</h4>
                                                </div>
                                                <ul className="space-y-1.5">
                                                    {section.points.map((pt, pIdx) => (
                                                        <li key={pIdx} className="text-sm text-slate-600 flex items-start gap-2">
                                                            <span className="text-cyan-500 font-bold">•</span>
                                                            {pt}
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

                    {/* Sidebar: Highlights & Usage */}
                    <div className="space-y-6 lg:sticky lg:top-8">
                        {/* Suggested Usage */}
                        <div className="bg-gradient-to-br from-amber-50 to-orange-100 p-6 rounded-2xl border border-amber-200 shadow-sm relative overflow-hidden">
                            <div className="absolute right-0 bottom-0 w-24 h-24 bg-amber-200/40 rounded-full blur-xl pointer-events-none" />

                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 bg-amber-50 rounded-lg border border-amber-200">
                                    <Clock className="h-4 w-4 text-amber-800" />
                                </div>
                                <span className="text-[10px] font-black tracking-widest text-amber-800 uppercase block">
                                    Intake Guide
                                </span>
                            </div>

                            {/* Fixed typo 'open-serif' to 'font-serif' and explicitly locked color */}
                            <h3 className="font-serif text-xl font-black text-slate-900 mb-3 tracking-tight">
                                Suggested Usage
                            </h3>

                            {/* Locked the background to a solid bg-white and explicitly set high-contrast text to override system schemes */}
                            <div className="bg-white rounded-xl p-4 border border-amber-200/60 shadow-inner">
                                <p className="text-sm font-bold text-slate-800 leading-relaxed">
                                    {extraInfo.suggestedUsage}
                                </p>
                            </div>
                        </div>

                        {/* Highlights */}
                        {extraInfo.highlights &&
                            extraInfo.highlights.map((hl, idx) => (
                                <div
                                    key={idx}
                                    className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
                                >
                                    <h3 className="font-serif text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                                        <HelpCircle className="h-5 w-5 text-cyan-500" />
                                        {hl.title}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {hl.items.map((item, iIdx) => (
                                            <span
                                                key={iIdx}
                                                className="bg-slate-50 text-slate-700 text-xs font-bold px-3.5 py-1.5 rounded-full border border-slate-200"
                                            >
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

                {/* Sticky Mobile Bar - No quantity */}
                <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 p-4 shadow-2xl md:hidden z-50">
                    <div className="flex items-center gap-3 max-w-md mx-auto">
                        <button
                            onClick={handleAdd}
                            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg"
                        >
                            {isAdded ? (
                                <>
                                    <Check className="h-5 w-5" /> Added
                                </>
                            ) : (
                                <>
                                    <ShoppingCart className="h-5 w-5" /> Add to Cart
                                </>
                            )}
                        </button>
                    </div>
                </div>
                <div className="h-24 md:h-0" />
            </div>
        </div>
    );
}