import { describe, expect, it } from 'vitest';

import { MarketplaceService } from './marketplace-service';
import { WebhookService } from './webhook-service';

describe('MarketplaceService', () => {
  it('should list agents', async () => {
    const service = new MarketplaceService({});
    const agents = await service.listAgents();
    expect(agents).toHaveLength(2);
    expect(agents[0].name).toBe('SaaS Sales Expert');
  });
});

describe('WebhookService', () => {
  it('should sign payloads correctly', () => {
    const service = new WebhookService({});
    // Access private method for testing logic (using any cast)
    const signature = (service as any).signPayload('test-payload', 'secret');
    expect(signature).toBeDefined();
    expect(signature).toHaveLength(64); // SHA-256 hex
  });
});
