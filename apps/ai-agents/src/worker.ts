import { createWorker, createQueue } from '@salesos/queue-core';
import { ScraperEngine } from './scraper/scraper-engine';
import { logger, prisma } from '@salesos/core';
import { createCrmSyncWorker } from '@salesos/core';

// Import workers to ensure they are started
import {
  auditWorker,
  webhookWorker,
  emailWorker,
  dataImportWorker
} from '@salesos/queue-core';

// Prevent tree-shaking (optional, but good practice if only side-effects are needed)
const _workers = [auditWorker, webhookWorker, emailWorker, dataImportWorker];

// Initialize Engines
const scraperEngine = new ScraperEngine();
const emailQueue = createQueue('email-sending');

// Start CRM Sync Worker
createCrmSyncWorker();

// Scraping Worker
createWorker('scraping-queue', async (job) => {
  logger.info({ jobId: job.id, url: job.data.url }, 'Processing scraping job');

  if (!job.data.url) {
    throw new Error('URL is required');
  }

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
  concurrency: 5,
});

// AI Analysis Worker (Placeholder)
createWorker('ai-analysis-queue', async (job) => {
  logger.info({ jobId: job.id }, 'Processing AI analysis job');
  return { analysis: 'Placeholder' };
}, {
  concurrency: 2,
});

/**
 * Função executada via Cron/Interval
 * Busca emails 'PENDING' que já passaram da hora de envio e enfileira
 */
export async function scheduleEmails() {
  const BATCH_SIZE = 500;

  try {
    const now = new Date();

    const pendingEmails = await prisma.scheduledEmail.findMany({
      where: {
        status: 'PENDING',
        sendAt: {
          lte: now
        },
        deletedAt: null
      },
      take: BATCH_SIZE,
      orderBy: { sendAt: 'asc' }
    });

    if (pendingEmails.length === 0) return;

    logger.info({ count: pendingEmails.length }, 'Found pending emails to schedule');

    const jobs = pendingEmails.map(email => ({
      name: 'send-email',
      data: {
        scheduledEmailId: email.id,
        organizationId: email.organizationId
      },
      opts: {
        jobId: `email:${email.id}`,
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 5000
        }
      }
    }));

    await emailQueue.addBulk(jobs);

    const ids = pendingEmails.map(e => e.id);
    await prisma.scheduledEmail.updateMany({
      where: { id: { in: ids } },
      data: { status: 'QUEUED' }
    });

    logger.info({ count: ids.length }, 'Emails queued successfully');

  } catch (error) {
    logger.error({ error }, 'Error in email scheduler');
  }
}

// Start Dispatcher Loop
setInterval(scheduleEmails, 60000);
scheduleEmails();

logger.info('Workers started');
