import { describe, it, expect, vi } from 'vitest';
import { SalesOSClient } from '../libs/sdk/src/index';
import { AuditService } from '../libs/core/src/services/audit-service';

// Mock Axios
vi.mock('axios', () => {
  return {
    default: {
      create: vi.fn().mockReturnValue({
        get: vi.fn().mockResolvedValue({ data: ['lead1', 'lead2'] }),
        post: vi.fn().mockResolvedValue({ data: { success: true } })
      })
    }
  };
});

describe('Cycle 34: SDK', () => {
  it('should initialize and make requests', async () => {
    const client = new SalesOSClient({ apiKey: 'sk_test_123' });
    const leads = await client.leads.list();
    expect(leads).toHaveLength(2);
  });
});

describe('Cycle 37: Audit Logs', () => {
  it('should log actions', async () => {
    const mockDb = {
      auditLog: {
        create: vi.fn().mockResolvedValue({ id: 'log-1' }),
        findMany: vi.fn()
      }
    } as any;

    const service = new AuditService(mockDb);
    await service.logAction({
      action: 'TEST_ACTION',
      resource: 'Resource:1',
      actorId: 'user-1',
      organizationId: 'org-1'
    });

    expect(mockDb.auditLog.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ action: 'TEST_ACTION' })
    }));
  });
});
