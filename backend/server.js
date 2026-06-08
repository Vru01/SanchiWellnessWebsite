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
const Product = require('./models/Product');

const app = express();
const PORT = process.env.PORT || 5000;

// --- SECURITY MIDDLEWARE ---
app.use(helmet());

const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = isProduction 
  ? ['https://sanchiwellness.com', 'https://www.sanchiwellness.com']
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

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
    .then(() => {
        console.log('✅ Connected to MongoDB Atlas');
        // seedProducts();
    })
    .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// --- SEED DATA (Updated to match new Production Schema) ---
const seedProducts = async () => {
    try {

        // 2. Format with the new schema requirements
        const formatProduct = (name, desc, price, cat, imgUrl, tag) => ({
            name,
            slug: name.toLowerCase().replace(/ /g, '-'),
            description: desc,
            price,
            category: cat,
            images: [{ url: imgUrl }], 
            shippingDetails: { weight: 500 }, 
            isActive: true, // <-- This ensures productController finds them!
            tag: tag || null
        });

        const products = [
            formatProduct("Ambrosia", "Mix berries (without sugar) - Antioxidant Rich", 1980, "Wellness", "https://res.cloudinary.com/dfqgwgehn/image/upload/v1768055648/Ambrosia_ebsvoz.jpg", "Premium"),
            formatProduct("Male Might 10 Caps", "Men's Capsule - Extreme Satisfaction", 1600, "Men's Health", "https://res.cloudinary.com/dfqgwgehn/image/upload/v1767969563/P1_gw0rtq.jpg", "Best Seller"),
            formatProduct("Male Might 30 Caps", "Men's Capsule - Monthly Pack", 4500, "Men's Health", "https://res.cloudinary.com/dfqgwgehn/image/upload/v1767969563/P1_gw0rtq.jpg", "Value Pack"),
            formatProduct("Virility Maxx", "Sperm Capsule (30 Cap) - Vitality Booster", 1500, "Men's Health", "https://res.cloudinary.com/dfqgwgehn/image/upload/v1767969562/P2_rnqzem.jpg", "Trending"),
            formatProduct("Piyoosh", "Pure Cow Colostrum (30 Tab)", 800, "Immunity", "https://res.cloudinary.com/dfqgwgehn/image/upload/v1767969562/P4_gjkkw5.jpg", "Natural"),
            formatProduct("Aspire Glow Soap", "Cream Soft Soap (75 gm)", 80, "Bath & Body", "https://res.cloudinary.com/dfqgwgehn/image/upload/v1767969562/P8_jmucip.jpg", "Daily Use"),
            formatProduct("Aspire Face Wash", "Charcoal Face Wash (100ml)", 280, "Face Care", "https://res.cloudinary.com/dfqgwgehn/image/upload/v1767969579/P9_vc69ms.jpg", "Deep Cleanse"),
            formatProduct("Blossom Care", "Vaginal Wash (100 ml) - Intimate Hygiene", 380, "Personal Care", "https://res.cloudinary.com/dfqgwgehn/image/upload/v1767969563/P6_akilmv.jpg", "Hygiene"),
            formatProduct("Wild Roots", "Anti Hair Fall Shampoo (200 ml)", 320, "Hair Care", "https://res.cloudinary.com/dfqgwgehn/image/upload/v1767969563/P5_yu19ca.jpg", "Herbal"),
            formatProduct("Aloe Aura", "Aloe Vera Gel (100 ml) - Soothe & Glow", 320, "Skin Care", "https://res.cloudinary.com/dfqgwgehn/image/upload/v1767969562/P3_r2frvm.jpg", null),
            formatProduct("Vita-Maxx Men", "Men's Multivitamin (60 Tab)", 1400, "Supplements", "https://res.cloudinary.com/dfqgwgehn/image/upload/v1768055647/Men_VitaMax_rx6cxx.jpg", "New"),
            formatProduct("Vita-Maxx Women", "Women's Multivitamin (60 Tab)", 1400, "Supplements", "https://res.cloudinary.com/dfqgwgehn/image/upload/v1768055647/Women_Vita-Max_oaont4.jpg", "New")
        ];
        
        await Product.insertMany(products);
        console.log("✅ Products seeded successfully with new schemas.");

    } catch (err) {
        console.error("❌ Seeding error:", err);
    }
};
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
    requester.get(`${BACKEND_URL}/`, (res) => {
        console.log(`🔄 Keep-alive ping sent → status ${res.statusCode}`);
    }).on('error', (err) => {
        console.error('❌ Keep-alive ping failed:', err.message);
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});