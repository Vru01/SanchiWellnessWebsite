const express = require('express');
const router = express.Router();
const { authMiddleware, isAdminMiddleware } = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
const upload = require('../middleware/upload');
const {
    getAllProducts,
    getAllProductsAdmin,
    addProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');

// PUBLIC ROUTE — tier-aware pricing (guest = normal, logged-in = their tier)
router.get('/', optionalAuth, getAllProducts);

// ADMIN PROTECTED ROUTES
router.get('/admin/all', authMiddleware, isAdminMiddleware, getAllProductsAdmin);
router.post('/admin/add', authMiddleware, isAdminMiddleware, upload.array('images', 5), addProduct);
router.put('/admin/update/:id', authMiddleware, isAdminMiddleware, updateProduct);
router.delete('/admin/delete/:id', authMiddleware, isAdminMiddleware, deleteProduct);

module.exports = router;