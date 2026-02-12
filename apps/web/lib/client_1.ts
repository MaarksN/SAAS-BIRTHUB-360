import { PrismaClient } from '@prisma/client';
import { env } from '@salesos/config';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'stdout', level: 'error' },
    { emit: 'stdout', level: 'warn' },
  ],
});

if (!global.prisma) {
  // @ts-ignore
  prisma.$on('query', (e: any) => {
    if (e.duration > 1000) {
      console.warn(`[Slow Query] ${e.duration}ms ${e.query} ${e.params}`);
    }
  });
}

if (env.NODE_ENV !== 'production') global.prisma = prisma;
