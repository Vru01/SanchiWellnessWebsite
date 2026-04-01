const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    discountPrice: { type: Number },
    category: { type: String, index: true },
    img: String,
    tag: String
});

module.exports = mongoose.model('Product', productSchema);