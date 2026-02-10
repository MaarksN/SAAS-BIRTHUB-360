import { guard, features, logger } from '@salesos/core';

export type LLMProvider = 'openai' | 'anthropic';

export interface CompletionRequest {
  prompt: string;
  provider?: LLMProvider;
  temperature?: number;
  userId?: string;
}

export const llmGateway = {
  complete: async (request: CompletionRequest): Promise<string> => {
    const userId = request.userId || 'anonymous';

    // 1. Feature Flag Check
    if (!features.isEnabled('AI_ENABLED')) {
      logger.warn('AI feature is disabled', { userId });
      throw new Error('AI services are temporarily disabled.');
    }

    // 2. Rate Limit Check
    try {
      guard.checkRateLimit('ai', userId);
    } catch (error) {
      logger.warn('Rate limit blocked AI request', { userId });
      throw error;
    }

    // 3. Cost Guard Check
    try {
      guard.checkCost('ai', userId, 1); // Assume 1 unit cost per call
    } catch (error) {
      logger.warn('Cost guard blocked AI request', { userId });
      throw error;
    }

    // Log the cost event (Audit)
    logger.info('COST_EVENT: AI Completion started', {
      userId,
      provider: request.provider,
      cost: 1
    });

    // Mock LLM response
    // In real implementation, this would call the provider
    return retry(async () => {
      // Simulate network call
      return `[AI Response from ${request.provider || 'openai'}] Based on the context, I suggest focusing on value-based selling...`;
    }, 3);
  }
};

async function retry<T>(fn: () => Promise<T>, retries: number, delayMs = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    logger.warn(`Retrying operation... (${retries} attempts left)`);
    await new Promise(res => setTimeout(res, delayMs));
    return retry(fn, retries - 1, delayMs * 2);
  }
}
