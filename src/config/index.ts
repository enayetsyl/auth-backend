import dotenv from "dotenv";

interface Config {
  NODE_ENV: string;
  PORT: number;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  TENANT_A_MONGO_URI: string;
  TENANT_B_MONGO_URI: string;
  SCHOOL_ATTENDANCE_MONGO_URI: string;
  TENANT_D_MONGO_URI: string;
  MONGO_URI_DEFAULT: string;
  EMAIL_HOST: string;
  EMAIL_PORT: number;
  EMAIL_USER: string;
  EMAIL_PASS: string;
  EMAIL_FROM: string;
}

// Load environment variables from the .env file into process.env
dotenv.config();

// Define and export global constants for your application.
const config: Config = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 3000,

  // JWT Settings
  JWT_SECRET: process.env.JWT_SECRET || "",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1h",

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

export default config;
