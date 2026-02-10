import { getContext } from './context';

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => {
    const ctx = getContext();
    console.log(JSON.stringify({
      level: 'info',
      message,
      meta: { ...meta, requestId: ctx.requestId, userId: ctx.userId },
      timestamp: new Date().toISOString()
    }));
  },
  error: (message: string, error?: unknown) => {
    const ctx = getContext();
    console.error(JSON.stringify({
      level: 'error',
      message,
      error,
      meta: { requestId: ctx.requestId, userId: ctx.userId },
      timestamp: new Date().toISOString()
    }));
  },
  warn: (message: string, meta?: Record<string, unknown>) => {
    const ctx = getContext();
    console.warn(JSON.stringify({
      level: 'warn',
      message,
      meta: { ...meta, requestId: ctx.requestId, userId: ctx.userId },
      timestamp: new Date().toISOString()
    }));
  }
};
