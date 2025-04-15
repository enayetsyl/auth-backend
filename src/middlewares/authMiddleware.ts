import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';

interface JwtPayload {
  userId: string;
  // Add additional claims if needed, for example:
  // email: string;
  // tenant: string;
}

/**
 * Middleware to validate JWT tokens and protect routes.
 * The token should be provided in the Authorization header as "Bearer <token>".
 */
const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
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
    const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;

    // Attach the decoded token to the request object
    // Ensure that the Express Request type is extended to include this property, e.g., req.user.
    (req as any).user = decoded;

    // Proceed to the next middleware or route handler
    next();
  } catch (error: any) {
    // Token verification failed - send Unauthorized response
    res.status(401).json({ message: 'Unauthorized: Token verification failed.', error: error.message });
  }
};

export default authMiddleware;
