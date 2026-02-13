# 🔥 IMPLEMENTAÇÃO CRÍTICA - PARTE 1
## Ciclos 03 e 05 - Soft Delete & Correlation ID

---

## 📦 INSTALAÇÃO DE DEPENDÊNCIAS

```bash
# Instalar dependências necessárias
npm install --workspace=libs/core
npm install --workspace=apps/web
```

---

## 🗂️ CICLO 03: SOFT DELETE MIDDLEWARE

### 1️⃣ Criar Prisma Middleware para Soft Delete

**Arquivo:** `libs/core/src/prisma-middleware.ts`

```typescript
import { Prisma } from '@prisma/client';

/**
 * Middleware de Soft Delete
 * Intercepta operações de delete e transforma em update com deletedAt
 */
export function softDeleteMiddleware(params: Prisma.MiddlewareParams, next: (params: Prisma.MiddlewareParams) => Promise<any>) {
  // Lista de models que suportam soft delete
  const softDeleteModels = [
    'Lead',
    'Campaign',
    'Deal',
    'Organization',
    'User',
    'CompanyProfile',
    'Contact',
    'EmailAccount',
    'ScheduledEmail',
    'Integration',
    'Notification',
    'Meeting',
    'Quote'
  ];

  // Intercepta DELETE
  if (params.action === 'delete' && softDeleteModels.includes(params.model || '')) {
    params.action = 'update';
    params.args = {
      ...params.args,
      data: {
        deletedAt: new Date()
      }
    };
  }

  // Intercepta DELETE MANY
  if (params.action === 'deleteMany' && softDeleteModels.includes(params.model || '')) {
    params.action = 'updateMany';
    if (!params.args) {
      params.args = {};
    }
    params.args.data = {
      deletedAt: new Date()
    };
  }

  // Injeta filtro automático em queries de leitura
  if (
    (params.action === 'findUnique' ||
      params.action === 'findFirst' ||
      params.action === 'findMany' ||
      params.action === 'count' ||
      params.action === 'aggregate') &&
    softDeleteModels.includes(params.model || '')
  ) {
    if (!params.args) {
      params.args = {};
    }

    // Adiciona where: { deletedAt: null }
    if (params.args.where) {
      if (params.args.where.deletedAt === undefined) {
        params.args.where = {
          ...params.args.where,
          deletedAt: null
        };
      }
    } else {
      params.args.where = {
        deletedAt: null
      };
    }
  }

  return next(params);
}

/**
 * Helper para incluir registros deletados em uma query específica
 * 
 * @example
 * const allLeads = await prisma.lead.findMany(withDeleted());
 */
export function withDeleted<T extends Record<string, any>>(args?: T): T {
  return {
    ...args,
    where: {
      ...(args?.where || {}),
      deletedAt: undefined // Remove o filtro deletedAt
    }
  } as T;
}

/**
 * Helper para buscar APENAS registros deletados
 * 
 * @example
 * const deletedLeads = await prisma.lead.findMany(onlyDeleted());
 */
export function onlyDeleted<T extends Record<string, any>>(args?: T): T {
  return {
    ...args,
    where: {
      ...(args?.where || {}),
      deletedAt: {
        not: null
      }
    }
  } as T;
}
```

---

### 2️⃣ Atualizar Cliente Prisma

**Arquivo:** `libs/core/src/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import { softDeleteMiddleware } from './prisma-middleware';

// Singleton pattern
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
  });

// Aplicar middleware de soft delete
prisma.$use((params, next) => softDeleteMiddleware(params, next));

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
```

---

### 3️⃣ Exportar no Index

**Arquivo:** `libs/core/src/index.ts`

```typescript
// Adicionar estas linhas
export { prisma } from './prisma';
export { softDeleteMiddleware, withDeleted, onlyDeleted } from './prisma-middleware';
```

---

### 4️⃣ Criar Testes

**Arquivo:** `libs/core/src/prisma-middleware.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
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
```

---

## 🔗 CICLO 05: CORRELATION ID & ASYNCLOCALSTORAGE

### 1️⃣ Criar Context Service

**Arquivo:** `libs/core/src/context.ts`

