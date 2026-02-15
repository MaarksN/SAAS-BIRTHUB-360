import { WebhookService } from '../webhook.service';
import { prisma } from '../../prisma';
import { redis } from '../../redis';
import axios from 'axios';
import { Queue } from 'bullmq';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../prisma', () => ({
  prisma: {
    webhookSubscription: {
      findMany: vi.fn()
    }
  }
}));

vi.mock('../../redis', () => ({
  redis: {}
}));

vi.mock('axios');
vi.mock('bullmq', () => ({
  Queue: vi.fn().mockImplementation(() => ({
    add: vi.fn()
  }))
}));

describe('WebhookService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('dispatch should add job to queue', async () => {
    const addMock = vi.fn();
    (Queue as any).mockImplementation(() => ({
      add: addMock
    }));

    await WebhookService.dispatch('test.event', { foo: 'bar' }, 'org1');

    expect(Queue).toHaveBeenCalledWith('webhook-queue', expect.any(Object));
    expect(addMock).toHaveBeenCalledWith(
      'dispatch-webhook',
      { event: 'test.event', payload: { foo: 'bar' }, organizationId: 'org1' },
      expect.any(Object)
    );
  });

  it('process should send webhook for matching subscription', async () => {
    const sub = {
      id: 'sub1',
      url: 'http://example.com/webhook',
      events: ['test.event'],
      secret: 'secret',
      organizationId: 'org1',
      isActive: true
    };

    (prisma.webhookSubscription.findMany as any).mockResolvedValue([sub]);
    (axios.post as any).mockResolvedValue({ status: 200 });

    await WebhookService.process({
      event: 'test.event',
      payload: { data: 123 },
      organizationId: 'org1'
    });

    expect(prisma.webhookSubscription.findMany).toHaveBeenCalledWith({
      where: { organizationId: 'org1', isActive: true }
    });

    expect(axios.post).toHaveBeenCalledWith(
      'http://example.com/webhook',
      { data: 123 },
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-Event': 'test.event',
          'X-Hub-Signature-256': expect.stringContaining('sha256=')
        })
      })
    );
  });
});
