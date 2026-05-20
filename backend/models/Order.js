const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: [{
        name: String,
        quantity: Number,
        price: Number
    }],
    totalAmount: Number,
    status: { type: String, default: 'Pending' },
    paymentMethod: String,
    transactionId: String,
    
    // 1. Updated Address Structure (Required by Shipping APIs)
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        pincode: String
    },
    
    // 2. New Shipping Tracking Fields
    shipmentId: String,
    awbNumber: String,
    courierName: String,
    labelUrl: String,
    // Add these inside your orderSchema
    deliveryType: { type: String, default: 'standard' },
    deliveryFee: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);