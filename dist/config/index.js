"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from the .env file into process.env
dotenv_1.default.config();
// Define and export global constants for your application.
const config = {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: Number(process.env.PORT) || 3000,
    // JWT Settings
    JWT_SECRET: process.env.JWT_SECRET || "",
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1h",
    JWT_REFRESH_TOKEN_EXPIRES_IN: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || "180d",
    // MongoDB default connection
    MONGO_URI_DEFAULT: process.env.MONGO_URI_DEFAULT || "",
    // Tenant-specific MongoDB connection strings
    TENANT_A_MONGO_URI: process.env.TENANT_A_MONGO_URI || "",
    TENANT_B_MONGO_URI: process.env.TENANT_B_MONGO_URI || "",
    SCHOOL_ATTENDANCE_MONGO_URI: process.env.SCHOOL_ATTENDANCE_MONGO_URI || "",
    TENANT_D_MONGO_URI: process.env.TENANT_D_MONGO_URI || "",
    // nodemailer credentials
    EMAIL_HOST: process.env.EMAIL_HOST || "",
    EMAIL_PORT: Number(process.env.EMAIL_PORT) || 587,
    EMAIL_USER: process.env.EMAIL_USER || "",
    EMAIL_PASS: process.env.EMAIL_PASS || "",
    EMAIL_FROM: process.env.EMAIL_FROM || "",
};
exports.default = config;
