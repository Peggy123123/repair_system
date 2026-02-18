import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200
): Response => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

export const sendError = (
  res: Response,
  error: string,
  statusCode = 400
): Response => {
  return res.status(statusCode).json({
    success: false,
    error,
  });
};

export const sendValidationError = (
  res: Response,
  errors: { field: string; message: string }[]
): Response => {
  return res.status(400).json({
    success: false,
    error: 'Validation failed',
    details: errors,
  });
};
