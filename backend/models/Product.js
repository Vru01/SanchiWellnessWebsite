const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    // 🔥 FIXED: Added sparse: true so empty/null slugs don't collide
    slug: { type: String, unique: true, index: true, sparse: true }, 
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    category: { type: String, index: true },
    
    images: [{
        url: { type: String, required: true },
        public_id: { type: String } 
    }],
    
    sku: { type: String, unique: true, sparse: true },
    stock: { type: Number, default: 0, min: 0 },
    
    shippingDetails: {
        weight: { type: Number, required: true } 
    },

    healthMetadata: {
        ingredients: [String],
        benefits: [String],
        howToUse: String,
        isVegetarian: { type: Boolean, default: true }
    },
    
    isActive: { type: Boolean, default: true } 
}, { timestamps: true });

// 🔥 BONUS AUTOMATION: Automatically generate a clean slug from the name before saving
productSchema.pre('save', async function() {
    if (this.isModified('name') && !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-');         // Replace spaces with hyphens
    }
});

module.exports = mongoose.model('Product', productSchema);