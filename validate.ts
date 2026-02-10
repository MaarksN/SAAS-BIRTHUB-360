import { z } from 'zod';

import { AppError } from '../errors/AppError';
import { ErrorCategory,ErrorCode } from '../errors/error-codes';

// Simulating a middleware factory that could be used in Next.js API routes or Express
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    // Cast to ZodError type implicitly via property access or use explicit cast if needed,
    // but here we know it's a ZodError. The issue is 'errors' property access on standard Error type if inference fails.
    // However, safeParse returns ZodError in result.error.
    // The previous error was accessing 'errors' on 'result.error' which typescript thinks is just Error sometimes or ZodError.
    // We can use proper typing.
    const errorMessage = result.error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`).join(', ');
    throw new AppError(
      `Validation Error: ${errorMessage}`,
      400,
      ErrorCode.INVALID_INPUT,
      ErrorCategory.VALIDATION
    );
  }
  return result.data;
}
