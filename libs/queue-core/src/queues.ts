import { createQueue } from './queue-wrapper';

export const scrapingQueue = createQueue('scraping-queue', {
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: true,
  },
});

export const aiQueue = createQueue('ai-analysis-queue', {
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: true,
  },
});

export const emailQueue = createQueue('email-queue', {
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: 'exponential', delay: 5000 },
    priority: 1, // Higher priority
    removeOnComplete: true,
  },
});
