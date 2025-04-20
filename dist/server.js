"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_1 = __importDefault(require("./config"));
const cors_1 = __importDefault(require("cors"));
const tenantMiddleware_1 = __importDefault(require("./middlewares/tenantMiddleware"));
const errorHandler_1 = __importDefault(require("./middlewares/errorHandler"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const logger_1 = __importDefault(require("./utils/logger")); // Winston-based logger instance
// Initialize Express app
const app = (0, express_1.default)();
/**
 * Essential Middleware
 */
// JSON Parsing: Parses incoming JSON requests and makes the data available under req.body
app.use(express_1.default.json());
// Request Logging Middleware: Logs each incoming request's method and URL using Winston.
app.use((req, res, next) => {
    logger_1.default.info(`${req.method} ${req.url}`);
    next();
});
// CORS: whitelist only http://localhost:3000
const whitelist = ['http://localhost:3000', 'https://scd-school-attendance.vercel.app'];
const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
// Tenant Middleware: Extracts the tenant identifier (e.g., from header 'X-Tenant-ID')
// and establishes a dynamic DB connection for each request.
app.use(tenantMiddleware_1.default);
/**
 * Routes
 */
app.use('/api/v1/auth', authRoutes_1.default);
/**
 * Fallback Middleware for 404 (Not Found)
 */
app.use((req, res, next) => {
    res.status(404).json({ message: 'Not Found' });
});
/**
 * Global Error Handling Middleware
 */
app.use(errorHandler_1.default);
/**
 * Start the Server
 */
app.listen(config_1.default.PORT, () => {
    logger_1.default.info(`Server is running on port ${config_1.default.PORT} in ${config_1.default.NODE_ENV} mode.`);
});
