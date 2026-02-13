import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@salesos/core';

// This endpoint is protected by API Key, NOT Session
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing API Key' }, { status: 401 });
  }

  const apiKey = authHeader.split(' ')[1];

  // Validate Key (Naive implementation, in prod use hash comparison)
  // Since we store 'key' directly in this MVP schema (should be hashed), we query directly.
  const keyRecord = await prisma.apiKey.findUnique({
    where: { key: apiKey }
  });

  if (!keyRecord || !keyRecord.isActive) {
    return NextResponse.json({ error: 'Invalid API Key' }, { status: 403 });
  }

  // Inject Context Manually because we bypass standard Middleware/Session
  // In a real app, we would have a middleware for /api/v1 that does this.

  const leads = await prisma.lead.findMany({
    where: { organizationId: keyRecord.organizationId },
    take: 100,
    select: { id: true, name: true, email: true, status: true }
  });

  return NextResponse.json({ data: leads });
}
