import { Queue, Worker, QueueOptions, WorkerOptions, Processor } from 'bullmq';
import { logger, env, runWithContext, RequestContext } from '@salesos/core';
import IORedis from 'ioredis';
import * as crypto from 'crypto';

const workers = new Set<Worker>();

const createConnection = () => {
  return new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null
  });
};

const attachSignalListeners = () => {
  const signalHandler = async (signal: string) => {
    logger.info(`Received ${signal}, closing workers...`);
    await Promise.all(
      Array.from(workers).map((worker) => worker.close())
    );
    logger.info('All workers closed');
    process.exit(0);
  };

  process.once('SIGTERM', () => signalHandler('SIGTERM'));
  process.once('SIGINT', () => signalHandler('SIGINT'));
};

export const createQueue = <T>(name: string, options?: Partial<QueueOptions>) => {
  return new Queue<T>(name, {
    connection: createConnection(),
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: false,
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 2000
      },
      ...options?.defaultJobOptions
    },
    ...options
  });
};

export const createWorker = <T = any>(
  name: string,
  processor: Processor<T>,
  options?: Partial<WorkerOptions>
) => {
  const worker = new Worker<T>(
    name,
    async (job) => {
      // Extrair contexto do job.data se existir
      const context: Partial<RequestContext> = {
        requestId: job.id || crypto.randomUUID(),
        userId: (job.data as any)?.userId,
        organizationId: (job.data as any)?.organizationId
      };

      // Executar processor dentro do contexto
      return runWithContext(context, async () => {
        const start = Date.now();

        logger.jobStarted(job.id!, name, job.data);

        try {
          const result = await processor(job);
          const duration = Date.now() - start;

          logger.jobCompleted(job.id!, name, duration, result);

          return result;
        } catch (error: any) {
          const duration = Date.now() - start;

          logger.jobFailed(job.id!, name, duration, error);

          throw error;
        }
      });
    },
    {
      connection: createConnection(),
      concurrency: options?.concurrency || 1,
      ...options
    }
  );

  worker.on('failed', (job, err) => {
    logger.error(
      { jobId: job?.id, queue: name, error: err },
      'Job failed permanently'
    );
  });

  // Graceful shutdown
  const workers = new Set<Worker>();
  workers.add(worker);

  if (workers.size === 1) {
    attachSignalListeners();
  }

  worker.on('closed', () => {
    workers.delete(worker);
  });

  return worker;
};
