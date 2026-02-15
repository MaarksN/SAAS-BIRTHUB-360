// import { guard } from './guard'; // This file does not exist!
import { guard } from '@salesos/core'; // Use the core one
import { describe, expect, it } from 'vitest';

import { features } from './features';

describe('Guard', () => {
  it('should allow requests within rate limit', async () => {
    const userId = 'user-1';
    await expect(guard.checkRateLimit('ai', userId)).resolves.not.toThrow();
  });

  it('should throw when rate limit exceeded', async () => {
    const userId = 'user-spam';
    // Consume all tokens
    // Default limit is 20 for AI
    for (let i = 0; i < 20; i++) {
        await guard.checkRateLimit('ai', userId);
    }
    await expect(guard.checkRateLimit('ai', userId)).rejects.toThrow(/Rate limit exceeded/);
  });

  it('should check cost correctly', async () => {
      const userId = 'user-cost';
      await expect(guard.checkCost('ai', userId, 10)).resolves.not.toThrow();
  });
});

describe('Features', () => {
    it('should return default values if env not set', () => {
        expect(features.isEnabled('AI_ENABLED')).toBe(true);
    });

    it('should respect env vars', () => {
        process.env.FEATURE_AI_ENABLED = 'false';
        expect(features.isEnabled('AI_ENABLED')).toBe(false);
        process.env.FEATURE_AI_ENABLED = 'true'; // Reset
    });
});
