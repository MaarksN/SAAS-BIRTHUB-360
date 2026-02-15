import { AppError, ErrorCategory,ErrorCode, ReferralService } from '@salesos/core';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createApiHandler } from '@/lib/api-handler';

const completeSchema = z.object({
    code: z.string(),
    userId: z.string(),
});

export const POST = createApiHandler(async (req, { body }) => {
    // Basic security check (should be improved with Admin key or specific permission)
    const adminKey = req.headers.get('x-admin-key');
    if (adminKey !== process.env.ADMIN_KEY && process.env.NODE_ENV !== 'development') {
        throw new AppError('Forbidden', 403, ErrorCode.FORBIDDEN, ErrorCategory.AUTHORIZATION);
    }

    if (!body) throw new AppError('Missing body', 400, ErrorCode.INVALID_INPUT, ErrorCategory.VALIDATION);

    try {
        await ReferralService.completeReferral(body.code, body.userId);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}, { schema: completeSchema });
