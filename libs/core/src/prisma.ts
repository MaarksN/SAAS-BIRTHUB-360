import { PrismaClient } from '@birthhub/database';
import { softDeleteMiddleware } from './prisma-middleware';
import { rlsMiddleware } from './rls-middleware';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
  });

// Aplicar middlewares na ordem correta
// 1. RLS primeiro (segurança)
// 2. Soft Delete depois (funcionalidade)
prisma.$use((params, next) => rlsMiddleware(params, next));
prisma.$use((params, next) => softDeleteMiddleware(params, next));

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
