import { z } from 'zod';

export enum QueueName {
  SCRAPING_HIGH = 'scraping.high',
  SCRAPING_LOW = 'scraping.low',
  AI_PROCESSING = 'ai.processing',
}

// Job Schemas for validation
export const ScrapingJobSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  source: z.enum(['linkedin', 'apollo', 'google']),
  priority: z.enum(['high', 'low']).default('low'),
  metadata: z.record(z.any()).optional(),
});

export const AiProcessingJobSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  context: z.record(z.any()),
  model: z.string().optional(),
});

export type ScrapingJob = z.infer<typeof ScrapingJobSchema>;
export type AiProcessingJob = z.infer<typeof AiProcessingJobSchema>;
