import Redis from 'ioredis';
import { env } from '@salesos/config';
import { CacheService } from './types';

export class RedisCacheService implements CacheService {
  private client: Redis;

  constructor(connectionString?: string) {
    this.client = new Redis(connectionString || env.REDIS_URL || 'redis://localhost:6379');
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const data = JSON.stringify(value);
    if (ttlSeconds) {
      await this.client.set(key, data, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, data);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }
}
