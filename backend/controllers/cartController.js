const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const User = require('../models/User');
const getPriceForUser = require('../utils/getPriceForUser');

exports.getCart = async (req, res) => {
    try {
        if (req.userId !== req.params.userId) return res.status(403).json({ error: 'Unauthorized' });

        const user = await User.findById(req.userId).select('pricingTier');
        const pricingTier = user?.pricingTier || 'normal';

        // populate brings in the real-time name, images, and all price tiers from the Product collection
        const cartItems = await CartItem.find({ userId: req.params.userId })
            .populate('productId', 'name price discountPrice franchisePrice distributorPrice images slug');

        const shaped = cartItems.map((item) => {
            const obj = item.toObject();
            if (obj.productId) {
                try {
                    const { price, original } = getPriceForUser(pricingTier, obj.productId);
                    obj.productId.displayPrice = price;
                    obj.productId.originalPrice = original;
                } catch (err) {
                    // Tier price missing for this product — surface a flag,
                    // don't crash the whole cart view
                    obj.productId.pricingUnavailable = true;
                    obj.productId.pricingError = err.message;
                }
                delete obj.productId.franchisePrice;
                delete obj.productId.distributorPrice;
            }
            return obj;
        });

        res.json(shaped);
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
            { returnDocument: 'after', upsert: true } // UPGRADED: Replaced 'new: true' with 'returnDocument: 'after''
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