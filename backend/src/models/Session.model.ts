import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISession extends Document {
  userId: Types.ObjectId;
  refreshTokenHash: string;
  deviceInfo?: string;
  ip?: string;
  isValid: boolean;
  lastUsedAt: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required for session'],
      index: true,
    },
    refreshTokenHash: {
      type: String,
      required: [true, 'Refresh token hash is required'],
      index: true,
    },
    deviceInfo: {
      type: String,
      default: 'Unknown Device / Browser',
      trim: true,
    },
    ip: {
      type: String,
      default: '127.0.0.1',
      trim: true,
    },
    isValid: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Session expiration date is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for fast multi-device lookups and session validation
SessionSchema.index({ userId: 1, isValid: 1 });
SessionSchema.index({ refreshTokenHash: 1, isValid: 1 });
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Automatic cleanup after expiry

export const Session = mongoose.model<ISession>('Session', SessionSchema);
