import { prisma } from '../prisma';
import { logger } from '../logger';

export const PRICING_TABLE: Record<string, { input: number; output: number }> = {
  // Prices per 1k tokens (USD)
  'gpt-4o': { input: 0.005, output: 0.015 },
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
  // Add other models here
};

export const usage = {
  /**
   * Calculates the estimated cost of a request based on tokens and model.
   */
  calculateCost: (model: string, inputTokens: number, outputTokens: number): number => {
    const pricing = PRICING_TABLE[model] || PRICING_TABLE['gpt-4o-mini']; // Default fallback
    const inputCost = (inputTokens / 1000) * pricing.input;
    const outputCost = (outputTokens / 1000) * pricing.output;
    return Number((inputCost + outputCost).toFixed(6));
  },

  /**
   * Records usage to the database asynchronously.
   * Does not block the main thread unless awaited.
   */
  recordUsage: async ({
    userId,
    organizationId,
    model,
    inputTokens,
    outputTokens,
    latencyMs,
    contextType,
  }: {
    userId: string;
    organizationId: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    latencyMs: number;
    contextType: string;
  }) => {
    try {
      const estimatedCost = usage.calculateCost(model, inputTokens, outputTokens);

      await prisma.usageLog.create({
        data: {
          userId,
          organizationId,
          modelUsed: model,
          inputTokens,
          outputTokens,
          latencyMs,
          estimatedCost,
          contextType,
        },
      });

      logger.info(`Usage logged for ${userId} (Org: ${organizationId}): ${inputTokens}+${outputTokens} tokens. Cost: $${estimatedCost}`);
    } catch (error) {
      logger.error(`Failed to record usage for ${userId}`, error);
      // Don't throw, failing to log shouldn't break the user experience
    }
  },
};
