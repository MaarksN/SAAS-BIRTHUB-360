import { Queue, QueueOptions } from 'bullmq';

import { createRedisConnection } from './client';
import { QueueName } from './definitions';

export const createQueue = (name: QueueName, options?: QueueOptions) => {
  return new Queue(name, {
    connection: createRedisConnection(),
    ...options,
  });
};
