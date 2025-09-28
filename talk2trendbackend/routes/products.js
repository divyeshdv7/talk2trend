const express = require('express');
const router = express.Router();
const Product = require('../models/product');

// GET all products


// GET /api/products?limit=4
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 0; // default: no limit
    const products = await Product.find().limit(limit);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
