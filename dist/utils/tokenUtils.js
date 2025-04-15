"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = exports.verifyToken = exports.createToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
/**
 * Creates a JWT token with the given payload.
 * @param payload - Data to include in the token.
 * @returns A signed JWT token.
 */
const createToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, config_1.default.JWT_SECRET, { expiresIn: config_1.default.JWT_EXPIRES_IN });
};
exports.createToken = createToken;
/**
 * Verifies a JWT token and returns the decoded payload.
 * @param token - The JWT token to verify.
 * @returns The decoded token payload.
 * @throws An error if token verification fails.
 */
const verifyToken = (token) => {
    return jsonwebtoken_1.default.verify(token, config_1.default.JWT_SECRET);
};
exports.verifyToken = verifyToken;
/**
 * Refreshes a JWT token by verifying the current token (ignoring expiration)
 * and issuing a new token with updated expiration.
 * @param token - The existing JWT token.
 * @returns A new JWT token with a refreshed expiration time.
 * @throws An error if token refreshing fails.
 */
const refreshToken = (token) => {
    try {
        // Verify the token ignoring expiration to extract the payload
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.JWT_SECRET, { ignoreExpiration: true });
        // Re-issue a token with the same payload, including userId and tenant, with a refreshed expiration
        return jsonwebtoken_1.default.sign({ userId: decoded.userId, tenant: decoded.tenant }, config_1.default.JWT_SECRET, { expiresIn: config_1.default.JWT_EXPIRES_IN });
    }
    catch (error) {
        throw new Error('Token refresh failed');
    }
};
exports.refreshToken = refreshToken;
