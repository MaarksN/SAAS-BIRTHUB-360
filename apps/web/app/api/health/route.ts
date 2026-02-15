import { NextResponse } from 'next/server';
import { prisma, redis } from '@salesos/core';

export const dynamic = 'force-dynamic';

export async function GET() {
  const healthCheck: any = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'ok',
    services: {
      database: 'unknown',
      redis: 'unknown',
    }
  };

  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;
    healthCheck.services.database = 'up';
  } catch (error) {
    console.error('Database health check failed:', error);
    healthCheck.services.database = 'down';
    healthCheck.status = 'error';
  }

  try {
    // Check redis connectivity
    if (redis) {
      await redis.ping();
      healthCheck.services.redis = 'up';
    } else {
      healthCheck.services.redis = 'not_configured';
    }
  } catch (error) {
    console.error('Redis health check failed:', error);
    healthCheck.services.redis = 'down';
    healthCheck.status = 'error';
  }

  if (healthCheck.status === 'error') {
    return NextResponse.json(healthCheck, { status: 503 });
  }

  return NextResponse.json(healthCheck);
}
