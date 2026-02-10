import { PrismaClient } from '@prisma/client';
import { env } from './env';

const prismaClientSingleton = () => {
  const client = new PrismaClient({
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  // Soft Delete Middleware
  client.$use(async (params, next) => {
    // Check if model has deletedAt field (optimization: only apply if model is in a list, or assume all)
    // For now apply to all models as per schema update

    if (params.model) {
      if (params.action === 'delete') {
        // Change to update
        params.action = 'update';
        params.args['data'] = { deletedAt: new Date() };
      }
      if (params.action === 'deleteMany') {
        // Change to updateMany
        params.action = 'updateMany';
        if (params.args.data !== undefined) {
          params.args.data['deletedAt'] = new Date();
        } else {
          params.args['data'] = { deletedAt: new Date() };
        }
      }
    }
    return next(params);
  });

  // Filter Soft Deleted Middleware
  client.$use(async (params, next) => {
    if (params.model) {
      if (params.action === 'findUnique' || params.action === 'findFirst') {
        // Change findUnique to findFirst
        params.action = 'findFirst';
        if (!params.args) params.args = {};
        if (!params.args.where) params.args.where = {};
        if (params.args.where.deletedAt === undefined) {
          params.args.where.deletedAt = null;
        }
      }
      if (params.action === 'findMany') {
        if (!params.args) params.args = {};
        if (!params.args.where) params.args.where = {};
        if (params.args.where.deletedAt === undefined) {
          params.args.where.deletedAt = null;
        }
      }
      if (params.action === 'count') {
         if (!params.args) params.args = {};
         if (!params.args.where) params.args.where = {};
         if (params.args.where.deletedAt === undefined) {
           params.args.where.deletedAt = null;
         }
      }
    }
    return next(params);
  });

  return client;
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (env.NODE_ENV !== 'production') globalThis.prisma = prisma;
