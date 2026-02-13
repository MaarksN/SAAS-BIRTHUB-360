# 🔥 IMPLEMENTAÇÃO CRÍTICA - PARTE 3
## Ciclos 21, 31 e 36 - Tokenizer, RLS e Email Worker

---

## 📦 INSTALAÇÃO DE DEPENDÊNCIAS

```bash
# Tokenizer
npm install --workspace=libs/core tiktoken

# Email
npm install --workspace=apps/web resend
```

---

## 💰 CICLO 21: TOKENIZER SERVICE PARA TRACKING DE CUSTOS

### 1️⃣ Criar Tokenizer Service

**Arquivo:** `libs/core/src/tokenizer.ts`

```typescript
import { encoding_for_model, Tiktoken, TiktokenModel } from 'tiktoken';

/**
 * Tabela de preços por modelo (USD por 1M tokens)
 * Atualizar conforme mudanças de preço dos provedores
 */
const PRICING_TABLE = {
  // OpenAI
  'gpt-4o': { input: 2.50, output: 10.00 },
  'gpt-4o-mini': { input: 0.15, output: 0.60 },
  'gpt-4-turbo': { input: 10.00, output: 30.00 },
  'gpt-4': { input: 30.00, output: 60.00 },
  'gpt-3.5-turbo': { input: 0.50, output: 1.50 },
  
  // Anthropic
  'claude-3-5-sonnet-20241022': { input: 3.00, output: 15.00 },
  'claude-3-opus-20240229': { input: 15.00, output: 75.00 },
  'claude-3-sonnet-20240229': { input: 3.00, output: 15.00 },
  'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
  
  // Gemini
  'gemini-2.5-flash-preview': { input: 0.075, output: 0.30 },
  'gemini-pro': { input: 0.50, output: 1.50 }
} as const;

type ModelName = keyof typeof PRICING_TABLE;

/**
 * Mapeamento de modelos para encoders Tiktoken
 */
const MODEL_TO_ENCODING: Record<string, TiktokenModel> = {
  'gpt-4o': 'gpt-4o',
  'gpt-4o-mini': 'gpt-4o',
  'gpt-4-turbo': 'gpt-4-turbo',
  'gpt-4': 'gpt-4',
  'gpt-3.5-turbo': 'gpt-3.5-turbo',
  // Claude e Gemini usam cl100k_base como aproximação
  'claude-3-5-sonnet-20241022': 'cl100k_base' as any,
  'claude-3-opus-20240229': 'cl100k_base' as any,
  'claude-3-sonnet-20240229': 'cl100k_base' as any,
  'claude-3-haiku-20240307': 'cl100k_base' as any,
  'gemini-2.5-flash-preview': 'cl100k_base' as any,
  'gemini-pro': 'cl100k_base' as any
};

/**
 * Cache de encoders para evitar recriação
 */
const encoderCache = new Map<string, Tiktoken>();

/**
 * Obtém ou cria encoder para um modelo
 */
function getEncoder(model: string): Tiktoken {
  if (encoderCache.has(model)) {
    return encoderCache.get(model)!;
  }

  const encodingName = MODEL_TO_ENCODING[model] || 'cl100k_base';
  const encoder = encoding_for_model(encodingName as TiktokenModel);
  encoderCache.set(model, encoder);
  
  return encoder;
}

/**
 * Conta tokens em um texto
 */
export function countTokens(text: string, model: string = 'gpt-4o'): number {
  try {
    const encoder = getEncoder(model);
    const tokens = encoder.encode(text);
    return tokens.length;
  } catch (error) {
    console.error('Error counting tokens:', error);
    // Fallback: estimativa grosseira
    return Math.ceil(text.length / 4);
  }
}

/**
 * Conta tokens em mensagens de chat (formato OpenAI/Anthropic)
 */
export function countChatTokens(
  messages: Array<{ role: string; content: string }>,
  model: string = 'gpt-4o'
): number {
  try {
    const encoder = getEncoder(model);
    let totalTokens = 0;

    // Tokens por mensagem (overhead)
    const tokensPerMessage = 3;
    const tokensPerName = 1;

    for (const message of messages) {
      totalTokens += tokensPerMessage;
      
      // Contar tokens do conteúdo
      const contentTokens = encoder.encode(message.content);
      totalTokens += contentTokens.length;
      
      // Tokens do role
      totalTokens += tokensPerName;
    }

    // Tokens de priming (resposta inicial)
    totalTokens += 3;

    return totalTokens;
  } catch (error) {
    console.error('Error counting chat tokens:', error);
    // Fallback
    const totalText = messages.map(m => m.content).join(' ');
    return Math.ceil(totalText.length / 4);
  }
}

/**
 * Calcula custo estimado baseado em tokens
 */
export function calculateCost(
  inputTokens: number,
  outputTokens: number,
  model: string,
  cachedTokens: number = 0
): number {
  const pricing = PRICING_TABLE[model as ModelName];
  
  if (!pricing) {
    console.warn(`Unknown model: ${model}. Using default pricing.`);
    return ((inputTokens + outputTokens) / 1_000_000) * 5.0; // Default fallback
  }

  // Tokens em cache custam 50% do preço normal (aproximação)
  const effectiveInputTokens = inputTokens - cachedTokens;
  const cachedCost = (cachedTokens / 1_000_000) * (pricing.input * 0.5);
  
  const inputCost = (effectiveInputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;

  return inputCost + outputCost + cachedCost;
}

/**
 * Interface para resultado de contagem
 */
export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
  totalTokens: number;
  estimatedCost: number;
  model: string;
}

/**
 * Wrapper conveniente para calcular uso completo
 */
export function calculateUsage(
  input: string | Array<{ role: string; content: string }>,
  output: string,
  model: string,
  cachedTokens: number = 0
): TokenUsage {
  const inputTokens = typeof input === 'string' 
    ? countTokens(input, model)
    : countChatTokens(input, model);
  
  const outputTokens = countTokens(output, model);
  const totalTokens = inputTokens + outputTokens;
  const estimatedCost = calculateCost(inputTokens, outputTokens, model, cachedTokens);

  return {
    inputTokens,
    outputTokens,
    cachedTokens,
    totalTokens,
    estimatedCost,
    model
  };
}

/**
 * Limpa encoders do cache (para liberar memória)
 */
export function clearEncoderCache(): void {
  for (const encoder of encoderCache.values()) {
    encoder.free();
  }
  encoderCache.clear();
}

/**
 * Obtém preços de um modelo
 */
export function getModelPricing(model: string): { input: number; output: number } | null {
  return PRICING_TABLE[model as ModelName] || null;
}

/**
 * Lista todos os modelos suportados
 */
export function getSupportedModels(): string[] {
  return Object.keys(PRICING_TABLE);
}
```

