import { Prisma } from '@prisma/client';

const SOFT_DELETE_MODELS = [
  'Organization', 'User', 'Permission', 'CompanyProfile', 'EnrichmentLog',
  'DataReliabilityScore', 'BuyingCommittee', 'Contact', 'OutboundSequence',
  'Lead', 'LeadScore', 'Cadence', 'Deal', 'Quote', 'Meeting',
  'SubscriptionPlan', 'UsageLog', 'CreditTransaction', 'AiFeedback',
  'Notification', 'Campaign', 'EmailAccount', 'ScheduledEmail'
];

export async function softDeleteMiddleware(
  params: Prisma.MiddlewareParams,
  next: (params: Prisma.MiddlewareParams) => Promise<any>
) {
  const { model, action, args } = params;

  if (model && SOFT_DELETE_MODELS.includes(model)) {
    if (action === 'delete') {
      // Change to update
      params.action = 'update';
      if (!params.args.data) {
        params.args.data = {};
      }
      params.args.data.deletedAt = new Date();
    }

    if (action === 'deleteMany') {
      // Change to updateMany
      params.action = 'updateMany';
      if (params.args.data !== undefined) {
        params.args.data.deletedAt = new Date();
      } else {
        params.args.data = { deletedAt: new Date() };
      }
    }

    if (['findUnique', 'findFirst', 'findMany', 'count', 'aggregate', 'groupBy'].includes(action)) {
       // For findUnique, we change to findFirst to allow filtering
       if (action === 'findUnique') {
         params.action = 'findFirst';
       }

       if (!params.args) params.args = {};
       if (!params.args.where) params.args.where = {};

       if (params.args.where.deletedAt === undefined) {
         params.args.where.deletedAt = null;
       }
    }
  }

  return next(params);
}
