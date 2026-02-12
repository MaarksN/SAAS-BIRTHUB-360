// Mock implementation of logic usually found in a DB lookup
// In a real app, this would use Prisma to find the ApiKey by hash
import { ApiKeyService } from '@salesos/core/services/api-key-service';
import { RateLimitService } from '@salesos/core/services/rate-limit-service';

const apiKeyService = new ApiKeyService();
const rateLimitService = new RateLimitService(process.env.REDIS_URL || 'redis://localhost:6379');

export async function validateRequest(req: Request) {
  const apiKey = req.headers.get('x-api-key');

  if (!apiKey) {
    return { authorized: false, error: 'Missing API Key', status: 401 };
  }

  // 1. Verify Key (Hash)
  // Mock DB Lookup: "Is this hash in the DB?"
  // const storedHash = await db.apiKey.findFirst(...)
  // For demo, we assume any key starting with 'sk_live_' is "valid" structurally
  if (!apiKey.startsWith('sk_live_')) {
    return { authorized: false, error: 'Invalid API Key format', status: 401 };
  }

  const hashedKey = apiKeyService.hashKey(apiKey);

  // 2. Rate Limit
  const limit = 100; // Mock limit from DB
  const rateCheck = await rateLimitService.checkLimit(hashedKey, limit);

  if (!rateCheck.allowed) {
    return {
      authorized: false,
      error: 'Rate limit exceeded',
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': rateCheck.remaining.toString(),
        'X-RateLimit-Reset': rateCheck.resetAt.toString()
      }
    };
  }

  return {
    authorized: true,
    headers: {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': rateCheck.remaining.toString(),
      'X-RateLimit-Reset': rateCheck.resetAt.toString()
    }
  };
}
