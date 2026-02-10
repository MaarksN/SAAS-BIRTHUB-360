import { describe, expect, it } from 'vitest';

import { features } from './features';
import { guard } from './guard';

describe('Guard', () => {
  it('should allow requests within rate limit', () => {
    const userId = 'user-1';
    expect(() => guard.checkRateLimit('ai', userId)).not.toThrow();
  });

  it('should throw when rate limit exceeded', () => {
    const userId = 'user-spam';
    // Consume all tokens
    // Default limit is 20 for AI
    for (let i = 0; i < 20; i++) {
        guard.checkRateLimit('ai', userId);
    }
    expect(() => guard.checkRateLimit('ai', userId)).toThrow(/Rate limit exceeded/);
  });

  it('should check cost correctly', () => {
      const userId = 'user-cost';
      expect(() => guard.checkCost('ai', userId, 10)).not.toThrow();
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
