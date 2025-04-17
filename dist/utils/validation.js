"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    username: zod_1.z.string().min(3, { message: 'Username must be at least 3 characters.' }),
    email: zod_1.z.string().email({ message: 'Invalid email address.' }),
    password: zod_1.z.string().min(6, { message: 'Password must be at least 6 characters.' }),
    role: zod_1.z.string().optional(),
    frontendUrl: zod_1.z
        .string()
        .url({ message: 'Invalid frontend URL.' })
        .optional(),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email({ message: 'Invalid email address.' }),
    password: zod_1.z.string().min(6, { message: 'Password must be at least 6 characters.' }),
    role: zod_1.z.string().optional(),
});
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(6, { message: 'Password must be at least 6 characters.' }),
    newPassword: zod_1.z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});
