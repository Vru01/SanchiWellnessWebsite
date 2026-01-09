import React, { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock, MapPin, User, Box } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL + "/api" || "http://localhost:5000/api";

const AdminPanel = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/all-orders`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    const confirmMsg = newStatus === 'Paid' 
      ? "Confirm payment received? This will mark order as Paid." 
      : "Are you sure you want to reject this order?";
      
    if (!window.confirm(confirmMsg)) return;

    try {
      await fetch(`${API_BASE}/admin/update-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      fetchOrders(); 
    } catch (error) {
      alert("Error updating status");
    }
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center">Loading Admin Panel...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-28">
        <h1 className="text-3xl font-black mb-8 text-gray-800 border-b pb-4">Admin Dashboard</h1>
        
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order._id} className={`shadow-md overflow-hidden border-l-4 ${
                order.status === 'Paid' ? 'border-l-green-500' : 
                order.status === 'Rejected' ? 'border-l-red-500' : 'border-l-yellow-500'
            }`}>
              <CardContent className="p-0">
                
                {/* HEADER ROW: ID & STATUS */}
                <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-lg text-gray-700">Order #{order._id.slice(-6).toUpperCase()}</span>
                        <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString()}</span>
                    </div>
                    <Badge className={
                        order.status === 'Paid' ? 'bg-green-600' : 
                        order.status === 'Rejected' ? 'bg-red-600' : 'bg-yellow-500'
                    }>{order.status}</Badge>
                </div>

                {/* MAIN CONTENT GRID */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    
                    {/* COLUMN 1: PAYMENT & UTR */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Payment Details</h3>
                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                            <p className="text-xs text-blue-600 font-bold mb-1">UTR / TRANS ID</p>
                            <p className="font-mono font-black text-lg text-gray-800 break-all">{order.transactionId || "N/A"}</p>
                            <p className="mt-2 text-2xl font-black text-green-700">₹{order.totalAmount}</p>
                        </div>
                    </div>

                    {/* COLUMN 2: CUSTOMER & ADDRESS */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Customer & Shipping</h3>
                        <div className="space-y-3 text-sm text-gray-700">
                            <div className="flex gap-2 items-start">
                                <User className="h-4 w-4 text-gray-400 mt-0.5" />
                                <div>
                                    {/* Populate handles this: order.userId might be null if user deleted */}
                                    <p className="font-bold">{order.userId ? order.userId.name : "Unknown User"}</p>
                                    <p className="text-gray-500 text-xs">{order.userId ? order.userId.email : "No Email"}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 items-start">
                                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                                <p className="leading-relaxed bg-gray-50 p-2 rounded w-full border">
                                    {order.shippingAddress || "No Address Provided"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* COLUMN 3: ITEMS & ACTIONS */}
                    <div className="flex flex-col justify-between">
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Items Ordered</h3>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm border-b border-gray-100 pb-1 last:border-0">
                                        <span className="text-gray-700">{item.name} <span className="text-xs text-gray-400">x{item.quantity}</span></span>
                                        <span className="font-medium text-gray-900">₹{item.price * item.quantity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ACTION BUTTONS */}
                        {order.status === 'Pending Verification' ? (
                            <div className="flex gap-2 mt-4">
                                <Button 
                                    onClick={() => updateStatus(order._id, 'Rejected')}
                                    variant="outline" 
                                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                >
                                    <X className="h-4 w-4 mr-1" /> Reject
                                </Button>
                                <Button 
                                    onClick={() => updateStatus(order._id, 'Paid')}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200"
                                >
                                    <Check className="h-4 w-4 mr-1" /> Approve
                                </Button>
                            </div>
                        ) : (
                             <div className="mt-4 text-center text-sm text-gray-400 flex items-center justify-center gap-2 bg-gray-50 py-2 rounded">
                                <Clock className="h-4 w-4" /> 
                                {order.status === 'Paid' ? 'Order Approved & Ready to Ship' : 'Order Rejected'}
                            </div>
                        )}
                    </div>

                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;