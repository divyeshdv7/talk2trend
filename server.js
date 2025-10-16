const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth'); // Your existing auth routes
const path = require('path');

// ✅ ADD THIS LINE - Import profile routes
const profileRoutes = require('./routes/profileRoutes');

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware
app.use(cors());           // Allow cross-origin requests
app.use(express.json());   // Parse JSON bodies

// ✅ ADD THIS LINE - Serve uploaded avatar files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Serve static files from frontend folder
app.use(express.static(path.join(__dirname, '../talk2trendfrontend')));

// ✅ Default route → show login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../talk2trendfrontend/login.html'));
});

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);

// ✅ ADD THIS LINE - Profile routes
app.use('/api/profile', profileRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
  



//