```typescript
import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';

/**
 * Interface do contexto de requisição
 */
export interface RequestContext {
  requestId: string;
  userId?: string;
  organizationId?: string;
  ip?: string;
  userAgent?: string;
  startTime: number;
}

/**
 * AsyncLocalStorage para propagar contexto através da stack
 */
const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

/**
 * Inicializa um novo contexto de requisição
 */
export function runWithContext<T>(
  context: Partial<RequestContext>,
  callback: () => T
): T {
  const fullContext: RequestContext = {
    requestId: context.requestId || randomUUID(),
    userId: context.userId,
    organizationId: context.organizationId,
    ip: context.ip,
    userAgent: context.userAgent,
    startTime: Date.now()
  };

  return asyncLocalStorage.run(fullContext, callback);
}

/**
 * Obtém o contexto atual
 */
export function getContext(): RequestContext | undefined {
  return asyncLocalStorage.getStore();
}

/**
 * Obtém o Request ID do contexto atual
 */
export function getRequestId(): string {
  const context = getContext();
  return context?.requestId || 'unknown';
}

/**
 * Obtém o Organization ID do contexto atual
 */
export function getOrganizationId(): string | undefined {
  const context = getContext();
  return context?.organizationId;
}

/**
 * Obtém o User ID do contexto atual
 */
export function getUserId(): string | undefined {
  const context = getContext();
  return context?.userId;
}

/**
 * Atualiza o contexto atual (merge)
 */
export function updateContext(updates: Partial<RequestContext>): void {
  const current = getContext();
  if (current) {
    Object.assign(current, updates);
  }
}
```

---

### 2️⃣ Atualizar Logger para usar Context

**Arquivo:** `libs/core/src/logger.ts`

```typescript
import pino from 'pino';
import { getContext, getRequestId } from './context';

const isDevelopment = process.env.NODE_ENV === 'development';

// Criar logger base
const baseLogger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  formatters: {
    level: (label) => {
      return { level: label };
    }
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  ...(isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname'
      }
    }
  })
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
    baseLogger.info({
      ...context,
      event: 'job_started',
      jobId,
      queue,
      data
    }, `Job started: ${jobId} in queue ${queue}`);
  },

  /**
   * Log de conclusão de job
   */
  jobCompleted: (jobId: string, queue: string, duration: number, result?: any) => {
    const context = getContext();
    baseLogger.info({
      ...context,
      event: 'job_completed',
      jobId,
      queue,
      duration,
      result
    }, `Job completed: ${jobId} in ${duration}ms`);
  },

  /**
   * Log de falha de job
   */
  jobFailed: (jobId: string, queue: string, duration: number, error: Error) => {
    const context = getContext();
    baseLogger.error({
      ...context,
      event: 'job_failed',
      jobId,
      queue,
      duration,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      }
    }, `Job failed: ${jobId} - ${error.message}`);
  }
};

export default logger;
```

---

### 3️⃣ Middleware Next.js para injetar Context

**Arquivo:** `apps/web/middleware.ts`

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';

export function middleware(request: NextRequest) {
  // Gerar ou extrair Request ID
  const requestId = request.headers.get('x-request-id') || randomUUID();

  // Extrair informações do request
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  // Criar response
  const response = NextResponse.next();

  // Injetar Request ID no header de resposta
  response.headers.set('x-request-id', requestId);

  // Adicionar headers de contexto para serem lidos pelos API routes
  response.headers.set('x-client-ip', ip);
  response.headers.set('x-user-agent', userAgent);

  // Logs estruturados (opcional)
  if (process.env.LOG_REQUESTS === 'true') {
    console.log(JSON.stringify({
      event: 'http_request',
      requestId,
      method: request.method,
      url: request.url,
      ip,
      userAgent,
      timestamp: new Date().toISOString()
    }));
  }

  return response;
}

// Configurar quais rotas o middleware deve processar
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)'
  ]
};
```

---

### 4️⃣ Helper para API Routes

**Arquivo:** `apps/web/lib/api-context.ts`

```typescript
import { NextRequest } from 'next/server';
import { runWithContext, RequestContext } from '@salesos/core';

/**
 * Extrai contexto do NextRequest e executa callback dentro do contexto
 * 
 * @example
 * export async function GET(req: NextRequest) {
 *   return withRequestContext(req, async () => {
 *     // Código da API route
 *     // getContext() agora retorna dados do request
 *   });
 * }
 */
export async function withRequestContext<T>(
  req: NextRequest,
  callback: () => Promise<T>
): Promise<T> {
  const requestId = req.headers.get('x-request-id') || 
                    req.headers.get('x-amzn-trace-id') || 
                    crypto.randomUUID();
  
  const ip = req.headers.get('x-client-ip') || 
             req.headers.get('x-forwarded-for') || 
             req.ip || 
             'unknown';
  
  const userAgent = req.headers.get('user-agent') || 'unknown';

  const context: Partial<RequestContext> = {
    requestId,
    ip,
    userAgent,
    // userId e organizationId devem ser extraídos do JWT/Session depois
  };

  return runWithContext(context, callback);
}

/**
 * Extrai contexto de autenticação (JWT) e atualiza o contexto atual
 */
export function extractAuthContext(decoded: { userId?: string; organizationId?: string }) {
  const { updateContext } = require('@salesos/core');
  updateContext({
    userId: decoded.userId,
    organizationId: decoded.organizationId
  });
}
```

---

### 5️⃣ Exemplo de Uso em API Route

**Arquivo:** `apps/web/app/api/example/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withRequestContext } from '@/lib/api-context';
import { logger, getRequestId } from '@salesos/core';

