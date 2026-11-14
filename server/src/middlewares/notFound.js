import { ApiResponse } from '../utils/apiResponse.js';

export function notFound(req, res, next) {
  return ApiResponse.error(res, {
    statusCode: 404,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

