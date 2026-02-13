// apps/web/lib/api-auth.ts
import { ApiKeyService } from '@salesos/core/services/api-key-service';

const apiKeyService = new ApiKeyService();

export async function validateApiKey(req: Request) {
  const apiKey = req.headers.get('x-api-key');
  return await apiKeyService.validateAndLogUsage(apiKey || '');
}
