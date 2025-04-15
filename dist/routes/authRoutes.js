"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const authController_1 = require("../controllers/authController");
const router = express_1.default.Router();
// Public routes
router.post('/register', authController_1.register);
router.post('/login', authController_1.login);
router.post('/password-reset', authController_1.passwordResetRequest);
router.post('/password-reset/confirm', authController_1.passwordResetConfirm);
router.post('/refresh-token', authController_1.refreshToken);
router.get('/verify-email', authController_1.verifyEmail);
// Protected routes
router.post('/logout', authMiddleware_1.default, authController_1.logout);
router.get('/profile', authMiddleware_1.default, authController_1.getProfile);
router.post('/change-password', authMiddleware_1.default, authController_1.changePassword);
// Example of a protected route that requires JWT validation
router.get('/protected', authMiddleware_1.default, (req, res) => {
    res.status(200).json({
        message: 'This is a protected route. You have successfully accessed it!',
        user: req.user,
    });
});
exports.default = router;
