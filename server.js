const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const path = require('path');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profileRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const orderRoutes = require('./routes/orderRoutes');

const Cart = require('./models/cart');
const authMiddleware = require('./middleware/authMiddleware');

dotenv.config();

// ✅ Add this to check if .env is loaded
console.log('🔑 Razorpay Key ID:', process.env.RAZORPAY_KEY_ID ? '✅ Loaded' : '❌ Missing');
console.log('🔑 MongoDB URI:', process.env.MONGO_URI ? '✅ Loaded' : '❌ Missing');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../talk2trendfrontend')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../talk2trendfrontend/login.html'));
});

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch((err) => console.error('❌ MongoDB Connection Error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/orders', orderRoutes);

// Cart routes
app.get('/api/cart', authMiddleware, async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');
        if (!cart) {
            cart = new Cart({ userId: req.user.id, items: [] });
            await cart.save();
        }
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch cart' });
    }
});

app.post('/api/cart/add', authMiddleware, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        let cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) {
            cart = new Cart({ userId: req.user.id, items: [] });
        }
        const existingItem = cart.items.find(item => item.productId.toString() === productId);
        if (existingItem) {
            existingItem.quantity += quantity || 1;
        } else {
            cart.items.push({ productId, quantity: quantity || 1 });
        }
        await cart.save();
        cart = await Cart.findById(cart._id).populate('items.productId');
        res.json({ message: 'Product added to cart', cart });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add to cart' });
    }
});

app.put('/api/cart/update', authMiddleware, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const cart = await Cart.findOne({ userId: req.user.id });
        const item = cart.items.find(item => item.productId.toString() === productId);
        item.quantity = quantity;
        await cart.save();
        const updatedCart = await Cart.findById(cart._id).populate('items.productId');
        res.json({ message: 'Cart updated', cart: updatedCart });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update cart' });
    }
});

app.delete('/api/cart/remove/:productId', authMiddleware, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id });
        cart.items = cart.items.filter(item => item.productId.toString() !== req.params.productId);
        await cart.save();
        const updatedCart = await Cart.findById(cart._id).populate('items.productId');
        res.json({ message: 'Item removed from cart', cart: updatedCart });
    } catch (error) {
        res.status(500).json({ message: 'Failed to remove from cart' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`💳 Razorpay: ${process.env.RAZORPAY_KEY_ID ? '✅' : '❌'}`);
});
