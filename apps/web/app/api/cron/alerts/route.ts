import { NextResponse } from 'next/server';
import { prisma, alerts, env } from '@salesos/core';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // In a real scenario, use cursor-based pagination
    const organizations = await prisma.organization.findMany({
      where: {
        deletedAt: null,
        // Only check active subs or orgs with usage?
        // For now, check all to be safe against leaks
      },
      select: { id: true }
    });

    // Process in batches/parallel
    const results = await Promise.allSettled(
      organizations.map(org => alerts.checkAndAlert(org.id))
    );

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failCount = results.filter(r => r.status === 'rejected').length;

    return NextResponse.json({
      success: true,
      processed: organizations.length,
      ok: successCount,
      errors: failCount
    });

  } catch (error: any) {
    console.error('Cron Alert failed:', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
