import { Response } from 'express';

export interface ApiResponseOptions<T> {
  res: Response;
  statusCode?: number;
  data?: T;
  message?: string;
}

export interface ApiErrorOptions {
  res: Response;
  statusCode?: number;
  message: string;
  errors?: unknown[];
}

export const sendSuccess = <T>({
  res,
  statusCode = 200,
  data = {} as T,
  message = 'Success',
}: ApiResponseOptions<T>): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = ({
  res,
  statusCode = 500,
  message = 'Something went wrong',
  errors = [],
}: ApiErrorOptions): Response => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
