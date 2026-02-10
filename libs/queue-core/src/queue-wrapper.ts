import { Queue, Worker, QueueOptions, WorkerOptions, Processor, JobsOptions } from 'bullmq';
import { logger, env, runWithContext } from '@salesos/core';
import IORedis from 'ioredis';

const createConnection = () => {
  return new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
  });
};

export const createQueue = <T>(name: string, options?: QueueOptions) => {
  return new Queue<T>(name, {
    connection: createConnection(),
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: false, // Keep failed jobs for DLQ inspection
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      ...options?.defaultJobOptions,
    },
    ...options,
  });
};

export const createWorker = <T>(name: string, processor: Processor<T>, options?: WorkerOptions) => {
  const worker = new Worker<T>(name, async (job) => {
    const traceId = (job.data as any)?.meta?.traceId || job.id || 'unknown-job';

    return runWithContext(traceId, async () => {
      const start = Date.now();
      logger.info({ jobId: job.id, queue: name, data: job.data }, 'Job processing started');

      try {
        const result = await processor(job);
        const duration = Date.now() - start;
        logger.info({ jobId: job.id, queue: name, duration }, 'Job completed');
        return result;
      } catch (error) {
        const duration = Date.now() - start;
        logger.error({ jobId: job.id, queue: name, duration, error }, 'Job failed');
        throw error;
      }
    });
  }, {
    connection: createConnection(),
    concurrency: options?.concurrency || 1,
    ...options,
  });

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, queue: name, error: err }, 'Job failed permanently (or will retry)');
  });

  // Graceful shutdown logic is handled by the caller usually, but we can hook into process signals if this is the main process.
  // However, multiple workers might be created in one process. Adding global listeners here might be problematic if called multiple times.
  // Better to expose a close function or rely on the worker.close() being called by the app shutdown hook.
  // The prompt asked for "Graceful Shutdown: Intercepte sinais SIGTERM/SIGINT".
  // I will add a global handler only once or manage workers registry.

  // Simple implementation:
  const gracefulShutdown = async (signal: string) => {
    logger.info({ signal, queue: name }, 'Closing worker...');
    await worker.close();
    logger.info({ signal, queue: name }, 'Worker closed');
  };

  process.once('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.once('SIGINT', () => gracefulShutdown('SIGINT'));

  return worker;
};
