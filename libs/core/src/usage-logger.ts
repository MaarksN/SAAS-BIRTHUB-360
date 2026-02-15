import { getOrganizationId, getRequestId, getUserId } from './context';
import { prisma } from './prisma';
import { TokenUsage } from './tokenizer';

export interface LogUsageParams {
  modelUsed: string;
  inputTokens: number;
  outputTokens: number;
  cachedTokens?: number;
  latencyMs: number;
  estimatedCost: number;
  contextType: string; // 'RAG_Search', 'Chat_Assistant', 'Email_Generation', etc.
  organizationId?: string;
  userId?: string;
}

/**
 * Grava log de uso de IA no banco de dados
 */
export async function logAIUsage(params: LogUsageParams): Promise<void> {
  try {
    const orgId = params.organizationId || getOrganizationId();
    const userId = params.userId || getUserId();

    if (!orgId) {
      console.warn('No organization ID found for usage logging');
      return;
    }

    await prisma.usageLog.create({
      data: {
        organizationId: orgId,
        userId: userId,
        modelUsed: params.modelUsed,
        inputTokens: params.inputTokens,
        outputTokens: params.outputTokens,
        cachedTokens: params.cachedTokens || 0,
        latencyMs: params.latencyMs,
        estimatedCost: params.estimatedCost,
        contextType: params.contextType,
      },
    });

    console.log({
      event: 'ai_usage_logged',
      requestId: getRequestId(),
      orgId,
      model: params.modelUsed,
      tokens: params.inputTokens + params.outputTokens,
      cost: params.estimatedCost,
    });
  } catch (error) {
    // Não deve falhar a requisição se logging falhar
    console.error('Failed to log AI usage:', error);
  }
}

/**
 * Obtém uso total de uma organização em um período
 */
export async function getOrganizationUsage(
  organizationId: string,
  startDate: Date,
  endDate: Date = new Date(),
): Promise<{
  totalCost: number;
  totalTokens: number;
  requestCount: number;
  byModel: Record<string, { cost: number; tokens: number; count: number }>;
}> {
  const logs = await prisma.usageLog.findMany({
    where: {
      organizationId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const totalCost = logs.reduce(
    (sum, log) => sum + Number(log.estimatedCost),
    0,
  );
  const totalTokens = logs.reduce(
    (sum, log) => sum + log.inputTokens + log.outputTokens,
    0,
  );
  const requestCount = logs.length;

  // Agregar por modelo
  const byModel: Record<
    string,
    { cost: number; tokens: number; count: number }
  > = {};

  for (const log of logs) {
    if (!byModel[log.modelUsed]) {
      byModel[log.modelUsed] = { cost: 0, tokens: 0, count: 0 };
    }
    byModel[log.modelUsed].cost += Number(log.estimatedCost);
    byModel[log.modelUsed].tokens += log.inputTokens + log.outputTokens;
    byModel[log.modelUsed].count += 1;
  }

  return {
    totalCost,
    totalTokens,
    requestCount,
    byModel,
  };
}

/**
 * Verifica se organização está próxima do limite de budget
 */
export async function checkBudgetLimit(
  organizationId: string,
  budgetLimit: number,
  warningThreshold: number = 0.8,
): Promise<{
  usage: number;
  limit: number;
  percentage: number;
  shouldWarn: boolean;
  shouldBlock: boolean;
}> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const usage = await getOrganizationUsage(organizationId, startOfMonth, now);
  const percentage = usage.totalCost / budgetLimit;

  return {
    usage: usage.totalCost,
    limit: budgetLimit,
    percentage,
    shouldWarn: percentage >= warningThreshold,
    shouldBlock: percentage >= 1.0,
  };
}
