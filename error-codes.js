export var ErrorCategory;
(function (ErrorCategory) {
    ErrorCategory["VALIDATION"] = "VALIDATION";
    ErrorCategory["AUTHENTICATION"] = "AUTHENTICATION";
    ErrorCategory["AUTHORIZATION"] = "AUTHORIZATION";
    ErrorCategory["NOT_FOUND"] = "NOT_FOUND";
    ErrorCategory["SYSTEM"] = "SYSTEM";
    ErrorCategory["EXTERNAL_SERVICE"] = "EXTERNAL_SERVICE";
})(ErrorCategory || (ErrorCategory = {}));
export var ErrorCode;
(function (ErrorCode) {
    // Validation
    ErrorCode["INVALID_INPUT"] = "VAL-001";
    ErrorCode["MISSING_FIELD"] = "VAL-002";
    // Auth
    ErrorCode["UNAUTHORIZED"] = "AUTH-001";
    ErrorCode["FORBIDDEN"] = "AUTH-002";
    ErrorCode["TOKEN_EXPIRED"] = "AUTH-003";
    // Resource
    ErrorCode["RESOURCE_NOT_FOUND"] = "RES-001";
    ErrorCode["RESOURCE_EXISTS"] = "RES-002";
    // System
    ErrorCode["INTERNAL_ERROR"] = "SYS-001";
    ErrorCode["RATE_LIMIT_EXCEEDED"] = "SYS-002";
    ErrorCode["SERVICE_UNAVAILABLE"] = "SYS-003";
})(ErrorCode || (ErrorCode = {}));
