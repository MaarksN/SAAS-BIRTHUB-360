import { Queue } from 'bullmq';
import { redis } from './redis';

const AUDIT_QUEUE_NAME = 'audit-queue';

// Create a dedicated queue for audit logs using shared Redis connection
const auditQueue = new Queue(AUDIT_QUEUE_NAME, {
  connection: redis as any,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: 100, // Keep last 100 failed jobs
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    }
  }
});

export interface AuditLogData {
  organizationId: string;
  actorId?: string;
  action: string;
  entity: string;
  entityId: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}

export async function logAudit(data: AuditLogData) {
  try {
    await auditQueue.add('audit-log', data);
  } catch (error) {
    // Fire and forget - log error but don't break flow
    console.error('Failed to enqueue audit log:', error);
  }
}
