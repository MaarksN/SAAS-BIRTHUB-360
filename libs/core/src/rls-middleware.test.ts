import { PrismaClient } from '@birthhub/database';
import { beforeEach, describe, expect, it } from 'vitest';

import { runWithContext } from './context';
import { rlsMiddleware } from './rls-middleware';

describe('RLS Middleware - Security Tests', () => {
  let prisma: PrismaClient;

  beforeEach(() => {
    prisma = new PrismaClient();
    prisma.$use((params, next) => rlsMiddleware(params, next));
  });

  it('should prevent cross-tenant data access', async () => {
    // Simular usuário da Org A tentando acessar Lead da Org B
    const result = await runWithContext(
      { organizationId: 'org-a-123' },
      async () => {
        // Tentar buscar lead que pertence à org-b-456
        const lead = await prisma.lead.findUnique({
          where: { id: 'lead-from-org-b' },
        });
        return lead;
      },
    );

    // Deve retornar null porque o RLS bloqueou
    expect(result).toBeNull();
  });

  it('should automatically inject organizationId on create', async () => {
    const created = await runWithContext(
      { organizationId: 'org-a-123' },
      async () => {
        // Criar lead SEM especificar organizationId
        return await prisma.lead.create({
          data: {
            email: 'test@example.com',
            name: 'Test Lead',
          },
        });
      },
    );

    // O organizationId deve ter sido injetado automaticamente
    expect(created.organizationId).toBe('org-a-123');
  });

  it('should filter results by organizationId', async () => {
    const leads = await runWithContext(
      { organizationId: 'org-a-123' },
      async () => {
        return await prisma.lead.findMany();
      },
    );

    // Todos os leads devem pertencer à org-a-123
    expect(leads.every((lead) => lead.organizationId === 'org-a-123')).toBe(
      true,
    );
  });
});
