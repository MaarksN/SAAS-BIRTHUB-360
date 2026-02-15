import { checkBudgetLimit } from '@salesos/core';
import { getOrganizationId } from '@salesos/core';

/**
 * Erro de quota excedida
 */
export class QuotaExceededError extends Error {
  constructor(
    message: string,
    public usage: number,
    public limit: number
  ) {
    super(message);
    this.name = 'QuotaExceededError';
  }
}

/**
 * Verifica se organização pode fazer requisição de IA
 */
export async function guardAIRequest(organizationId?: string): Promise<void> {
  const orgId = organizationId || getOrganizationId();

  if (!orgId) {
    throw new Error('Organization ID required for AI requests');
  }

  // Buscar limite do plano da organização
  // TODO: Integrar com Prisma para pegar o limite real
  const budgetLimit = 50.00; // $50/mês para Pro plan (exemplo)

  const budget = await checkBudgetLimit(orgId, budgetLimit);

  // Bloquear se excedeu 100%
  if (budget.shouldBlock) {
    throw new QuotaExceededError(
      'Budget limit exceeded. Please upgrade your plan or wait for next billing cycle.',
      budget.usage,
      budget.limit
    );
  }

  // Avisar se passou de 80%
  if (budget.shouldWarn) {
    console.warn({
      event: 'budget_warning',
      organizationId: orgId,
      usage: budget.usage,
      limit: budget.limit,
      percentage: budget.percentage
    });

    // TODO: Enviar notificação para o usuário
  }
}
