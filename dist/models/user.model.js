"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGlobalUserModel = void 0;
const mongoose_1 = require("mongoose");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Define the global user schema with required fields for authentication
const GlobalUserSchema = new mongoose_1.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // Optional fields for further customization:
    username: { type: String }, // could be required if needed
    role: { type: String, default: 'user' },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
// Pre-save middleware to hash the password using bcryptjs
GlobalUserSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        // Only hash the password if it has been modified (or is new)
        if (!this.isModified('password'))
            return next();
        try {
            const salt = yield bcryptjs_1.default.genSalt(10);
            this.password = yield bcryptjs_1.default.hash(this.password, salt);
            next();
        }
        catch (error) {
            next(error);
        }
    });
});
// Instance method to compare a provided password with the stored hashed password
GlobalUserSchema.methods.comparePassword = function (candidatePassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcryptjs_1.default.compare(candidatePassword, this.password);
    });
};
/**
 * Dynamically get or create the Global User model on the tenant-specific Mongoose connection.
 *
 * @param connection - Tenant-specific Mongoose connection instance.
 * @returns A Mongoose Model for the Global User defined on the given connection.
 */
const getGlobalUserModel = (connection) => {
    return connection.models.GlobalUser || connection.model('GlobalUser', GlobalUserSchema);
};
exports.getGlobalUserModel = getGlobalUserModel;
