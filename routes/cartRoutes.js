const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const cartController = require('../controllers/cartController');
const Cart = require('../models/cart');

// Add to cart (protected)
router.post('/add', authMiddleware, cartController.addToCart);

// Get cart (protected)
router.get('/', authMiddleware, cartController.getCart);

router.delete("/remove/:productId", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const productId = req.params.productId;

  try {
    const cart = await Cart.findOne({ userId: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    await cart.save();

    res.json({ message: "Item removed from cart", cart });
  } catch (err) {
    console.error("Remove Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
