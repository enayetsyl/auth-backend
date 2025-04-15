"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
/**
 * Middleware to validate JWT tokens and protect routes.
 * The token should be provided in the Authorization header as "Bearer <token>".
 */
const authMiddleware = (req, res, next) => {
    // Retrieve the token from the Authorization header
    const authHeader = req.headers.authorization;
    // Check if the Authorization header exists and starts with 'Bearer'
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Unauthorized: Missing or invalid token.' });
        return;
    }
    // Extract the token string from the header
    const token = authHeader.split(' ')[1];
    try {
        // Verify the token using the secret key from our configuration
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.JWT_SECRET);
        // Attach the decoded token to the request object
        // Ensure that the Express Request type is extended to include this property, e.g., req.user.
        req.user = decoded;
        // Proceed to the next middleware or route handler
        next();
    }
    catch (error) {
        // Token verification failed - send Unauthorized response
        res.status(401).json({ message: 'Unauthorized: Token verification failed.', error: error.message });
    }
};
exports.default = authMiddleware;
