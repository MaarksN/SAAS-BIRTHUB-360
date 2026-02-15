import { Job, Queue, QueueEvents, Worker } from 'bullmq';

import { env } from '../env';

const EVENT_QUEUE_NAME = 'salesos-event-bus';

// Connection config
const connection = {
  host: 'localhost',
  port: 6379,
  ...(env.REDIS_URL ? parseRedisUrl(env.REDIS_URL) : {}),
};

function parseRedisUrl(url: string) {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port || '6379'),
      password: parsed.password,
      username: parsed.username,
      tls: parsed.protocol === 'rediss:' ? {} : undefined,
    };
  } catch (e) {
    return {};
  }
}

export type DomainEvent =
  | {
      type: 'LEAD_CREATED';
      payload: { leadId: string; organizationId: string };
    }
  | {
      type: 'LEAD_UPDATED';
      payload: { leadId: string; organizationId: string; changes: any };
    }
  | {
      type: 'DEAL_WON';
      payload: { dealId: string; organizationId: string; amount: number };
    };

export class EventBus {
  private static queue: Queue;

  static init() {
    if (!this.queue) {
      this.queue = new Queue(EVENT_QUEUE_NAME, {
        connection,
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          removeOnComplete: true,
          removeOnFail: 1000,
        },
      });
    }
  }

  static async publish(event: DomainEvent) {
    this.init();
    await this.queue.add(event.type, event.payload);
  }

  static createWorker(
    name: string,
    handler: (job: Job<DomainEvent['payload']>) => Promise<void>,
  ) {
    return new Worker(
      EVENT_QUEUE_NAME,
      async (job) => {
        // We can filter by job name (event type) inside the handler or here
        await handler(job);
      },
      { connection },
    );
  }
}
