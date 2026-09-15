import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserRole } from '../constants/roles.js';

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  sessionId?: string;
}

export const signAccessToken = (payload: JwtPayload): string => {
  const secret = process.env.JWT_SECRET || 'dev_jwt_secret_min_32_characters_long_for_security';
  const expiresIn = (process.env.JWT_ACCESS_EXPIRES_IN || process.env.JWT_EXPIRES_IN || '15m') as jwt.SignOptions['expiresIn'];

  return jwt.sign(payload, secret, { expiresIn });
};

export const signRefreshToken = (payload: JwtPayload): string => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'dev_jwt_refresh_secret_min_32_characters_long';
  const expiresIn = (process.env.JWT_REFRESH_EXPIRES_IN || '30d') as jwt.SignOptions['expiresIn'];

  return jwt.sign(payload, secret, { expiresIn });
};

export const signToken = (payload: JwtPayload): string => {
  return signAccessToken(payload);
};

export const verifyToken = (token: string): JwtPayload => {
  const secret = process.env.JWT_SECRET || 'dev_jwt_secret_min_32_characters_long_for_security';
  return jwt.verify(token, secret) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'dev_jwt_refresh_secret_min_32_characters_long';
  return jwt.verify(token, secret) as JwtPayload;
};

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const generateRandomToken = (bytes: number = 32): string => {
  return crypto.randomBytes(bytes).toString('hex');
};
