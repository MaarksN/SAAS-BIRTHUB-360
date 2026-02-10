import { createWorker } from '@salesos/queue-core';
import { ScraperEngine } from './scraper/scraper-engine';
import { logger } from '@salesos/core';

// Initialize Scraper Engine
const scraperEngine = new ScraperEngine();

// Scraping Worker
createWorker('scraping-queue', async (job) => {
  logger.info({ jobId: job.id, url: job.data.url }, 'Processing scraping job');

  // TODO: Implement strict per-domain rate limiting using Bottleneck or BullMQ Pro Groups.
  // Currently relies on queue-level limits and exponential backoff.

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

logger.info('Workers started');
