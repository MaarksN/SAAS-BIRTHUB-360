import { logger,WebhookService } from '@salesos/core';

import { createWorker } from '../queue-wrapper';

export const webhookWorker = createWorker('webhook-queue', async (job) => {
  const { event, organizationId } = job.data;
  logger.info({ jobId: job.id, event, organizationId }, 'Processing webhook job');

  await WebhookService.process(job.data);

  return { processed: true };
}, {
  concurrency: 50, // High I/O concurrency
  limiter: {
    max: 100,      // Max 100 requests per second globally (prevent flooding clients)
    duration: 1000
  }
});
