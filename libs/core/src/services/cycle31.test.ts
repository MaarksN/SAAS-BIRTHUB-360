import { describe, it, expect, vi } from 'vitest';
import { ApiKeyService } from './api-key-service';
import { RateLimitService } from './rate-limit-service';

// Mock Redis
vi.mock('ioredis', () => {
  return {
    default: class {
      pipeline = vi.fn().mockReturnValue({
        incr: vi.fn(),
        ttl: vi.fn(),
        exec: vi.fn().mockResolvedValue([
          [null, 1], // incr result: 1 (first request)
          [null, -1] // ttl result: -1 (no expiration yet)
        ]),
      });
      expire = vi.fn().mockResolvedValue(1);
      quit = vi.fn();
    },
  };
});

describe('Cycle 31: API Gateway Foundation', () => {
  it('should generate and validate API Keys', () => {
    const service = new ApiKeyService();
    const { key, hash } = service.generateKey();

    expect(key).toMatch(/^sk_live_[a-f0-9]{64}$/);
    expect(service.validateKey(key, hash)).toBe(true);
    expect(service.validateKey('invalid_key', hash)).toBe(false);
  });

  it('should check rate limits', async () => {
    const service = new RateLimitService('redis://mock');
    const result = await service.checkLimit('test-hash', 10);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9);
  });
});
