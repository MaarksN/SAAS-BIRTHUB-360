import { AppError, ErrorCategory,ErrorCode, ReferralService } from '@salesos/core';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createApiHandler } from '@/lib/api-handler';

const validateSchema = z.object({
    code: z.string(),
});

export const POST = createApiHandler(async (req, { body }) => {
    if (!body) throw new AppError('Missing body', 400, ErrorCode.INVALID_INPUT, ErrorCategory.VALIDATION);

    const isValid = await ReferralService.validateCode(body.code);

    return NextResponse.json({ valid: isValid });
}, { schema: validateSchema });
