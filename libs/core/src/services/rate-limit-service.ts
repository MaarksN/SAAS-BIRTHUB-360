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

  async close() {
    await this.redis.quit();
  }
}
