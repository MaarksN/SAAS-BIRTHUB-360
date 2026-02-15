import { prisma } from '../prisma';
import { IEmailProvider } from './types';
import { MockProvider } from './providers/mock-provider';
import { ResendProvider } from './providers/resend-provider';
import { injectTracking } from './tracking';
import { logger } from '../logger';

// Factory to get provider instance
function getProvider(type: string, credentials: any): IEmailProvider {
  switch (type) {
    case 'MOCK':
      return new MockProvider(credentials);
    case 'RESEND':
      return new ResendProvider(credentials);
    case 'GMAIL':
    case 'OUTLOOK':
      // Return Mock for now until implemented
      return new MockProvider(credentials);
    default:
      throw new Error(`Unknown provider type: ${type}`);
  }
}

export class SenderEngine {
  async sendEmail(scheduledEmailId: string) {
    // 1. Fetch Scheduled Email with Sender details
    // We use 'findFirst' because we are in a worker context (System), but we want to be safe.
    // Ideally we pass context, but here we just need the record.
    const emailTask = await prisma.scheduledEmail.findUnique({
      where: { id: scheduledEmailId },
      include: { sender: true }
    });

    if (!emailTask) throw new Error(`Email task not found: ${scheduledEmailId}`);
    if (!emailTask.sender) throw new Error('No sender account assigned');

    try {
      // 2. Prepare Provider
      const provider = getProvider(emailTask.sender.provider, emailTask.sender.credentials);

      // 3. Inject Tracking
      const trackedHtml = injectTracking(emailTask.body, emailTask.id);

      // 4. Send
      const result = await provider.send({
        to: emailTask.to,
        from: emailTask.sender.email,
        subject: emailTask.subject,
        html: trackedHtml,
        trackingId: emailTask.id
      });

      // 5. Update Status
      await prisma.scheduledEmail.update({
        where: { id: emailTask.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
          // Store provider ID if needed in metadata
        }
      });

      // 6. Update Usage (Sender Daily Limit)
      await prisma.emailAccount.update({
        where: { id: emailTask.senderId! },
        data: {
          usedToday: { increment: 1 }
        }
      });

      logger.info({ emailId: emailTask.id, providerId: result.id }, 'Email sent successfully');

    } catch (error: any) {
      logger.error({ emailId: emailTask.id, error }, 'Failed to send email');

      await prisma.scheduledEmail.update({
        where: { id: emailTask.id },
        data: {
          status: 'FAILED',
          error: error.message
        }
      });

      // Circuit Breaker logic could go here (if too many failures, pause campaign)
    }
  }
}
