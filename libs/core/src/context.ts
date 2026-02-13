import { AsyncLocalStorage } from 'node:async_hooks';

export interface Context {
  userId?: string;
  organizationId?: string;
  role?: string;
  requestId?: string;
}

export const context = new AsyncLocalStorage<Context>();

export function getContext(): Context | undefined {
  return context.getStore();
}

export function runWithContext<T>(ctx: Context, callback: () => T): T {
  return context.run(ctx, callback);
}

export function getOrganizationId(): string | undefined {
  return context.getStore()?.organizationId;
}

export function getUserId(): string | undefined {
  return context.getStore()?.userId;
}

export function getRequestId(): string | undefined {
  return context.getStore()?.requestId;
}
