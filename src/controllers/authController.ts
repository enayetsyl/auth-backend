import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config";
import { getGlobalUserModel } from "../models/user.model";
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
} from "../utils/validation";
import * as authService from "../services/authService";
import { sendEmail } from "../services/emailService";
import { verifyToken } from "../services/authService";

/**
 * Controller for user registration.
 * Expects JSON body with username, email, and password.
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsedData = registerSchema.parse(req.body);

    // Allow clients to pass their own frontend URL for the verification link
    const { frontendUrl } = req.body as { frontendUrl?: string };
    
    // Get the tenant-specific database connection (set by tenant middleware)
    const connection = req.dbConnection;
    if (!connection) {
      res
        .status(500)
        .json({ message: "No database connection available for tenant." });
      return;
    }

    // Get the User model for the current tenant
    const User = getGlobalUserModel(connection);

    // Check if a user with the same email already exists
    const existingUser = await User.findOne({ email: parsedData.email });

    if (existingUser) {
      res.status(409).json({ message: "User with this email already exists." });
      return;
    }

    // Create and save a new user document
    const newUser = new User(parsedData);
    await newUser.save();

    // Generate a verification token (valid for 24h)
    const verificationToken = jwt.sign(
      { userId: newUser._id },
      config.JWT_SECRET as jwt.Secret,
      { expiresIn: "24h" }
    );

      // Determine base URL: use provided frontendUrl (no trailing slash) or fallback to backend host
      const base =
      typeof frontendUrl === "string" && frontendUrl.trim()
        ? frontendUrl.replace(/\/$/, "")
        : `${req.protocol}://${req.get("host")}`;

    // Build the link that your frontend will handle
    const verificationUrl = `${base}/verify-email?token=${verificationToken}`;


    // Send verification email using the email service (Nodemailer)
    await sendEmail({
      to: newUser.email,
      subject: "Please verify your email",
      text: `Click this link to verify your email: ${verificationUrl}`,
      html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
    });

    res
      .status(201)
      .json({
        message:
          "User registered successfully. Please check your email to verify your account.",
      });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for user login.
 * Expects JSON body with email and password.
 * Generates and returns a JWT token upon successful authentication.
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate input using Zod
    const parsedData = loginSchema.parse(req.body);

    // Retrieve tenant-specific connection from the request
    const connection = req.dbConnection;
    if (!connection) {
      res
        .status(500)
        .json({ message: "No database connection available for tenant." });
      return;
    }

    // Get the User model for the current tenant
    const User = getGlobalUserModel(connection);
    const user = await User.findOne({ email: parsedData.email });
    if (!user) {
      res.status(401).json({ message: "Invalid credentials." });
      return;
    }

    // Compare passwords using the instance method from the user model.
    const isMatch = await user.comparePassword(parsedData.password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid credentials." });
      return;
    }

      // 1️⃣ Generate short‐lived access token
      const accessToken = authService.generateToken(user, req.tenantId);

      // 2️⃣ Generate long‐lived refresh token
      const refreshToken = jwt.sign(
        { userId: user._id, tenant: req.tenantId, role: user.role },
        config.JWT_SECRET as jwt.Secret,
        { expiresIn: config.JWT_REFRESH_TOKEN_EXPIRES_IN } as jwt.SignOptions
      );
  
       // Convert to plain object and drop sensitive fields
    const userObj = user.toObject();
    const { password, ...publicUser } = userObj;
       
      res.status(200).json({ accessToken, refreshToken, globalUser: publicUser });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for initiating a password reset.
 * Generates a reset token, constructs a reset URL, and sends a reset email to the user.
 */
export const passwordResetRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
    const User = getGlobalUserModel(connection);
    const user = await User.findOne({ email });
    
    // For security, always return a success message, regardless of whether the user exists.
    if (!user) {
      res.status(200).json({ 
        message: "If that email address is in our system, we have sent a password reset link." 
      });
      return;
    }
    
    // Generate a password reset token that expires in 1 hour.
    const resetToken = jwt.sign(
      { userId: user._id },
      config.JWT_SECRET as jwt.Secret,
      { expiresIn: '1h' }
    );
    
    // Build the link using the provided redirectUrl (or a default fallback)
    const base =
      redirectUrl

    const resetUrl = `${base.replace(/\/$/, "")}/reset-password?token=${resetToken}`;

    
    // Use the email service to send a password reset email.
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      text: `Please click the following link to reset your password: ${resetUrl}`,
      html: `<p>Please click <a href="${resetUrl}">here</a> to reset your password.</p>`,
    });
    
    // Respond with a generic message.
    res.status(200).json({ 
      message: "If that email address is in our system, we have sent a password reset link." 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for confirming a password reset.
 * Verifies the reset token, updates the user's password, and saves the changes.
 */
export const passwordResetConfirm = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      res.status(400).json({ message: "Reset token and new password are required." });
      return;
    }
    
    // Verify the reset token.
    const decoded = jwt.verify(token, config.JWT_SECRET) as { userId: string };
    
    // Retrieve tenant-specific connection.
    const connection = req.dbConnection;
    if (!connection) {
      res.status(500).json({ message: "No database connection available for tenant." });
      return;
    }
    
    // Get the global user model and find the user by ID.
    const User = getGlobalUserModel(connection);
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }
    
    // Update the user's password.
    // The pre-save hook in the model will handle hashing.
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({ message: "Password has been reset successfully." });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.body;
    console.log('token',token)
    if (!token) {
      res.status(400).json({ message: 'Refresh token is required.' });
      console.log('no token')
      return;
    }
    const newToken = authService.refreshToken(token);
    console.log('new token', newToken)
    res.status(200).json({ token: newToken });
  } catch (error) {
    next(error);
  }
};


export const verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.query;
    if (!token || typeof token !== 'string') {
      res.status(400).json({ message: 'Verification token is missing.' });
      return;
    }
    // Verify the token to extract the userId
    const decoded = verifyToken(token);

    const connection = req.dbConnection;

    if (!connection) {
      res.status(500).json({ message: 'Database connection not available.' });
      return;
    }

    const User = getGlobalUserModel(connection);

    const user = await User.findById(decoded.userId);

    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }
    // Assume the user model contains an `isVerified` field.
    user.set('isVerified', true);

    await user.save();

    res.status(200).json({ message: 'Email verified successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for logging out.
 * If using token blacklisting or session management, implement accordingly.
 */
export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // For JWT, logout is typically handled client-side.
    res.status(200).json({ message: 'Logout successful.' });
  } catch (error) {
    next(error);
  }
};


/**
 * Controller to get the profile of the authenticated user.
 */
export const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const connection = req.dbConnection;

    if (!connection) {
      res.status(500).json({ message: 'Database connection not available.' });
      return;
    }

    const User = getGlobalUserModel(connection);

    const user = await User.findById(req.user?.userId).select('-password');

    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};



/**
 * Controller to change the password of the authenticated user.
 */
export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const User = getGlobalUserModel(connection);

    const user = await User.findById(req.user?.userId);

    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      res.status(401).json({ message: 'Current password is incorrect.' });
      return;
    }
    user.password = newPassword;

    await user.save();

    res.status(200).json({ message: 'Password updated successfully.' });

  } catch (error) {
    next(error);
  }
};