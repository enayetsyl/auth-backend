"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.getProfile = exports.logout = exports.verifyEmail = exports.refreshToken = exports.passwordResetConfirm = exports.passwordResetRequest = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const user_model_1 = require("../models/user.model");
const validation_1 = require("../utils/validation");
const authService = __importStar(require("../services/authService"));
const emailService_1 = require("../services/emailService");
const authService_1 = require("../services/authService");
/**
 * Controller for user registration.
 * Expects JSON body with username, email, and password.
 */
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsedData = validation_1.registerSchema.parse(req.body);
        // Allow clients to pass their own frontend URL for the verification link
        const { frontendUrl } = req.body;
        // Get the tenant-specific database connection (set by tenant middleware)
        const connection = req.dbConnection;
        if (!connection) {
            res
                .status(500)
                .json({ message: "No database connection available for tenant." });
            return;
        }
        // Get the User model for the current tenant
        const User = (0, user_model_1.getGlobalUserModel)(connection);
        // Check if a user with the same email already exists
        const existingUser = yield User.findOne({ email: parsedData.email });
        if (existingUser) {
            res.status(409).json({ message: "User with this email already exists." });
            return;
        }
        // Create and save a new user document
        const newUser = new User(parsedData);
        yield newUser.save();
        // Generate a verification token (valid for 24h)
        const verificationToken = jsonwebtoken_1.default.sign({ userId: newUser._id }, config_1.default.JWT_SECRET, { expiresIn: "24h" });
        // Determine base URL: use provided frontendUrl (no trailing slash) or fallback to backend host
        const base = typeof frontendUrl === "string" && frontendUrl.trim()
            ? frontendUrl.replace(/\/$/, "")
            : `${req.protocol}://${req.get("host")}`;
        // Build the link that your frontend will handle
        const verificationUrl = `${base}/verify-email?token=${verificationToken}`;
        // Send verification email using the email service (Nodemailer)
        yield (0, emailService_1.sendEmail)({
            to: newUser.email,
            subject: "Please verify your email",
            text: `Click this link to verify your email: ${verificationUrl}`,
            html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
        });
        res
            .status(201)
            .json({
            message: "User registered successfully. Please check your email to verify your account.",
        });
    }
    catch (error) {
        next(error);
    }
});
exports.register = register;
/**
 * Controller for user login.
 * Expects JSON body with email and password.
 * Generates and returns a JWT token upon successful authentication.
 */
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate input using Zod
        const parsedData = validation_1.loginSchema.parse(req.body);
        // Retrieve tenant-specific connection from the request
        const connection = req.dbConnection;
        if (!connection) {
            res
                .status(500)
                .json({ message: "No database connection available for tenant." });
            return;
        }
        // Get the User model for the current tenant
        const User = (0, user_model_1.getGlobalUserModel)(connection);
        const user = yield User.findOne({ email: parsedData.email });
        if (!user) {
            res.status(401).json({ message: "Invalid credentials." });
            return;
        }
        // Compare passwords using the instance method from the user model.
        const isMatch = yield user.comparePassword(parsedData.password);
        if (!isMatch) {
            res.status(401).json({ message: "Invalid credentials." });
            return;
        }
        // 1️⃣ Generate short‐lived access token
        const accessToken = authService.generateToken(user, req.tenantId);
        // 2️⃣ Generate long‐lived refresh token
        const refreshToken = jsonwebtoken_1.default.sign({ userId: user._id, tenant: req.tenantId, role: user.role }, config_1.default.JWT_SECRET, { expiresIn: config_1.default.JWT_REFRESH_TOKEN_EXPIRES_IN });
        // Convert to plain object and drop sensitive fields
        const userObj = user.toObject();
        const { password } = userObj, publicUser = __rest(userObj, ["password"]);
        res.status(200).json({ accessToken, refreshToken, globalUser: publicUser });
    }
    catch (error) {
        next(error);
    }
});
exports.login = login;
/**
 * Controller for initiating a password reset.
 * Generates a reset token, constructs a reset URL, and sends a reset email to the user.
 */
