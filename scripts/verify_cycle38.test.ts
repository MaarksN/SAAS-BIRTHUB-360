import { describe, it, expect } from 'vitest';
import { CleanRoomService } from '../libs/core/src/services/clean-room-service';

describe('Cycle 38: Data Clean Room', () => {
  it('should find overlapping hashes', () => {
    const service = new CleanRoomService();
    const email1 = 'match@example.com';
    const email2 = 'uniqueA@example.com';
    const email3 = 'uniqueB@example.com';

    const hash1 = CleanRoomService.hashEmail(email1);
    const hash2 = CleanRoomService.hashEmail(email2);
    const hash3 = CleanRoomService.hashEmail(email3);

    const setA = [hash1, hash2];
    const setB = [hash1, hash3];

    const result = service.computeIntersection(setA, setB);

    expect(result).toHaveLength(1);
    expect(result[0]).toBe(hash1);
  });
});