---

### 2️⃣ Service para Gravar Usage Logs

**Arquivo:** `libs/core/src/usage-logger.ts`

```typescript
import { prisma } from './prisma';
import { TokenUsage } from './tokenizer';
import { getOrganizationId, getUserId, getRequestId } from './context';

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
        contextType: params.contextType
      }
    });

    console.log({
      event: 'ai_usage_logged',
      requestId: getRequestId(),
      orgId,
      model: params.modelUsed,
      tokens: params.inputTokens + params.outputTokens,
      cost: params.estimatedCost
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
  endDate: Date = new Date()
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
        lte: endDate
      }
    }
  });

  const totalCost = logs.reduce((sum, log) => sum + Number(log.estimatedCost), 0);
  const totalTokens = logs.reduce((sum, log) => sum + log.inputTokens + log.outputTokens, 0);
  const requestCount = logs.length;

  // Agregar por modelo
  const byModel: Record<string, { cost: number; tokens: number; count: number }> = {};
  
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
    byModel
  };
}

/**
 * Verifica se organização está próxima do limite de budget
 */
export async function checkBudgetLimit(
  organizationId: string,
  budgetLimit: number,
  warningThreshold: number = 0.8
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
    shouldBlock: percentage >= 1.0
  };
}
```

---

### 3️⃣ Middleware de Budget Guard

**Arquivo:** `apps/web/lib/budget-guard.ts`

```typescript
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
```

---

### 4️⃣ Exemplo de Uso Completo

**Arquivo:** `apps/web/app/api/ai/generate/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withRequestContext } from '@/lib/api-context';
import { guardAIRequest, QuotaExceededError } from '@/lib/budget-guard';
import { calculateUsage, logAIUsage } from '@salesos/core';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
});

export async function POST(req: NextRequest) {
  return withRequestContext(req, async () => {
    try {
      // 1. Verificar budget ANTES de chamar API
      await guardAIRequest();

      const { prompt, model = 'claude-3-5-sonnet-20241022' } = await req.json();

      // 2. Medir tempo de execução
      const startTime = Date.now();

      // 3. Fazer requisição à API
      const message = await anthropic.messages.create({
        model,
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      });

      const latencyMs = Date.now() - startTime;
      const output = message.content[0].type === 'text' ? message.content[0].text : '';

      // 4. Calcular tokens e custo
      const usage = calculateUsage(
        prompt,
        output,
        model,
        0 // cachedTokens - pode ser extraído do response se disponível
      );

      // 5. Gravar usage log (async, não bloqueia response)
      logAIUsage({
        modelUsed: usage.model,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        cachedTokens: usage.cachedTokens,
        latencyMs,
        estimatedCost: usage.estimatedCost,
        contextType: 'Chat_Assistant'
      }).catch(console.error);

      // 6. Retornar resposta
      return NextResponse.json({
        output,
        usage: {
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens,
          totalTokens: usage.totalTokens,
          estimatedCost: usage.estimatedCost
        }
      });

    } catch (error) {
      if (error instanceof QuotaExceededError) {
        return NextResponse.json(
          {
            error: 'Budget limit exceeded',
            message: error.message,
            usage: error.usage,
            limit: error.limit
          },
          { status: 402 } // Payment Required
        );
      }

      console.error('AI generation error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}
```