const passwordResetRequest = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, redirectUrl } = req.body;
        if (!email) {
            res.status(400).json({ message: "Email is required." });
            return;
        }
        // Retrieve tenant-specific connection.
        const connection = req.dbConnection;
        if (!connection) {
            res.status(500).json({ message: "No database connection available for tenant." });
            return;
        }
        // Get the global user model for the current tenant.
        const User = (0, user_model_1.getGlobalUserModel)(connection);
        const user = yield User.findOne({ email });
        // For security, always return a success message, regardless of whether the user exists.
        if (!user) {
            res.status(200).json({
                message: "If that email address is in our system, we have sent a password reset link."
            });
            return;
        }
        // Generate a password reset token that expires in 1 hour.
        const resetToken = jsonwebtoken_1.default.sign({ userId: user._id }, config_1.default.JWT_SECRET, { expiresIn: '1h' });
        // Build the link using the provided redirectUrl (or a default fallback)
        const base = redirectUrl;
        const resetUrl = `${base.replace(/\/$/, "")}/reset-password?token=${resetToken}`;
        // Use the email service to send a password reset email.
        yield (0, emailService_1.sendEmail)({
            to: user.email,
            subject: 'Password Reset Request',
            text: `Please click the following link to reset your password: ${resetUrl}`,
            html: `<p>Please click <a href="${resetUrl}">here</a> to reset your password.</p>`,
        });
        // Respond with a generic message.
        res.status(200).json({
            message: "If that email address is in our system, we have sent a password reset link."
        });
    }
    catch (error) {
        next(error);
    }
});
exports.passwordResetRequest = passwordResetRequest;
/**
 * Controller for confirming a password reset.
 * Verifies the reset token, updates the user's password, and saves the changes.
 */
const passwordResetConfirm = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            res.status(400).json({ message: "Reset token and new password are required." });
            return;
        }
        // Verify the reset token.
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.JWT_SECRET);
        // Retrieve tenant-specific connection.
        const connection = req.dbConnection;
        if (!connection) {
            res.status(500).json({ message: "No database connection available for tenant." });
            return;
        }
        // Get the global user model and find the user by ID.
        const User = (0, user_model_1.getGlobalUserModel)(connection);
        const user = yield User.findById(decoded.userId);
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        // Update the user's password.
        // The pre-save hook in the model will handle hashing.
        user.password = newPassword;
        yield user.save();
        res.status(200).json({ message: "Password has been reset successfully." });
    }
    catch (error) {
        next(error);
    }
});
exports.passwordResetConfirm = passwordResetConfirm;
const refreshToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.body;
        if (!token) {
            res.status(400).json({ message: 'Refresh token is required.' });
            return;
        }
        const newToken = authService.refreshToken(token);
        res.status(200).json({ token: newToken });
    }
    catch (error) {
        next(error);
    }
});
exports.refreshToken = refreshToken;
const verifyEmail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.query;
        if (!token || typeof token !== 'string') {
            res.status(400).json({ message: 'Verification token is missing.' });
            return;
        }
        // Verify the token to extract the userId
        const decoded = (0, authService_1.verifyToken)(token);
        const connection = req.dbConnection;
        if (!connection) {
            res.status(500).json({ message: 'Database connection not available.' });
            return;
        }
        const User = (0, user_model_1.getGlobalUserModel)(connection);
        const user = yield User.findById(decoded.userId);
        if (!user) {
            res.status(404).json({ message: 'User not found.' });
            return;
        }
        // Assume the user model contains an `isVerified` field.
        user.set('isVerified', true);
        yield user.save();
        res.status(200).json({ message: 'Email verified successfully.' });
    }
    catch (error) {
        next(error);
    }
});
exports.verifyEmail = verifyEmail;
/**
 * Controller for logging out.
 * If using token blacklisting or session management, implement accordingly.
 */
const logout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // For JWT, logout is typically handled client-side.
        res.status(200).json({ message: 'Logout successful.' });
    }
    catch (error) {
        next(error);
    }
});
exports.logout = logout;
/**
 * Controller to get the profile of the authenticated user.
 */
const getProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const connection = req.dbConnection;
        if (!connection) {
            res.status(500).json({ message: 'Database connection not available.' });
            return;
        }
        const User = (0, user_model_1.getGlobalUserModel)(connection);
        const user = yield User.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found.' });
            return;
        }
        res.status(200).json({ user });
    }
    catch (error) {
        next(error);
    }
});
exports.getProfile = getProfile;
/**
 * Controller to change the password of the authenticated user.
 */
const changePassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            res.status(400).json({ message: 'Current password and new password are required.' });
            return;
        }
        const connection = req.dbConnection;
        if (!connection) {
            res.status(500).json({ message: 'Database connection not available.' });
            return;
        }
        const User = (0, user_model_1.getGlobalUserModel)(connection);
        const user = yield User.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
        if (!user) {
            res.status(404).json({ message: 'User not found.' });
            return;
        }
        const isMatch = yield user.comparePassword(currentPassword);
        if (!isMatch) {
            res.status(401).json({ message: 'Current password is incorrect.' });
            return;
        }
        user.password = newPassword;
        yield user.save();
        res.status(200).json({ message: 'Password updated successfully.' });
    }
    catch (error) {
        next(error);
    }
});
exports.changePassword = changePassword;
