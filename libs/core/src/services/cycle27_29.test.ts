import { describe, expect, it, vi } from 'vitest';

import { RateLimitService } from './rate-limit-service';
import { WatchdogService } from './watchdog-service';

// Mock Redis
vi.mock('ioredis', () => {
  return {
    default: class {
      get = vi.fn().mockResolvedValue('10.0'); // Current spend
      incrbyfloat = vi.fn().mockResolvedValue(10.1);
      llen = vi.fn().mockResolvedValue(500); // Queue size
      quit = vi.fn();
    },
  };
});

describe('Cycle 27: FinOps', () => {
  it('should allow request if budget not exceeded', async () => {
    const service = new RateLimitService('redis://mock');
    const allowed = await service.checkBudget('org-123', 0.5);
    expect(allowed).toBe(true); // 10.0 + 0.5 < 50.0
  });

  it('should deny request if budget exceeded', async () => {
    const service = new RateLimitService('redis://mock');
    // Mock get to return high value
    vi.spyOn(service['redis'], 'get').mockResolvedValue('49.9');

    const allowed = await service.checkBudget('org-123', 1.0);
    expect(allowed).toBe(false); // 49.9 + 1.0 > 50.0
  });
});

describe('Cycle 29: Watchdog', () => {
  it('should report healthy status when queue is low', async () => {
    const watchdog = new WatchdogService('redis://mock');
    const health = await watchdog.monitorHealth();
    expect(health.status).toBe('healthy');
    expect(health.queueSize).toBe(500);
  });
});
