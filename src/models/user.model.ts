import { Schema, model, Connection, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// Define the global user interface
export interface IGlobalUser extends Document {
  email: string;
  password: string;
  username?: string;
  role?: string;
  isActive?: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Define the global user schema with required fields for authentication
const GlobalUserSchema: Schema<IGlobalUser> = new Schema<IGlobalUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // Optional fields for further customization:
    username: { type: String }, // could be required if needed
    role: { type: String, default: 'user' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Pre-save middleware to hash the password using bcryptjs
GlobalUserSchema.pre<IGlobalUser>('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as any);
  }
});

// Instance method to compare a provided password with the stored hashed password
GlobalUserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Dynamically get or create the Global User model on the tenant-specific Mongoose connection.
 *
 * @param connection - Tenant-specific Mongoose connection instance.
 * @returns A Mongoose Model for the Global User defined on the given connection.
 */
export const getGlobalUserModel = (connection: Connection): Model<IGlobalUser> => {
  return connection.models.GlobalUser || connection.model<IGlobalUser>('GlobalUser', GlobalUserSchema);
};
