import { Queue, Worker, QueueOptions, WorkerOptions, Processor, JobsOptions } from 'bullmq';
import { logger, env } from '@salesos/core';
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

// Registry to track active workers for graceful shutdown
const workers = new Set<Worker>();
let shutdownHandlerAttached = false;

const shutdownHandler = async (signal: string) => {
  logger.info({ signal }, 'Shutting down workers...');
  const closePromises = Array.from(workers).map((worker) => worker.close());
  await Promise.all(closePromises);
  logger.info({ signal }, 'All workers closed');
};

const attachSignalListeners = () => {
  if (shutdownHandlerAttached) return;
  shutdownHandlerAttached = true;

  process.once('SIGTERM', () => shutdownHandler('SIGTERM'));
  process.once('SIGINT', () => shutdownHandler('SIGINT'));
};

export const createWorker = <T = any>(name: string, processor: Processor<T>, options?: Omit<WorkerOptions, 'connection'>) => {
  const worker = new Worker<T>(name, async (job) => {
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
  }, {
    connection: createConnection(),
    concurrency: options?.concurrency || 1,
    ...options,
  });

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, queue: name, error: err }, 'Job failed permanently (or will retry)');
  });

  // Register worker for graceful shutdown
  workers.add(worker);
  attachSignalListeners();

  worker.on('closed', () => {
    workers.delete(worker);
  });

  return worker;
};
