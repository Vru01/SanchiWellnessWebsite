const crypto = require('crypto');

exports.verifyRazorpaySignature = (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        
        // Create the expected signature using your Razorpay Secret
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            next(); // Signature is valid, proceed to update Order status
        } else {
            res.status(400).json({ success: false, message: 'Invalid payment signature.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error verifying payment', error: error.message });
    }
};