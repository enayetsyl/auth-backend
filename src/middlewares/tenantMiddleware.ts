import { Request, Response, NextFunction } from 'express';
import { getTenantConnection } from '../config/dbConfig';

/**
 * Middleware to extract the tenant identifier from the incoming request,
 * establish the tenant-specific database connection, and attach both to the request object.
 */
const tenantMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Extract tenant identifier from headers, query parameters, or URL parameters.
    let tenantId = req.headers['x-tenant-id'] as string | undefined;
    
    if (!tenantId && req.query.tenant) {
      tenantId = req.query.tenant as string;
    }
    
    if (!tenantId && req.params && req.params.tenant) {
      tenantId = req.params.tenant as string;
    }
    
    // If tenant identifier is missing, respond with a 400 error.
    if (!tenantId) {
      res.status(400).json({ message: 'Tenant identifier is missing.' });
      return;
    }

    // Attach the tenant identifier to the request object.
    // Ensure your custom Request interface (in /src/types/custom.d.ts) includes `tenantId`.
    (req as any).tenantId = tenantId;

    // Obtain the tenant-specific MongoDB connection and attach it to the request.
    // Again, ensure your custom Request interface has a property (e.g., `dbConnection`) for this.
    const tenantConnection = await getTenantConnection(tenantId);
    (req as any).dbConnection = tenantConnection;

    next();
  } catch (error: any) {
    console.error('Error in tenantMiddleware:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

export default tenantMiddleware;
