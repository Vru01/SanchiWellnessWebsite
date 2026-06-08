const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// Helper function to generate JWT
const generateToken = (userId, email, role) => {
  return jwt.sign(
    { id: userId, email, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // You can keep 7d or use 30d
  );
};

// @desc    Register new user
exports.signup = async (req, res) => {
    // 1. Check for validation errors from the route
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone } = req.body;
    
    try {
        // 🔥 NEW Validation: Ensure phone exists and is a 10-digit number
        if (!phone || !/^\d{10}$/.test(phone)) {
          return res.status(400).json({ error: "A valid 10-digit phone number is required." });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ error: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userRole = (email === process.env.ADMIN_EMAIL) ? 'admin' : 'user';

        const newUser = new User({ 
          name, 
          email, 
          password: hashedPassword, 
          phone, // 🔥 Saved cleanly as a mandatory field
          role: userRole
        });
        
        await newUser.save();

        const token = generateToken(newUser._id, newUser.email, newUser.role);

        res.status(201).json({ 
          message: "User created successfully",
          token,
          user: { 
            id: newUser._id, 
            name: newUser.name, 
            email: newUser.email, 
            phone: newUser.phone,
            role: newUser.role
          } 
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: "An error occurred during signup" });
    }
};

// @desc    Login user
exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    
    try {
        const user = await User.findOne({ email });
        if (!user) {
          return res.status(400).json({ error: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(400).json({ error: "Invalid password" });
        }

        const token = generateToken(user._id, user.email, user.role);

        res.json({ 
            message: "Login successful",
            token,
            user: { 
              id: user._id, 
              name: user.name, 
              email: user.email, 
              phone: user.phone,
              role: user.role
            } 
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: "An error occurred during login" });
    }
};

// @desc    Update User Profile Information
exports.updateProfile = async (req, res) => {
    // 🔥 Catch express-validator array errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { name, phone } = req.body;
    const userId = req.userId; // Provided securely by authMiddleware

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User profile record not found." });

        user.name = name.trim();
        user.phone = phone;
        await user.save();

        res.json({
            success: true,
            user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role }
        });
    } catch (err) {
        console.error("Profile Edit Target Error:", err);
        res.status(500).json({ error: "Failed to update profile changes on server." });
    }
};