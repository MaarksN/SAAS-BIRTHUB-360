import { createWorker, createQueue } from '@salesos/queue-core';
import { ScraperEngine } from './scraper/scraper-engine';
import { logger, prisma, AuditLogData, SenderEngine } from '@salesos/core';

// Initialize Engines
const scraperEngine = new ScraperEngine();
const senderEngine = new SenderEngine();
const emailQueue = createQueue('email-queue');

// Scraping Worker
createWorker('scraping-queue', async (job) => {
  logger.info({ jobId: job.id, url: job.data.url }, 'Processing scraping job');

  if (!job.data.url) {
    throw new Error('URL is required');
  }

  // Ensure engine is ready (lazy init)
  // Or call init() once globally. But lazy allows retry if browser crashes.
  await scraperEngine.init();

  try {
    const result = await scraperEngine.scrape(job.data.url);
    logger.info({ jobId: job.id, success: true }, 'Scraping successful');
    return result;
  } catch (error) {
    logger.error({ jobId: job.id, error }, 'Scraping failed');
    throw error;
  }
}, {
  concurrency: 5, // Limit concurrent browser contexts
});

// AI Analysis Worker (Placeholder)
createWorker('ai-analysis-queue', async (job) => {
  logger.info({ jobId: job.id }, 'Processing AI analysis job');
  // ... OpenAI logic ...
  return { analysis: 'Placeholder' };
}, {
  concurrency: 2, // CPU bound
});

// Email Queue Worker (Consumer)
createWorker<{ scheduledEmailId: string }>('email-queue', async (job) => {
  const { scheduledEmailId } = job.data;
  logger.info({ jobId: job.id, scheduledEmailId }, 'Processing email send task');

  await senderEngine.sendEmail(scheduledEmailId);

  return { sent: true };
}, {
  concurrency: 10, // IO bound
});

// Dispatcher (Cron - Runs every 60s)
// In a real production setup, this should be a separate service or use a distributed lock (e.g. Redlock)
// to prevent multiple workers from dispatching the same emails if scaled horizontally.
// For now, we assume a single worker instance or that `updateMany` handles concurrency via row locking (skip locked).
async function runDispatcher() {
  try {
    const now = new Date();

    // 1. Find Pending Emails due now
    // We use a transaction or simple update to mark them as QUEUED to avoid double processing
    // But Prisma doesn't support "UPDATE ... RETURNING" cleanly with "limit" easily in one go for varying IDs without raw query.
    // We'll fetch first, then loop.

    const pendingEmails = await prisma.scheduledEmail.findMany({
      where: {
        status: 'PENDING',
        sendAt: { lte: now }
      },
      take: 100 // Batch size
    });

    if (pendingEmails.length === 0) return;

    logger.info({ count: pendingEmails.length }, 'Dispatcher found pending emails');

    for (const email of pendingEmails) {
      try {
        // Optimistic locking or just update status first
        // Prisma update only accepts unique where. To use composite check (id + status), we must use updateMany.
        const result = await prisma.scheduledEmail.updateMany({
          where: { id: email.id, status: 'PENDING' },
          data: { status: 'QUEUED' }
        });

        if (result.count === 0) continue; // Already processed or not pending

        // Add to Queue
        await emailQueue.add('send-email', { scheduledEmailId: email.id }, {
           jobId: `email-${email.id}`, // Deduplication
           removeOnComplete: true
        });
      } catch (e) {
        // Race condition or update failed (already processed), ignore
      }
    }
  } catch (error) {
    logger.error({ error }, 'Dispatcher failed');
  }
}

// Start Dispatcher Loop
setInterval(runDispatcher, 60000);
// Run immediately on startup
runDispatcher();

// Audit Log Worker
createWorker<AuditLogData>('audit-queue', async (job) => {
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

logger.info('Workers started');
