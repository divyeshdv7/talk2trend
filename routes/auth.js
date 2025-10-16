const express = require('express');
const { signup, login } = require('../controllers/authController');

const router = express.Router();

// Signup route
router.post('/signup', signup);

// Login route
router.post('/login', login);


// ✅ Protected Route for Dashboard
router.get('/dashboard', authMiddleware, dashboard);

module.exports = router;





