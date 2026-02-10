export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface IEmailService {
  send(payload: EmailPayload): Promise<{ id: string; status: 'sent' | 'failed' }>;
}

export class MockEmailService implements IEmailService {
  async send(payload: EmailPayload) {
    console.log(`[MockEmailService] Sending email to ${payload.to} with subject: ${payload.subject}`);
    // Simulate API call to Resend/SendGrid
    return {
      id: `email_${Math.random().toString(36).substr(2, 9)}`,
      status: 'sent' as const
    };
  }
}
