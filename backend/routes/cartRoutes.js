const express = require('express');
const router = express.Router();
const CartItem = require('../models/CartItem');

// GET CART
router.get('/:userId', async (req, res) => {
    try {
        const cartItems = await CartItem.find({ userId: req.params.userId });
        res.json(cartItems);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ADD TO CART
router.post('/add', async (req, res) => {
    const { userId, product } = req.body;
    try {
        let item = await CartItem.findOne({ userId, productId: product._id || product.id });
        if (item) {
            item.quantity += 1;
            await item.save();
        } else {
            item = new CartItem({
                userId,
                productId: product._id || product.id,
                name: product.name,
                price: product.price,
                img: product.img,
                quantity: 1
            });
            await item.save();
        }
        res.json({ message: "Added to cart" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DECREASE QTY
router.post('/decrease', async (req, res) => {
    const { userId, productId } = req.body;
    try {
        const item = await CartItem.findOne({ userId, productId });
        if (item && item.quantity > 1) {
            item.quantity -= 1;
            await item.save();
            res.json({ message: "Quantity decreased" });
        } else {
            res.json({ message: "Cannot decrease further" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// REMOVE ITEM
router.post('/remove', async (req, res) => {
    const { userId, productId } = req.body;
    try {
        await CartItem.deleteOne({ userId, productId });
        res.json({ message: "Item removed" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;