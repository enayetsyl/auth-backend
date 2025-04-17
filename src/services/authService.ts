import jwt from 'jsonwebtoken';
import { Connection } from 'mongoose';
import config from '../config';
import { getGlobalUserModel, IGlobalUser,  } from '../models/user.model';

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

/**
 * Registers a new user for the given tenant.
 * @param data - Registration details including username, email, and password.
 * @param connection - Tenant-specific Mongoose connection.
 * @returns The newly created user document.
 * @throws Error if a user with the same email already exists.
 */
export async function registerUser(data: RegisterData, connection: Connection): Promise<IGlobalUser> {
  const User = getGlobalUserModel(connection);

  // Check if the user already exists by email
  const existingUser = await User.findOne({ email: data.email });

  if (existingUser) {
    throw new Error('User already exists with this email.');
  }

  // Create and save the new user
  const newUser = new User(data);
  await newUser.save();
  return newUser;
}

/**
 * Authenticates a user given their login credentials for the specified tenant.
 * @param data - Login credentials, including email and password.
 * @param connection - Tenant-specific Mongoose connection.
 * @returns The authenticated user document.
 * @throws Error if the user cannot be found or if the password is incorrect.
 */
export async function loginUser(data: LoginData, connection: Connection): Promise<IGlobalUser> {
  const User = getGlobalUserModel(connection);

  // Retrieve the user by email
  const user = await User.findOne({ email: data.email });

  if (!user) {
    throw new Error('Invalid email or password.');
  }

  // Verify the password using the instance method defined in the user model.
  const isMatch = await user.comparePassword(data.password);

  if (!isMatch) {
    throw new Error('Invalid email or password.');
  }

  return user;
}

/**
 * Generates a JWT for a user.
 * @param user - The user document for which to generate the token.
 * @param tenantId - (Optional) The tenant identifier to include in the token payload.
 * @returns A signed JWT token.
 */
export function generateToken(user: IGlobalUser, tenantId?: string): string {
  const payload = {
    userId: user._id,
    tenant: tenantId,
    role: user.role,
  };

  return jwt.sign(payload,  config.JWT_SECRET as jwt.Secret,
    { expiresIn: config.JWT_EXPIRES_IN } as jwt.SignOptions);
}

/**
 * Verifies a JWT token.
 * @param token - The JWT token to verify.
 * @returns The decoded token payload.
 * @throws Error if verification fails.
 */
export function verifyToken(token: string): any {
  return jwt.verify(token, config.JWT_SECRET);
}


/**
 * Refreshes the token by decoding the old token (ignoring expiration) and signing a new one.
 */
export function refreshToken(oldToken: string): string {
  const decoded = jwt.verify(oldToken, config.JWT_SECRET, { ignoreExpiration: true }) as { userId: string; tenant?: string; role?: string; };

 return jwt.sign(
      { userId: decoded.userId, tenant: decoded.tenant, role: decoded.role },
     config.JWT_SECRET as jwt.Secret,
       { expiresIn: config.JWT_EXPIRES_IN } as jwt.SignOptions 
    );
}