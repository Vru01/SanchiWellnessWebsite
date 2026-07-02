require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const https = require('https');
const http = require('http');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import Routes & Middleware
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// --- SECURITY MIDDLEWARE ---
app.use(helmet());

app.use(cors({
  origin: ['https://sanchiwellness.com', 'https://www.sanchiwellness.com'],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// --- PRODUCTION DUAL-LAYER RATE LIMITERS ---

// 1. Loose Catalog Read Limiter (Handles multiple concurrent component fetches like BestSellers & ProductSection)
const catalogReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 450, // Raised to allow high-frequency page browsing and filtering safely
  message: 'Too many catalog views from this IP, please try again in a few minutes.'
});

// 2. Secure Transaction Limiter (Protects database writes from brute-force bot spam)
const secureTransactionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, 
  message: 'Too many operations from this IP, please try again later.'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, 
  skipSuccessfulRequests: true,
  message: 'Too many login attempts, please try again later.'
});

app.use(express.json());

// --- MONGODB CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// --- USE ROUTES ---
app.get('/', (req, res) => res.json({ status: 'ok', service: 'Sanchi Wellness API' }));

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', catalogReadLimiter, productRoutes);      // 🟢 Uses the loose read configuration
app.use('/api/cart', secureTransactionLimiter, cartRoutes);             // 🔒 Protected write route
app.use('/api/orders', secureTransactionLimiter, orderRoutes);          // 🔒 Protected write route

// --- GLOBAL ERROR HANDLER ---
app.use(errorHandler);

// --- KEEP ALIVE CRON ---
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;
cron.schedule('*/14 * * * *', () => {
    const url = new URL(BACKEND_URL);
    const requester = url.protocol === 'https:' ? https : http;
    requester.get(BACKEND_URL, (res) => {
        console.log(`🔄 Keep-alive ping sent → status ${res.statusCode}`);
    }).on('error', (err) => {
        console.error('❌ Keep-alive ping failed:', err.message);
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});