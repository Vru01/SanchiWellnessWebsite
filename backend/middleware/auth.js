const jwt = require('jsonwebtoken');

// @desc    Verify JWT and attach user info to request
exports.authMiddleware = (req, res, next) => {
    try {
        // 1. Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const token = authHeader.split(' ')[1];

        // 2. Verify token
        // Make sure your process.env.JWT_SECRET matches what you used in authController
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Attach exact fields to the request (matches your controller logic)
        req.userId = decoded.id;
        req.userRole = decoded.role; 

        next(); // Move to the next middleware or controller
    } catch (error) {
        console.error('Auth Middleware Error:', error.message);
        res.status(401).json({ error: 'Invalid or expired token.' });
    }
};

// @desc    Verify if the logged-in user is an admin
exports.isAdminMiddleware = (req, res, next) => {
    // Ensure authMiddleware has run first
    if (!req.userId || !req.userRole) {
        return res.status(401).json({ error: 'Authentication required.' });
    }

    // Check the role
    if (req.userRole !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    next(); // Move to the admin controller
};