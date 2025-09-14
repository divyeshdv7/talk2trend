const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("../models/product");

dotenv.config({ path: "../.env" });

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error("❌ MONGO_URI not found in .env");
  process.exit(1);
}

// 5 curated products (shoes and watches) with working .jpg image URLs
const products = [
  {
    name: "Men's Sneakers",
    description: "Stylish and comfortable sneakers for everyday wear.",
    price: 2999,
    image: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg",
    category: "Men",
    stock: 25
  },
  {
    name: "Women's Heels",
    description: "Elegant heels perfect for parties and formal events.",
    price: 2799,
    image: "https://images.pexels.com/photos/2529147/pexels-photo-2529147.jpeg",
    category: "Women",
    stock: 20
  },
  {
    name: "Kid's Shoes",
    description: "Durable and fun shoes for active kids.",
    price: 1599,
    image: "https://images.pexels.com/photos/1456734/pexels-photo-1456734.jpeg",
    category: "Kids",
    stock: 18
  },
  {
    name: "Men's Watch",
    description: "Luxury men's watch with leather strap.",
    price: 4999,
    image: "https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg",
    category: "Men",
    stock: 10
  },
  {
    name: "Women's Watch",
    description: "Stylish watch for women with metallic finish.",
    price: 4499,
    image: "https://images.pexels.com/photos/277319/pexels-photo-277319.jpeg",
    category: "Women",
    stock: 12
  },

  {
    name: "Jordan A1",
    description: "Nike Air-1",
    price: 14499,
    image: "https://images.pexels.com/photos/2385477/pexels-photo-2385477.jpeg",
    category: "Men",
    stock: 100
  }

];

// Seed to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB");
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log("🎉 Successfully inserted 5 products with working images");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error connecting to MongoDB:", err.message);
    process.exit(1);
  });
