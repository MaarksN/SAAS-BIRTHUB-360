import { NextRequest, NextResponse } from 'next/server';
import { ReferralService, AppError, ErrorCode, ErrorCategory } from '@salesos/core';
import { createApiHandler } from '@/lib/api-handler';
import { z } from 'zod';

const validateSchema = z.object({
    code: z.string(),
});

export const POST = createApiHandler(async (req, { body }) => {
    if (!body) throw new AppError('Missing body', 400, ErrorCode.INVALID_INPUT, ErrorCategory.VALIDATION);

    const isValid = await ReferralService.validateCode(body.code);

    return NextResponse.json({ valid: isValid });
}, { schema: validateSchema });
