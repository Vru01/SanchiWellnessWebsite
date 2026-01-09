const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    productId: { type: String, required: true },
    name: String,
    price: Number,
    img: String,
    quantity: { type: Number, default: 1 }
});

module.exports = mongoose.model('CartItem', cartItemSchema);