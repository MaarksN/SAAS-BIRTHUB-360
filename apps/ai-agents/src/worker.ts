import { createWorker } from '@salesos/queue-core';
import { ScraperEngine } from './scraper/scraper-engine';
import { logger, prisma, AuditLogData } from '@salesos/core';

// Initialize Scraper Engine
const scraperEngine = new ScraperEngine();

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

// Email Queue Worker (Placeholder)
createWorker('email-queue', async (job) => {
  logger.info({ jobId: job.id }, 'Processing email job');
  // ... Email sending logic ...
  return { sent: true };
}, {
  concurrency: 10, // IO bound
});

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
