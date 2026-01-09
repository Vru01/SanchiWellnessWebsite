const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    category: String,
    img: String,
    tag: String
});

module.exports = mongoose.model('Product', productSchema);