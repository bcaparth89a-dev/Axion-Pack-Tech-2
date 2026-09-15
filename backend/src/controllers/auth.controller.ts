import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../types/index.js';

const ACCESS_COOKIE_NAME = 'auth_token';
const REFRESH_COOKIE_NAME = 'axion_refresh_token';

const getAccessCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? 'strict' : 'lax') as 'strict' | 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: '/',
  };
};

const getRefreshCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? 'strict' : 'lax') as 'strict' | 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: '/',
  };
};

const getClientIp = (req: Request): string => {
  const forwarded = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
  return forwarded || req.ip || req.socket.remoteAddress || '127.0.0.1';
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    const clientIp = getClientIp(req);
    const userAgent = (req.headers['user-agent'] as string) || 'Browser Session';

    const result = await authService.login(email, password, clientIp, userAgent);

    // Set HTTP-only secure cookies
    res.cookie(ACCESS_COOKIE_NAME, result.token, getAccessCookieOptions());
    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, getRefreshCookieOptions());

    sendSuccess({
      res,
      data: {
        user: result.user,
        token: result.token,
      },
      message: 'Login successful',
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const refreshToken =
      req.cookies?.[REFRESH_COOKIE_NAME] ||
      req.body?.refreshToken ||
      (req.headers['x-refresh-token'] as string);

    const clientIp = getClientIp(req);
    const userAgent = (req.headers['user-agent'] as string) || 'Browser Session';

    const result = await authService.refreshSession(refreshToken, clientIp, userAgent);

    // Set rotated HTTP-only cookies
    res.cookie(ACCESS_COOKIE_NAME, result.token, getAccessCookieOptions());
    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, getRefreshCookieOptions());

    sendSuccess({
      res,
      data: {
        user: result.user,
        token: result.token,
      },
      message: 'Session refreshed successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  const refreshToken =
    req.cookies?.[REFRESH_COOKIE_NAME] ||
    req.body?.refreshToken ||
    (req.headers['x-refresh-token'] as string);

  // Invalidate current device session in MongoDB
  if (refreshToken) {
    await authService.logoutSession(refreshToken);
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const clearOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? 'strict' : 'lax') as 'strict' | 'lax',
    path: '/',
  };

  res.clearCookie(ACCESS_COOKIE_NAME, clearOptions);
  res.clearCookie(REFRESH_COOKIE_NAME, clearOptions);

  sendSuccess({
    res,
    message: 'Logged out successfully from this device',
  });
};

export const logoutAll = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    await authService.logoutAllSessions(userId);

    const isProduction = process.env.NODE_ENV === 'production';
    const clearOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: (isProduction ? 'strict' : 'lax') as 'strict' | 'lax',
      path: '/',
    };

    res.clearCookie(ACCESS_COOKIE_NAME, clearOptions);
    res.clearCookie(REFRESH_COOKIE_NAME, clearOptions);

    sendSuccess({
      res,
      message: 'All active sessions have been revoked successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await authService.getProfile(req.user!.userId);
    sendSuccess({
      res,
      data: user,
      message: 'User profile retrieved',
    });
  } catch (error) {
    next(error);
  }
};

export const createAdminUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const newUser = await authService.createAdmin(req.body);
    sendSuccess({
      res,
      statusCode: 201,
      data: newUser,
      message: 'Admin user created successfully',
    });
  } catch (error) {
    next(error);
  }
};
