const Razorpay = require('razorpay');
const crypto = require('crypto');
const axios = require('axios');
const Order = require('../models/Order');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// --- 1. NEW: Create Razorpay Order (Fixes the "undefined" error) ---
exports.createRazorpayOrder = async (req, res) => {
    const { cartItems } = req.body;

    if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ success: false, error: "Cart is empty" });
    }

    try {
        let calculatedTotal = 0;
        
        // Calculate the exact total securely on the backend
        await Promise.all(cartItems.map(async (item) => {
            const product = await Product.findById(item.productId);
            if (product) {
                const activePrice = product.discountPrice || product.price;
                calculatedTotal += activePrice * item.quantity;
            }
        }));

        // Razorpay expects amount in paise (multiply by 100)
        const options = {
            amount: calculatedTotal * 100, 
            currency: "INR",
            receipt: `rcpt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        
        res.status(200).json({ success: true, order });
    } catch (err) {
        console.error("Razorpay Create Order Error:", err);
        res.status(500).json({ success: false, error: "Server error during order creation" });
    }
};

// --- 2. Customer verifies payment & saves order ---
exports.verifyRazorpayPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, address, cartItems } = req.body;

    try {
        // Verify Signature
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(sign).digest("hex");
        if (razorpay_signature !== expectedSign) return res.status(400).json({ success: false, error: "Invalid signature!" });

        let calculatedTotal = 0;
        const finalItems = await Promise.all(cartItems.map(async (item) => {
            const product = await Product.findById(item.productId);
            const activePrice = product.discountPrice || product.price;
            calculatedTotal += activePrice * item.quantity;
            
            return {
                productId: product._id,
                name: product.name,
                quantity: item.quantity,
                price: activePrice 
            };
        }));

        // Save order structure matching production schema
        const newOrder = new Order({
            userId,
            totalAmount: calculatedTotal,
            status: 'Processing',
            paymentDetails: {
                method: 'RAZORPAY',
                paymentStatus: 'Completed',
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature
            },
            shippingAddress: address,
            items: finalItems
        });

        await newOrder.save();
        await CartItem.deleteMany({ userId }); // Clear cart after successful order

        res.status(200).json({ success: true, orderId: newOrder._id });

    } catch (err) {
        res.status(500).json({ success: false, error: "Verification failed" });
    }
};

// --- 3. ADMIN Fulfillment (Triggers Shipmozo - FIXED DISCOUNT INDEX) ---
exports.dispatchOrder = async (req, res) => {
    const { orderId, packageWeight, length, width, height } = req.body;

    try {
        const order = await Order.findById(orderId).populate('userId', 'name email phone');
        if (!order) return res.status(404).json({ error: "Order not found" });

        // Format date to YYYY-MM-DD as required by Shipmozo
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];

        const shipPayload = {
            order_id: order._id.toString(),
            order_date: orderDate,
            consignee_name: order.shippingAddress.fullName || order.userId.name,
            consignee_phone: Number(order.shippingAddress.phone || order.userId.phone || 0),
            consignee_email: order.userId.email,
            consignee_address_line_one: order.shippingAddress.street,
            consignee_pin_code: Number(order.shippingAddress.pincode),
            consignee_city: order.shippingAddress.city || "Pune", 
            consignee_state: order.shippingAddress.state || "Maharashtra",
            
            // Map our cart items to Shipmozo's required product format
            product_detail: order.items.map(item => ({
                name: item.name,
                sku_number: item.productId ? item.productId.toString().slice(-6) : "SKU001",
                quantity: Number(item.quantity),
                unit_price: Number(item.price),
                product_category: "Wellness",
                discount: 0 // 🔥 Added to prevent "Undefined index: discount" inside products
            })),
            
            payment_type: "PREPAID",
            discount: 0, // 🔥 Added to prevent "Undefined index: discount" at root level
            weight: Number(packageWeight),
            length: Number(length),
            width: Number(width),
            height: Number(height)
        };

        const shipRes = await axios.post(process.env.SHIPMOZO_API_URL, shipPayload, {
            headers: { 
                'public-key': process.env.SHIPMOZO_PUBLIC_KEY, 
                'private-key': process.env.SHIPMOZO_PRIVATE_KEY,
                'Content-Type': 'application/json'
            }
        });

        // Shipmozo docs: success returns "result": "1"
        if (shipRes.data && shipRes.data.result === "1") {
            order.status = 'Shipped';
            order.shipmentDetails = {
                // 🔥 FIX: Set a clean processing string instead of the database Hex ID
                awbNumber: "Awaiting Courier Assignment", 
                packageDetails: { totalWeight: packageWeight, length, width, height }
            };
            await order.save();
            
            // Return the clean status string to the frontend
            res.json({ success: true, message: "Order synced to Shipmozo!", awb: "Awaiting Courier Assignment" });
        } else {
            res.status(400).json({ error: "Shipmozo rejected order", details: shipRes.data });
        }

    } catch (error) {
        console.error("Shipmozo Error:", error.response ? error.response.data : error.message);
        
        res.status(500).json({ 
            error: "Failed to dispatch", 
            details: error.response ? error.response.data : error.message 
        });
    }
};
// --- 4. Get logged-in user's orders ---
exports.getUserOrders = async (req, res) => {
    try {
        if (req.userId !== req.params.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error('Error fetching user orders:', err);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

// --- 5. Get all orders for Admin Panel ---
exports.getAllAdminOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('userId', 'name email phone') 
            .sort({ createdAt: -1 });
            
        res.json(orders);
    } catch (err) {
        console.error('Error fetching admin orders:', err);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

// --- 6. Update order status (Admin) ---
exports.updateOrderStatus = async (req, res) => {
    const { orderId, status } = req.body;
    try {
        const updatedOrder = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
        if (!updatedOrder) return res.status(404).json({ error: 'Order not found' });
        
        res.json({ success: true, message: "Status updated", order: updatedOrder });
    } catch (err) {
        console.error('Error updating order status:', err);
        res.status(500).json({ error: 'Failed to update status' });
    }
};

// --- 7. Delete an order entirely (Admin) ---
exports.deleteOrder = async (req, res) => {
    try {
        const deletedOrder = await Order.findByIdAndDelete(req.params.orderId);
        if (!deletedOrder) return res.status(404).json({ error: 'Order not found' });
        
        res.json({ success: true, message: "Order deleted successfully" });
    } catch (err) {
        console.error('Error deleting order:', err);
        res.status(500).json({ error: 'Failed to delete order' });
    }
};