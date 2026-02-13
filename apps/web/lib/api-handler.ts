import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema, ZodError } from 'zod';
import { AppError, ErrorCode, ErrorCategory, logger, checkRateLimit } from '@salesos/core';
import { withRequestContext } from './api-context';

type NextContext = { params: Record<string, string | string[]> };

// Handler signature: (req, context: { params, body }) => Promise
type ApiHandler<T> = (
  req: NextRequest,
  context: NextContext & { body?: T }
) => Promise<NextResponse | Response>;

interface ApiHandlerOptions<T> {
  schema?: ZodSchema<T>;
  roles?: string[]; // Future implementation for RBAC
  rateLimit?: {
    limit: number;
    windowSeconds: number;
  };
}

export function createApiHandler<T = any>(
  handler: ApiHandler<T>,
  options: ApiHandlerOptions<T> = {}
) {
  return async (req: NextRequest, context: NextContext) => {
    return withRequestContext(req, async () => {
      try {
        // Rate Limiting Strategy
        if (options.rateLimit) {
            const userId = req.headers.get('x-user-id');
            const ip = req.headers.get('x-forwarded-for') || 'unknown';
            const identifier = userId || ip;

            const { success } = await checkRateLimit(
                identifier,
                options.rateLimit.limit,
                options.rateLimit.windowSeconds
            );

            if (!success) {
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: ErrorCode.RATE_LIMIT_EXCEEDED,
                            message: 'Too many requests. Please try again later.'
                        }
                    },
                    { status: 429 }
                );
            }
        }

        let parsedBody: T | undefined;

        // Parse Body if schema is provided
        if (options.schema) {
          try {
            // Check if request has body before parsing
            if (req.body) {
                const body = await req.json();
                parsedBody = options.schema.parse(body);
            }
          } catch (error) {
            if (error instanceof ZodError) {
              throw new AppError(
                'Invalid request body',
                400,
                ErrorCode.INVALID_INPUT,
                ErrorCategory.VALIDATION,
                true
              );
            }
            throw error;
          }
        }

        // Execute handler with enhanced context (params + body)
        return await handler(req, { ...context, body: parsedBody });

      } catch (error: any) {
        // Log the error with context (automatically injected by logger)
        if (error instanceof AppError) {
            logger.warn({ code: error.code, statusCode: error.statusCode }, error.message);
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: error.code,
                        message: error.message,
                        details: (error as any).details // In case we want to expose Zod details later
                    }
                },
                { status: error.statusCode }
            );
        }

        // Unhandled Error
        logger.error({ error }, 'Unhandled API Error');

        return NextResponse.json(
            {
                success: false,
                error: {
                    code: ErrorCode.INTERNAL_ERROR,
                    message: 'Internal Server Error'
                }
            },
            { status: 500 }
        );
      }
    });
  };
}
