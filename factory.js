import { Queue } from 'bullmq';
import { createRedisConnection } from './client';
export const createQueue = (name, options) => {
    return new Queue(name, {
        connection: createRedisConnection(),
        ...options,
    });
};
