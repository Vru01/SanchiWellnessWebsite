import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';

// FIX: Add a fallback so it never breaks
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_BASE = `${API_URL}/api`;

const ProductSection = ({ onAddToCart }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. FETCH PRODUCTS
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_BASE}/products`);
        if (!res.ok) throw new Error("Failed to load products");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Could not load products. Please check server.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = async (product) => {
    const storedUser = localStorage.getItem('user');
    
    if (!storedUser) {
      alert("Please login to add items to your cart!");
      navigate('/login');
      return;
    }

    const user = JSON.parse(storedUser);

    // If Dashboard passed a handler, use it (This updates the Dashboard UI immediately)
    if (onAddToCart) {
      onAddToCart(product);
      alert(`${product.name} added to cart!`);
    } else {
      // Standalone Logic (For Home Page)
      try {
        const payload = {
          userId: user.id,
          product: {
            id: product._id || product.id, 
            name: product.name,
            price: product.price,
            img: product.img
          }
        };

        const res = await fetch(`${API_BASE}/cart/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          alert(`${product.name} added to cart!`);
          window.dispatchEvent(new Event("cartUpdated"));
        } else {
          const errData = await res.json();
          alert("Failed to add: " + (errData.error || "Unknown error"));
        }
      } catch (error) {
        console.error("Error adding to cart:", error);
        alert("Something went wrong.");
      }
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center items-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-24 flex justify-center items-center bg-slate-50 text-red-500 gap-2">
        <AlertCircle className="h-5 w-5" /> {error}
      </div>
    );
  }

  return (
    <section id="products" className="py-24 bg-slate-50">
      <div className="container mx-auto px-6">
        {!onAddToCart && (
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-green-600">
              Our Premium Collection
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Discover the power of nature with Sanchi Wellness.
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <Card key={product._id} className="group border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 bg-white overflow-hidden flex flex-col h-full">
              <CardHeader className="p-0 relative">
                <div className="overflow-hidden h-72 bg-gray-50 flex items-center justify-center relative">
                   <div className="absolute inset-0 bg-gradient-to-tr from-cyan-50/50 to-green-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                   {/* SIMPLIFIED IMAGE LOGIC: Just use src directly now that we have Cloudinary */}
                   <img 
                      src={product.img} 
                      alt={product.name} 
                      className="w-full h-full object-contain p-4 relative z-10 group-hover:scale-110 transition-transform duration-500" 
                   />
                </div>
                {product.tag && (
                  <Badge className="absolute top-3 right-3 shadow-md z-20 bg-cyan-600">{product.tag}</Badge>
                )}
              </CardHeader>
              
              <CardContent className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-xs font-bold text-cyan-600 uppercase tracking-wider">{product.category}</p>
                  <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1">{product.name}</h3>
                <p className="text-sm text-gray-500">{product.description}</p>
              </CardContent>
              
              <CardFooter className="p-6 pt-0">
                <Button 
                  onClick={() => handleAddToCart(product)}
                  className="w-full bg-gradient-to-r from-cyan-500 to-green-600 hover:from-cyan-600 hover:to-green-700 text-white shadow-md active:scale-95 transition-all"
                >
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductSection;