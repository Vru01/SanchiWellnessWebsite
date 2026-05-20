const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const axios = require('axios'); // Added for Shipmozo API
const Order = require('../models/Order');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const User = require('../models/User'); // Required to get customer phone/email for shipping

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// --- 1. CREATE RAZORPAY ORDER ---
router.post('/create-razorpay-order', async (req, res) => {
    const { cartItems } = req.body;

    if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ success: false, error: "Cart is empty" });
    }

    try {
        // 🔒 SECURITY: Recalculate Total Amount on Backend
        let calculatedTotal = 0;
        
        await Promise.all(cartItems.map(async (item) => {
            const product = await Product.findById(item.productId || item.id);
            if (!product) {
                throw new Error(`Product not found for ID: ${item.productId || item.id}`);
            }
            
            // Use discountPrice if it exists, otherwise use regular price
            const activePrice = product.discountPrice ? product.discountPrice : product.price;
            calculatedTotal += activePrice * item.quantity;
        }));

        // Razorpay expects amount in paise (multiply by 100)
        const options = {
            amount: calculatedTotal * 100, 
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        if (!order) {
            return res.status(500).json({ success: false, error: "Failed to create Razorpay order" });
        }

        res.status(200).json({ success: true, order });

    } catch (err) {
        console.error("Razorpay Order Error:", err.message);
        res.status(500).json({ success: false, error: "Server error during order creation" });
    }
});

// --- 2. VERIFY PAYMENT & SAVE ORDER ---
router.post('/verify-razorpay-payment', async (req, res) => {
    const { 
        razorpay_order_id, 
        razorpay_payment_id, 
        razorpay_signature, 
        userId, 
        address, // Sent as an object {street, city, state, pincode} from frontend
        cartItems 
    } = req.body;

    try {
        // 1. Verify the signature securely
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature !== expectedSign) {
            return res.status(400).json({ success: false, error: "Invalid payment signature!" });
        }

        // 2. Fetch real product prices again for saving the order accurately
        let calculatedTotal = 0;
        const finalItems = await Promise.all(cartItems.map(async (item) => {
            const product = await Product.findById(item.productId || item.id);
            const activePrice = product.discountPrice ? product.discountPrice : product.price;
            
            calculatedTotal += activePrice * item.quantity;
            
            return {
                name: product.name,
                quantity: item.quantity,
                price: activePrice 
            };
        }));

        // 3. Save the Order to MongoDB
        const newOrder = new Order({
            userId,
            totalAmount: calculatedTotal,
            status: 'Paid', // Order is now Paid
            paymentMethod: 'Razorpay',
            transactionId: razorpay_payment_id,
            shippingAddress: address,
            items: finalItems
        });

        await newOrder.save();

        // 4. --- PUSH ORDER TO SHIPMOZO ---
        try {
            // Fetch the user to get their actual email and phone
            const user = await User.findById(userId);

            const shipPayload = {
                order_id: newOrder._id.toString(),
                order_date: new Date().toISOString().split('T')[0],
                
                // ACTUAL CUSTOMER DATA
                consignee_name: user?.name || "Customer",
                consignee_phone: user?.phone ? Number(user.phone) : 9999999999,
                consignee_email: user?.email || "",
                
                // ACTUAL ADDRESS DATA
                consignee_address_line_one: address.street,
                consignee_pin_code: Number(address.pincode),
                consignee_city: address.city,
                consignee_state: address.state,
                
                // ACTUAL PRODUCT DATA (Dynamically mapped from your DB)
                product_detail: finalItems.map(item => ({
                    name: item.name,            // Real product name
                    unit_price: item.price,     // Real price paid
                    quantity: item.quantity,    // Real quantity ordered
                    sku_number: item.name.substring(0, 8).replace(/\s/g, '').toUpperCase() // Auto-generates a clean SKU like "MALEMIGH"
                })),
                
                payment_type: "PREPAID",
                
                // STANDARD BOX DIMENSIONS (No need to save this in DB, just hardcode standard packaging)
                weight: 500,  // Standard 500 gram box
                length: 10,   // 10 cm
                width: 10,    // 10 cm
                height: 10    // 10 cm
            };

            const shipRes = await axios.post(
                'https://shipping-api.com/app/api/v1/push-order', 
                shipPayload, 
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'public-key': process.env.SHIPMOZO_PUBLIC_KEY,
                        'private-key': process.env.SHIPMOZO_PRIVATE_KEY
                    }
                }
            );

            // 🔍 NEW DEBUGGING LOGS:
            console.log("--- SHIPMOZO RAW RESPONSE ---");
            console.log(shipRes.data); 
            console.log("-----------------------------");

            // Save the Tracking/AWB Number
            if (shipRes.data && shipRes.data.status) {
                newOrder.awbNumber = shipRes.data.awb_number || null;
                await newOrder.save();
                console.log(`✅ Order pushed to Shipmozo! Tracking: ${newOrder.awbNumber}`);
            } else {
                console.log("❌ Shipmozo rejected the order. Reason:", shipRes.data.message || "Unknown");
            }

        } catch (shipError) {
            console.error("⚠️ Shipmozo API failed:", shipError?.response?.data || shipError.message);
        }
        // --- END SHIPMOZO INTEGRATION ---

        // 5. Clear the user's cart
        await CartItem.deleteMany({ userId });

        res.status(200).json({ success: true, orderId: newOrder._id });

    } catch (err) {
        console.error("Payment Verification Error:", err);
        res.status(500).json({ success: false, error: "Payment verification failed" });
    }
});

// --- GET ORDERS ROUTE ---
router.get('/orders/:userId', async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        
        const formattedOrders = orders.map(order => ({
            id: order._id,
            total: order.totalAmount,
            status: order.status,
            date: order.createdAt,
            // Include shipping details so users can see them
            shippingAddress: order.shippingAddress,
            awbNumber: order.awbNumber,
            courierName: order.courierName,
            items: order.items.map(i => ({
                name: i.name,
                qty: i.quantity,
                price: i.price
            }))
        }));

        res.json(formattedOrders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ADMIN: GET ALL ORDERS ---
router.get('/admin/all-orders', async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('userId', 'name email phone') 
            .sort({ createdAt: -1 });
            
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ADMIN: UPDATE ORDER STATUS ---
router.post('/admin/update-status', async (req, res) => {
    const { orderId, status } = req.body;
    try {
        await Order.findByIdAndUpdate(orderId, { status });
        res.json({ message: "Status updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ADMIN: DELETE ORDER ---
router.delete('/admin/delete-order/:orderId', async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.orderId);
        res.json({ message: "Order deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;