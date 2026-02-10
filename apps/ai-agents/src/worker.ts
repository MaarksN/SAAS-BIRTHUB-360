import { createWorker } from '@salesos/queue-core';
import { ScraperEngine } from './scraper/scraper-engine';
import { logger } from '@salesos/core';
import Bottleneck from 'bottleneck';
import { URL } from 'url';

// Initialize Scraper Engine
const scraperEngine = new ScraperEngine();

// Bottleneck Group for Rate Limiting by Domain
const limiterGroup = new Bottleneck.Group({
  maxConcurrent: 1, // Only 1 request at a time per domain
  minTime: 1000,    // Minimum 1 second between requests
});

// Scraping Worker
createWorker('scraping-queue', async (job) => {
  logger.info({ jobId: job.id, url: job.data.url }, 'Processing scraping job');

  if (!job.data.url) {
    throw new Error('URL is required');
  }

  const urlObj = new URL(job.data.url);
  const domain = urlObj.hostname;

  // Ensure engine is ready
  await scraperEngine.init();

  // Wrap execution in limiter
  return limiterGroup.key(domain).schedule(async () => {
    try {
      logger.info({ jobId: job.id, domain }, 'Executing scrape within rate limit');
      const result = await scraperEngine.scrape(job.data.url);
      logger.info({ jobId: job.id, success: true }, 'Scraping successful');
      return result;
    } catch (error) {
      logger.error({ jobId: job.id, error }, 'Scraping failed');
      throw error;
    }
  });
}, {
  concurrency: 5, // Total concurrent workers across all domains
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
