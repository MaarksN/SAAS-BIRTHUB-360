import { AsyncLocalStorage } from 'async_hooks';

export const tenantContext = new AsyncLocalStorage<string>();

export function getTenantId(): string | undefined {
  return tenantContext.getStore();
}

// Middleware or Wrapper to run code within tenant context
export function runWithTenant<T>(tenantId: string, fn: () => T): T {
  return tenantContext.run(tenantId, fn);
}
