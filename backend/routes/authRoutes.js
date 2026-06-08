const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { signup, login, updateProfile } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

// SIGNUP Route
router.post('/signup', [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').optional().matches(/^\d{10}$/).withMessage('Phone must be 10 digits')
], signup);

// LOGIN Route
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required')
], login);

router.put('/update-profile', authMiddleware, [
  body('name').trim().notEmpty().withMessage('Name field cannot be left empty'),
  body('phone').matches(/^\d{10}$/).withMessage('Provide a valid 10-digit phone number')
], updateProfile);

module.exports = router;