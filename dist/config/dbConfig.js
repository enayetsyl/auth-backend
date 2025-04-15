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
exports.getTenantConnection = getTenantConnection;
const mongoose_1 = __importDefault(require("mongoose"));
const index_1 = __importDefault(require("./index"));
// Cache for tenant-specific connections
const tenantConnections = {};
/**
 * Get the MongoDB connection string based on the tenant identifier.
 * @param tenantId - Unique tenant identifier (e.g., "tenantA", "tenantB")
 * @returns MongoDB connection string for the tenant
 */
function getConnectionString(tenantId) {
    switch (tenantId) {
        case 'tenantA':
            return index_1.default.TENANT_A_MONGO_URI;
        case 'tenantB':
            return index_1.default.TENANT_B_MONGO_URI;
        case 'tenantC':
            return index_1.default.TENANT_C_MONGO_URI;
        case 'tenantD':
            return index_1.default.TENANT_D_MONGO_URI;
        default:
            // Optionally return a default connection or null if tenant ID is not recognized
            return index_1.default.MONGO_URI_DEFAULT || null;
    }
}
/**
 * Creates or retrieves an existing Mongoose connection for the given tenant.
 * @param tenantId - Unique tenant identifier extracted from the request
 * @returns A Promise that resolves to the tenant-specific Mongoose connection
 */
function getTenantConnection(tenantId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Return existing connection if available
        if (tenantConnections[tenantId]) {
            return tenantConnections[tenantId];
        }
        // Get connection string for the tenant
        const connectionString = getConnectionString(tenantId);
        if (!connectionString) {
            throw new Error(`No connection string found for tenant: ${tenantId}`);
        }
        // Create a new Mongoose connection for the tenant
        const connection = yield mongoose_1.default.createConnection(connectionString);
        // Cache and return the connection
        tenantConnections[tenantId] = connection;
        return connection;
    });
}
