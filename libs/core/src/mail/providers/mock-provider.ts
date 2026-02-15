import { logger } from '../../logger';
import { EmailMessage, EmailProviderConfig, IEmailProvider } from '../types';

export class MockProvider implements IEmailProvider {
  constructor(private config: EmailProviderConfig) {}

  async send(message: EmailMessage): Promise<{ id: string }> {
    logger.info({ message }, '📧 [MOCK] Sending Email');

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return { id: `mock-${Date.now()}` };
  }

  async checkHealth(): Promise<boolean> {
    return true;
  }

  async getQuota(): Promise<{
    used: number;
    limit: number;
    remaining: number;
  }> {
    return { used: 0, limit: 1000, remaining: 1000 };
  }
}
