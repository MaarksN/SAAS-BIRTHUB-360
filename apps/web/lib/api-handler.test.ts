import { createApiHandler } from './api-handler';
import { NextRequest, NextResponse } from 'next/server';
import { AppError, ErrorCode, ErrorCategory } from '@salesos/core';
import { describe, it, expect, vi } from 'vitest';

// Mock @salesos/core logger to avoid noise
vi.mock('@salesos/core', async () => {
    const actual = await vi.importActual<any>('@salesos/core');
    return {
        ...actual,
        logger: {
            warn: vi.fn(),
            error: vi.fn()
        }
    };
});

// Mock api-context to simplify testing (avoid AsyncLocalStorage issues if any)
vi.mock('./api-context', () => ({
    withRequestContext: (req: any, cb: any) => cb()
}));

describe('createApiHandler', () => {
    it('should handle success', async () => {
        const handler = createApiHandler(async () => {
            return NextResponse.json({ ok: true });
        });

        const req = new NextRequest('http://localhost/api');
        const res = await handler(req, { params: {} });

        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json).toEqual({ ok: true });
    });

    it('should handle AppError', async () => {
        const handler = createApiHandler(async () => {
            throw new AppError('Test Error', 400, ErrorCode.INVALID_INPUT, ErrorCategory.VALIDATION);
        });

        const req = new NextRequest('http://localhost/api');
        const res = await handler(req, { params: {} });

        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.success).toBe(false);
        expect(json.error.code).toBe(ErrorCode.INVALID_INPUT);
    });
});
