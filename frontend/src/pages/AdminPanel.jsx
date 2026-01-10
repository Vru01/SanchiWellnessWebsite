import React, { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Check, X, Clock, MapPin, User, Package, 
  ShoppingBag, Trash2, Edit, Plus, Image as ImageIcon, Loader2 
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL + "/api" || "http://localhost:5000/api";

// --- CLOUDINARY CONFIG ---
const CLOUD_NAME = "dfqgwgehn"; // I found this from your previous seed data
const UPLOAD_PRESET = "sanchi_wellness_uploads"; // Your new Unsigned Preset

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('orders'); 
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // UPLOAD STATE
  const [uploading, setUploading] = useState(false);

  // PRODUCT FORM STATE
  const [isEditing, setIsEditing] = useState(false); 
  const [showProductForm, setShowProductForm] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({
    id: '', name: '', price: '', category: '', description: '', img: '', tag: ''
  });

  // --- 1. FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const resOrders = await fetch(`${API_BASE}/admin/all-orders`);
      const dataOrders = await resOrders.json();
      setOrders(dataOrders);

      const resProducts = await fetch(`${API_BASE}/products`);
      const dataProducts = await resProducts.json();
      setProducts(dataProducts);
    } catch (err) {
      console.error("Failed to load admin data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 2. ORDER ACTIONS ---
  const updateOrderStatus = async (orderId, newStatus) => {
    if (!window.confirm(`Mark order as ${newStatus}?`)) return;
    try {
      await fetch(`${API_BASE}/admin/update-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      fetchData(); 
    } catch (error) { alert("Error updating status"); }
  };

  // --- 3. IMAGE UPLOAD HANDLER ---
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET); // 'sanchi_wellness_uploads'

    try {
      // Upload directly to Cloudinary
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      
      if (data.secure_url) {
        // Automatically put the URL into the form
        setCurrentProduct(prev => ({ ...prev, img: data.secure_url }));
      } else {
        alert("Upload failed. Check Cloud Name/Preset.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Image upload failed!");
    } finally {
      setUploading(false);
    }
  };

  // --- 4. PRODUCT SUBMIT ---
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    
    // Use the /admin/ routes we created
    const endpoint = isEditing 
      ? `${API_BASE}/products/admin/update/${currentProduct.id}` 
      : `${API_BASE}/products/admin/add`;
      
    const method = isEditing ? "PUT" : "POST";

    const { id, ...payload } = currentProduct;

    try {
      const res = await fetch(endpoint, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert(isEditing ? "Product Updated!" : "Product Created!");
        setShowProductForm(false);
        fetchData(); 
      } else {
        const errorData = await res.json();
        alert("Operation failed: " + errorData.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;
    try {
      await fetch(`${API_BASE}/products/admin/delete/${id}`, { method: "DELETE" });
      fetchData();
    } catch (err) { alert("Delete failed"); }
  };

  // --- FORM HELPERS ---
  const openEditProduct = (product) => {
    setCurrentProduct({
      id: product._id,
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description,
      img: product.img,
      tag: product.tag || ''
    });
    setIsEditing(true);
    setShowProductForm(true);
  };

  const openAddProduct = () => {
    setCurrentProduct({ id: '', name: '', price: '', category: '', description: '', img: '', tag: '' });
    setIsEditing(false);
    setShowProductForm(true);
  };

  const getUserName = (u) => !u ? "Unknown" : (typeof u === 'string' ? `ID: ${u.slice(-4)}` : u.name);
  const getUserEmail = (u) => !u || typeof u === 'string' ? "" : u.email;

  if (loading) return <div className="min-h-screen flex justify-center items-center">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-28">
        
        {/* HEADER & TABS */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-3xl font-black text-gray-800">Admin Control Center</h1>
            <div className="flex bg-white p-1 rounded-lg shadow-sm border">
                <button 
                    onClick={() => setActiveTab('orders')}
                    className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'orders' ? 'bg-gray-900 text-white shadow' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    Orders
                </button>
                <button 
                    onClick={() => setActiveTab('products')}
                    className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'products' ? 'bg-gray-900 text-white shadow' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    Products
                </button>
            </div>
        </div>

        {/* ==================== TAB 1: ORDERS ==================== */}
        {activeTab === 'orders' && (
            <div className="space-y-6">
            {orders.length === 0 && <p className="text-gray-500 text-center">No orders found.</p>}
            {orders.map((order) => (
                <Card key={order._id} className={`shadow-md overflow-hidden border-l-4 ${
                    order.status === 'Paid' ? 'border-l-green-500' : 
                    order.status === 'Rejected' ? 'border-l-red-500' : 'border-l-yellow-500'
                }`}>
                <CardContent className="p-0">
                    <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-lg text-gray-700">#{order._id.slice(-6).toUpperCase()}</span>
                            <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        <Badge className={order.status === 'Paid' ? 'bg-green-600' : order.status === 'Rejected' ? 'bg-red-600' : 'bg-yellow-500'}>
                            {order.status}
                        </Badge>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Payment</h3>
                            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                <p className="text-xs text-blue-600 font-bold">UTR: {order.transactionId || "N/A"}</p>
                                <p className="mt-1 text-2xl font-black text-green-700">₹{order.totalAmount}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Customer</h3>
                            <div className="space-y-1 text-sm">
                                <p className="font-bold">{getUserName(order.userId)}</p>
                                <p className="text-gray-500">{getUserEmail(order.userId)}</p>
                                <p className="text-xs bg-gray-100 p-2 mt-2 rounded border">{order.shippingAddress}</p>
                            </div>
                        </div>
                        <div className="flex flex-col justify-between">
                            <div className="mb-4">
                                <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Items</h3>
                                <div className="text-sm space-y-1">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between border-b border-dashed border-gray-200 pb-1">
                                            <span>{item.name} <span className="text-xs text-gray-400">x{item.quantity}</span></span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {order.status === 'Pending Verification' && (
                                <div className="flex gap-2">
                                    <Button onClick={() => updateOrderStatus(order._id, 'Rejected')} variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50">Reject</Button>
                                    <Button onClick={() => updateOrderStatus(order._id, 'Paid')} className="flex-1 bg-green-600 hover:bg-green-700 text-white">Approve</Button>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
                </Card>
            ))}
            </div>
        )}

        {/* ==================== TAB 2: PRODUCTS ==================== */}
        {activeTab === 'products' && (
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-700">Inventory Management</h2>
                    <Button onClick={openAddProduct} className="bg-cyan-600 hover:bg-cyan-700 text-white gap-2">
                        <Plus className="h-4 w-4" /> Add Product
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <Card key={product._id} className="overflow-hidden group hover:shadow-lg transition-all flex flex-col h-full">
                            <div className="h-48 bg-gray-50 relative p-4 flex items-center justify-center">
                                <img src={product.img} alt={product.name} className="h-full w-full object-contain" />
                                <Badge className="absolute top-2 right-2 bg-white text-gray-800 shadow-sm border hover:bg-white">{product.category}</Badge>
                            </div>
                            <CardContent className="p-4 flex-grow flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg leading-tight">{product.name}</h3>
                                        <span className="font-bold text-green-600">₹{product.price}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">{product.description}</p>
                                </div>
                                
                                <div className="flex gap-2 mt-auto">
                                    <Button onClick={() => openEditProduct(product)} variant="outline" className="flex-1 border-gray-200 hover:bg-gray-50">
                                        <Edit className="h-4 w-4 mr-2" /> Edit
                                    </Button>
                                    <Button onClick={() => deleteProduct(product._id)} variant="outline" className="text-red-500 border-red-100 hover:bg-red-50 hover:text-red-600">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )}

        {/* ==================== PRODUCT MODAL ==================== */}
        {showProductForm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                <Card className="w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
                    <div className="p-6 border-b flex justify-between items-center">
                        <h2 className="text-xl font-bold">{isEditing ? "Edit Product" : "Add New Product"}</h2>
                        <button onClick={() => setShowProductForm(false)} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
                    </div>
                    <form onSubmit={handleProductSubmit} className="p-6 space-y-4">
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Product Name</Label>
                                <Input required value={currentProduct.name} onChange={(e) => setCurrentProduct({...currentProduct, name: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Input required placeholder="e.g. Men's Health" value={currentProduct.category} onChange={(e) => setCurrentProduct({...currentProduct, category: e.target.value})} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Price (₹)</Label>
                                <Input required type="number" value={currentProduct.price} onChange={(e) => setCurrentProduct({...currentProduct, price: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label>Tag (Optional)</Label>
                                <Input placeholder="e.g. Best Seller" value={currentProduct.tag} onChange={(e) => setCurrentProduct({...currentProduct, tag: e.target.value})} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input required value={currentProduct.description} onChange={(e) => setCurrentProduct({...currentProduct, description: e.target.value})} />
                        </div>

                        {/* --- IMAGE UPLOAD SECTION --- */}
                        <div className="space-y-2">
                            <Label>Product Image</Label>
                            <div className="flex gap-4 items-center">
                                {/* PREVIEW BOX */}
                                <div className="h-20 w-20 bg-gray-100 border rounded-md flex items-center justify-center overflow-hidden relative shrink-0">
                                    {currentProduct.img ? (
                                        <img src={currentProduct.img} alt="Preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <ImageIcon className="text-gray-300 h-8 w-8" />
                                    )}
                                    {uploading && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <Loader2 className="h-6 w-6 text-white animate-spin" />
                                        </div>
                                    )}
                                </div>

                                {/* INPUTS */}
                                <div className="flex-1 space-y-2">
                                    <div className="relative">
                                        <Input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={uploading}
                                            className="cursor-pointer file:bg-gray-100 file:text-gray-700 file:border-0 file:rounded-md file:px-2 file:py-1 file:mr-2 file:text-sm file:font-bold hover:file:bg-gray-200"
                                        />
                                    </div>
                                    <Input 
                                        placeholder="Or paste URL manually..." 
                                        value={currentProduct.img} 
                                        onChange={(e) => setCurrentProduct({...currentProduct, img: e.target.value})}
                                        className="text-xs text-gray-500 h-8"
                                    />
                                </div>
                            </div>
                        </div>

                        <Button type="submit" disabled={uploading} className="w-full bg-gray-900 hover:bg-black text-white mt-4">
                            {uploading ? "Uploading Image..." : (isEditing ? "Update Product" : "Create Product")}
                        </Button>
                    </form>
                </Card>
            </div>
        )}

      </div>
    </div>
  );
};

export default AdminPanel;