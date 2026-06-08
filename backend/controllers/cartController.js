const CartItem = require('../models/CartItem');
const Product = require('../models/Product');

exports.getCart = async (req, res) => {
    try {
        if (req.userId !== req.params.userId) return res.status(403).json({ error: 'Unauthorized' });

        // populate brings in the real-time name, images, and price from the Product collection
        const cartItems = await CartItem.find({ userId: req.params.userId })
            .populate('productId', 'name price discountPrice images slug');
            
        res.json(cartItems);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
};

exports.addToCart = async (req, res) => {
    const { userId, productId } = req.body;
    
    try {
        if (req.userId !== userId) return res.status(403).json({ error: 'Unauthorized' });

        // Check if product exists before adding
        const dbProduct = await Product.findById(productId);
        if (!dbProduct) return res.status(404).json({ error: 'Product not found' });

        // Update quantity if exists, otherwise create new entry. 
        // This prevents the duplicate item bug!
        const item = await CartItem.findOneAndUpdate(
            { userId, productId },
            { $inc: { quantity: 1 } },
            { new: true, upsert: true } // upsert creates it if it doesn't exist
        );

        res.json({ message: "Added to cart", item });
    } catch (err) {
        res.status(500).json({ error: 'Failed to add to cart' });
    }
};

// @desc    Decrease quantity of a cart item
// @route   POST /api/cart/decrease
exports.decreaseQty = async (req, res) => {
    const { userId, productId } = req.body;
    
    try {
        if (req.userId !== userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const item = await CartItem.findOne({ userId, productId });
        
        if (!item) {
            return res.status(404).json({ error: "Item not found in cart" });
        }

        if (item.quantity > 1) {
            item.quantity -= 1;
            await item.save();
            res.json({ message: "Quantity decreased", item });
        } else {
            // If quantity is 1, decreasing it means removing it entirely
            await CartItem.deleteOne({ userId, productId });
            res.json({ message: "Item removed from cart completely" });
        }
    } catch (err) {
        console.error('Error decreasing quantity:', err);
        res.status(500).json({ error: 'Failed to decrease quantity' });
    }
};

// @desc    Remove an item completely regardless of quantity
// @route   POST /api/cart/remove
exports.removeItem = async (req, res) => {
    const { userId, productId } = req.body;
    
    try {
        if (req.userId !== userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await CartItem.deleteOne({ userId, productId });
        res.json({ message: "Item removed successfully" });
    } catch (err) {
        console.error('Error removing item:', err);
        res.status(500).json({ error: 'Failed to remove item' });
    }
};