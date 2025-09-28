// models/Cart.js

const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Reference to your Product model
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1, // Quantity should always be at least 1
        default: 1
    }
}, { _id: false }); // Do not create a separate _id for sub-documents

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to your User model
        required: true,
        unique: true // A user should only have one cart document
    },
    items: [cartItemSchema] // Array of cart items
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
