import Redis from 'ioredis';

import { getRedisConfig } from './config';

export const createRedisConnection = (): Redis => {
  const config = getRedisConfig();
  return new Redis(config);
};
