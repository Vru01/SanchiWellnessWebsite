import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/home/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Lock, Smartphone, AlertCircle, Info, CheckCircle2 } from 'lucide-react'; 
import QRCode from "react-qr-code"; 

// SAFE ENVIRONMENT VARIABLES
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_BASE = `${API_URL}/api`;
const MERCHANT_UPI = import.meta.env.VITE_MERCHANT_UPI || "yourname@upi";
const MERCHANT_NAME = import.meta.env.VITE_MERCHANT_NAME || "Sanchi Wellness";

const Checkout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Form States
  const [address, setAddress] = useState("");
  const [txnId, setTxnId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(""); 

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    
    fetch(`${API_BASE}/cart/${parsedUser.id}`)
      .then(res => res.json())
      .then(data => {
        setCart(data);
        setLoading(false);
        if (data.length === 0) {
            alert("Your cart is empty!");
            navigate('/dashboard');
        }
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [navigate]);

  const totalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  // SECURE QR STRING: Added 'tn' (Transaction Note) so user sees "Sanchi Wellness Order" in GPay
  // pn: Payee Name, pa: Payee Address, am: Amount, tn: Note
  const upiLink = `upi://pay?pa=${MERCHANT_UPI}&pn=${MERCHANT_NAME}&am=${totalAmount}&tn=SanchiWellnessOrder&cu=INR`;

  const handlePlaceOrder = async () => {
    setError(""); 

    if (!address.trim() || address.length < 10) {
      setError("Please enter a complete shipping address.");
      return;
    }
    
    // Strict UTR Validation: Must be exactly 12 digits
    const utrRegex = /^\d{12}$/;
    if (!txnId || !utrRegex.test(txnId)) {
        setError("Invalid Transaction ID. UTR must be exactly 12 digits.");
        return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          // SECURITY NOTE: We send totalAmount for display, but Backend MUST recalculate it
          totalAmount: totalAmount, 
          transactionId: txnId,
          address: address,
          cartItems: cart 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        window.dispatchEvent(new Event("cartUpdated")); // Update cart badge
        alert("✅ Order Submitted! We will verify the payment and ship your order.");
        navigate('/dashboard'); 
      } else {
        setError(data.error || "Order failed. Please try again.");
      }
    } catch (error) {
      console.error("Checkout Error:", error);
      setError("Server connection failed. Please check your internet.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-stone-50">Loading secure checkout...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 py-28">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                <Lock className="h-8 w-8 text-green-600" />
                Secure Checkout
            </h1>
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-2 rounded-full border border-green-200">
                <ShieldCheck className="h-4 w-4" />
                <span>256-bit SSL Encrypted Connection</span>
            </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* LEFT: ADDRESS & SUMMARY */}
          <div className="space-y-6">
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <span className="bg-gray-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                    Shipping Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Label className="mb-2 block text-gray-600">Delivery Address</Label>
                <textarea 
                  className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all text-sm"
                  rows="4"
                  placeholder="Full Name, House No, Street Area, City, Pincode"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </CardContent>
            </Card>

            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-3 bg-gray-50/50">
                <CardTitle className="text-lg flex items-center gap-2">
                    <span className="bg-gray-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                    Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">{item.name} <span className="text-xs text-gray-400">x{item.quantity}</span></span>
                        <span className="font-bold text-gray-900">₹{item.price * item.quantity}</span>
                    </div>
                ))}
                <div className="flex justify-between text-xl font-black text-gray-900 mt-4 pt-4 border-t border-gray-200">
                    <span>Total Payable</span>
                    <span>₹{totalAmount}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: SECURE PAYMENT */}
          <div>
            <Card className="bg-white border-2 border-cyan-500 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 bg-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                UPI / QR
              </div>

              <CardHeader className="bg-cyan-50/50 border-b border-cyan-100">
                <CardTitle className="flex items-center gap-2 text-cyan-900">
                   <Smartphone className="h-5 w-5" />
                   Scan & Pay
                </CardTitle>
              </CardHeader>
              
              <CardContent className="pt-8 flex flex-col items-center">
                
                {/* QR CODE */}
                <div className="p-4 bg-white border-2 border-gray-100 rounded-xl shadow-sm mb-4 relative">
                    <QRCode value={upiLink} size={180} />
                </div>
                
                {/* SAFETY INSTRUCTION */}
                <div className="bg-yellow-50 text-yellow-800 text-xs p-3 rounded-md mb-6 max-w-xs text-center border border-yellow-200 flex flex-col items-center gap-1">
                    <Info className="h-4 w-4" />
                    <span>Please ensure the payee name is <br/><strong className="font-bold">"{MERCHANT_NAME}"</strong> before paying.</span>
                </div>

                <div className="text-center mb-8">
                    <p className="text-2xl font-black text-gray-900">₹{totalAmount}</p>
                </div>

                {/* FORM */}
                <div className="w-full space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="text-left space-y-2">
                        <Label className="text-sm font-bold text-gray-700">Transaction ID (UTR)</Label>
                        <Input 
                            placeholder="Enter 12-digit UTR Ref No." 
                            value={txnId}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, ''); 
                                if (val.length <= 12) setTxnId(val);
                            }}
                            maxLength={12}
                            className="bg-white"
                        />
                        <p className="text-[10px] text-gray-400">
                            * Located in your UPI app under "Transaction Details".
                        </p>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-md">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    <Button 
                        onClick={handlePlaceOrder}
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold h-12"
                    >
                        {isSubmitting ? "Verifying Payment..." : "I have Paid"}
                    </Button>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Checkout;