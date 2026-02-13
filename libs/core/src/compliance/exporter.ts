import { prisma } from '../prisma';
import { logger } from '../logger';

export class DataExporter {
  async exportUserData(userId: string, organizationId: string) {
    logger.info({ userId, organizationId }, '📦 Starting Data Export');

    // Fetch all related data
    // In a real app, this might be a background job that streams to S3
    // For MVP, we gather in memory and return JSON.

    const [user, leads, logs, emails] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.lead.findMany({ where: { organizationId } }), // Export Org Leads or just Owned? Usually Org.
      prisma.auditLog.findMany({ where: { organizationId } }),
      prisma.emailAccount.findMany({ where: { organizationId } })
    ]);

    return {
      metadata: {
        exportedAt: new Date(),
        userId,
        organizationId
      },
      user,
      leads,
      logs,
      emailAccounts: emails.map(e => ({ ...e, credentials: '[REDACTED]' })) // Security
    };
  }
}
