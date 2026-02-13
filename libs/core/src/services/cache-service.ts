import { redis } from '../redis';
import { logger } from '../logger';

export class CacheService {
  private redis = redis;
  private defaultTtl = 3600; // 1 hour

  /**
   * Retrieves a value from the cache.
   * @param key The cache key
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      logger.error({ error, key }, 'Cache get error');
      return null;
    }
  }

  /**
   * Sets a value in the cache with an optional TTL.
   * @param key The cache key
   * @param value The value to store
   * @param ttlSeconds TTL in seconds (default: 3600)
   */
  async set<T>(key: string, value: T, ttlSeconds: number = this.defaultTtl): Promise<void> {
    try {
      const data = JSON.stringify(value);
      await this.redis.set(key, data, 'EX', ttlSeconds);
    } catch (error) {
      logger.error({ error, key }, 'Cache set error');
    }
  }

  /**
   * Deletes a value from the cache.
   * @param key The cache key
   */
  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      logger.error({ error, key }, 'Cache del error');
    }
  }

  /**
   * Implements the Cache-Aside pattern.
   * Tries to get from cache; if missing, calls fetcher, stores result, and returns it.
   * @param key The cache key
   * @param fetcher Function to fetch data if cache miss
   * @param ttlSeconds TTL in seconds
   */
  async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttlSeconds: number = this.defaultTtl): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached) {
      logger.debug({ key }, 'Cache hit');
      return cached;
    }

    logger.debug({ key }, 'Cache miss, fetching data');
    const data = await fetcher();

    if (data !== undefined && data !== null) {
      await this.set(key, data, ttlSeconds);
    }

    return data;
  }
}

export const cacheService = new CacheService();
