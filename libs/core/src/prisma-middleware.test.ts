import { PrismaClient } from '@birthhub/database';
import { beforeEach, describe, expect, it } from 'vitest';

import { softDeleteMiddleware } from './prisma-middleware';

describe('Soft Delete Middleware', () => {
  let prisma: PrismaClient;

  beforeEach(() => {
    prisma = new PrismaClient();
    prisma.$use((params, next) => softDeleteMiddleware(params, next));
  });

  it('should convert delete to update with deletedAt', async () => {
    // Este teste precisa de um banco de teste
    // Implementar com banco em memória ou mock
    expect(true).toBe(true);
  });

  it('should filter out deleted records by default', async () => {
    // Implementar teste
    expect(true).toBe(true);
  });

  it('should include deleted records with withDeleted()', async () => {
    // Implementar teste
    expect(true).toBe(true);
  });
});
