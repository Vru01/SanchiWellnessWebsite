const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    
    // Snapshot of the items at the exact time of purchase
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true }
    }],
    
    totalAmount: { type: Number, required: true },
    
    status: { 
        type: String, 
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending' 
    },
    
    // Razorpay Data Block
    paymentDetails: {
        method: { type: String, required: true }, // e.g., 'RAZORPAY' or 'COD'
        transactionId: String,
        razorpayOrderId: String,
        razorpaySignature: String
    },
    
    // Required by Couriers
    shippingAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        phone: { type: String, required: true } // Crucial for delivery drivers
    },
    
    // Shipmozo & Fulfillment Block
    shipmentDetails: {
        shipmentId: String,
        awbNumber: String,
        courierName: String,
        labelUrl: String,
        deliveryType: { type: String, default: 'standard' },
        deliveryFee: { type: Number, default: 0 },
        
        // You fill this in the admin panel when packing the box
        packageDetails: {
            totalWeight: Number,
            length: Number,
            width: Number,
            height: Number
        }
    }
}, { timestamps: true }); // Automatically handles createdAt and updatedAt

module.exports = mongoose.model('Order', orderSchema);