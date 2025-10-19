// routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');
const authenticateToken = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer configuration for avatar uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/avatars/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) return cb(null, true);
        cb(new Error('Only image files are allowed!'));
    }
});

// GET /api/profile - Get complete profile
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const stats = {
            totalOrders: user.orders?.length || 0,
            loyaltyPoints: user.loyaltyPoints || 0,
            accountAge: user.getAccountAge ? user.getAccountAge() : 0
        };

        res.json({ success: true, user, stats });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// PUT /api/profile - Update profile
router.put('/', auth, async (req, res) => {
    try {
        const { firstName, lastName, phone, dateOfBirth, gender, bio, language, location } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (firstName !== undefined) user.firstName = firstName;
        if (lastName !== undefined) user.lastName = lastName;
        if (firstName || lastName) {
            user.name = `${firstName || user.firstName || ''} ${lastName || user.lastName || ''}`.trim();
        }
        if (phone !== undefined) user.phone = phone;
        if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
        if (gender !== undefined) user.gender = gender;
        if (bio !== undefined) user.bio = bio;
        if (language !== undefined) user.language = language;
        if (location !== undefined) user.location = location;

        await user.save();
        res.json({ success: true, message: 'Profile updated successfully', user });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// POST /api/profile/avatar - Upload avatar
router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Delete old avatar
        if (user.avatar) {
            const oldPath = path.join(__dirname, '..', user.avatar);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }

        user.avatar = `/uploads/avatars/${req.file.filename}`;
        await user.save();

        res.json({ success: true, message: 'Avatar uploaded successfully', avatar: user.avatar });
    } catch (error) {
        console.error('Avatar upload error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// PUT /api/profile/password - Change password
router.put('/password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Provide both passwords' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        user.passwordChangedAt = Date.now();
        await user.save();

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// PUT /api/profile/preferences - Update preferences
router.put('/preferences', auth, async (req, res) => {
    try {
        const { emailNotifications, smsNotifications, marketing, darkMode } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!user.preferences) user.preferences = {};
        if (emailNotifications !== undefined) user.preferences.emailNotifications = emailNotifications;
        if (smsNotifications !== undefined) user.preferences.smsNotifications = smsNotifications;
        if (marketing !== undefined) user.preferences.marketing = marketing;
        if (darkMode !== undefined) user.preferences.darkMode = darkMode;

        await user.save();
        res.json({ success: true, message: 'Preferences updated', preferences: user.preferences });
    } catch (error) {
        console.error('Preferences update error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// POST /api/profile/addresses - Add address
router.post('/addresses', auth, async (req, res) => {
    try {
        const { label, name, street, landmark, city, state, pincode, country, isDefault } = req.body;

        if (!label || !name || !street || !city || !state || !pincode) {
            return res.status(400).json({ success: false, message: 'All required fields needed' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const makeDefault = !user.addresses || user.addresses.length === 0 || isDefault;
        if (makeDefault && user.addresses) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        const newAddress = { 
            label, name, street, landmark, city, state, pincode, 
            country: country || 'India', 
            isDefault: makeDefault 
        };
        
        if (!user.addresses) user.addresses = [];
        user.addresses.push(newAddress);
        await user.save();

        res.json({ success: true, message: 'Address added', address: user.addresses[user.addresses.length - 1] });
    } catch (error) {
        console.error('Address add error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// PUT /api/profile/addresses/:addressId - Update address
router.put('/addresses/:addressId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const address = user.addresses.id(req.params.addressId);
        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        Object.keys(req.body).forEach(key => {
            if (req.body[key] !== undefined) address[key] = req.body[key];
        });

        if (req.body.isDefault === true) {
            user.addresses.forEach(addr => {
                if (addr._id.toString() !== req.params.addressId) addr.isDefault = false;
            });
        }

        await user.save();
        res.json({ success: true, message: 'Address updated', address });
    } catch (error) {
        console.error('Address update error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// DELETE /api/profile/addresses/:addressId - Delete address
router.delete('/addresses/:addressId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === req.params.addressId);
        if (addressIndex === -1) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        user.addresses.splice(addressIndex, 1);
        await user.save();

        res.json({ success: true, message: 'Address deleted' });
    } catch (error) {
        console.error('Address delete error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// DELETE /api/profile - Delete account
router.delete('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.avatar) {
            const avatarPath = path.join(__dirname, '..', user.avatar);
            if (fs.existsSync(avatarPath)) fs.unlinkSync(avatarPath);
        }

        await User.findByIdAndDelete(req.user.id);
        res.json({ success: true, message: 'Account deleted' });
    } catch (error) {
        console.error('Account deletion error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

module.exports = router;
