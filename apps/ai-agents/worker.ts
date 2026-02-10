import { Worker, WorkerOptions, Processor } from 'bullmq';
import { createRedisConnection } from './client';

export const createWorker = <T = any, R = any, N extends string = string>(
  name: N,
  processor: string | Processor<T, R, N>,
  options?: WorkerOptions
) => {
  const connection = createRedisConnection();
  return new Worker<T, R, N>(name, processor, {
    connection,
    ...options,
  });
};
