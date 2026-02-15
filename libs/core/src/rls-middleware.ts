import { Prisma } from '@birthhub/database';

import { getOrganizationId } from './context';

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
  'EmailThread',
];

/**
 * Middleware de Row-Level Security
 * Injeta automaticamente filtro de organizationId em todas as queries
 */
export function rlsMiddleware(
  params: Prisma.MiddlewareParams,
  next: (params: Prisma.MiddlewareParams) => Promise<any>,
) {
  // Só aplica em models com RLS
  if (!RLS_MODELS.includes(params.model || '')) {
    return next(params);
  }

  const organizationId = getOrganizationId();

  // Se não tiver organizationId no contexto, deixa passar
  // (pode ser uma query de sistema ou admin)
  if (!organizationId) {
    // Opicional: Loggar quando RLS é bypassado (se desejar debug)
    return next(params);
  }

  // Helper para verificar bypass explícito
  if (shouldBypassRLS(params.args)) {
    // Remove a flag antes de enviar para o banco
    delete params.args.__bypassRLS;
    return next(params);
  }

  // Injeta organizationId em queries de leitura
  if (
    params.action === 'findUnique' ||
    params.action === 'findFirst' ||
    params.action === 'findMany' ||
    params.action === 'count' ||
    params.action === 'aggregate' ||
    params.action === 'groupBy'
  ) {
    if (!params.args) {
      params.args = {};
    }

    // Adiciona filtro de organizationId
    if (params.args.where) {
      // Se já existe um where, faz merge
      params.args.where = {
        AND: [{ organizationId }, params.args.where],
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
        organizationId,
      }));
    } else if (params.args.data) {
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
        AND: [{ organizationId }, params.args.where],
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
        AND: [{ organizationId }, params.args.where],
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
export function bypassRLS<T extends Record<string, any>>(
  args?: T,
): T & { __bypassRLS: true } {
  return {
    ...args,
    __bypassRLS: true as const,
  } as T & { __bypassRLS: true };
}

/**
 * Verifica se query está marcada para bypass
 */
function shouldBypassRLS(args: any): boolean {
  return args?.__bypassRLS === true;
}
