import { AuditLogData,logger, prisma } from '@salesos/core';

import { createWorker } from '../queue-wrapper';

export const auditWorker = createWorker<AuditLogData>('audit-queue', async (job) => {
  logger.info({ jobId: job.id, action: job.data.action }, 'Processing audit log');

  const { organizationId, actorId, action, entity, entityId, metadata, ipAddress, userAgent } = job.data;

  await prisma.auditLog.create({
    data: {
      organizationId,
      actorId,
      action,
      entity,
      entityId,
      metadata: metadata || {},
      ipAddress,
      userAgent
    }
  });

  return { logged: true };
}, {
  concurrency: 5,
});
