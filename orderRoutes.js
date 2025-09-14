// routes/orderRoutes.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // Assuming this path is correct
const Order = require('../models/order'); // Assuming this path is correct
const Cart = require('../models/cart'); // You'll need your Cart model to clear it after order

// Assuming you have a Product model to reference in cart/order for item details
// const Product = require('../models/Product'); // uncomment if needed for populating cart directly in this file

// --- PLACE ORDER ROUTE ---
router.post('/place-order', authMiddleware, async (req, res) => {
    console.log('Received order request body:', req.body); // <-- IMPORTANT DEBUGGING STEP

    try {
        const userId = req.user.id; // User ID from the authenticated token

        // Destructure all necessary fields from req.body
        const { items, totalAmount, shippingAddress, paymentMethod, deliveryDate } = req.body;

        // Basic validation for critical fields received from frontend
        // Mongoose schema will do more detailed validation on save
        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty. No items to place an order.' });
        }
        if (typeof totalAmount !== 'number' || totalAmount <= 0) {
            return res.status(400).json({ message: 'Invalid total amount.' });
        }
        if (!shippingAddress) {
            return res.status(400).json({ message: 'Shipping address is required.' });
        }

        // Create the new order document
        const newOrder = new Order({
            userId: userId,
            items: items.map(item => ({
                productId: item.productId,
                name: item.name,
                price: item.price,
                image: item.image,
                quantity: item.quantity
            })),
            totalAmount: totalAmount,
            // Directly assign the received shippingAddress object.
            // Mongoose will validate its sub-fields based on the schema.
            shippingAddress: {
                fullName: shippingAddress.fullName,
                phoneNumber: shippingAddress.phoneNumber,
                street: shippingAddress.street,
                size:shippingAddress.size,
                city: shippingAddress.city,
                state: shippingAddress.state,
                zipCode: shippingAddress.zipCode,
                country: shippingAddress.country
            },
            paymentMethod: paymentMethod || 'Cash on Delivery', // Default if not provided
            deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined, // Convert to Date object if provided
            status: 'pending' // Initial status for a new order
        });

        // Save the order to the database
        await newOrder.save();

        // --- Important: Clear the user's cart after a successful order ---
        // Assuming your Cart model uses userId to identify the cart
        const userCart = await Cart.findOne({ userId: userId });
        if (userCart) {
            userCart.items = []; // Clear the items array in the cart
            await userCart.save(); // Save the empty cart
        }

        // Respond with success message and order ID
        res.status(201).json({
            message: 'Order placed successfully!',
            orderId: newOrder._id,
            totalAmount: newOrder.totalAmount
        });

    } catch (error) {
        console.error('Error placing order:', error);

        // Handle Mongoose validation errors specifically
        if (error.name === 'ValidationError') {
            const errors = {};
            for (let field in error.errors) {
                errors[field] = error.errors[field].message;
            }
            return res.status(400).json({ message: 'Order validation failed', errors });
        }

        // Generic server error
        res.status(500).json({ message: 'Server error' });
    }
});

// ... other order routes like fetching user orders, getting a single order etc.

module.exports = router;