import { AsyncLocalStorage } from 'node:async_hooks';

export interface Context {
  requestId?: string;
  userId?: string;
  [key: string]: unknown;
}

export const contextStorage = new AsyncLocalStorage<Context>();

export const getContext = (): Context => {
  return contextStorage.getStore() || {};
};

export const runWithContext = <T>(ctx: Context, callback: () => T): T => {
  return contextStorage.run(ctx, callback);
};
