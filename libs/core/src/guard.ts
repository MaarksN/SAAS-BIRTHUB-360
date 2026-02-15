import { logger } from './logger';
import Redis from 'ioredis';
import { env } from './env';
import { prisma } from './prisma';

// Use Redis from env, or default to localhost
const redis = new Redis(env.REDIS_URL || 'redis://localhost:6379');

export const guard = {
  /**
   * Checks if the user has exceeded the rate limit for the given action.
   * Uses Redis for distributed rate limiting.
   */
  checkRateLimit: async (actionType: string, userId: string = 'anonymous'): Promise<void> => {
    let limit = 100;
    const window = 60; // 1 minute

    if (actionType === 'ai') limit = 20;
    else if (actionType === 'write') limit = 50;

    const key = `ratelimit:${actionType}:${userId}`;

    // Simple fixed window counter using Redis INCR and EXPIRE
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, window);
    }

    if (current > limit) {
      logger.warn(`Rate limit exceeded for user ${userId} on action ${actionType}`);
      throw new Error(`Rate limit exceeded for ${actionType}. Please try again later.`);
    }
  },

  /**
   * Checks if the organization has exceeded its plan limits.
   * Fetches the plan via organizationId -> plan -> limits.
   */
  checkPlanLimit: async (organizationId: string, resource: 'max_leads' | 'ai_tokens', amountToConsume: number = 1): Promise<void> => {
    // 1. Get Plan Limits (Cache in Redis for 5 mins to reduce DB load)
    const planKey = `org:plan:${organizationId}`;
    let limitsStr = await redis.get(planKey);
    let limits: any;

    if (!limitsStr) {
      const org = await prisma.organization.findUnique({
        where: { id: organizationId },
        include: { plan: true },
      });

      if (!org || !org.plan) {
        // Fallback or throw? Ideally throw if no plan assigned.
        // For now, assume a default limit or throw "No Active Plan"
        throw new Error("No active subscription plan found.");
      }

      limits = org.plan.limits;
      await redis.setex(planKey, 300, JSON.stringify(limits)); // Cache for 5 mins
    } else {
      limits = JSON.parse(limitsStr);
    }

    const limit = limits[resource] || 0; // if not defined, 0 limit (blocked)

    // 2. Check Usage (Cache in Redis for real-time tracking, sync to DB async via UsageLog)
    // Actually, usage should be tracked via DB aggregation for accuracy over long periods (monthly),
    // but for rate limiting, we need a fast counter.
    // Let's assume usage is reset monthly.

    // Key: usage:orgId:resource:month-year
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
    const usageKey = `usage:${organizationId}:${resource}:${monthKey}`;

    const currentUsage = await redis.incrby(usageKey, amountToConsume);
    // Set expiry if new key (e.g. 40 days just to be safe)
    if (currentUsage === amountToConsume) {
        await redis.expire(usageKey, 60 * 60 * 24 * 40);
    }

    if (currentUsage > limit) {
        logger.warn(`Plan limit exceeded for org ${organizationId} on ${resource}. Used: ${currentUsage}, Limit: ${limit}`);
        throw new Error(`Plan limit reached for ${resource}. Please upgrade.`);
    }
  },

  /**
   * Checks if the user has enough budget/quota for the action.
   * Tracks usage against daily/monthly limits.
   */
  checkCost: async (actionType: string, userId: string = 'anonymous', estimatedCost: number = 1): Promise<void> => {
    // Hard limit per user per day (mock currency units)
    const DAILY_LIMIT = 1000;

    const today = new Date().toISOString().split('T')[0];
    const key = `cost:${userId}:${today}`;

    // Get current cost from Redis
    const currentStr = await redis.get(key);
    const current = currentStr ? parseFloat(currentStr) : 0;

    if (current + estimatedCost > DAILY_LIMIT) {
      logger.warn(`Cost limit exceeded for user ${userId} on action ${actionType}. Current: ${current}, Limit: ${DAILY_LIMIT}`);
      throw new Error(`Daily cost limit reached for this account.`);
    }

    // Speculatively add cost (commit happens later technically, but for safety we reserve it)
    await redis.incrbyfloat(key, estimatedCost);
    // Set expiry for 24 hours
    if (current === 0) {
        await redis.expire(key, 86400);
    }
  }
};
