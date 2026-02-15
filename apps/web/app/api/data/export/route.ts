import {
  AppError,
  DataManagementService,
  ErrorCategory,
  ErrorCode,
} from '@salesos/core';
import { NextRequest, NextResponse } from 'next/server';

import { createApiHandler } from '@/lib/api-handler';

export const GET = createApiHandler(async (req) => {
  const userId = req.headers.get('x-user-id');
  const orgId = req.headers.get('x-org-id');
  if (!userId || !orgId) {
    throw new AppError(
      'Unauthorized',
      401,
      ErrorCode.UNAUTHORIZED,
      ErrorCategory.AUTHENTICATION,
    );
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') as 'leads' | 'deals';
  const format = searchParams.get('format') as 'csv' | 'json';

  if (!['leads', 'deals'].includes(type) || !['csv', 'json'].includes(format)) {
    throw new AppError(
      'Invalid parameters. Type must be leads/deals. Format must be csv/json.',
      400,
      ErrorCode.INVALID_INPUT,
      ErrorCategory.VALIDATION,
    );
  }

  const data = await DataManagementService.exportData(orgId, type, format);

  const headers = new Headers();
  headers.set(
    'Content-Disposition',
    `attachment; filename="${type}-${new Date().toISOString()}.${format}"`,
  );
  headers.set(
    'Content-Type',
    format === 'csv' ? 'text/csv' : 'application/json',
  );

  return new NextResponse(data, {
    status: 200,
    headers,
  });
});
