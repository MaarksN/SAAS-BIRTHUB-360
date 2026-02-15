import { describe, expect,it } from 'vitest';

import { ExperimentService } from './ab-testing';

describe('ExperimentService', () => {
  const service = new ExperimentService();

  it('should return boolean', () => {
    expect(typeof service.isInExperiment('user1', 'exp1')).toBe('boolean');
  });

  it('should be deterministic', () => {
    const userId = 'user_deterministic';
    const result1 = service.isInExperiment(userId, 'exp1');
    const result2 = service.isInExperiment(userId, 'exp1');
    expect(result1).toBe(result2);
  });

  it('should distribute users', () => {
    // 'a' charCode is 97 (odd) -> hash 97 -> 97 % 2 !== 0 -> false
    expect(service.isInExperiment('a', 'exp1')).toBe(false);

    // 'b' charCode is 98 (even) -> hash 98 -> 98 % 2 === 0 -> true
    expect(service.isInExperiment('b', 'exp1')).toBe(true);
  });

  it('should handle empty user id', () => {
    // Empty string -> hash 0 -> 0 % 2 === 0 -> true
    expect(service.isInExperiment('', 'exp1')).toBe(true);
  });

  it('should accept different experiment IDs', () => {
    // The experiment ID doesn't affect the result currently, but should be accepted
    expect(service.isInExperiment('b', 'exp1')).toBe(true);
    expect(service.isInExperiment('b', 'exp2')).toBe(true);
  });
});
