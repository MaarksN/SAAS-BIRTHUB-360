import pino from 'pino';

import { getContext, getRequestId } from './context';

const isDevelopment = process.env.NODE_ENV === 'development';

// Criar logger base
const baseLogger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  ...(isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
      },
    },
  }),
});

/**
 * Logger que injeta automaticamente o contexto da requisição
 */
export const logger = {
  info: (obj: object | string, msg?: string) => {
    const context = getContext();
    if (typeof obj === 'string') {
      baseLogger.info({ ...context }, obj);
    } else {
      baseLogger.info({ ...context, ...obj }, msg);
    }
  },

  error: (obj: object | string, msg?: string) => {
    const context = getContext();
    if (typeof obj === 'string') {
      baseLogger.error({ ...context }, obj);
    } else {
      baseLogger.error({ ...context, ...obj }, msg);
    }
  },

  warn: (obj: object | string, msg?: string) => {
    const context = getContext();
    if (typeof obj === 'string') {
      baseLogger.warn({ ...context }, obj);
    } else {
      baseLogger.warn({ ...context, ...obj }, msg);
    }
  },

  debug: (obj: object | string, msg?: string) => {
    const context = getContext();
    if (typeof obj === 'string') {
      baseLogger.debug({ ...context }, obj);
    } else {
      baseLogger.debug({ ...context, ...obj }, msg);
    }
  },

  fatal: (obj: object | string, msg?: string) => {
    const context = getContext();
    if (typeof obj === 'string') {
      baseLogger.fatal({ ...context }, obj);
    } else {
      baseLogger.fatal({ ...context, ...obj }, msg);
    }
  },

  /**
   * Log de início de job com informações contextuais
   */
  jobStarted: (jobId: string, queue: string, data?: any) => {
    const context = getContext();
    baseLogger.info(
      {
        ...context,
        event: 'job_started',
        jobId,
        queue,
        data,
      },
      `Job started: ${jobId} in queue ${queue}`,
    );
  },

  /**
   * Log de conclusão de job
   */
  jobCompleted: (
    jobId: string,
    queue: string,
    duration: number,
    result?: any,
  ) => {
    const context = getContext();
    baseLogger.info(
      {
        ...context,
        event: 'job_completed',
        jobId,
        queue,
        duration,
        result,
      },
      `Job completed: ${jobId} in ${duration}ms`,
    );
  },

  /**
   * Log de falha de job
   */
  jobFailed: (jobId: string, queue: string, duration: number, error: Error) => {
    const context = getContext();
    baseLogger.error(
      {
        ...context,
        event: 'job_failed',
        jobId,
        queue,
        duration,
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
      },
      `Job failed: ${jobId} - ${error.message}`,
    );
  },
};

export default logger;
