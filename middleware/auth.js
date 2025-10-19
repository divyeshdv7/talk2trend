const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ✅ CHANGE THIS - Import from authMiddleware.js (not auth.js)
const authMiddleware = require('../middleware/authMiddleware');

// Your routes...
router.get('/dashboard', authMiddleware, dashboard);

module.exports = router;
