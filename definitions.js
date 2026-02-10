import { z } from 'zod';
export var QueueName;
(function (QueueName) {
    QueueName["SCRAPING_HIGH"] = "scraping.high";
    QueueName["SCRAPING_LOW"] = "scraping.low";
    QueueName["AI_PROCESSING"] = "ai.processing";
})(QueueName || (QueueName = {}));
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
