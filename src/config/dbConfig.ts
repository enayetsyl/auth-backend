import mongoose, { Connection } from 'mongoose';
import config from './index';

// Define a type for storing tenant-specific connections
interface TenantConnections {
  [tenantId: string]: Connection;
}

// Cache for tenant-specific connections
const tenantConnections: TenantConnections = {};

/**
 * Get the MongoDB connection string based on the tenant identifier.
 * @param tenantId - Unique tenant identifier (e.g., "tenantA", "tenantB")
 * @returns MongoDB connection string for the tenant
 */
function getConnectionString(tenantId: string): string | null {
  switch (tenantId) {
    case 'tenantA':
      return config.TENANT_A_MONGO_URI;
    case 'tenantB':
      return config.TENANT_B_MONGO_URI;
    case 'tenantC':
      return config.TENANT_C_MONGO_URI;
    case 'tenantD':
      return config.TENANT_D_MONGO_URI;
    default:
      // Optionally return a default connection or null if tenant ID is not recognized
      return config.MONGO_URI_DEFAULT || null;
  }
}

/**
 * Creates or retrieves an existing Mongoose connection for the given tenant.
 * @param tenantId - Unique tenant identifier extracted from the request
 * @returns A Promise that resolves to the tenant-specific Mongoose connection
 */
export async function getTenantConnection(tenantId: string): Promise<Connection> {
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
  const connection = await mongoose.createConnection(connectionString);

  // Cache and return the connection
  tenantConnections[tenantId] = connection;
  return connection;
}
