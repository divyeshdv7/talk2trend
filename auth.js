const express = require('express');
const { signup, login,dashboard } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');


const router = express.Router();

// Signup route
router.post('/signup', signup);

// Login route
router.post('/login', login);


// ✅ Protected Route for Dashboard
router.get('/dashboard', authMiddleware, dashboard);

module.exports = router;





