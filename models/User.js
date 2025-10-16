const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Address subdocument schema
const addressSchema = new mongoose.Schema({
    label: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    landmark: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    country: { type: String, default: 'India' },
    isDefault: { type: Boolean, default: false }
}, { timestamps: true });

// Preferences subdocument schema
const preferencesSchema = new mongoose.Schema({
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    marketing: { type: Boolean, default: true },
    darkMode: { type: Boolean, default: false }
});

// Main User Schema - YOUR ORIGINAL 3 FIELDS + ENHANCEMENTS
const userSchema = new mongoose.Schema({
    // YOUR ORIGINAL FIELDS (UNCHANGED)
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // ENHANCED PROFILE FIELDS (ALL OPTIONAL)
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    phone: { type: String, trim: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer-not-to-say', ''], default: '' },
    bio: { type: String, maxlength: 500 },
    avatar: { type: String, default: null },
    language: { type: String, enum: ['en', 'hi', 'mr', 'ta', 'te'], default: 'en' },
    location: {
        city: String,
        state: String,
        country: { type: String, default: 'India' }
    },
    
    // ACCOUNT STATUS
    isVerified: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },
    loyaltyPoints: { type: Number, default: 0, min: 0 },
    
    // SUBDOCUMENTS
    addresses: [addressSchema],
    preferences: { type: preferencesSchema, default: () => ({}) },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    
    // TIMESTAMPS
    lastLogin: { type: Date, default: Date.now },
    passwordChangedAt: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// MIDDLEWARE: Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        
        // Auto-split name into firstName/lastName
        if (this.name && !this.firstName) {
            const nameParts = this.name.trim().split(' ');
            this.firstName = nameParts[0];
            this.lastName = nameParts.slice(1).join(' ');
        }
        
        next();
    } catch (error) {
        next(error);
    }
});

// METHOD: Compare password for login
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
};

// METHOD: Update loyalty points
userSchema.methods.updateLoyaltyPoints = async function() {
    try {
        await this.populate('orders');
        const totalSpent = this.orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        this.loyaltyPoints = Math.floor(totalSpent / 100);
        return this.save();
    } catch (error) {
        throw new Error('Failed to update loyalty points');
    }
};

// METHOD: Get total spending
userSchema.methods.getTotalSpent = async function() {
    await this.populate('orders');
    return this.orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
};

// METHOD: Get account age in days
userSchema.methods.getAccountAge = function() {
    return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
};

// METHOD: Get default address
userSchema.methods.getDefaultAddress = function() {
    return this.addresses.find(addr => addr.isDefault) || this.addresses[0];
};

// VIRTUAL: Full name
userSchema.virtual('fullName').get(function() {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim() || this.name;
});

// INDEXES for faster queries
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
