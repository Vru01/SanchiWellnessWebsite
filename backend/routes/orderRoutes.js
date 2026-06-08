const express = require('express');
const router = express.Router();
const { authMiddleware, isAdminMiddleware } = require('../middleware/auth');
const { 
    createRazorpayOrder, // <-- IMPORTED HERE
    verifyRazorpayPayment, 
    dispatchOrder,
    getUserOrders,
    getAllAdminOrders,
    updateOrderStatus,
    deleteOrder
} = require('../controllers/orderController');

// --- CUSTOMER ROUTES ---
router.post('/create-razorpay-order', authMiddleware, createRazorpayOrder); // <-- ROUTE ADDED HERE
router.post('/verify-payment', authMiddleware, verifyRazorpayPayment);
router.get('/user/:userId', authMiddleware, getUserOrders);

// --- ADMIN ROUTES ---
router.post('/admin/dispatch', authMiddleware, isAdminMiddleware, dispatchOrder);
router.get('/admin/all', authMiddleware, isAdminMiddleware, getAllAdminOrders);
router.post('/admin/update-status', authMiddleware, isAdminMiddleware, updateOrderStatus);
router.delete('/admin/delete-order/:orderId', authMiddleware, isAdminMiddleware, deleteOrder);

module.exports = router;