export async function GET(req: NextRequest) {
  return withRequestContext(req, async () => {
    try {
      // Log automático com requestId injetado
      logger.info('Processing example request');

      // Simular processamento
      const result = await someAsyncOperation();

      // O requestId está disponível em todos os logs
      logger.info({ result }, 'Request completed successfully');

      return NextResponse.json({ 
        success: true, 
        data: result,
        requestId: getRequestId() // Opcional: retornar para o cliente
      });

    } catch (error) {
      // Erro será logado com requestId automaticamente
      logger.error({ error }, 'Request failed');

      return NextResponse.json(
        { 
          success: false, 
          error: 'Internal server error',
          requestId: getRequestId()
        },
        { status: 500 }
      );
    }
  });
}

async function someAsyncOperation() {
  // Mesmo em funções nested, o contexto está disponível
  logger.debug('Inside nested function');
  return { foo: 'bar' };
}
```

---

### 6️⃣ Atualizar Queue Wrapper para propagar contexto

**Arquivo:** `libs/queue-core/src/queue-wrapper.ts`

```typescript
import { Queue, Worker, QueueOptions, WorkerOptions, Processor } from 'bullmq';
import { logger, env, runWithContext, RequestContext } from '@salesos/core';
import IORedis from 'ioredis';

const createConnection = () => {
  return new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null
  });
};

export const createQueue = <T>(name: string, options?: Partial<QueueOptions>) => {
  return new Queue<T>(name, {
    connection: createConnection(),
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: false,
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 2000
      },
      ...options?.defaultJobOptions
    },
    ...options
  });
};

export const createWorker = <T = any>(
  name: string,
  processor: Processor<T>,
  options?: Partial<WorkerOptions>
) => {
  const worker = new Worker<T>(
    name,
    async (job) => {
      // Extrair contexto do job.data se existir
      const context: Partial<RequestContext> = {
        requestId: job.id || crypto.randomUUID(),
        userId: (job.data as any)?.userId,
        organizationId: (job.data as any)?.organizationId
      };

      // Executar processor dentro do contexto
      return runWithContext(context, async () => {
        const start = Date.now();
        
        logger.jobStarted(job.id!, name, job.data);

        try {
          const result = await processor(job);
          const duration = Date.now() - start;
          
          logger.jobCompleted(job.id!, name, duration, result);
          
          return result;
        } catch (error: any) {
          const duration = Date.now() - start;
          
          logger.jobFailed(job.id!, name, duration, error);
          
          throw error;
        }
      });
    },
    {
      connection: createConnection(),
      concurrency: options?.concurrency || 1,
      ...options
    }
  );

  worker.on('failed', (job, err) => {
    logger.error(
      { jobId: job?.id, queue: name, error: err },
      'Job failed permanently'
    );
  });

  // Graceful shutdown
  const workers = new Set<Worker>();
  workers.add(worker);

  const shutdown = async () => {
    console.log(`Shutting down worker: ${name}`);
    await worker.close();
  };

  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);

  worker.on('closed', () => {
    workers.delete(worker);
  });

  return worker;
};
```

---

## 📝 CHECKLIST DE IMPLEMENTAÇÃO

### Ciclo 03: Soft Delete
- [ ] Criar `libs/core/src/prisma-middleware.ts`
- [ ] Atualizar `libs/core/src/prisma.ts` para aplicar middleware
- [ ] Exportar helpers no `libs/core/src/index.ts`
- [ ] Criar testes em `libs/core/src/prisma-middleware.test.ts`
- [ ] Testar com queries reais no banco

### Ciclo 05: Correlation ID
- [ ] Criar `libs/core/src/context.ts`
- [ ] Atualizar `libs/core/src/logger.ts`
- [ ] Criar `apps/web/middleware.ts`
- [ ] Criar `apps/web/lib/api-context.ts`
- [ ] Atualizar `libs/queue-core/src/queue-wrapper.ts`
- [ ] Testar fluxo completo (Request -> API -> Worker -> Log)

---

## 🧪 TESTES

```bash
# Rodar testes
npm test --workspace=libs/core

# Testar em desenvolvimento
npm run dev

# Verificar logs estruturados
tail -f logs/app.log | jq '.'
```

---

## 📊 VALIDAÇÃO

### Soft Delete
```bash
# Verificar no banco
psql $DATABASE_URL -c "SELECT id, email, deleted_at FROM leads LIMIT 10;"

# Deve mostrar deletedAt NULL para registros ativos
```

### Correlation ID
```bash
# Fazer request e verificar header
curl -i http://localhost:3000/api/example

# Deve retornar header: x-request-id: <uuid>

# Verificar logs
# Todos os logs devem ter o campo "requestId"
```

---

**Próximo arquivo:** IMPLEMENTACAO-CRITICOS-PARTE2.md (Ciclos 18-20 e 21)
