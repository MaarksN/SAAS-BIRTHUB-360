import Redis from 'ioredis';
import { getRedisConfig } from './config';
export const createRedisConnection = () => {
    const config = getRedisConfig();
    return new Redis(config);
};
