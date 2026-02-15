import { redis } from '../redis';

/**
 * Sliding Window Rate Limiter using Redis Sorted Sets
 * @param identifier Unique key (e.g., IP or User ID)
 * @param limit Max requests
 * @param windowSeconds Window size in seconds
 */
export async function checkRateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<{ success: boolean; remaining: number }> {
  const key = `ratelimit:${identifier}`;
  const now = Date.now();
  const windowStart = now - (windowSeconds * 1000);

  // Remove requests outside the window
  await redis.zremrangebyscore(key, 0, windowStart);

  // Count requests in the current window
  const count = await redis.zcard(key);

  if (count >= limit) {
    return { success: false, remaining: 0 };
  }

  // Add current request
  // Use unique member (timestamp + random) to allow multiple requests in same ms
  await redis.zadd(key, now, `${now}-${Math.random()}`);

  // Set expire to clean up key if unused
  await redis.expire(key, windowSeconds + 60);

  return {
    success: true,
    remaining: limit - count - 1
  };
}
