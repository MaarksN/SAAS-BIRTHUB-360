import { AsyncLocalStorage } from 'node:async_hooks';
export const contextStorage = new AsyncLocalStorage();
export const getContext = () => {
    return contextStorage.getStore() || {};
};
export const runWithContext = (ctx, callback) => {
    return contextStorage.run(ctx, callback);
};
