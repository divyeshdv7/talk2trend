// models/Order.js

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product', // Reference to your Product model
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number, // Store price as a Number
        required: true
        // Consider using Decimal128 for financial data in production for precision
        // type: mongoose.Schema.Types.Decimal128
    },
    image: {
        type: String, // URL to the product image
        required: false // Image might not always be critical for an order record
    },
    quantity: {
        type: Number,
        required: true,
        min: 1 // Ensure quantity is at least 1
    }
}, { _id: false }); // Do not create a separate _id for sub-documents (order items)

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to your User model
        required: true
    },
    items: [orderItemSchema], // Array of sub-documents using the orderItemSchema
    totalAmount: {
        type: Number,
        required: true
        // Consider using Decimal128 for financial data in production for precision
        // type: mongoose.Schema.Types.Decimal128
    },
    shippingAddress: { // --- UPDATED: Added fullName and phoneNumber ---
        fullName: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, required: true },
        size: { type: String, required: true },
    },
    paymentMethod: { // Optional: e.g., 'Credit Card', 'Cash on Delivery', 'UPI'
        type: String,
        default: 'Cash on Delivery' // Default for now
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
        default: 'pending',
        required: true
    },
    orderDate: {
        type: Date,
        default: Date.now, // Automatically set creation date
        required: true
    },
    deliveryDate: { // Optional: Estimated or actual delivery date
        type: Date
    },
    // Optional: Add a paymentIntentId if integrating with payment gateways like Stripe
    // paymentIntentId: {
    //     type: String
    // },
    // Optional: Reference to transaction if you have a separate Transaction model
    // transactionId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Transaction'
    // }
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps automatically
});

const Order = mongoose.model('order', orderSchema);

module.exports = Order;