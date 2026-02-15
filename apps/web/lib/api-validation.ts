import { z } from 'zod';
import { BaseResponseSchema, ErrorResponseSchema } from '@salesos/core';
import { NextResponse } from 'next/server';

export class ApiError extends Error {
  code: string;
  details?: any;

  constructor(message: string, code: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

export async function validateApiResponse<T>(response: Response, schema: z.ZodSchema<T>): Promise<T> {
  const data = await response.json();

  // First check if it's an error response
  const errorResult = ErrorResponseSchema.safeParse(data);
  if (errorResult.success) {
      throw new ApiError(errorResult.data.error, errorResult.data.error_code, errorResult.data.details);
  }

  // Then validate against expected schema
  const result = schema.safeParse(data);

  if (!result.success) {
    console.error('API Contract Violation:', result.error);
    // In production, you might want to log this but still return data if possible, or throw.
    // For now, we throw to enforce contract.
    throw new Error('API Response Contract Violation');
  }

  return result.data;
}

export function handleApiError(error: unknown) {
    console.error('API Error:', error);

    if (error instanceof ApiError) {
        return NextResponse.json({
            success: false,
            error: error.message,
            error_code: error.code,
            details: error.details,
            timestamp: new Date().toISOString()
        }, { status: 400 });
    }

    if (error instanceof z.ZodError) {
        return NextResponse.json({
            success: false,
            error: 'Validation Error',
            error_code: 'VALIDATION_ERROR',
            details: error.errors,
            timestamp: new Date().toISOString()
        }, { status: 400 });
    }

    return NextResponse.json({
        success: false,
        error: 'Internal Server Error',
        error_code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
    }, { status: 500 });
}
