import { NextRequest, NextResponse } from 'next/server';
import { runWithContext } from '@salesos/core';

export async function withRequestContext(
  req: NextRequest,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const organizationId = req.headers.get('x-org-id') || undefined;
  const userId = req.headers.get('x-user-id') || undefined;
  const role = req.headers.get('x-user-role') || undefined;
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();

  return runWithContext(
    { organizationId, userId, role, requestId },
    handler
  );
}
