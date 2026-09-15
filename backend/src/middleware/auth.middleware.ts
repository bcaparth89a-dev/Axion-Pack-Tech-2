import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { verifyToken } from '../utils/jwt.js';
import { User } from '../models/User.model.js';
import { AppError } from '../utils/appError.js';

export const authenticate = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // 1. Check HTTP-only cookie
    if (req.cookies && (req.cookies.auth_token || req.cookies.axion_access_token)) {
      token = req.cookies.auth_token || req.cookies.axion_access_token;
    }

    // 2. Check Authorization Bearer header fallback
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(AppError.unauthorized('Authentication token missing. Please log in.'));
    }

    const payload = verifyToken(token);

    // Verify user still exists and is active in DB
    const user = await User.findById(payload.userId).select('role email name isActive');
    if (!user || !user.isActive) {
      return next(AppError.unauthorized('User account does not exist or has been deactivated.'));
    }

    req.user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      sessionId: payload.sessionId,
    };
    req.token = token;

    next();
  } catch {
    next(AppError.unauthorized('Invalid or expired authentication token.'));
  }
};
