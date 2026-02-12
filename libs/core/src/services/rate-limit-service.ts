import Redis from 'ioredis';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // Unix timestamp
}

export class RateLimitService {
  private redis: Redis;

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl);
  }

  /**
   * Implements a simple Fixed Window Counter algorithm.
   * @param identifier - Unique ID (e.g., API Key Hash or IP)
   * @param limit - Max requests per window
   * @param windowSeconds - Window size in seconds (default 60)
   */
  async checkLimit(identifier: string, limit: number, windowSeconds: number = 60): Promise<RateLimitResult> {
    const key = `ratelimit:${identifier}`;

    // Multi command: INCR and TTL
    const pipeline = this.redis.pipeline();
    pipeline.incr(key);
    pipeline.ttl(key);

    const results = await pipeline.exec();

    if (!results) {
      throw new Error('Redis pipeline failed');
    }

    const [incrErr, currentCount] = results[0];
    const [ttlErr, ttl] = results[1];

    if (incrErr) throw incrErr;

    const count = currentCount as number;
    let remainingTtl = ttl as number;

    // If key was just created (count === 1), set expiration
    if (count === 1) {
      await this.redis.expire(key, windowSeconds);
      remainingTtl = windowSeconds;
    }

    const resetAt = Math.floor(Date.now() / 1000) + (remainingTtl > 0 ? remainingTtl : windowSeconds);

    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
      resetAt
    };
  }

  /**
   * Cycle 27: Check Tenant Budget (FinOps)
   */
  async checkBudget(tenantId: string, estimatedCost: number): Promise<boolean> {
    const key = `budget:${tenantId}`;

    // Check current spend in Redis (L1)
    const currentSpend = parseFloat(await this.redis.get(key) || '0');
    const monthlyLimit = 50.0; // Mock limit, normally fetch from DB/Cache

    if (currentSpend + estimatedCost > monthlyLimit) {
      return false;
    }

    // Increment spend (Atomic)
    await this.redis.incrbyfloat(key, estimatedCost);
    return true;
  }

  async close() {
    await this.redis.quit();
  }
}
