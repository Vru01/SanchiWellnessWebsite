const Product = require('../models/Product');
const getPriceForUser = require('../utils/getPriceForUser');

// @desc    Get all products (Public) — tier-aware pricing
//          req.pricingTier is set by optionalAuth (defaults to 'normal' for guests)
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true });

        const shaped = products.map((p) => {
            const obj = p.toObject();

            let displayPrice, originalPrice;
            try {
                const result = getPriceForUser(req.pricingTier, p);
                displayPrice = result.price;
                originalPrice = result.original;
            } catch (err) {
                // Tier price not configured for this product yet —
                // fall back to normal pricing so the product still renders.
                displayPrice = p.discountPrice ?? p.price;
                originalPrice = p.discountPrice ? p.price : null;
            }

            // Strip raw tier fields before sending to non-admin clients
            delete obj.franchisePrice;
            delete obj.distributorPrice;

            return {
                ...obj,
                displayPrice,
                originalPrice
            };
        });

        res.json(shaped);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};

// @desc    Get all products with RAW pricing fields (Admin Only)
//          Used by the Admin Panel product list/edit form.
exports.getAllProductsAdmin = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        console.error('Error fetching admin products:', err);
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
        res.status(400).json({ error: err.message });
    }
};

// @desc    Update a product (Admin Only)
exports.updateProduct = async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
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