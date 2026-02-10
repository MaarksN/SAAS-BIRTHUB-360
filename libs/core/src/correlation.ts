import { AsyncLocalStorage } from 'node:async_hooks';

export const context = new AsyncLocalStorage<{ requestId: string; [key: string]: any }>();

export const getRequestId = () => {
  const store = context.getStore();
  return store?.requestId;
};

export const runWithContext = <T>(requestId: string, fn: () => T) => {
  return context.run({ requestId }, fn);
};
