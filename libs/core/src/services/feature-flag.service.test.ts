import { FeatureFlagService } from '../feature-flag.service';
import { prisma } from '../../prisma';
import { redis } from '../../redis';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../prisma', () => ({
  prisma: {
    featureFlag: {
      findUnique: vi.fn()
    }
  }
}));

vi.mock('../../redis', () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn()
  }
}));

describe('FeatureFlagService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return false if flag does not exist', async () => {
    (redis.get as any).mockResolvedValue(null);
    (prisma.featureFlag.findUnique as any).mockResolvedValue(null);

    const result = await FeatureFlagService.isEnabled('non-existent');
    expect(result).toBe(false);
  });

  it('should return true if flag is globally enabled', async () => {
    const flag = { key: 'test', isEnabled: true };
    (redis.get as any).mockResolvedValue(JSON.stringify(flag));

    const result = await FeatureFlagService.isEnabled('test');
    expect(result).toBe(true);
  });

  it('should return true for allowed user', async () => {
    const flag = {
      key: 'test',
      isEnabled: false,
      rules: { users: ['user1'] }
    };
    (redis.get as any).mockResolvedValue(JSON.stringify(flag));

    const result = await FeatureFlagService.isEnabled('test', { userId: 'user1' });
    expect(result).toBe(true);
  });

  it('should return false for disallowed user', async () => {
    const flag = {
      key: 'test',
      isEnabled: false,
      rules: { users: ['user1'] }
    };
    (redis.get as any).mockResolvedValue(JSON.stringify(flag));

    const result = await FeatureFlagService.isEnabled('test', { userId: 'user2' });
    expect(result).toBe(false);
  });
});
