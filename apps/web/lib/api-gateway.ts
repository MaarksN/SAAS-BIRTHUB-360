import { ApiKeyService } from '@salesos/core/services/api-key-service';

// Mock Implementation for Edge Runtime
const mockValidation = (req: Request) => {
  const apiKey = req.headers.get('x-api-key');
  if (!apiKey) return { authorized: false, error: 'Missing API Key', status: 401 };

  const isSandbox = req.headers.get('x-salesos-sandbox') === 'true' || apiKey.startsWith('sk_test_');
  if (!apiKey.startsWith('sk_live_') && !apiKey.startsWith('sk_test_')) {
    return { authorized: false, error: 'Invalid API Key format', status: 401 };
  }

  return {
    authorized: true,
    headers: {
      'X-RateLimit-Limit': '100',
      'X-RateLimit-Remaining': '99',
      'X-RateLimit-Reset': Date.now().toString(),
      'X-SalesOS-Sandbox': isSandbox ? 'true' : 'false'
    }
  };
};

export async function validateRequest(req: Request) {
  // Check Runtime
  // Next.js Edge Runtime defines `EdgeRuntime` global or process.env.NEXT_RUNTIME
  const isEdge = process.env.NEXT_RUNTIME === 'edge' || (typeof EdgeRuntime !== 'string');

  if (isEdge) {
    return mockValidation(req);
  }

  // Node.js Runtime - Use Real Service
  try {
    const { validateApiKey } = await import('./api-auth'); // Dynamic import to avoid bundling Node modules in Edge
    const result = await validateApiKey(req);

    if (!result.valid) {
        return { authorized: false, error: result.error, status: 401 }; // Or 429
    }

    return {
        authorized: true,
        headers: {
            'X-RateLimit-Limit': result.limit?.toString() || '100',
            'X-RateLimit-Remaining': result.remaining?.toString() || '0',
            'X-RateLimit-Reset': result.reset?.toString() || Date.now().toString(),
        }
    };
  } catch (e) {
      console.error('Validation failed', e);
      return { authorized: false, error: 'Internal Error', status: 500 };
  }
}
