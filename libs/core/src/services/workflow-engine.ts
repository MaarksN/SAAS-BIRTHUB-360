import { Worker, Job, FlowProducer } from 'bullmq';
import Redis from 'ioredis';
import { EventEmitter } from 'events';
import { EmailService } from './email-service'; // Import EmailService

const WORKFLOW_QUEUE_NAME = 'workflows';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const PYTHON_QUEUE_NAME = 'ai:agents:crawl_queue';
const EVENT_CHANNEL = 'ai:agents:events';

export class WorkflowEngine extends EventEmitter {
  private flowProducer: FlowProducer;
  private worker: Worker;
  private redisSubscriber: Redis;
  private redisPublisher: Redis;
  private redis: Redis;

  constructor() {
    super();
    const connection = new Redis(REDIS_URL, {
        maxRetriesPerRequest: null // Required by BullMQ
    });

    this.flowProducer = new FlowProducer({ connection });
    this.redisSubscriber = new Redis(REDIS_URL);
    this.redisPublisher = new Redis(REDIS_URL);
    this.redis = new Redis(REDIS_URL); // General purpose redis

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
    }, { connection });
  }

  async startOnboardingFlow(leadId: string, url: string, email: string, orgId: string) {
    await this.flowProducer.add({
      name: 'email-step',
      queueName: WORKFLOW_QUEUE_NAME,
      data: { leadId, email, orgId, step: 'email' }, // Pass email and orgId
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
          resolve(event); // Return event data to parent job
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
    const { leadId, email, orgId } = job.data;

    // Get children values (crawl result)
    const childrenValues = await job.getChildrenValues();
    let crawlResult = { phones: [], emails: [] };
    let url = 'unknown';

    // Find the crawl step result
    // BullMQ returns dictionary { "jobKey": returnedValue }
    for (const key in childrenValues) {
        if (childrenValues[key] && childrenValues[key].result_key) {
             const resultKey = childrenValues[key].result_key;
             url = childrenValues[key].input;
             const rawData = await this.redis.get(resultKey);
             if (rawData) {
                 crawlResult = JSON.parse(rawData);
             }
        }
    }

    console.log(`[WorkflowEngine] Sending email to ${email} with crawl results from ${url}`);

    // Generate Email Body
    const html = `
      <h1>Onboarding Complete</h1>
      <p>We analyzed your website: ${url}</p>
      <h3>Found Contacts:</h3>
      <ul>
        <li>Emails: ${crawlResult.emails.join(', ') || 'None'}</li>
        <li>Phones: ${crawlResult.phones.join(', ') || 'None'}</li>
      </ul>
      <p>Welcome to SalesOS!</p>
    `;

    // Send Email
    // Note: We use a dummy ID for scheduledEmailId since this is an ad-hoc workflow email
    await EmailService.sendNow({
        scheduledEmailId: `workflow-${job.id}`,
        to: email,
        subject: 'Your Site Analysis is Ready',
        html: html,
        organizationId: orgId
    });

    return { sent: true };
  }

  async close() {
    await this.worker.close();
    await this.flowProducer.close();
    await this.redisSubscriber.quit();
    await this.redisPublisher.quit();
    await this.redis.quit();
  }
}
