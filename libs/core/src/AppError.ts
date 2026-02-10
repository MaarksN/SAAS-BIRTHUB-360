import { ErrorCategory, ErrorCode } from './error-codes';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code: ErrorCode;
  public readonly category: ErrorCategory;

  constructor(
    message: string,
    statusCode = 400,
    code: ErrorCode = ErrorCode.INVALID_INPUT,
    category: ErrorCategory = ErrorCategory.VALIDATION,
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.category = category;
    this.isOperational = isOperational;

    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
