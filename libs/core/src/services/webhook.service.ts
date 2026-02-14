import { Queue } from 'bullmq';
import { prisma } from '../prisma';
import { logger } from '../logger';
import { redis } from '../redis';
import crypto from 'crypto';
import axios from 'axios';

const WEBHOOK_QUEUE_NAME = 'webhook-queue';

export class WebhookService {
  private static queue: Queue;

  static getQueue() {
    if (!this.queue) {
      this.queue = new Queue(WEBHOOK_QUEUE_NAME, {
        connection: redis
      });
    }
    return this.queue;
  }

  static async dispatch(event: string, payload: any, organizationId: string) {
    try {
      const queue = this.getQueue();
      await queue.add('dispatch-webhook', {
        event,
        payload,
        organizationId
      }, {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 5000
        },
        removeOnComplete: true
      });
    } catch (error) {
      logger.error({ error, event, organizationId }, 'Failed to dispatch webhook');
    }
  }

  static async process(jobData: { event: string, payload: any, organizationId: string }) {
    const { event, payload, organizationId } = jobData;

    try {
       // Fetch active subscriptions for this org
       const subscriptions = await prisma.webhookSubscription.findMany({
         where: {
           organizationId,
           isActive: true
         }
       });

       // Filter in memory (simple and robust)
       const relevantSubs = subscriptions.filter(sub => {
         const events = sub.events as string[];
         return Array.isArray(events) && (events.includes(event) || events.includes('*'));
       });

       if (relevantSubs.length === 0) return;

       logger.info({ count: relevantSubs.length, event }, 'Sending webhooks');

       const results = await Promise.allSettled(relevantSubs.map(async (sub) => {
         const signature = crypto
           .createHmac('sha256', sub.secret)
           .update(JSON.stringify(payload))
           .digest('hex');

         await axios.post(sub.url, payload, {
           headers: {
             'Content-Type': 'application/json',
             'X-Hub-Signature-256': `sha256=${signature}`,
             'X-Event': event
           },
           timeout: 10000 // 10s timeout
         });
       }));

       let failureCount = 0;
       results.forEach((result, index) => {
         if (result.status === 'rejected') {
           failureCount++;
           logger.warn({
             error: result.reason,
             subscriptionId: relevantSubs[index].id,
             url: relevantSubs[index].url
           }, 'Webhook delivery failed');
         }
       });

       if (failureCount === relevantSubs.length && failureCount > 0) {
         // If ALL failed, throw to retry the job (maybe network issue?)
         throw new Error('All webhook deliveries failed');
       }

    } catch (error) {
       logger.error({ error, jobData }, 'Error processing webhook job');
       throw error;
    }
  }
}
