const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { 
    getCart, 
    addToCart, 
    decreaseQty, // <-- ADDED THIS
    removeItem   // <-- ADDED THIS
} = require('../controllers/cartController');

router.get('/:userId', authMiddleware, getCart);
router.post('/add', authMiddleware, addToCart);
router.post('/decrease', authMiddleware, decreaseQty);
router.post('/remove', authMiddleware, removeItem);

module.exports = router;