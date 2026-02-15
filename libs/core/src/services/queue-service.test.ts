import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { QueueService } from './queue-service';

describe('QueueService', () => {
  it('should validate payload before pushing', async () => {
    const service = new QueueService('redis://localhost:6379');
    const schema = z.object({ id: z.number() });

    // Mock Redis
    const rpushSpy = vi.spyOn(service['redis'], 'rpush').mockResolvedValue(1);

    await expect(
      service.produce('test-queue', schema, 'test-job', { id: 123 }),
    ).resolves.not.toThrow();

    expect(rpushSpy).toHaveBeenCalled();
  });

  it('should throw on schema mismatch', async () => {
    const service = new QueueService('redis://localhost:6379');
    const schema = z.object({ id: z.number() });

    // @ts-ignore
    await expect(
      service.produce('test-queue', schema, 'test-job', { id: 'abc' }),
    ).rejects.toThrow('Schema Mismatch');
  });
});
