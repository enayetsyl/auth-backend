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
Object.defineProperty(exports, "__esModule", { value: true });
const dbConfig_1 = require("../config/dbConfig");
/**
 * Middleware to extract the tenant identifier from the incoming request,
 * establish the tenant-specific database connection, and attach both to the request object.
 */
const tenantMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Extract tenant identifier from headers, query parameters, or URL parameters.
        let tenantId = req.headers['x-tenant-id'];
        if (!tenantId && req.query.tenant) {
            tenantId = req.query.tenant;
        }
        if (!tenantId && req.params && req.params.tenant) {
            tenantId = req.params.tenant;
        }
        // If tenant identifier is missing, respond with a 400 error.
        if (!tenantId) {
            res.status(400).json({ message: 'Tenant identifier is missing.' });
            return;
        }
        // Attach the tenant identifier to the request object.
        // Ensure your custom Request interface (in /src/types/custom.d.ts) includes `tenantId`.
        req.tenantId = tenantId;
        // Obtain the tenant-specific MongoDB connection and attach it to the request.
        // Again, ensure your custom Request interface has a property (e.g., `dbConnection`) for this.
        const tenantConnection = yield (0, dbConfig_1.getTenantConnection)(tenantId);
        req.dbConnection = tenantConnection;
        next();
    }
    catch (error) {
        console.error('Error in tenantMiddleware:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});
exports.default = tenantMiddleware;
