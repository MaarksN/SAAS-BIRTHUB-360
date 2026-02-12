import { describe, it, expect } from 'vitest';
import { ExperimentService } from './ab-testing';

describe('ExperimentService', () => {
  const service = new ExperimentService();

  it('should return false for odd hash (user "a")', () => {
    // 'a' charCode is 97. 97 % 2 !== 0
    expect(service.isInExperiment('a', 'exp1')).toBe(false);
  });

  it('should return true for even hash (user "b")', () => {
    // 'b' charCode is 98. 98 % 2 === 0
    expect(service.isInExperiment('b', 'exp1')).toBe(true);
  });

  it('should be deterministic for the same input', () => {
    expect(service.isInExperiment('user123', 'exp1')).toBe(service.isInExperiment('user123', 'exp1'));
  });

  it('should handle empty string userId', () => {
    // empty string sum is 0. 0 % 2 === 0
    expect(service.isInExperiment('', 'exp1')).toBe(true);
  });

  it('should calculate hash correctly for multiple characters', () => {
    // 'abc' -> 97 + 98 + 99 = 294 (even) -> true
    expect(service.isInExperiment('abc', 'exp1')).toBe(true);

    // 'ab' -> 97 + 98 = 195 (odd) -> false
    expect(service.isInExperiment('ab', 'exp1')).toBe(false);
  });

  it('should result in same outcome regardless of experimentId (current implementation)', () => {
    // Since experimentId is not used in hash calculation currently
    expect(service.isInExperiment('a', 'exp1')).toBe(service.isInExperiment('a', 'exp2'));
  });
});
