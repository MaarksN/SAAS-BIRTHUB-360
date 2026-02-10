import { env } from '@salesos/config';
export function getRedisConfig() {
    if (env.REDIS_URL) {
        const url = new URL(env.REDIS_URL);
        return {
            host: url.hostname,
            port: parseInt(url.port || '6379', 10),
            username: url.username,
            password: url.password,
            maxRetriesPerRequest: null,
        };
    }
    return {
        host: 'localhost',
        port: 6379,
        maxRetriesPerRequest: null,
    };
}
