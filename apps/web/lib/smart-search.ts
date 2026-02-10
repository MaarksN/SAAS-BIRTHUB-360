import { llmGateway } from '@salesos/ai';
import { RedisCacheService } from '@salesos/cache';
import { logger } from '@salesos/core';
import { SmartSearchQuerySchema } from './schemas';

const cache = new RedisCacheService();

export const smartSearch = {
  translateQuery: async (naturalLanguageQuery: string) => {
    // Validate input
    const parsed = SmartSearchQuerySchema.safeParse({ query: naturalLanguageQuery });
    if (!parsed.success) {
        throw new Error('Invalid search query');
    }

    const cacheKey = `ai-assistant:search:${naturalLanguageQuery}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
        logger.info('Returning cached search translation', { query: naturalLanguageQuery });
        return cached;
    }

    // Use LLM to convert "Find SaaS companies in Berlin with >50 employees" to a structured filter
    const prompt = `Convert this query to JSON filter: "${naturalLanguageQuery}"`;
    const response = await llmGateway.complete({ prompt });

    // Mock parsing result
    const result = {
      industry: 'SaaS',
      location: 'Berlin',
      minEmployees: 50
    };

    await cache.set(cacheKey, result, 3600); // 1h cache
    return result;
  }
};
