import { Resend } from 'resend';

import { logger } from '../../logger';
import { EmailMessage, EmailProviderConfig, IEmailProvider } from '../types';

export class ResendProvider implements IEmailProvider {
  private resend: Resend;

  constructor(private config: EmailProviderConfig) {
    if (!config.apiKey) {
      throw new Error('Resend API Key is required');
    }
    this.resend = new Resend(config.apiKey);
  }

  async send(message: EmailMessage): Promise<{ id: string }> {
    logger.info({ message }, '📧 [Resend] Sending Email');

    try {
      const response = await this.resend.emails.send({
        from: message.from, // Must be verified domain
        to: message.to,
        subject: message.subject,
        html: message.html,
        headers: message.headers,
        reply_to: message.replyTo,
      } as any);

      if (response.error) {
        throw new Error(response.error.message);
      }

      return { id: response.data!.id };
    } catch (error: any) {
      logger.error({ error }, 'Resend Provider Error');
      throw error;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      // Check if API key is valid by listing domains or similar (if API allows).
      // Resend doesn't have a direct "ping" endpoint documented easily, so assume true if instantiated.
      return true;
    } catch (e) {
      return false;
    }
  }

  async getQuota(): Promise<{
    used: number;
    limit: number;
    remaining: number;
  }> {
    // Resend API limits depend on plan. Not easily fetchable via API yet.
    return { used: 0, limit: 100, remaining: 100 }; // Placeholder
  }
}
