import { createLogger, format, transports } from 'winston';

// Define the log format
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.splat(),
  format.printf(({ timestamp, level, message, stack }) => {
    // If the log has a stack trace, include it in the output
    return stack
      ? `${timestamp} ${level}: ${message} - ${stack}`
      : `${timestamp} ${level}: ${message}`;
  })
);

// Create the Winston logger instance
const logger = createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    // Log to the console
    new transports.Console({
      format: format.combine(
        format.colorize(),
        logFormat
      ),
    }),
    // Optionally, you can add file transports:
    // new transports.File({ filename: 'error.log', level: 'error' }),
    // new transports.File({ filename: 'combined.log' })
  ],
  exitOnError: false, // Do not exit on handled exceptions
});

export default logger;
