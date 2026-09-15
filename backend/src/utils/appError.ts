export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: unknown[];

  constructor(message: string, statusCode: number = 500, errors?: unknown[]) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string = 'Bad request', errors?: unknown[]): AppError {
    return new AppError(message, 400, errors);
  }

  static unauthorized(message: string = 'Authentication required'): AppError {
    return new AppError(message, 401);
  }

  static forbidden(message: string = 'Permission denied'): AppError {
    return new AppError(message, 403);
  }

  static notFound(message: string = 'Resource not found'): AppError {
    return new AppError(message, 404);
  }

  static conflict(message: string = 'Resource already exists'): AppError {
    return new AppError(message, 409);
  }

  static tooManyRequests(message: string = 'Too many requests'): AppError {
    return new AppError(message, 429);
  }

  static internal(message: string = 'Internal server error'): AppError {
    return new AppError(message, 500);
  }
}
