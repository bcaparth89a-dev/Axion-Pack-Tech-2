import mongoose, { Document, Schema } from 'mongoose';
import { ROLES, UserRole } from '../constants/roles.js';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false, // Don't return password hash by default
    },
    role: {
      type: String,
      enum: [ROLES.ADMIN, ROLES.EDITOR],
      default: ROLES.EDITOR,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        const copy = { ...ret };
        delete (copy as Record<string, unknown>).passwordHash;
        delete (copy as Record<string, unknown>).__v;
        return copy;
      },
    },
  }
);

// Compound index for active user queries
UserSchema.index({ email: 1, isActive: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
