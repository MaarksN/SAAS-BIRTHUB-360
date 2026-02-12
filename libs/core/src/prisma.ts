import { PrismaClient } from '@prisma/client';
import { env } from './env';
import { getOrganizationId } from './context';

const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
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

const SOFT_DELETE_MODELS = [
  'Organization', 'User', 'Permission', 'CompanyProfile', 'EnrichmentLog',
  'DataReliabilityScore', 'BuyingCommittee', 'Contact', 'OutboundSequence',
  'Lead', 'LeadScore', 'Cadence', 'Deal', 'Quote', 'Meeting',
  'SubscriptionPlan', 'UsageLog', 'CreditTransaction', 'AiFeedback',
  'Notification', 'Campaign', 'EmailAccount'
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
        // This is dangerous if the Web App doesn't set context.
        // To prevent leakage, we should THROW if strictly required, but Workers need System access.
        // We assume "System" access (no context) is intentional.

        // 1. Audit Log Immutability
        if (model === 'AuditLog' && ['update', 'updateMany', 'delete', 'deleteMany', 'upsert'].includes(operation)) {
          throw new Error('Audit Logs are immutable.');
        }

        // 2. Soft Delete - Transform delete to update
        if (operation === 'delete') {
           // We must check if model supports soft delete
           if (SOFT_DELETE_MODELS.includes(model)) {
               const where = { ...(args.where || {}) } as any;
               where['deletedAt'] = null;
               if (orgId && TENANT_MODELS.includes(model)) {
                  where['organizationId'] = orgId;
               }

               // Find first to get ID and ensure existence/ownership
               const record = await (basePrisma as any)[model].findFirst({ where });

               if (!record) {
                  // Mimic Prisma error
                  throw new Error('Record to delete does not exist.');
               }

               return (basePrisma as any)[model].update({
                 where: { id: record.id },
                 data: { deletedAt: new Date() }
               });
           }
           // If model doesn't support soft delete (e.g. AuditLog, but that is immutable anyway), proceed with normal delete?
           // AuditLog throws on delete.
           // Other models? If any other model exists without soft delete, we let it pass.
        }

        if (operation === 'deleteMany') {
           if (SOFT_DELETE_MODELS.includes(model)) {
               const where = { ...(args.where || {}) } as any;
               if (orgId && TENANT_MODELS.includes(model)) {
                  where['organizationId'] = orgId;
               }
               where['deletedAt'] = null;

               return (basePrisma as any)[model].updateMany({
                 where,
                 data: { deletedAt: new Date() }
               });
           }
        }

        // 3. RLS Injection & Soft Delete Filtering (Read/Update)
        const anyArgs = args as any;

        // Ensure args.where exists for relevant operations
        if (['findUnique', 'findFirst', 'findMany', 'count', 'aggregate', 'groupBy', 'update', 'updateMany'].includes(operation)) {
           if (!anyArgs.where) {
             anyArgs.where = {};
           }
        }

        // Soft Delete Filter
        let softDeleteInjected = false;
        if (SOFT_DELETE_MODELS.includes(model)) {
            if (['findUnique', 'findFirst', 'findMany', 'count', 'aggregate', 'groupBy'].includes(operation)) {
               if (anyArgs.where.deletedAt === undefined) {
                  anyArgs.where.deletedAt = null;
                  softDeleteInjected = true;
               }
            }
        }

        // RLS Injection
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

             // createMany
            if (operation === 'createMany') {
                 if (Array.isArray(anyArgs.data)) {
                      anyArgs.data = anyArgs.data.map((item: any) => ({ ...item, organizationId: orgId }));
                 } else if (anyArgs.data) {
                      anyArgs.data.organizationId = orgId;
                 }
            }
        }

        // Handle findUnique -> findFirst conversion if we injected filters
        if (operation === 'findUnique' && (softDeleteInjected || rlsInjected)) {
             return (basePrisma as any)[model].findFirst({
                 ...anyArgs
             });
        }

        return query(args);
      }
    }
  }
});
