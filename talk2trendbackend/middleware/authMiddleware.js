const jwt = require('jsonwebtoken');
// No need for dotenv.config() here if it's already at the very top of server.js,
// as process.env variables are global once loaded.
// If you uncomment this line, make sure it's necessary and doesn't conflict.
// require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET; // This reads the secret from environment variables

const authMiddleware = (req, res, next) => {
    // --- Start Debugging Logs ---
    console.log("--> authMiddleware: Request received for protected route.");
    console.log("--> authMiddleware: Full Authorization Header:", req.header('Authorization'));
    // --- End Debugging Logs ---

    const authHeader = req.header('Authorization');

    // Case 1: No Authorization header at all
    if (!authHeader) {
        console.log("--> authMiddleware: No Authorization header provided. Access denied.");
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Ensure it starts with 'Bearer ' and extract the token
    const token = authHeader.replace('Bearer ', '');

    // Case 2: Authorization header exists but token is empty/malformed after 'Bearer ' removal
    if (!token || token.length < 10) { // Basic check for malformed token
        console.log("--> authMiddleware: Token is empty or too short after 'Bearer ' removal. Access denied.");
        return res.status(401).json({ message: 'Access denied. Malformed token.' });
    }

    // --- Start Debugging Logs ---
    // Log first few characters of the token to confirm it's being extracted
    console.log("--> authMiddleware: Token extracted (first 10 chars):", token.substring(0, 10) + '...');
    // --- End Debugging Logs ---

    // Case 3: JWT_SECRET itself is not defined (critical server configuration error)
    if (!JWT_SECRET) {
        console.error("🚨 --> authMiddleware: CRITICAL ERROR: JWT_SECRET is not defined in environment variables!");
        console.error("🚨 Please ensure you have a .env file at your backend root with JWT_SECRET=YOUR_SECRET_KEY, and require('dotenv').config() at the top of server.js.");
        return res.status(500).json({ message: 'Server configuration error: JWT secret not set.' });
    }

    // Case 4: Attempt to verify the token
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Attaches the decoded payload (e.g., { id: user._id }) to req.user
        console.log("✅ --> authMiddleware: Token successfully decoded for user ID:", req.user.id);
        next(); // Proceed to the next middleware/route handler
    } catch (err) {
        // Case 5: JWT verification failed (expired, invalid signature, malformed)
        console.error("❌ --> authMiddleware: JWT verification failed! Error type:", err.name, "Message:", err.message);

        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired. Please log in again.' });
        } else if (err.name === 'JsonWebTokenError') {
            // This covers 'invalid signature', 'jwt malformed', etc.
            return res.status(403).json({ message: 'Invalid token. Authorization failed.' });
        } else {
            // Generic error for other unexpected JWT issues
            return res.status(500).json({ message: 'An unexpected error occurred during token verification.' });
        }
    }
};

module.exports = authMiddleware;
