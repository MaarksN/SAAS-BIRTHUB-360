import { PrismaClient } from '@birthhub/database';

export interface AuditAction {
  action: string;
  resource: string;
  actorId: string;
  organizationId: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  constructor(private db: PrismaClient) {}

  async logAction(data: AuditAction) {
    // Append-only log
    await this.db.auditLog.create({
      data: {
        action: data.action,
        resource: data.resource,
        actorId: data.actorId,
        organizationId: data.organizationId,
        metadata: data.metadata || {},
        ipAddress: data.ipAddress,
        userAgent: data.userAgent
      }
    });
    console.log(`[Audit] ${data.action} on ${data.resource} by ${data.actorId}`);
  }

  async getLogs(organizationId: string, limit: number = 100) {
    return this.db.auditLog.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { actor: { select: { name: true, email: true } } }
    });
  }
}
