require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const Product = require('./models/Product'); // For seeding

const app = express();
const PORT = process.env.PORT || 5000;

// --- MIDDLEWARE ---
app.use(cors({
  origin: [
    "https://sanchiwellness.com",
    "https://www.sanchiwellness.com"
  ]
}));

app.use(express.json());

// --- MONGODB CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// --- SEED DATA (Safe Mode) ---
const seedProducts = async () => {
    try {
        const count = await Product.countDocuments();
        
        // CHECK: Only seed if the database is completely empty
        if (count === 0) {
            console.log("Database empty. Seeding products...");

            const products = [
                { 
                    name: "Male Might", 
                    description: "Extreme Satisfaction", 
                    price: 899, 
                    category: "Men's Health", 
                    img: "https://res.cloudinary.com/dfqgwgehn/image/upload/v1767969563/P1_gw0rtq.jpg", 
                    tag: "Best Seller" 
                },
                { 
                    name: "Virility Maxx", 
                    description: "Vitality Booster", 
                    price: 749, 
                    category: "Men's Health", 
                    img: "https://res.cloudinary.com/dfqgwgehn/image/upload/v1767969562/P2_rnqzem.jpg", 
                    tag: "Trending" 
                },
                { 
                    name: "Piyoosh", 
                    description: "Pure Cow Colostrum", 
                    price: 699, 
                    category: "Immunity", 
                    img: "https://res.cloudinary.com/dfqgwgehn/image/upload/v1767969562/P4_gjkkw5.jpg", 
                    tag: null 
                },
                { 
                    name: "Wild Roots", 
                    description: "Anti Hair Fall Shampoo", 
                    price: 349, 
                    category: "Hair Care", 
                    img: "https://res.cloudinary.com/dfqgwgehn/image/upload/v1767969563/P5_yu19ca.jpg", 
                    tag: "Herbal" 
                },
                { 
                    name: "Aspire Face Wash", 
                    description: "Cucumber & Tea Tree", 
                    price: 249, 
                    category: "Face Care", 
                    img: "https://res.cloudinary.com/dfqgwgehn/image/upload/v1767969579/P9_vc69ms.jpg", 
                    tag: "Daily Use" 
                },
                { 
                    name: "Aloe Aura", 
                    description: "Soothe & Glow Gel", 
                    price: 199, 
                    category: "Skin Care", 
                    img: "https://res.cloudinary.com/dfqgwgehn/image/upload/v1767969562/P3_r2frvm.jpg", 
                    tag: null 
                },
                { 
                    name: "Blossom Care", 
                    description: "Intimate Hygiene Wash", 
                    price: 299, 
                    category: "Personal Care", 
                    img: "https://res.cloudinary.com/dfqgwgehn/image/upload/v1767969563/P6_akilmv.jpg", 
                    tag: null 
                },
                { 
                    name: "Aspire Saffron Soap", 
                    description: "Sandalwood & Saffron", 
                    price: 129, 
                    category: "Bath & Body", 
                    img: "https://res.cloudinary.com/dfqgwgehn/image/upload/v1767969562/P7_wemkns.jpg", 
                    tag: "Organic" 
                },
                { 
                    name: "Aspire Glow Soap", 
                    description: "Cream Soft Soap", 
                    price: 119, 
                    category: "Bath & Body", 
                    img: "https://res.cloudinary.com/dfqgwgehn/image/upload/v1767969562/P8_jmucip.jpg", 
                    tag: null 
                }
            ];
            
            await Product.insertMany(products);
            console.log("✅ Products seeded successfully.");
        } else {
            console.log("✅ Products already exist. Skipping seed.");
        }

    } catch (err) {
        console.error("❌ Seeding error:", err);
    }
};

// --- USE ROUTES ---
app.use('/api', authRoutes);         // Handles /api/login, /api/signup
app.use('/api/products', productRoutes); // Handles /api/products
app.use('/api/cart', cartRoutes);    // Handles /api/cart/...
app.use('/api', orderRoutes);        // Handles /api/checkout, /api/orders

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});