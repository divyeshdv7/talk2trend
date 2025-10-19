const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const authMiddleware = require('../middleware/authMiddleware');

// ✅ Only initialize Razorpay if keys exist
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    const Razorpay = require('razorpay');
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
}

// Create Razorpay Order
router.post('/create-order', authMiddleware, async (req, res) => {
    try {
        // Check if Razorpay is configured
        if (!razorpay) {
            return res.status(503).json({ 
                message: 'Payment gateway not configured. Please add Razorpay keys to .env file' 
            });
        }

        const { amount, currency, receipt } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        const options = {
            amount: amount * 100,
            currency: currency || 'INR',
            receipt: receipt || `receipt_${Date.now()}`,
            payment_capture: 1
        };

        const order = await razorpay.orders.create(options);
        
        console.log('✅ Razorpay order created:', order.id);
        res.json(order);
    } catch (error) {
        console.error('❌ Error creating Razorpay order:', error);
        res.status(500).json({ 
            message: 'Failed to create payment order', 
            error: error.message 
        });
    }
});

// Verify Razorpay Payment
router.post('/verify', authMiddleware, async (req, res) => {
    try {
        if (!process.env.RAZORPAY_KEY_SECRET) {
            return res.status(503).json({ 
                message: 'Payment gateway not configured' 
            });
        }

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: 'Missing payment parameters' });
        }

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest('hex');

        if (razorpay_signature === expectedSign) {
            console.log('✅ Payment verified successfully');
            res.json({ 
                success: true, 
                message: 'Payment verified successfully',
                razorpay_payment_id
            });
        } else {
            console.log('❌ Invalid payment signature');
            res.status(400).json({ 
                success: false, 
                message: 'Invalid payment signature' 
            });
        }
    } catch (error) {
        console.error('❌ Error verifying payment:', error);
        res.status(500).json({ 
            message: 'Payment verification failed', 
            error: error.message 
        });
    }
});

module.exports = router;
