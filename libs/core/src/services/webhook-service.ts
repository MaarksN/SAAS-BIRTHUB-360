import { createHmac } from 'crypto';
import axios from 'axios';

export class WebhookService {
  constructor(private db: any) {}

  async dispatchEvent(organizationId: string, event: string, payload: any) {
    // 1. Find subscriptions
    // const subs = await this.db.webhookSubscription.findMany({ where: { organizationId, events: { has: event } } });

    // Mock Subscriptions
    const subs = [
      { url: 'https://client-api.com/hooks', secret: 'whsec_123' }
    ];

    for (const sub of subs) {
      await this.sendWebhook(sub.url, sub.secret, event, payload);
    }
  }

  private async sendWebhook(url: string, secret: string, event: string, payload: any) {
    const timestamp = Date.now();
    const body = JSON.stringify({
      id: `evt_${timestamp}`,
      event,
      created: timestamp,
      data: payload
    });

    const signature = this.signPayload(body, secret);

    try {
      await axios.post(url, body, {
        headers: {
          'Content-Type': 'application/json',
          'X-SalesOS-Signature': signature,
          'X-SalesOS-Event': event
        },
        timeout: 5000
      });
      console.log(`Webhook sent to ${url}`);
    } catch (error) {
      console.error(`Webhook failed to ${url}: ${error}`);
      // Implement retry logic (BullMQ) here
    }
  }

  private signPayload(payload: string, secret: string): string {
    return createHmac('sha256', secret).update(payload).digest('hex');
  }
}
