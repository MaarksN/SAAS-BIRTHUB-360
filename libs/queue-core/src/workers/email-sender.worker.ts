import { Job } from 'bullmq';
import { logger, SenderEngine } from '@salesos/core';
import { createWorker } from '../queue-wrapper';

interface EmailJob {
  scheduledEmailId: string;
  organizationId: string;
}

class EmailSenderWorker {
  private engine: SenderEngine;

  constructor() {
    this.engine = new SenderEngine();

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
    const { scheduledEmailId } = job.data;

    // SenderEngine handles fetching, validation, rendering (tracking), sending, status updates, and logging.
    await this.engine.sendEmail(scheduledEmailId);
  }
}

// Start worker
new EmailSenderWorker();
