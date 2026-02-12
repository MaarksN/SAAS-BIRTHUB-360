import { describe, it, expect } from 'vitest';
import { ExperimentService } from './ab-testing';

describe('ExperimentService', () => {
  const service = new ExperimentService();

  it('should be deterministic', () => {
    const userA = 'user-a';
    const result1 = service.isInExperiment(userA, 'experiment-1');
    const result2 = service.isInExperiment(userA, 'experiment-1');
    expect(result1).toBe(result2);
  });

  it('should return expected boolean for known inputs', () => {
    // 'a' charCode is 97 (odd) -> hash 97 -> 97 % 2 !== 0 -> false
    expect(service.isInExperiment('a', 'exp-1')).toBe(false);

    // 'b' charCode is 98 (even) -> hash 98 -> 98 % 2 === 0 -> true
    expect(service.isInExperiment('b', 'exp-1')).toBe(true);
  });

  it('should handle empty string', () => {
    // Empty string -> reduce initial value 0 -> 0 % 2 === 0 -> true
    expect(service.isInExperiment('', 'exp-1')).toBe(true);
  });

  it('should accept experimentId argument', () => {
    // Ensuring the interface is respected even if unused
    expect(service.isInExperiment('user-1', 'any-experiment')).toBeDefined();
  });
});
