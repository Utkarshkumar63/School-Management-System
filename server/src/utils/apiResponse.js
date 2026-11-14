export class ApiResponse {
  static success(res, { statusCode = 200, message = 'Success', data = null, pagination = null }) {
    const payload = {
      success: true,
      message,
      data,
    };
    if (pagination) {
      payload.pagination = pagination;
    }
    return res.status(statusCode).json(payload);
  }

  static created(res, { message = 'Resource created successfully', data = null }) {
    return this.success(res, { statusCode: 201, message, data });
  }

  static error(res, { statusCode = 500, message = 'Internal server error', errors = null }) {
    return res.status(statusCode).json({
      success: false,
      message,
      data: null,
      errors: errors || null,
    });
  }
}

export class AppError extends Error {
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

