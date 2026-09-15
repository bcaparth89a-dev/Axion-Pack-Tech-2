import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AppError } from '../utils/appError.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  const isProduction = process.env.NODE_ENV === 'production';

  // 1. Known operational AppError
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error(`[AppError ${err.statusCode}]: ${err.message}`, err.stack);
    }
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors ?? [],
    });
  }

  // 2. Mongoose Validation Error
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((el) => ({
      field: el.path,
      message: el.message,
    }));
    const details = errors.map((e) => (e.field ? `${e.field}: ${e.message}` : e.message)).join(', ');
    return res.status(400).json({
      success: false,
      message: details ? `Validation failed: ${details}` : 'Invalid input data',
      errors,
    });
  }

  // 3. Mongoose Duplicate Key Error (E11000)
  if (typeof err === 'object' && err !== null && 'code' in err && (err as { code: number }).code === 11000) {
    const duplicateKeyObj = (err as { keyValue?: Record<string, unknown> }).keyValue || {};
    const field = Object.keys(duplicateKeyObj)[0] || 'field';
    const value = duplicateKeyObj[field];
    return res.status(409).json({
      success: false,
      message: `A record with ${field} "${value}" already exists.`,
      errors: [{ field, message: 'Must be unique' }],
    });
  }

  // 4. Mongoose CastError (e.g. invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      success: false,
      message: `Invalid format for field "${err.path}": ${err.value}`,
      errors: [{ field: err.path, message: `Invalid format: ${err.value}` }],
    });
  }

  // 5. Malformed JSON Body
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Malformed JSON payload in request body',
      errors: [],
    });
  }

  // 6. Generic/Unhandled Server Errors
  const errorObj = err instanceof Error ? err : new Error(String(err));
  logger.error(`[Unhandled Error]: ${errorObj.message}`, errorObj.stack);

  return res.status(500).json({
    success: false,
    message: isProduction ? 'An unexpected internal server error occurred.' : errorObj.message,
    errors: isProduction ? [] : [{ stack: errorObj.stack }],
  });
};
