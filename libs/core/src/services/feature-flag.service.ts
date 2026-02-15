import { logger } from '../logger';
import { prisma } from '../prisma';
import { redis } from '../redis';

const CACHE_TTL = 300; // 5 minutes

export interface FeatureFlagContext {
  userId?: string;
  organizationId?: string;
}

export class FeatureFlagService {
  /**
   * Checks if a feature flag is enabled for the given context.
   * Uses Redis caching (L1) and DB (L2).
   */
  static async isEnabled(
    key: string,
    context: FeatureFlagContext = {},
  ): Promise<boolean> {
    try {
      // 1. Check Cache
      const cacheKey = `feature_flag:${key}`;
      const cached = await redis.get(cacheKey);

      let flag: any;
      if (cached) {
        flag = JSON.parse(cached);
      } else {
        // 2. Fetch from DB
        flag = await prisma.featureFlag.findUnique({
          where: { key },
        });

        if (flag) {
          await redis.set(cacheKey, JSON.stringify(flag), 'EX', CACHE_TTL);
        }
      }

      if (!flag) {
        // Flag doesn't exist, default to false (safe)
        return false;
      }

      // 3. Global Check
      if (flag.isEnabled) {
        return true;
      }

      // 4. Rule Evaluation (if globally disabled/beta)
      if (!flag.rules) {
        return false;
      }

      const rules = flag.rules as any;

      // A. Allowlist (Users)
      if (context.userId && rules.users && Array.isArray(rules.users)) {
        if (rules.users.includes(context.userId)) {
          return true;
        }
      }

      // B. Allowlist (Orgs)
      if (context.organizationId && rules.orgs && Array.isArray(rules.orgs)) {
        if (rules.orgs.includes(context.organizationId)) {
          return true;
        }
      }

      // C. Percentage Rollout (User based)
      if (context.userId && rules.percentage !== undefined) {
        const hash = FeatureFlagService.hashString(context.userId + key);
        const userScore = hash % 100;
        if (userScore < rules.percentage) {
          return true;
        }
      }

      return false;
    } catch (error) {
      logger.error({ error, key, context }, 'Error evaluating feature flag');
      // Fail closed (safe)
      return false;
    }
  }

  private static hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Clears the cache for a specific flag.
   * Call this after updating a flag.
   */
  static async invalidateCache(key: string): Promise<void> {
    await redis.del(`feature_flag:${key}`);
  }
}
