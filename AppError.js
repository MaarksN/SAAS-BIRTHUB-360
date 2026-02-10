import { ErrorCategory, ErrorCode } from './error-codes';
export class AppError extends Error {
    statusCode;
    isOperational;
    code;
    category;
    constructor(message, statusCode = 400, code = ErrorCode.INVALID_INPUT, category = ErrorCategory.VALIDATION, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.category = category;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, AppError.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}
