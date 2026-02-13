import { Prisma } from '@prisma/client';

/**
 * Middleware de Soft Delete
 * Intercepta operações de delete e transforma em update com deletedAt
 */
export function softDeleteMiddleware(params: Prisma.MiddlewareParams, next: (params: Prisma.MiddlewareParams) => Promise<any>) {
  // Lista de models que suportam soft delete
  // Inclui models do sistema legado e novos models
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
    'Quote',
    'Permission',
    'EnrichmentLog',
    'DataReliabilityScore',
    'BuyingCommittee',
    'OutboundSequence',
    'LeadScore',
    'Cadence',
    'SubscriptionPlan',
    'UsageLog',
    'CreditTransaction',
    'AiFeedback'
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

    let injected = false;

    // Adiciona where: { deletedAt: null }
    if (params.args.where) {
      // Verifica se deletedAt foi explicitamente definido (incluindo undefined via withDeleted)
      // Se a chave não existe, injeta o filtro
      if (!('deletedAt' in params.args.where)) {
        params.args.where = {
          ...params.args.where,
          deletedAt: null
        };
        injected = true;
      }
    } else {
      params.args.where = {
        deletedAt: null
      };
      injected = true;
    }

    // Se injetamos o filtro e era um findUnique, precisamos converter para findFirst
    // pois findUnique não suporta filtros arbitrários (apenas unique constraints)
    if (injected && params.action === 'findUnique') {
      params.action = 'findFirst';
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
      deletedAt: undefined // Remove o filtro deletedAt (ou previne a injeção)
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
