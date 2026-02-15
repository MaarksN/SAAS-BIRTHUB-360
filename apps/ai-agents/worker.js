import { Worker } from 'bullmq';
import { createRedisConnection } from './client';
export const createWorker = (name, processor, options) => {
    const connection = createRedisConnection();
    return new Worker(name, processor, {
        connection,
        ...options,
    });
};
