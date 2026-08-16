const express = require('express');
const router = express.Router();
const { authMiddleware, isAdminMiddleware } = require('../middleware/auth');
const { searchUsers, setPricingTier } = require('../controllers/userController');

// --- ADMIN ROUTES ---
router.get('/admin/search', authMiddleware, isAdminMiddleware, searchUsers);
router.put('/admin/set-tier', authMiddleware, isAdminMiddleware, setPricingTier);

module.exports = router;