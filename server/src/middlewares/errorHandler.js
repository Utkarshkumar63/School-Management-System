import { ApiResponse, AppError } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`, err.stack);

  // AppError (explicitly thrown custom error)
  if (err instanceof AppError) {
    return ApiResponse.error(res, {
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors,
    });
  }

  // Zod validation error
  if (err.name === 'ZodError') {
    const formatted = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return ApiResponse.error(res, {
      statusCode: 400,
      message: 'Validation failed',
      errors: formatted,
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const formatted = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return ApiResponse.error(res, {
      statusCode: 400,
      message: 'Database validation error',
      errors: formatted,
    });
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue || {});
    return ApiResponse.error(res, {
      statusCode: 409,
      message: `Duplicate field value entered: ${fields.join(', ')} already exists`,
      errors: err.keyValue,
    });
  }

  // Mongoose invalid ObjectId / CastError
  if (err.name === 'CastError') {
    return ApiResponse.error(res, {
      statusCode: 400,
      message: `Invalid format for field: ${err.path}`,
      errors: null,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return ApiResponse.error(res, {
      statusCode: 401,
      message: 'Invalid authorization token',
    });
  }
  if (err.name === 'TokenExpiredError') {
    return ApiResponse.error(res, {
      statusCode: 401,
      message: 'Authorization token expired',
    });
  }

  // Default server error
  return ApiResponse.error(res, {
    statusCode: 500,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
}

