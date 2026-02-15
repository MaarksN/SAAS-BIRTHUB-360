import Redis from 'ioredis';
import { ZodSchema } from 'zod';

export class QueueService {
  private redis: Redis;

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl);
  }

  /**
   * Cycle 16: Node (Producer) uses Zod to validate payload before sending to Redis.
   */
  async produce<T>(
    queueName: string,
    schema: ZodSchema<T>,
    type: string,
    payload: T,
  ): Promise<void> {
    const result = schema.safeParse(payload);

    if (!result.success) {
      throw new Error(
        `Schema Mismatch: Payload validation failed for queue ${queueName}. Details: ${result.error.message}`,
      );
    }

    const job = {
      type: type,
      payload: result.data, // Use sanitized/validated data
      timestamp: Date.now(),
      retryCount: 0,
    };

    try {
      await this.redis.rpush(queueName, JSON.stringify(job));
      console.log(`Produced job ${type} to ${queueName}`);
    } catch (error) {
      console.error(`Failed to push to Redis: ${error}`);
      throw error;
    }
  }

  async close() {
    await this.redis.quit();
  }
}
