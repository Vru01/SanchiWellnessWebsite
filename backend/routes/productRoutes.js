const express = require('express');
const router = express.Router();
const { authMiddleware, isAdminMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload'); // <-- IMPORT UPLOAD MIDDLEWARE
const { 
    getAllProducts, 
    addProduct, 
    updateProduct, 
    deleteProduct 
} = require('../controllers/productController');

// PUBLIC ROUTE
router.get('/', getAllProducts);

// ADMIN PROTECTED ROUTES
// Add upload.array('images', 5) to handle the Cloudinary files
router.post('/admin/add', authMiddleware, isAdminMiddleware, upload.array('images', 5), addProduct);
router.put('/admin/update/:id', authMiddleware, isAdminMiddleware, updateProduct);
router.delete('/admin/delete/:id', authMiddleware, isAdminMiddleware, deleteProduct);

module.exports = router;