import { describe, it, expect, vi } from 'vitest';
import { CacheService } from './cache';

// Mock Redis directly without using top-level variable in factory
vi.mock('./redis', () => ({
  redis: {
    get: vi.fn(),
    setex: vi.fn(),
    ttl: vi.fn(),
  },
}));

vi.mock('./logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// Import redis to mock implementations
import { redis } from './redis';

describe('CacheService', () => {
  it('should return cached data if available', async () => {
    const key = 'test-key';
    const data = { value: 'cached' };

    // Mock implementation for this test
    (redis.get as any).mockResolvedValue(JSON.stringify(data));
    (redis.ttl as any).mockResolvedValue(300);

    const result = await CacheService.getOrSet(key, async () => ({ value: 'fresh' }));

    expect(result).toEqual(data);
    expect(redis.get).toHaveBeenCalledWith(key);
  });

  it('should fetch and cache data on cache miss', async () => {
    const key = 'miss-key';
    const data = { value: 'fresh' };

    (redis.get as any).mockResolvedValue(null);

    const result = await CacheService.getOrSet(key, async () => data);

    expect(result).toEqual(data);
    expect(redis.setex).toHaveBeenCalledWith(key, 300, JSON.stringify(data));
  });
});
