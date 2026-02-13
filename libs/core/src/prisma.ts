import { PrismaClient } from '@prisma/client';
import { env } from './env';
import { getOrganizationId } from './context';
import { softDeleteMiddleware } from './prisma-middleware';

const prismaClientSingleton = () => {
  const client = new PrismaClient({
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  // Apply Soft Delete Middleware (Cycle 03)
  client.$use(softDeleteMiddleware);

  return client;
};

declare global {
  var prismaBase: undefined | ReturnType<typeof prismaClientSingleton>;
}

const basePrisma = globalThis.prismaBase ?? prismaClientSingleton();

if (env.NODE_ENV !== 'production') globalThis.prismaBase = basePrisma;

const TENANT_MODELS = [
  'User',
  'Lead',
  'UsageLog',
  'CreditTransaction',
  'AuditLog',
  'Notification',
  'Campaign',
  'EmailAccount'
];

export const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        let orgId = getOrganizationId();

        // FAIL-SAFE: If no Org ID in context, check for headers (Mocking context propagation from Next.js Headers)
        // In a real production environment, this fallback should be replaced by a robust Context Wrapper
        // that is guaranteed to run before any DB call.
        // For now, if orgId is undefined, we DO NOT inject filters, which allows "God Mode" (System Context).

        // 1. Audit Log Immutability
        if (model === 'AuditLog' && ['update', 'updateMany', 'delete', 'deleteMany', 'upsert'].includes(operation)) {
          throw new Error('Audit Logs are immutable.');
        }

        // 2. RLS Injection
        // Note: Soft Delete is handled by middleware on base client.

        const anyArgs = args as any;

        // Ensure args.where exists for relevant operations
        if (['findUnique', 'findFirst', 'findMany', 'count', 'aggregate', 'groupBy', 'update', 'updateMany'].includes(operation)) {
           if (!anyArgs.where) {
             anyArgs.where = {};
           }
        }

        let rlsInjected = false;
        if (orgId && TENANT_MODELS.includes(model)) {
            if (['findUnique', 'findFirst', 'findMany', 'count', 'aggregate', 'groupBy', 'update', 'updateMany'].includes(operation)) {
                anyArgs.where.organizationId = orgId;
                rlsInjected = true;
            }

            if (operation === 'create') {
                if (!anyArgs.data) anyArgs.data = {};
                if (!anyArgs.data.organizationId) {
                    anyArgs.data.organizationId = orgId;
                }
            }

            if (operation === 'createMany') {
                 if (Array.isArray(anyArgs.data)) {
                      anyArgs.data = anyArgs.data.map((item: any) => ({ ...item, organizationId: orgId }));
                 } else if (anyArgs.data) {
                      anyArgs.data.organizationId = orgId;
                 }
            }
        }

        // Handle findUnique -> findFirst conversion if we injected filters (RLS)
        if (operation === 'findUnique' && rlsInjected) {
             return (basePrisma as any)[model].findFirst({
                 ...anyArgs
             });
        }

        return query(args);
      }
    }
  }
});

export default prisma;
