// Mock implementation of logic usually found in a DB lookup
// In a real app, this would use Prisma to find the ApiKey by hash
import { ApiKeyService } from '@salesos/core/services/api-key-service';
// import { RateLimitService } from '@salesos/core/services/rate-limit-service'; // Removed for Edge Compatibility

const apiKeyService = new ApiKeyService();
// const rateLimitService = new RateLimitService(process.env.REDIS_URL || 'redis://localhost:6379');

export async function validateRequest(req: Request) {
  const apiKey = req.headers.get('x-api-key');

  if (!apiKey) {
    return { authorized: false, error: 'Missing API Key', status: 401 };
  }

  // Cycle 35: Sandbox Logic
  const isSandbox = req.headers.get('x-salesos-sandbox') === 'true' || apiKey.startsWith('sk_test_');

  // 1. Verify Key (Hash)
  // Mock DB Lookup: "Is this hash in the DB?"
  // const storedHash = await db.apiKey.findFirst(...)
  // For demo, we assume any key starting with 'sk_live_' or 'sk_test_' is "valid" structurally
  if (!apiKey.startsWith('sk_live_') && !apiKey.startsWith('sk_test_')) {
    return { authorized: false, error: 'Invalid API Key format', status: 401 };
  }

  const hashedKey = apiKeyService.hashKey(apiKey);

  // 2. Rate Limit (SKIPPED IN EDGE MIDDLEWARE)
  // To enable this, use @upstash/redis or move to Node.js Route Handler
  // We mock it here to prevent Edge Runtime crash due to ioredis
  const limit = 100;

  return {
    authorized: true,
    headers: {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': '99', // Mock
      'X-RateLimit-Reset': Date.now().toString(), // Mock
      'X-SalesOS-Sandbox': isSandbox ? 'true' : 'false'
    }
  };
}
