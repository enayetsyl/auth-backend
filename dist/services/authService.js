"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.loginUser = loginUser;
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
exports.refreshToken = refreshToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const user_model_1 = require("../models/user.model");
/**
 * Registers a new user for the given tenant.
 * @param data - Registration details including username, email, and password.
 * @param connection - Tenant-specific Mongoose connection.
 * @returns The newly created user document.
 * @throws Error if a user with the same email already exists.
 */
function registerUser(data, connection) {
    return __awaiter(this, void 0, void 0, function* () {
        const User = (0, user_model_1.getGlobalUserModel)(connection);
        // Check if the user already exists by email
        const existingUser = yield User.findOne({ email: data.email });
        if (existingUser) {
            throw new Error('User already exists with this email.');
        }
        // Create and save the new user
        const newUser = new User(data);
        yield newUser.save();
        return newUser;
    });
}
/**
 * Authenticates a user given their login credentials for the specified tenant.
 * @param data - Login credentials, including email and password.
 * @param connection - Tenant-specific Mongoose connection.
 * @returns The authenticated user document.
 * @throws Error if the user cannot be found or if the password is incorrect.
 */
function loginUser(data, connection) {
    return __awaiter(this, void 0, void 0, function* () {
        const User = (0, user_model_1.getGlobalUserModel)(connection);
        // Retrieve the user by email
        const user = yield User.findOne({ email: data.email });
        if (!user) {
            throw new Error('Invalid email or password.');
        }
        // Verify the password using the instance method defined in the user model.
        const isMatch = yield user.comparePassword(data.password);
        if (!isMatch) {
            throw new Error('Invalid email or password.');
        }
        return user;
    });
}
/**
 * Generates a JWT for a user.
 * @param user - The user document for which to generate the token.
 * @param tenantId - (Optional) The tenant identifier to include in the token payload.
 * @returns A signed JWT token.
 */
function generateToken(user, tenantId) {
    const payload = {
        userId: user._id,
        tenant: tenantId,
        role: user.role,
    };
    return jsonwebtoken_1.default.sign(payload, config_1.default.JWT_SECRET, { expiresIn: config_1.default.JWT_EXPIRES_IN });
}
/**
 * Verifies a JWT token.
 * @param token - The JWT token to verify.
 * @returns The decoded token payload.
 * @throws Error if verification fails.
 */
function verifyToken(token) {
    return jsonwebtoken_1.default.verify(token, config_1.default.JWT_SECRET);
}
/**
 * Refreshes the token by decoding the old token (ignoring expiration) and signing a new one.
 */
function refreshToken(oldToken) {
    const decoded = jsonwebtoken_1.default.verify(oldToken, config_1.default.JWT_SECRET, { ignoreExpiration: true });
    return jsonwebtoken_1.default.sign({ userId: decoded.userId, tenant: decoded.tenant, role: decoded.role }, config_1.default.JWT_SECRET, { expiresIn: config_1.default.JWT_EXPIRES_IN });
}
