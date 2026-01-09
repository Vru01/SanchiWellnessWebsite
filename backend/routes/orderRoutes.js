const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product'); 

// --- CHECKOUT ROUTE (SECURE) ---
router.post('/checkout', async (req, res) => {
    const { userId, transactionId, address, cartItems } = req.body; 

    // Basic Validation
    if (!userId || !cartItems || cartItems.length === 0) {
        return res.status(400).json({ error: "Invalid order data" });
    }

    try {
        // 🔒 SECURITY: Recalculate Total Amount on Backend
        // We do NOT trust the 'totalAmount' sent from the frontend.
        let calculatedTotal = 0;
        
        // We use Promise.all to handle multiple database lookups efficiently
        const finalItems = await Promise.all(cartItems.map(async (item) => {
            // 1. Find the real product in the DB to get the REAL price
            // We check both .productId (from DB cart) and .id (fallback)
            const product = await Product.findById(item.productId || item.id);
            
            if (!product) {
                throw new Error(`Product not found for ID: ${item.productId || item.id}`);
            }
            
            // 2. Add to total using the DB price
            calculatedTotal += product.price * item.quantity;
            
            return {
                name: product.name,
                quantity: item.quantity,
                price: product.price // Save the price at time of purchase
            };
        }));

        // 3. Create the Order with the calculated total
        const newOrder = new Order({
            userId,
            totalAmount: calculatedTotal, // <--- Secure Total
            status: 'Pending Verification', 
            paymentMethod: 'UPI',
            transactionId,
            shippingAddress: address,
            items: finalItems
        });

        await newOrder.save();
        
        // 4. Clear the user's cart
        await CartItem.deleteMany({ userId });

        res.status(201).json({ message: "Order placed successfully!", orderId: newOrder._id });

    } catch (err) {
        console.error("Checkout Error:", err.message);
        res.status(500).json({ error: "Payment processing failed. Please contact support." });
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
            .populate('userId', 'name email') 
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

module.exports = router;