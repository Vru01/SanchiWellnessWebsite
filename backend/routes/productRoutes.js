const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// 1. PUBLIC ROUTE (Customers need this)
// URL: /api/products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. ADMIN: ADD PRODUCT
// URL: /api/products/admin/add
router.post('/admin/add', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 3. ADMIN: UPDATE PRODUCT
// URL: /api/products/admin/update/:id
router.put('/admin/update/:id', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        );
        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 4. ADMIN: DELETE PRODUCT
// URL: /api/products/admin/delete/:id
router.delete('/admin/delete/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Product deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;