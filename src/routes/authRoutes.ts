import express from 'express';
import authMiddleware from '../middlewares/authMiddleware';
import {
  register,
  login,
  passwordResetRequest,
  passwordResetConfirm,
  refreshToken,
  verifyEmail,
  logout,
  getProfile,
  changePassword
} from '../controllers/authController';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/password-reset', passwordResetRequest);
router.post('/password-reset/confirm', passwordResetConfirm);
router.post('/refresh-token', refreshToken);
router.get('/verify-email', verifyEmail);

// Protected routes
router.post('/logout', authMiddleware, logout);
router.get('/profile', authMiddleware, getProfile);
router.post('/change-password', authMiddleware, changePassword);


// Example of a protected route that requires JWT validation
router.get('/protected', authMiddleware, (req, res) => {
  res.status(200).json({
    message: 'This is a protected route. You have successfully accessed it!',
    user: req.user,
  });
});

export default router;
