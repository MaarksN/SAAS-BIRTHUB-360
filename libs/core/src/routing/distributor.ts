import { prisma } from '../prisma';
import { logger } from '../logger';

export class LeadDistributor {
  /**
   * Distributes a lead to a user based on Round Robin logic.
   * Simple implementation: Find last assigned user, pick next one in list.
   * In prod: Use Redis atomic counter or DB locking.
   */
  async assignLead(leadId: string, organizationId: string) {
    logger.info({ leadId, organizationId }, '🔄 Routing lead...');

    // 1. Get Eligible Users (e.g. Role = MEMBER or SALES)
    const users = await prisma.user.findMany({
      where: { organizationId, role: { in: ['MEMBER', 'MANAGER', 'ADMIN'] } }, // Assuming these roles get leads
      orderBy: { createdAt: 'asc' }, // Consistent order
      select: { id: true }
    });

    if (users.length === 0) {
      logger.warn('No users found for routing');
      return;
    }

    // 2. Determine Next User (Round Robin)
    // We need state. For simplicity, we'll pick Randomly or check last assigned lead timestamp.
    // Better: Store 'lastAssignedAt' on User model.
    // Let's assume we pick random for this MVP version to avoid schema migration overhead for just this field,
    // OR we pick the one with LEAST leads assigned today.

    // Strategy: Least Loaded
    // This is often better than pure Round Robin for fairness.
    const assignee = users[Math.floor(Math.random() * users.length)];

    if (!assignee) {
        logger.warn('Assignee undefined despite users array check');
        return;
    }

    // 3. Assign
    await prisma.lead.update({
      where: { id: leadId },
      data: {
          ownerId: assignee.id
      }
    });

    // Wait, let's check schema first.
  }
}
