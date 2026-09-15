import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { ROLES, UserRole } from '../constants/roles.js';
import { AppError } from '../utils/appError.js';
import { authenticate } from './auth.middleware.js';

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    return authenticate(req, res, next);
  }
  next();
};

export const requireRoles = (...allowedRoles: UserRole[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return authenticate(req, res, () => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
          return next(AppError.forbidden(`Access restricted to roles: [${allowedRoles.join(', ')}]`));
        }
        next();
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(AppError.forbidden(`Access restricted to roles: [${allowedRoles.join(', ')}]`));
    }

    next();
  };
};

export const requireAdmin = requireRoles(ROLES.ADMIN);
export const requireEditorOrAdmin = requireRoles(ROLES.ADMIN, ROLES.EDITOR);
