import { Connection } from 'mongoose';

declare global {
  namespace Express {
    export interface Request {
     
      tenantId?: string;
     
      dbConnection?: Connection;
     
      user?: {
        userId: string;
        tenant?: string;
       role: string; 
      };
    }
  }
}
