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

// Rate limiters
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: 'Too many requests from this IP, please try again later.'
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
app.use('/api/products', limiter, productRoutes);      
app.use('/api/cart', limiter, cartRoutes);             
app.use('/api/orders', limiter, orderRoutes);          

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