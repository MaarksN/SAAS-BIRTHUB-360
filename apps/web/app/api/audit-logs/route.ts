import { createApiHandler } from '@/lib/api-handler';
import { prisma, getContext, AppError, ErrorCode, ErrorCategory } from '@salesos/core';
import { NextResponse } from 'next/server';

export const GET = createApiHandler(
  async (req) => {
    const context = getContext();

    if (!context) {
        throw new AppError('Internal Server Error: Context missing', 500, ErrorCode.INTERNAL_ERROR, ErrorCategory.SYSTEM);
    }

    const { organizationId, role } = context;

    if (!organizationId) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED, ErrorCategory.SECURITY);
    }

    // Only ADMIN or OWNER can view audit logs
    if (role !== 'ADMIN' && role !== 'OWNER') {
      throw new AppError(
        'Insufficient permissions',
        403,
        ErrorCode.FORBIDDEN,
        ErrorCategory.SECURITY
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({
        where: { organizationId },
      }),
    ]);

    return NextResponse.json({
      data: logs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }
);
