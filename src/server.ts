import express, { Request, Response, NextFunction } from 'express';
import config from './config';
import tenantMiddleware from './middlewares/tenantMiddleware';
import errorHandler from './middlewares/errorHandler';
import authRoutes from './routes/authRoutes';
import logger from './utils/logger'; // Winston-based logger instance

// Initialize Express app
const app = express();

/**
 * Essential Middleware
 */

// JSON Parsing: Parses incoming JSON requests and makes the data available under req.body
app.use(express.json());

// Request Logging Middleware: Logs each incoming request's method and URL using Winston.
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Tenant Middleware: Extracts the tenant identifier (e.g., from header 'X-Tenant-ID')
// and establishes a dynamic DB connection for each request.
app.use(tenantMiddleware);

/**
 * Routes
 */
app.use('/api/v1/auth', authRoutes);

/**
 * Fallback Middleware for 404 (Not Found)
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: 'Not Found' });
});

/**
 * Global Error Handling Middleware
 */
app.use(errorHandler);

/**
 * Start the Server
 */
app.listen(config.PORT, () => {
  logger.info(`Server is running on port ${config.PORT} in ${config.NODE_ENV} mode.`);
});
