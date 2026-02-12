import { Worker, Job, FlowProducer } from 'bullmq';
import Redis from 'ioredis';
import { EventEmitter } from 'events';

const WORKFLOW_QUEUE_NAME = 'workflows';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const PYTHON_QUEUE_NAME = 'ai:agents:crawl_queue';
const EVENT_CHANNEL = 'ai:agents:events';

export class WorkflowEngine extends EventEmitter {
  private flowProducer: FlowProducer;
  private worker: Worker;
  private redisSubscriber: Redis;
  private redisPublisher: Redis;

  constructor() {
    super();
    this.flowProducer = new FlowProducer({ connection: { url: REDIS_URL } });
    this.redisSubscriber = new Redis(REDIS_URL);
    this.redisPublisher = new Redis(REDIS_URL);

    // Python Event Listener
    this.redisSubscriber.subscribe(EVENT_CHANNEL);
    this.redisSubscriber.on('message', (channel, message) => {
      if (channel === EVENT_CHANNEL) {
        const event = JSON.parse(message);
        this.emit('python_event', event);
      }
    });

    this.worker = new Worker(WORKFLOW_QUEUE_NAME, async (job: Job) => {
      console.log(`[WorkflowWorker] Processing ${job.name} (ID: ${job.id})`);

      switch (job.name) {
        case 'onboarding-flow':
          console.log('Flow completed!');
          return { status: 'completed' };

        case 'crawl-step':
          return this.handleCrawlStep(job);

        case 'email-step':
          return this.handleEmailStep(job);

        default:
          throw new Error(`Unknown step: ${job.name}`);
      }
    }, { connection: { url: REDIS_URL } });
  }

  async startOnboardingFlow(leadId: string, url: string) {
    // BullMQ Flow: Parent waits for Children.
    // So: Email (Parent) -> Children: [Crawl]
    // The parent (Email) will be delayed by 2000ms.
    // This effectively simulates: Crawl -> Wait -> Email.

    await this.flowProducer.add({
      name: 'email-step',
      queueName: WORKFLOW_QUEUE_NAME,
      data: { leadId, step: 'email' },
      opts: { delay: 2000 },
      children: [
        {
          name: 'crawl-step',
          queueName: WORKFLOW_QUEUE_NAME,
          data: { leadId, url, step: 'crawl' }
        }
      ]
    });

    console.log(`[WorkflowEngine] Started Onboarding Flow for ${leadId}`);
  }

  private async handleCrawlStep(job: Job) {
    const { url } = job.data;

    // 1. Dispatch to Python
    const pythonJob = {
      type: 'crawl',
      payload: { url }, // Matches CrawlJobPayload
      timestamp: Date.now(),
      retryCount: 0
    };

    await this.redisPublisher.rpush(PYTHON_QUEUE_NAME, JSON.stringify(pythonJob));
    console.log(`[WorkflowEngine] Dispatched crawl for ${url}`);

    // 2. Wait for Completion Signal (The "Saga" part)
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error('Timeout waiting for Python worker'));
      }, 30000);

      const handler = (event: any) => {
        if (event.type === 'job_complete' && event.input === url) {
          console.log(`[WorkflowEngine] Received completion for ${url}`);
          cleanup();
          resolve(event);
        }
      };

      const cleanup = () => {
        clearTimeout(timeout);
        this.off('python_event', handler);
      };

      this.on('python_event', handler);
    });
  }

  private async handleEmailStep(job: Job) {
    console.log(`[WorkflowEngine] Sending email to lead... (After crawl)`);
    // Logic to fetch crawl result from Redis and generate email
    return { sent: true };
  }

  async close() {
    await this.worker.close();
    await this.flowProducer.close();
    await this.redisSubscriber.quit();
    await this.redisPublisher.quit();
  }
}
