const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config(); 

const authRoutes = require('./routes/auth'); // Make sure this file exists!
const path = require('path');



// Load environment variables from .env file
dotenv.config();

const app = express();




// Middleware
app.use(cors());           // Allow cross-origin requests
app.use(express.json());   // Parse JSON bodies

// ✅ Serve static files from frontend folder
app.use(express.static(path.join(__dirname, '../talk2trendfrontend')));

// ✅ Default route → show login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../talk2trendfrontend/login.html'));
});


// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);

const productRoutes = require('./routes/products');
app.use('/api/products', productRoutes);

const cartRoutes = require('./routes/cartRoutes');
app.use('/api/cart', cartRoutes);

const orderRoutes = require('./routes/orderRoutes');
app.use('/api/orders',  orderRoutes);// Order routes usually require authentication










// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
