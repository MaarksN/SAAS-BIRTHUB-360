'use server';

import { prisma, withCache, getOrganizationId } from '@salesos/core';
import { withContext } from '@/lib/context-wrapper';

export async function getCampaignStats() {
  return withContext(async () => {
    const orgId = getOrganizationId();
    const cacheKey = `analytics:stats:${orgId}`;

    return withCache(cacheKey, 60, async () => {
        // Aggregate email stats
        const stats = await prisma.scheduledEmail.groupBy({
            by: ['status'],
            _count: {
                id: true
            }
        });

    const counts = {
        SENT: 0,
        OPENED: 0,
        REPLIED: 0,
        BOUNCED: 0,
        PENDING: 0
    };

    stats.forEach(s => {
        if (s.status in counts) {
            counts[s.status as keyof typeof counts] = s._count.id;
        }
    });

    // Mock OPENED/REPLIED if not tracked in status directly (usually tracked in metadata or separate events)
    // For this MVP, let's assume status updates reflect lifecycle.

    return counts;
    });
  });
}

export async function getLeadFunnel() {
    return withContext(async () => {
        const orgId = getOrganizationId();
        const cacheKey = `analytics:funnel:${orgId}`;

        return withCache(cacheKey, 60, async () => {
            const funnel = await prisma.lead.groupBy({
                by: ['status'],
                _count: { id: true }
            });

            return funnel.map(f => ({ status: f.status, count: f._count.id }));
        });
    });
}
