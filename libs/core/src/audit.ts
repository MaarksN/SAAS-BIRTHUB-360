import { Queue } from 'bullmq';
import { env } from './env';

const AUDIT_QUEUE_NAME = 'audit-queue';

// Create a dedicated queue for audit logs
const auditQueue = new Queue(AUDIT_QUEUE_NAME, {
  connection: {
    host: 'localhost', // Default fallback
    port: 6379,
    ...(env.REDIS_URL ? parseRedisUrl(env.REDIS_URL) : {})
  },
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

function parseRedisUrl(url: string) {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port || '6379'),
      password: parsed.password,
      username: parsed.username,
      tls: parsed.protocol === 'rediss:' ? {} : undefined
    };
  } catch (e) {
    return {};
  }
}

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
