import { logger } from './logger';

// In-memory store for Rate Limiting and Cost Tracking
// Note: This is instance-local. In a distributed environment (serverless), this resets per instance.
// For production cluster, this should be backed by Redis.
const rateLimits = new Map<string, { tokens: number; lastRefill: number }>();
const costUsage = new Map<string, number>();

const checkRateLimitInternal = (key: string, limit: number, windowSeconds: number): boolean => {
  const now = Date.now();
  const entry = rateLimits.get(key) || { tokens: limit, lastRefill: now };

  const elapsed = (now - entry.lastRefill) / 1000;
  if (elapsed > 0) {
    const tokensToAdd = elapsed * (limit / windowSeconds);
    entry.tokens = Math.min(limit, entry.tokens + tokensToAdd);
    entry.lastRefill = now;
  }

  if (entry.tokens >= 1) {
    entry.tokens -= 1;
    rateLimits.set(key, entry);
    return true;
  }

  rateLimits.set(key, entry);
  return false;
};

export const guard = {
  /**
   * Checks if the user has exceeded the rate limit for the given action.
   * Throws an error if exceeded.
   */
  checkRateLimit: (actionType: string, userId: string = 'anonymous'): void => {
    // Configuration
    let limit = 100; // default requests
    const window = 60; // 1 minute

    if (actionType === 'ai') {
      limit = 20; // stricter for AI
    } else if (actionType === 'write') {
      limit = 50;
    }

    const key = `ratelimit:${actionType}:${userId}`;
    if (!checkRateLimitInternal(key, limit, window)) {
      logger.warn(`Rate limit exceeded for user ${userId} on action ${actionType}`);
      throw new Error(`Rate limit exceeded for ${actionType}. Please try again later.`);
    }
  },

  /**
   * Checks if the user has enough budget/quota for the action.
   * Tracks usage.
   */
  checkCost: (actionType: string, userId: string = 'anonymous', estimatedCost: number = 1): void => {
    // Hard limit per user per day (mock currency units)
    const DAILY_LIMIT = 1000;

    const today = new Date().toISOString().split('T')[0];
    const key = `cost:${userId}:${today}`;

    const current = costUsage.get(key) || 0;

    if (current + estimatedCost > DAILY_LIMIT) {
      logger.warn(`Cost limit exceeded for user ${userId} on action ${actionType}. Current: ${current}, Limit: ${DAILY_LIMIT}`);
      throw new Error(`Daily cost limit reached for this account.`);
    }

    // Speculatively add cost (commit happens later technically, but for safety we reserve it)
    costUsage.set(key, current + estimatedCost);
  }
};
