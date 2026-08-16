const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @desc    Attach req.pricingTier if a valid token is present.
//          Unlike authMiddleware, this NEVER blocks the request —
//          guests fall through with pricingTier = 'normal'.
module.exports = async function optionalAuth(req, res, next) {
    req.pricingTier = 'normal';
    req.userId = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.userId = decoded.id;

            const user = await User.findById(decoded.id).select('pricingTier');
            if (user) {
                req.pricingTier = user.pricingTier || 'normal';
            }
        } catch (err) {
            // Bad/expired token — treat as guest, do not throw
        }
    }

    next();
};