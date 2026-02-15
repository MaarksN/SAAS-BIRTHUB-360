import { Job } from 'bullmq';
import { prisma, logger, env } from '@salesos/core';
import { Resend } from 'resend';
import { createWorker } from '../queue-wrapper';

interface EmailJob {
  scheduledEmailId: string;
  organizationId: string;
}

const resend = new Resend(env.RESEND_API_KEY || 're_123456789'); // Fallback for dev

class EmailSenderWorker {
  constructor() {
    createWorker<EmailJob>(
      'email-sending',
      this.processEmail.bind(this),
      {
        concurrency: 5,
        limiter: {
          max: 50,
          duration: 60000,
        },
      }
    );

    logger.info('Email Sender Worker initialized');
  }

  private async processEmail(job: Job<EmailJob>) {
    const { scheduledEmailId, organizationId } = job.data;

    // 1. Fetch scheduled email
    const scheduledEmail = await prisma.scheduledEmail.findUnique({
      where: { id: scheduledEmailId },
      include: {
        sender: true,
        lead: true,
        campaign: true,
      },
    });

    if (!scheduledEmail) {
      throw new Error(`ScheduledEmail ${scheduledEmailId} not found`);
    }

    if (scheduledEmail.status !== 'PENDING' && scheduledEmail.status !== 'QUEUED') {
      logger.info({ scheduledEmailId, status: scheduledEmail.status }, 'Email already processed');
      return;
    }

    // 2. Validate rate limit
    const sender = scheduledEmail.sender;
    if (sender && sender.usedToday >= sender.dailyLimit) {
      throw new Error(`Daily limit reached for sender ${sender.email}`);
    }

    // 3. Render template
    const { subject, body } = this.renderTemplate(
      scheduledEmail.subject,
      scheduledEmail.body,
      {
        lead_name: scheduledEmail.lead?.name || 'there',
        company_name: scheduledEmail.lead?.companyName || '',
        // Add more variables as needed
      }
    );

    // 4. Send via Resend
    try {
      const result = await resend.emails.send({
        from: sender?.email || env.DEFAULT_FROM_EMAIL || 'onboarding@resend.dev',
        to: scheduledEmail.to,
        subject,
        html: body,
        headers: {
          'X-Entity-Ref-ID': scheduledEmailId,
        },
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      // 5. Update status
      await prisma.scheduledEmail.update({
        where: { id: scheduledEmailId },
        data: {
          status: 'SENT',
          sentAt: new Date(),
          trackingId: result.data?.id,
        },
      });

      // 6. Increment sender counter
      if (sender) {
        await prisma.emailAccount.update({
          where: { id: sender.id },
          data: { usedToday: { increment: 1 } },
        });
      }

      logger.info({ scheduledEmailId, trackingId: result.data?.id }, 'Email sent successfully');

    } catch (error: any) {
      // 7. Handle error
      await prisma.scheduledEmail.update({
        where: { id: scheduledEmailId },
        data: {
          status: 'FAILED',
          error: error.message,
        },
      });

      throw error; // For BullMQ retry
    }
  }

  private renderTemplate(subject: string, body: string, variables: Record<string, string>): { subject: string; body: string } {
    let renderedSubject = subject;
    let renderedBody = body;

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      renderedSubject = renderedSubject.replace(regex, value);
      renderedBody = renderedBody.replace(regex, value);
    }

    return { subject: renderedSubject, body: renderedBody };
  }
}

// Start worker
new EmailSenderWorker();
