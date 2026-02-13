import { redis } from '../redis';
import { logger } from '../logger';

/**
 * Higher-order function to cache expensive DB queries
 * @param key Unique cache key
 * @param ttlSeconds Time to live
 * @param callback Async function returning data
 */
export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  callback: () => Promise<T>
): Promise<T> {
  // 1. Try Cache
  try {
    const cached = await redis.get(key);
    if (cached) {
      logger.debug({ key }, 'Cache Hit');
      return JSON.parse(cached) as T;
    }
  } catch (e) {
    logger.warn({ error: e }, 'Redis Cache Get Failed');
  }

  // 2. Fetch Fresh
  logger.debug({ key }, 'Cache Miss - Fetching');
  const data = await callback();

  // 3. Set Cache
  try {
    if (data) {
      await redis.setex(key, ttlSeconds, JSON.stringify(data));
    }
  } catch (e) {
    logger.warn({ error: e }, 'Redis Cache Set Failed');
  }

  return data;
}
