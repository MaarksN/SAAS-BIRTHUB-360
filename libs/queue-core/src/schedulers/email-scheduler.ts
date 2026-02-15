import { prisma, logger } from '@salesos/core';
import { createQueue } from '../queue-wrapper';

interface EmailJob {
  scheduledEmailId: string;
  organizationId: string;
}

const queue = createQueue<EmailJob>('email-sending');

class EmailScheduler {
  async scheduleEmails() {
    // 1. Fetch pending emails with sendAt <= now
    const now = new Date();
    const emails = await prisma.scheduledEmail.findMany({
      where: {
        status: 'PENDING',
        sendAt: {
          lte: now,
        },
      },
      take: 100, // Limit to avoid overload
    });

    if (emails.length === 0) {
      logger.info('No emails to schedule');
      return;
    }

    logger.info({ count: emails.length }, 'Found emails to send');

    for (const email of emails) {
      // 2. Mark as QUEUED
      await prisma.scheduledEmail.update({
        where: { id: email.id },
        data: { status: 'QUEUED' },
      });

      // 3. Add to queue
      await queue.add('send-email', {
        scheduledEmailId: email.id,
        organizationId: email.organizationId,
      }, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      });

      logger.info({ scheduledEmailId: email.id }, 'Email added to queue');
    }
  }
}

// Execute scheduler
(async () => {
  const scheduler = new EmailScheduler();
  logger.info('Starting Email Scheduler...');

  // Run every minute
  setInterval(async () => {
    try {
      await scheduler.scheduleEmails();
    } catch (error) {
      logger.error({ error }, 'Error in Email Scheduler');
    }
  }, 60000); // 1 minute
})();