---

## 🔒 CICLO 31: ROW-LEVEL SECURITY (RLS) VIA PRISMA

### 1️⃣ Criar RLS Middleware

**Arquivo:** `libs/core/src/rls-middleware.ts`

```typescript
import { Prisma } from '@prisma/client';
import { getOrganizationId, getContext } from './context';

/**
 * Models que precisam de RLS (filtro por organizationId)
 */
const RLS_MODELS = [
  'Lead',
  'Campaign',
  'Deal',
  'EmailAccount',
  'ScheduledEmail',
  'Integration',
  'Notification',
  'AuditLog',
  'UsageLog',
  'CreditTransaction',
  'EmailThread'
];

/**
 * Middleware de Row-Level Security
 * Injeta automaticamente filtro de organizationId em todas as queries
 */
export function rlsMiddleware(
  params: Prisma.MiddlewareParams,
  next: (params: Prisma.MiddlewareParams) => Promise<any>
) {
  // Só aplica em models com RLS
  if (!RLS_MODELS.includes(params.model || '')) {
    return next(params);
  }

  const organizationId = getOrganizationId();
  
  // Se não tiver organizationId no contexto, deixa passar
  // (pode ser uma query de sistema ou admin)
  if (!organizationId) {
    console.warn({
      event: 'rls_bypass',
      model: params.model,
      action: params.action,
      reason: 'no_organization_id_in_context'
    });
    return next(params);
  }

  // Injeta organizationId em queries de leitura
  if (
    params.action === 'findUnique' ||
    params.action === 'findFirst' ||
    params.action === 'findMany' ||
    params.action === 'count' ||
    params.action === 'aggregate'
  ) {
    if (!params.args) {
      params.args = {};
    }

    // Adiciona filtro de organizationId
    if (params.args.where) {
      // Se já existe um where, faz merge
      params.args.where = {
        AND: [
          { organizationId },
          params.args.where
        ]
      };
    } else {
      params.args.where = { organizationId };
    }
  }

  // Injeta organizationId em writes
  if (params.action === 'create') {
    if (!params.args) {
      params.args = {};
    }
    
    if (!params.args.data) {
      params.args.data = {};
    }

    // Força organizationId no create
    params.args.data.organizationId = organizationId;
  }

  if (params.action === 'createMany') {
    if (!params.args) {
      params.args = {};
    }

    if (Array.isArray(params.args.data)) {
      params.args.data = params.args.data.map((item: any) => ({
        ...item,
        organizationId
      }));
    } else {
      params.args.data.organizationId = organizationId;
    }
  }

  // Update e delete: adiciona where organizationId
  if (params.action === 'update' || params.action === 'delete') {
    if (!params.args) {
      params.args = {};
    }

    if (params.args.where) {
      params.args.where = {
        AND: [
          { organizationId },
          params.args.where
        ]
      };
    } else {
      params.args.where = { organizationId };
    }
  }

  if (params.action === 'updateMany' || params.action === 'deleteMany') {
    if (!params.args) {
      params.args = {};
    }

    if (params.args.where) {
      params.args.where = {
        AND: [
          { organizationId },
          params.args.where
        ]
      };
    } else {
      params.args.where = { organizationId };
    }
  }

  return next(params);
}

/**
 * Helper para queries que precisam IGNORAR RLS
 * (ex: admin queries, system operations)
 * 
 * USO RESTRITO - APENAS PARA OPERAÇÕES DE SISTEMA
 */
export function bypassRLS<T extends Record<string, any>>(args?: T): T & { __bypassRLS: true } {
  return {
    ...args,
    __bypassRLS: true as true
  } as T & { __bypassRLS: true };
}

/**
 * Verifica se query está marcada para bypass
 */
function shouldBypassRLS(args: any): boolean {
  return args?.__bypassRLS === true;
}
```

---

### 2️⃣ Atualizar Prisma Client com RLS

**Arquivo:** `libs/core/src/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client';
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
```

---

### 3️⃣ Teste de Penetração Automatizado

**Arquivo:** `libs/core/src/rls-middleware.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { rlsMiddleware } from './rls-middleware';
import { runWithContext } from './context';

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
          where: { id: 'lead-from-org-b' }
        });
        return lead;
      }
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
            name: 'Test Lead'
          }
        });
      }
    );

    // O organizationId deve ter sido injetado automaticamente
    expect(created.organizationId).toBe('org-a-123');
  });

  it('should filter results by organizationId', async () => {
    const leads = await runWithContext(
      { organizationId: 'org-a-123' },
      async () => {
        return await prisma.lead.findMany();
      }
    );

    // Todos os leads devem pertencer à org-a-123
    expect(leads.every(lead => lead.organizationId === 'org-a-123')).toBe(true);
  });
});
```

---

Continua com CICLO 36 no próximo arquivo...
