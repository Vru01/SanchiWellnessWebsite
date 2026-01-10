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
    .then(() => {
        console.log('✅ Connected to MongoDB Atlas');
        seedProducts(); // Run seeding after connection
    })
    .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// --- SEED DATA  ---
const seedProducts = async () => {
    try {
        const count = await Product.countDocuments();
        
        // CHECK: Only seed if the database is completely empty
        if (count === 0) {
            console.log("Database empty. Seeding products...");

            const products = [
                { 
                    name: "Ambrosia", 
                    description: "Mix berries (without sugar) - Antioxidant Rich", 
                    price: 1980, 
                    category: "Wellness", 
                    img: "https://res.cloudinary.com/dfqgwgehn/image/upload/v1768055648/Ambrosia_ebsvoz.jpg", 
                    tag: "Premium" 
                },
                { 
                    name: "Male Might (10 Caps)", 
                    description: "Men's Capsule - Extreme Satisfaction", 
                    price: 1600, 
                    category: "Men's Health", 
                    img: "https://res.cloudinary.com/dfqgwgehn/image/upload/v1767969563/P1_gw0rtq.jpg", 
                    tag: "Best Seller" 
                },
                { 
                    name: "Male Might (30 Caps)", 
                    description: "Men's Capsule - Monthly Pack", 
                    price: 4500, 
                    category: "Men's Health", 
                    img: "https://res.cloudinary.com/dfqgwgehn/image/upload/v1767969563/P1_gw0rtq.jpg", 
                    tag: "Value Pack" 
                },
                { 
                    name: "Virility Maxx", 
                    description: "Sperm Capsule (30 Cap) - Vitality Booster", 
                    price: 1500, 
                    category: "Men's Health", 
                    img: "https://res.cloudinary.com/dfqgwgehn/image/upload/v1767969562/P2_rnqzem.jpg", 
                    tag: "Trending" 
                },
                { 
                    name: "Piyoosh", 
                    description: "Pure Cow Colostrum (30 Tab)", 
                    price: 800, 
                    category: "Immunity", 
                    img: "https://res.cloudinary.com/dfqgwgehn/image/upload/v1767969562/P4_gjkkw5.jpg", 
                    tag: "Natural" 
                },
                { 
                    name: "Aspire Glow Soap", 
                    description: "Cream Soft Soap (75 gm)", 
                    price: 80, 
                    category: "Bath & Body", 
                    img: "https://res.cloudinary.com/dfqgwgehn/image/upload/v1767969562/P8_jmucip.jpg", 
                    tag: "Daily Use" 
                },
                { 
                    name: "Aspire Face Wash", 
                    description: "Charcoal Face Wash (100ml)", 
                    price: 280, 
                    category: "Face Care", 
                    img: "https://res.cloudinary.com/dfqgwgehn/image/upload/v1767969579/P9_vc69ms.jpg", 
                    tag: "Deep Cleanse" 
                },
                { 
                    name: "Blossom Care", 
                    description: "Vaginal Wash (100 ml) - Intimate Hygiene", 
                    price: 380, 
                    category: "Personal Care", 
                    img: "https://res.cloudinary.com/dfqgwgehn/image/upload/v1767969563/P6_akilmv.jpg", 
                    tag: "Hygiene" 
                },
                { 
                    name: "Wild Roots", 
                    description: "Anti Hair Fall Shampoo (200 ml)", 
                    price: 320, 
                    category: "Hair Care", 
                    img: "https://res.cloudinary.com/dfqgwgehn/image/upload/v1767969563/P5_yu19ca.jpg", 
                    tag: "Herbal" 
                },
                { 
                    name: "Aloe Aura", 
                    description: "Aloe Vera Gel (100 ml) - Soothe & Glow", 
                    price: 320, 
                    category: "Skin Care", 
                    img: "https://res.cloudinary.com/dfqgwgehn/image/upload/v1767969562/P3_r2frvm.jpg", 
                    tag: null 
                },
                { 
                    name: "Vita-Maxx Men", 
                    description: "Men's Multivitamin (60 Tab)", 
                    price: 1400, 
                    category: "Supplements", 
                    img: "https://res.cloudinary.com/dfqgwgehn/image/upload/v1768055647/Men_VitaMax_rx6cxx.jpg", 
                    tag: "New" 
                },
                { 
                    name: "Vita-Maxx Women", 
                    description: "Women's Multivitamin (60 Tab)", 
                    price: 1400, 
                    category: "Supplements", 
                    img: "https://res.cloudinary.com/dfqgwgehn/image/upload/v1768055647/Women_Vita-Max_oaont4.jpg", 
                    tag: "New" 
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