const Product = require('../models/Product');

// @desc    Get all products (Public)
exports.getAllProducts = async (req, res) => {
    try {
        // Only fetch active products for the public store
        const products = await Product.find({ isActive: true });
        res.json(products);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};

// @desc    Add a new product (Admin Only)
exports.addProduct = async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json({ success: true, product: newProduct });
    } catch (err) {
        console.error('Error adding product:', err);
        // 🔥 FIXED: Now passes the exact schema failure message back to you!
        res.status(400).json({ error: err.message });
    }
};

// @desc    Update a product (Admin Only)
exports.updateProduct = async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true } // runValidators ensures updated data still matches schema rules
        );
        
        if (!updatedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json({ success: true, product: updatedProduct });
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(400).json({ error: 'Failed to update product' });
    }
};

// @desc    Delete a product (Admin Only)
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json({ success: true, message: "Product deleted successfully" });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ error: 'Failed to delete product' });
    }
};