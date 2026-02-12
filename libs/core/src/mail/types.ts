export interface EmailMessage {
  to: string;
  from: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  headers?: Record<string, string>;
  trackingId?: string;
}

export interface EmailProviderConfig {
  apiKey?: string;
  host?: string;
  port?: number;
  user?: string;
  pass?: string;
}

export interface IEmailProvider {
  send(message: EmailMessage): Promise<{ id: string }>;
  checkHealth(): Promise<boolean>;
  getQuota(): Promise<{ used: number; limit: number; remaining: number }>;
}
