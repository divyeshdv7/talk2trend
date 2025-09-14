// routes/cartRoutes.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // Your authentication middleware
const Cart = require('../models/cart'); // Your Cart model (ensure path is correct)
const Product = require('../models/product'); // Your Product model (needed for validation/population)

// Assuming you have cartController for addToCart and getCart,
// but for increment/decrement/remove, direct logic is fine or can be moved to controller later.
// const cartController = require('../controllers/cartController');


// @route   POST /api/cart/add
// @desc    Add a product to the user's cart
// @access  Private
// If you're using a cartController, make sure this maps to your controller function:
// router.post('/add', authMiddleware, cartController.addToCart);
// Otherwise, include the direct logic here:
router.post('/add', authMiddleware, async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    try {
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        const productExists = await Product.findById(productId);
        if (!productExists) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({ productId, quantity });
        }

        await cart.save();
        cart = await cart.populate('items.productId');
        res.status(200).json({ message: 'Product added to cart successfully!', cart });

    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ message: 'Server error. Could not add product to cart.' });
    }
});


// @route   GET /api/cart
// @desc    Get the user's cart contents
// @access  Private
// If you're using a cartController, make sure this maps to your controller function:
// router.get('/', authMiddleware, cartController.getCart);
// Otherwise, include the direct logic here:
router.get('/', authMiddleware, async (req, res) => {
    const userId = req.user.id;

    try {
        const cart = await Cart.findOne({ userId }).populate('items.productId');

        if (!cart) {
            return res.status(200).json({ items: [] });
        }

        // Format items for frontend, ensuring populated product data is sent
        const formattedItems = cart.items.map(item => {
            if (!item.productId) {
                console.warn(`Product data missing for item ID: ${item._id} in cart.`);
                return null; // Handle cases where product might have been deleted
            }
            return {
                productId: item.productId, // This is the populated product object
                quantity: item.quantity,
                // You can also add direct properties if your frontend expects them
                name: item.productId.name,
                price: item.productId.price,
                image: item.productId.image
            };
        }).filter(item => item !== null); // Filter out any items where product data was missing

        res.status(200).json({ items: formattedItems });

    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: 'Server error. Could not fetch cart.' });
    }
});


// @route   POST /api/cart/update
// @desc    Update quantity of a product in the user's cart (increment/decrement)
// @access  Private
router.post('/update', authMiddleware, async (req, res) => {
    const { productId, change } = req.body; // 'change' will be +1 or -1
    const userId = req.user.id;

    if (typeof change !== 'number' || (change !== 1 && change !== -1)) {
        return res.status(400).json({ message: 'Invalid quantity change value. Must be 1 or -1.' });
    }

    try {
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found for this user.' });
        }

        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

        if (itemIndex > -1) {
            // Item found, update quantity
            cart.items[itemIndex].quantity += change;

            // If quantity drops to 0 or less, remove the item
            if (cart.items[itemIndex].quantity <= 0) {
                cart.items.splice(itemIndex, 1); // Remove the item
                // If the cart becomes empty after removal, delete the cart document
                if (cart.items.length === 0) {
                    await Cart.deleteOne({ userId }); // Delete the cart document if empty
                    // Send an empty cart in response
                    return res.status(200).json({ message: 'Item removed and cart is now empty.', cart: { items: [] } });
                }
            }
            await cart.save();
            // Re-populate the cart to send updated product details back to the frontend
            cart = await cart.populate('items.productId');
            res.status(200).json({ message: 'Cart quantity updated successfully!', cart });

        } else {
            return res.status(404).json({ message: 'Product not found in cart.' });
        }

    } catch (error) {
        console.error('Error updating cart quantity:', error);
        res.status(500).json({ message: 'Server error. Could not update cart quantity.' });
    }
});


// @route   DELETE /api/cart/remove/:productId
// @desc    Remove a product from the user's cart
// @access  Private
router.delete('/remove/:productId', authMiddleware, async (req, res) => {
    const { productId } = req.params; // Get productId from URL parameter
    const userId = req.user.id;

    try {
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found for this user.' });
        }

        // Filter out the item to be removed
        const initialLength = cart.items.length;
        cart.items = cart.items.filter(item => item.productId.toString() !== productId);

        if (cart.items.length === initialLength) {
            // No item was removed, meaning productId was not found in cart
            return res.status(404).json({ message: 'Product not found in cart to remove.' });
        }

        // If cart becomes empty after removal, delete the cart document
        if (cart.items.length === 0) {
            await Cart.deleteOne({ userId });
            return res.status(200).json({ message: 'Item removed and cart is now empty.', cart: { items: [] } });
        }

        await cart.save();
        cart = await cart.populate('items.productId'); // Re-populate for the response
        res.status(200).json({ message: 'Product removed from cart successfully!', cart });

    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({ message: 'Server error. Could not remove product from cart.' });
    }
});


module.exports = router;