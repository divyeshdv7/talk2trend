const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });

    await user.save();
    res.status(201).json({ msg: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Signup error', error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt:", email, password);

  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.log("❌ User not found");
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Incorrect password");
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // ✅ Check if JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      console.error("🚨 JWT_SECRET not set in .env");
      return res.status(500).json({ msg: 'JWT secret not configured' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    console.log("✅ Login successful");
    res.json({ msg: 'Login successful', token });

  } catch (err) {
    console.error("🚨 Login error:", err.message);
    res.status(500).json({ msg: 'Login error', error: err.message });
  }
};


exports.dashboard = async (req, res) => {
  try {
    // req.user is set by authMiddleware (contains id from token)
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.status(200).json({ msg: `Welcome to your dashboard, ${user.name}!` });
  } catch (err) {
    console.error("🚨 Dashboard error:", err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

