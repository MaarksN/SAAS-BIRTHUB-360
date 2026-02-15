import { beforeEach, describe, expect, it, vi } from 'vitest';

import { WorkflowEngine } from './workflow-engine';

// Mock BullMQ
vi.mock('bullmq', () => {
  return {
    FlowProducer: class {
      add = vi.fn().mockResolvedValue({ id: 'mock-job-id' });
      close = vi.fn().mockResolvedValue(undefined);
    },
    Worker: class {
      close = vi.fn().mockResolvedValue(undefined);
    },
    Job: vi.fn(),
  };
});

// Mock IORedis
vi.mock('ioredis', () => {
  return {
    default: class {
      subscribe = vi.fn();
      on = vi.fn();
      rpush = vi.fn().mockResolvedValue(1);
      quit = vi.fn().mockResolvedValue('OK');
    },
  };
});

describe('WorkflowEngine', () => {
  let engine: WorkflowEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    engine = new WorkflowEngine();
  });

  it('should start an onboarding flow with correct structure', async () => {
    const leadId = 'lead-123';
    const url = 'http://example.com';

    await engine.startOnboardingFlow(leadId, url);

    // Verify FlowProducer.add was called
    const flowProducer = (engine as any).flowProducer;
    expect(flowProducer.add).toHaveBeenCalledTimes(1);

    const callArgs = flowProducer.add.mock.calls[0][0];

    // Parent should be Email Step
    expect(callArgs.name).toBe('email-step');
    expect(callArgs.queueName).toBe('workflows');
    expect(callArgs.opts.delay).toBe(2000);

    // Children should be Crawl Step
    expect(callArgs.children).toHaveLength(1);
    expect(callArgs.children[0].name).toBe('crawl-step');
    expect(callArgs.children[0].data.url).toBe(url);
  });

  it('should dispatch crawl job to Python and wait for event', async () => {
    const jobData = { data: { url: 'http://example.com' } };

    // Access the private redisPublisher
    const rpushSpy = vi.spyOn((engine as any).redisPublisher, 'rpush');

    // Simulate handling crawl step
    // We need to run this asynchronously and resolve it later
    const promise = (engine as any).handleCrawlStep(jobData);

    // Verify dispatch happened
    expect(rpushSpy).toHaveBeenCalledWith(
      'ai:agents:crawl_queue',
      expect.stringContaining('"type":"crawl"'),
    );

    // Simulate completion event from Python (via Redis Subscriber event)
    const event = { type: 'job_complete', input: 'http://example.com' };

    // Wait for listener to be attached (handleCrawlStep awaits rpush)
    setTimeout(() => {
      engine.emit('python_event', event);
    }, 50);

    await expect(promise).resolves.toEqual(event);
  });
});
