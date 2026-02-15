import { describe, expect, it } from 'vitest';

import { getTenantId, runWithTenant } from './tenant-context';

describe('TenantContext', () => {
  it('should propagate tenant ID in async scope', () => {
    const tenantId = 'org-123';

    runWithTenant(tenantId, () => {
      // Simulate async operation
      setTimeout(() => {
        expect(getTenantId()).toBe(tenantId);
      }, 10);

      expect(getTenantId()).toBe(tenantId);
    });
  });

  it('should return undefined outside scope', () => {
    expect(getTenantId()).toBeUndefined();
  });
});
