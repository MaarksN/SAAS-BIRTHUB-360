import { z } from 'zod';

import { ErrorCategory,ErrorCode } from './errors/error-codes';

export const ApiResponseMetaSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  total: z.number().optional(),
});

export type ApiResponseMeta = z.infer<typeof ApiResponseMetaSchema>;

export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) => z.object({
  success: z.boolean(),
  data: dataSchema.optional(),
  error: z.object({
    message: z.string(),
    code: z.nativeEnum(ErrorCode),
    category: z.nativeEnum(ErrorCategory),
  }).optional(),
  meta: ApiResponseMetaSchema.optional(),
});

export interface ApiErrorDetail {
  message: string;
  code: ErrorCode;
  category: ErrorCategory;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiErrorDetail;
  meta?: ApiResponseMeta;
}

export function successResponse<T>(data: T, meta?: ApiResponseMeta): ApiResponse<T> {
  return {
    success: true,
    data,
    meta,
  };
}

export function errorResponse(
  message: string,
  code: ErrorCode = ErrorCode.INTERNAL_ERROR,
  category: ErrorCategory = ErrorCategory.SYSTEM
): ApiResponse<null> {
  return {
    success: false,
    error: {
      message,
      code,
      category,
    },
  };
}
