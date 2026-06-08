const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
        index: true
    },
    productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true 
    },
    quantity: { 
        type: Number, 
        default: 1, 
        min: 1 
    }
}, { timestamps: true });

// Crucial: Prevents duplicate cart items for the same product. 
// If a user adds the same item again, your backend should $inc (increment) the quantity.
cartItemSchema.index({ userId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model('CartItem', cartItemSchema);