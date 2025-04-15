import { NextFunction, Request, Response } from 'express';
import config from '../config';

/**
 * Centralized error handling middleware.
 * Captures errors and sends a standardized JSON response.
 *
 * @param err - The error object thrown from any middleware or route handler.
 * @param req - The current request object.
 * @param res - The response object.
 * @param next - The next middleware function in the stack.
 */
const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  // Log the error details to the console (or a logging utility)
  console.error('Error:', err);

  // Determine the HTTP status code, defaulting to 500 if not specified.
  const statusCode: number = err.statusCode || err.status || 500;
  
  // Build the error response with a standard format.
  const errorResponse: { status: string; message: string; stack?: string } = {
    status: 'error',
    message: err.message || 'Internal Server Error',
    // Include error stack only if in development mode
    ...(config.NODE_ENV === 'development' && { stack: err.stack }),
  };

  // Send the error response in JSON format.
  res.status(statusCode).json(errorResponse);
};

export default errorHandler;
