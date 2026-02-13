import { NextResponse } from 'next/server';
import { prisma, redis } from '@salesos/core';

export const dynamic = 'force-dynamic';

export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: 'unknown',
      redis: 'unknown',
    },
  };

  let status = 200;

  try {
    // Prisma check (using a simple query)
    await prisma.$queryRaw`SELECT 1`;
    health.services.database = 'connected';
  } catch (error) {
    console.error('Database check failed', error);
    health.services.database = 'disconnected';
    status = 503;
  }

  try {
    // Redis check
    await redis.ping();
    health.services.redis = 'connected';
  } catch (error) {
    console.error('Redis check failed', error);
    health.services.redis = 'disconnected';
    status = 503;
  }

  if (status !== 200) {
      health.status = 'error';
  }

  return NextResponse.json(health, { status });
}
