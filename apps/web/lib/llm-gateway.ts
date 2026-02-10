import { guard, features, logger, countTokens, usage, firewall } from '@salesos/core';

export type LLMProvider = 'openai' | 'anthropic';

export interface CompletionRequest {
  prompt: string;
  provider?: LLMProvider;
  temperature?: number;
  userId?: string;
  organizationId: string; // Mandatory for billing
  contextType?: string;
}

export const llmGateway = {
  complete: async (request: CompletionRequest): Promise<string> => {
    const userId = request.userId || 'anonymous';
    const organizationId = request.organizationId;
    const model = 'gpt-4o'; // Default or from request

    // 1. Feature Flag Check
    if (!features.isEnabled('AI_ENABLED')) {
      logger.warn('AI feature is disabled', { userId });
      throw new Error('AI services are temporarily disabled.');
    }

    // 2. Firewall Check (Input)
    await firewall.checkInput(request.prompt);

    // 3. Token Counting (Pre-flight)
    const inputTokens = countTokens(request.prompt, model);
    // Estimate output (e.g., max tokens or avg) for budget check
    const estimatedOutputTokens = 500;
    const estimatedCost = usage.calculateCost(model, inputTokens, estimatedOutputTokens);

    // 4. Rate Limit Check
    try {
      await guard.checkRateLimit('ai', userId);
    } catch (error) {
      logger.warn('Rate limit blocked AI request', { userId });
      throw error;
    }

    // 4. Cost Guard Check (Budget)
    try {
      await guard.checkCost('ai', userId, estimatedCost);
    } catch (error) {
      logger.warn('Cost guard blocked AI request', { userId, estimatedCost });
      throw error;
    }

    // 5. Plan Limit Check (Monthly Tokens)
    try {
        await guard.checkPlanLimit(organizationId, 'ai_tokens', inputTokens + estimatedOutputTokens);
    } catch (error) {
        logger.warn('Plan limit blocked AI request', { organizationId });
        throw error;
    }

    const startTime = Date.now();

    // Mock LLM response
    // In real implementation, this would call the provider
    const response = await retry(async () => {
      // Simulate network call
      await new Promise(res => setTimeout(res, 500)); // Latency
      return `[AI Response from ${request.provider || 'openai'}] Based on the context, I suggest focusing on value-based selling...`;
    }, 3);

    const latencyMs = Date.now() - startTime;
    const outputTokens = countTokens(response, model);

    // 6. Record Actual Usage (Async)
    usage.recordUsage({
        userId,
        organizationId,
        model,
        inputTokens,
        outputTokens,
        latencyMs,
        contextType: request.contextType || 'chat',
    }).catch(err => logger.error('Failed to record usage', err));

    // 7. Firewall Sanitize (Output)
    return firewall.sanitizeOutput(response);
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
