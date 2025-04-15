"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
// Define the log format
const logFormat = winston_1.format.combine(winston_1.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.format.errors({ stack: true }), winston_1.format.splat(), winston_1.format.printf(({ timestamp, level, message, stack }) => {
    // If the log has a stack trace, include it in the output
    return stack
        ? `${timestamp} ${level}: ${message} - ${stack}`
        : `${timestamp} ${level}: ${message}`;
}));
// Create the Winston logger instance
const logger = (0, winston_1.createLogger)({
    level: 'info',
    format: logFormat,
    transports: [
        // Log to the console
        new winston_1.transports.Console({
            format: winston_1.format.combine(winston_1.format.colorize(), logFormat),
        }),
        // Optionally, you can add file transports:
        // new transports.File({ filename: 'error.log', level: 'error' }),
        // new transports.File({ filename: 'combined.log' })
    ],
    exitOnError: false, // Do not exit on handled exceptions
});
exports.default = logger;
