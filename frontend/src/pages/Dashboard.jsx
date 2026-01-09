import React, { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import ProductSection from '@/components/home/ProductSection';
import Footer from '@/components/home/Footer';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, Plus, Minus, Package, Loader2 } from 'lucide-react'; 

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_BASE = `${API_URL}/api`;

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
    } else {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchCart(parsedUser.id);
      fetchOrders(parsedUser.id);
    }
  }, [navigate]);

  const fetchCart = async (userId) => {
    try {
      setCartLoading(true);
      const res = await fetch(`${API_BASE}/cart/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch cart");
      const data = await res.json();
      setCart(data);
    } catch (error) {
      console.error("Error loading cart:", error);
    } finally {
      setCartLoading(false);
    }
  };

  const fetchOrders = async (userId) => {
    try {
      const res = await fetch(`${API_BASE}/orders/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  // --- 1. ADD TO CART (For Shop Page) ---
  const addToCart = async (product) => {
    if (!user) return;
    
    // FIX: Prioritize productId (if coming from cart) over _id (if coming from shop)
    const targetId = product.productId || product._id || product.id;

    try {
      const productData = {
        id: targetId, 
        name: product.name,
        price: product.price,
        img: product.img
      };

      const res = await fetch(`${API_BASE}/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, product: productData }),
      });
      
      if (res.ok) {
        fetchCart(user.id); 
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  // --- 2. INCREASE QTY (For Cart + Button) ---
  // I created a separate function for the '+' button in the cart to be safe
  const increaseQty = async (item) => {
    // We just reuse addToCart logic, but passing the item correctly
    await addToCart(item); 
  };

  const decreaseQty = async (productId) => {
    try {
      const res = await fetch(`${API_BASE}/cart/decrease`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, productId }),
      });

      if (res.ok) fetchCart(user.id);
    } catch (error) {
      console.error("Error decreasing quantity:", error);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const res = await fetch(`${API_BASE}/cart/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, productId }),
      });

      if (res.ok) fetchCart(user.id);
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const totalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      
      <div className="pt-28 pb-10 bg-white border-b border-gray-100">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
            Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-green-600">{user.name}</span>
          </h1>
          <p className="text-gray-500">Manage your wellness journey.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-cyan-600" /> 
                Your Cart {cartLoading && <Loader2 className="h-4 w-4 animate-spin text-gray-400"/>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  Your cart is empty. Start adding products below!
                </div>
              ) : (
                <div className="space-y-6">
                  {cart.map((item) => (
                    <div 
                      key={item.productId} 
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-6 last:border-0 gap-4"
                    >
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="h-20 w-20 flex-shrink-0 bg-gray-50 rounded-md p-2">
                            <img src={item.img} alt={item.name} className="h-full w-full object-contain" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 text-lg leading-tight">{item.name}</h4>
                          <p className="text-sm text-gray-500 mt-1">Unit Price: ₹{item.price}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between w-full sm:w-auto sm:gap-8 bg-gray-50 sm:bg-transparent p-3 sm:p-0 rounded-lg">
                        <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm">
                          <Button 
                            variant="ghost" size="icon" 
                            className="h-9 w-9 rounded-none rounded-l-lg hover:bg-gray-100 text-gray-600"
                            onClick={() => decreaseQty(item.productId)} 
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-10 text-center text-sm font-bold text-gray-900">{item.quantity}</span>
                          
                          {/* FIX: Call increaseQty instead of addToCart directly */}
                          <Button 
                            variant="ghost" size="icon" 
                            className="h-9 w-9 rounded-none rounded-r-lg hover:bg-gray-100 text-green-700"
                            onClick={() => increaseQty(item)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="font-bold text-gray-900 text-lg">₹{item.price * item.quantity}</span>
                            <Button 
                            variant="ghost" size="icon" 
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 h-9 w-9"
                            onClick={() => removeFromCart(item.productId)}
                            >
                            <Trash2 className="h-5 w-5" />
                            </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t border-gray-100 flex justify-between items-center mt-4">
                    <span className="text-lg font-bold text-gray-700">Total Amount</span>
                    <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-green-600">
                      ₹{totalAmount}
                    </span>
                  </div>
                  
                  <Button className="w-full mt-4 bg-gray-900 text-white hover:bg-gray-800 py-6 text-lg" onClick={() => navigate('/checkout')}>
                    Proceed to Checkout
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5 text-green-600" /> Order History</CardTitle></CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">No past orders found.</div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center mb-3 border-b border-gray-100 pb-2">
                        <div>
                          <span className="font-bold text-gray-800">Order #{order.id.slice(-6).toUpperCase()}</span>
                          <span className="text-xs text-gray-500 block ml-0.5">{new Date(order.date).toLocaleDateString()}</span>
                        </div>
                        <div className="text-right">
                          <span className="block font-bold text-green-700">₹{order.total}</span>
                          <span className="inline-block text-[10px] uppercase font-bold tracking-wider bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-sm">{order.status}</span>
                        </div>
                      </div>
                      <div className="space-y-1 bg-gray-50 p-2 rounded text-sm">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-gray-600">
                            <span>{item.name} <span className="text-gray-400 text-xs">x{item.qty}</span></span>
                            <span>₹{item.price * item.qty}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-lg bg-gradient-to-br from-cyan-500 to-green-600 text-white">
            <CardHeader><CardTitle>My Profile</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-white/80 text-sm">Full Name</p>
                <p className="font-bold text-lg" >{user.name}</p>
                <p className="text-white/80 text-sm mt-4">Email Address</p>
                <p className="font-bold text-lg">{user.email}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="bg-white py-10">
        <div className="container mx-auto px-6 mb-8">
           <h3 className="text-2xl font-bold text-gray-800">Continue Shopping</h3>
        </div>
        <ProductSection onAddToCart={addToCart} /> 
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;