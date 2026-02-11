import { redis } from './redis';
import { logger } from './logger';

export class CacheService {
  private static readonly DEFAULT_TTL = 300; // 5 minutes

  /**
   * Cache-Aside pattern implementation with probabilistic early expiration to prevent stampede.
   * @param key The cache key
   * @param fetchFn The function to fetch data if cache is empty
   * @param ttlSeconds Time to live in seconds
   * @returns The data from cache or fetchFn
   */
  static async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlSeconds: number = this.DEFAULT_TTL
  ): Promise<T> {
    try {
      const cached = await redis.get(key);

      if (cached) {
        // Probabilistic Early Expiration (beta = 1.0)
        // If remaining TTL is small, recompute in background or foreground
        const ttl = await redis.ttl(key);

        // Simple stampede protection: if TTL is < 10% of original, 10% chance to recompute
        if (ttl > 0 && ttl < ttlSeconds * 0.1) {
            if (Math.random() < 0.1) {
                logger.info({ key }, 'Cache probabilistic refresh triggered');
                // Return old value but refresh in background (fire and forget)
                this.refresh(key, fetchFn, ttlSeconds).catch(err =>
                    logger.error({ err, key }, 'Background cache refresh failed')
                );
            }
        }

        return JSON.parse(cached) as T;
      }
    } catch (error) {
      logger.error({ error, key }, 'Redis get failed, falling back to fetchFn');
    }

    // Cache miss or error
    return this.refresh(key, fetchFn, ttlSeconds);
  }

  private static async refresh<T>(key: string, fetchFn: () => Promise<T>, ttl: number): Promise<T> {
      const data = await fetchFn();
      try {
        if (data) {
            await redis.setex(key, ttl, JSON.stringify(data));
        }
      } catch (error) {
          logger.error({ error, key }, 'Redis set failed');
      }
      return data;
  }

  static async invalidate(tag: string) {
      // In a real implementation, this would scan/delete keys or use Redis sets for tagging
      // For now, we'll assume keys are prefixed or known
      logger.info({ tag }, 'Cache invalidation requested');
  }
}
