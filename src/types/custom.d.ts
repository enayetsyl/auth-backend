import { Connection } from 'mongoose';

declare global {
  namespace Express {
    export interface Request {
      // Identifier for the tenant extracted from the request.
      tenantId?: string;
      // Mongoose connection specific to the tenant.
      dbConnection?: Connection;
      // Decoded JWT information. Customize properties as needed.
      user?: {
        userId: string;
        // You can add additional properties from the decoded token here.
        // For example:
        // email?: string;
        // tenant?: string;
      };
    }
  }
}
