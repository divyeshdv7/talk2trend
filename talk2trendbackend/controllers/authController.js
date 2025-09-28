const User = require('../models/User');
// Make sure to also require your Cart model here!
const Cart = require('../models/cart'); // <--- ADD THIS LINE
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

exports.signup = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ msg: 'Email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword });

        await user.save();
        res.status(201).json({ msg: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ msg: 'Signup error', error: err.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    console.log("Login attempt:", email, password);

    try {
        const user = await User.findOne({ email });

        if (!user) {
            console.log("❌ User not found");
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("❌ Incorrect password");
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // ✅ Check if JWT_SECRET exists
        if (!process.env.JWT_SECRET) {
            console.error("🚨 JWT_SECRET not set in .env");
            return res.status(500).json({ msg: 'JWT secret not configured' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        console.log("✅ Login successful");
        res.json({ msg: 'Login successful', token, name: user.name });

    } catch (err) {
        console.error("🚨 Login error:", err.message);
        res.status(500).json({ msg: 'Login error', error: err.message });
    }
};


exports.dashboard = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate({
                path: 'cart', // Populate the user's 'cart' field (which is a reference to a Cart document)
                populate: {
                    path: 'items.product', // And inside the Cart document, populate the 'product' field of each item
                    model: 'Product' // Specify the model for 'product' if Mongoose can't infer it
                }
            })
            .populate('wishlist') // This assumes 'wishlist' is an array of Product ObjectIds directly on User
            .populate('orders') // Populate orders if you want to access details
            .select('-password');

        if (!user) return res.status(404).json({ msg: 'User not found' });

        let cartItemCount = 0;
        // Check if a cart exists and if it has items
        if (user.cart && user.cart.items && user.cart.items.length > 0) {
            // Sum the quantities of all items in the cart
            cartItemCount = user.cart.items.reduce((total, item) => total + item.quantity, 0);
        }

        let recentOrdersData = [];
        if (user.orders && user.orders.length > 0) {
            // Sort by creation date if 'createdAt' is available in Order schema
            const sortedOrders = user.orders.sort((a, b) => b.createdAt - a.createdAt);
            recentOrdersData = sortedOrders.slice(0, 3).map(order => ({
                orderId: order._id, // Or a specific order number if you have one
                orderDate: order.createdAt,
                items: order.items, // Assuming Order schema has an 'items' array
                status: order.status || 'Delivered' // Or whatever your order status field is
            }));
        }

        res.status(200).json({
            name: user.name,
            email: user.email,
            joined: user.createdAt,
            cartCount: cartItemCount, // This will now reflect the total number of items by quantity
            wishlistCount: user.wishlist?.length || 0, // This should already work if wishlist is an array of Product IDs
            orderCount: user.orders?.length || 0,
            recentOrders: recentOrdersData
        });

    } catch (err) {
        console.error("🚨 Dashboard error:", err.message);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};