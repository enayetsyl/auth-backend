"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("../config"));
/**
 * Centralized error handling middleware.
 * Captures errors and sends a standardized JSON response.
 *
 * @param err - The error object thrown from any middleware or route handler.
 * @param req - The current request object.
 * @param res - The response object.
 * @param next - The next middleware function in the stack.
 */
const errorHandler = (err, req, res, next) => {
    // Log the error details to the console (or a logging utility)
    console.error('Error:', err);
    // Determine the HTTP status code, defaulting to 500 if not specified.
    const statusCode = err.statusCode || err.status || 500;
    // Build the error response with a standard format.
    const errorResponse = Object.assign({ status: 'error', message: err.message || 'Internal Server Error' }, (config_1.default.NODE_ENV === 'development' && { stack: err.stack }));
    // Send the error response in JSON format.
    res.status(statusCode).json(errorResponse);
};
exports.default = errorHandler;
