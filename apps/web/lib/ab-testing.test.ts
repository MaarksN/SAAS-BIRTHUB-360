import { describe, it, expect } from 'vitest';
import { ExperimentService } from './ab-testing';

describe('ExperimentService', () => {
  const service = new ExperimentService();
  const dummyExperimentId = 'exp-123';

  describe('isInExperiment', () => {
    it('should return true for even hash user IDs', () => {
      // "user-123" -> hash 642 (even) -> true
      expect(service.isInExperiment('user-123', dummyExperimentId)).toBe(true);
      // "b" -> hash 98 (even) -> true
      expect(service.isInExperiment('b', dummyExperimentId)).toBe(true);
    });

    it('should return false for odd hash user IDs', () => {
      // "user-124" -> hash 643 (odd) -> false
      expect(service.isInExperiment('user-124', dummyExperimentId)).toBe(false);
      // "a" -> hash 97 (odd) -> false
      expect(service.isInExperiment('a', dummyExperimentId)).toBe(false);
    });

    it('should be deterministic for the same user ID', () => {
      const userId = 'consistent-user';
      const result1 = service.isInExperiment(userId, dummyExperimentId);
      const result2 = service.isInExperiment(userId, dummyExperimentId);
      expect(result1).toBe(result2);
    });

    it('should handle empty user ID string', () => {
      // Empty string hash is 0 (even) -> true
      expect(service.isInExperiment('', dummyExperimentId)).toBe(true);
    });

    it('should ignore experiment ID in current implementation', () => {
      const userId = 'user-123'; // Known true
      expect(service.isInExperiment(userId, 'exp-A')).toBe(true);
      expect(service.isInExperiment(userId, 'exp-B')).toBe(true);
    });
  });
});
