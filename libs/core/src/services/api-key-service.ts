import { randomBytes, createHash } from 'crypto';
import { prisma } from '../prisma'; // Assumes libs/core/src/prisma.ts is accessible
import { RateLimitService } from './rate-limit-service'; // Import correctly

export interface GeneratedKey {
  key: string;
  keyPrefix: string;
  hash: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  remaining?: number;
  reset?: number;
  limit?: number;
}

export class ApiKeyService {
  private readonly LIVE_PREFIX = 'sk_live_';
  private readonly TEST_PREFIX = 'sk_test_';
  private rateLimitService: RateLimitService;

  constructor() {
    this.rateLimitService = new RateLimitService(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  generateKey(isTest: boolean = false): GeneratedKey {
    const buffer = randomBytes(32);
    const prefix = isTest ? this.TEST_PREFIX : this.LIVE_PREFIX;
    const rawKey = `${prefix}${buffer.toString('hex')}`;

    return {
      key: rawKey,
      keyPrefix: rawKey.substring(0, 15) + '...',
      hash: this.hashKey(rawKey)
    };
  }

  hashKey(key: string): string {
    return createHash('sha256').update(key).digest('hex');
  }

  /**
   * Validates key against DB and checks rate limit.
   * NOTE: This MUST run in Node.js runtime (not Edge).
   */
  async validateAndLogUsage(apiKey: string): Promise<ValidationResult> {
    if (!apiKey) return { valid: false, error: 'Missing API Key' };

    const hash = this.hashKey(apiKey);

    try {
      const storedKey = await prisma.apiKey.findUnique({
        where: { hash },
        include: { organization: true }
      });

      if (!storedKey) {
        return { valid: false, error: 'Invalid API Key' };
      }

      if (!storedKey.isActive) {
        return { valid: false, error: 'API Key is revoked' };
      }

      if (storedKey.expiresAt && storedKey.expiresAt < new Date()) {
        return { valid: false, error: 'API Key expired' };
      }

      // Check Rate Limit
      const limit = storedKey.rateLimit || 100;
      const rateCheck = await this.rateLimitService.checkLimit(hash, limit);

      if (!rateCheck.allowed) {
        return {
            valid: false,
            error: 'Rate limit exceeded',
            remaining: 0,
            reset: rateCheck.resetAt,
            limit
        };
      }

      // Async Log Usage (Fire and Forget)
      // In prod, push to queue. Here we just update LastUsedAt
      // We don't await this to reduce latency
      prisma.apiKey.update({
        where: { id: storedKey.id },
        data: { lastUsedAt: new Date() }
      }).catch(err => console.error('Failed to update key usage', err));

      return {
          valid: true,
          remaining: rateCheck.remaining,
          reset: rateCheck.resetAt,
          limit
      };

    } catch (error) {
      console.error('ApiKey Validation Error:', error);
      return { valid: false, error: 'Internal Server Error' };
    }
  }
}
