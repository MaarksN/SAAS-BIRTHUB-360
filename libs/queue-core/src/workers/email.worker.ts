import { EmailService,env, logger, prisma } from '@salesos/core';
import { Job } from 'bullmq';
import IORedis from 'ioredis';

import { createWorker } from '../queue-wrapper';

interface EmailJobData {
  scheduledEmailId: string;
  organizationId: string;
}

const redisLock = new IORedis(env.REDIS_URL || 'redis://localhost:6379');

export const emailWorker = createWorker<EmailJobData>(
  'email-sending',
  async (job: Job<EmailJobData>) => {
    const { scheduledEmailId, organizationId } = job.data;
    const lockKey = `lock:email:${scheduledEmailId}`;

    const acquiredLock = await redisLock.set(lockKey, 'processing', 'EX', 300, 'NX');

    if (!acquiredLock) {
      logger.warn({ scheduledEmailId, jobId: job.id }, 'Idempotency lock active. Skipping duplicate job.');
      return;
    }

    try {
      const emailRecord = await prisma.scheduledEmail.findUnique({
        where: { id: scheduledEmailId },
        include: { sender: true }
      });

      if (!emailRecord) {
        logger.error({ scheduledEmailId }, 'Email record not found in DB');
        return;
      }

      if (emailRecord.status === 'SENT' || emailRecord.status === 'FAILED') {
        logger.info({ scheduledEmailId, status: emailRecord.status }, 'Email already processed. Skipping.');
        return;
      }

      await prisma.scheduledEmail.update({
        where: { id: scheduledEmailId },
        data: { status: 'PROCESSING' }
      });

      logger.info({ scheduledEmailId }, 'Sending email via provider...');

      const { messageId } = await EmailService.sendNow({
        scheduledEmailId,
        organizationId,
        to: emailRecord.to,
        subject: emailRecord.subject,
        html: emailRecord.body,
        senderEmail: emailRecord.sender?.email
      });

      await EmailService.markAsSent(scheduledEmailId, messageId);
      logger.info({ scheduledEmailId, messageId }, 'Email sent successfully');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error({ error, scheduledEmailId }, 'Email sending failed');

      const isPermanentError = error.message?.includes('validation') || error.message?.includes('400');

      if (isPermanentError) {
        await EmailService.markAsFailed(scheduledEmailId, error.message);
      } else {
        throw error;
      }
    }
  },
  {
    concurrency: 20,
    limiter: {
      max: 10,
      duration: 1000
    }
  }
);
