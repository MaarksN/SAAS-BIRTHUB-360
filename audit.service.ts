export interface AuditLog {
  userId: string;
  action: string;
  resource: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

export class AuditService {
  async logAction(userId: string, action: string, resource: string, metadata?: Record<string, unknown>): Promise<void> {
    const log: AuditLog = {
      userId,
      action,
      resource,
      metadata,
      timestamp: new Date(),
    };
    // In a real app, this would save to DB or send to external service
    console.log('[AUDIT]', JSON.stringify(log));
  }
}
