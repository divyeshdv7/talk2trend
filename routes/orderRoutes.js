const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/cart');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// Place Order
router.post('/place-order', authMiddleware, async (req, res) => {
    try {
        const { items, totalAmount, shippingAddress, paymentDetails, deliveryDate } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No items in order' });
        }

        const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

        const order = new Order({
            userId: req.user.id,
            orderId,
            items,
            totalAmount,
            shippingAddress,
            paymentDetails,
            deliveryDate,
            status: 'pending'
        });

        await order.save();

        try {
            await User.findByIdAndUpdate(req.user.id, {
                $push: { orders: order._id }
            });
        } catch (err) {
            console.log('User orders array not updated');
        }

        await Cart.findOneAndUpdate(
            { userId: req.user.id },
            { items: [] }
        );

        console.log('✅ Order placed successfully:', orderId);
        res.status(201).json({
            message: 'Order placed successfully',
            orderId: order.orderId,
            order
        });
    } catch (error) {
        console.error('❌ Error placing order:', error);
        res.status(500).json({ 
            message: 'Failed to place order', 
            error: error.message 
        });
    }
});

// Get user orders
router.get('/', authMiddleware, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id })
            .populate('items.productId')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
});

// Get single order
router.get('/:orderId', authMiddleware, async (req, res) => {
    try {
        const order = await Order.findOne({ 
            orderId: req.params.orderId,
            userId: req.user.id 
        }).populate('items.productId');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'Failed to fetch order' });
    }
});

module.exports = router;
