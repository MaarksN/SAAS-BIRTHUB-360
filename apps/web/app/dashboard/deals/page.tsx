import { KanbanBoard } from '@/components/deals/kanban-board';
import { DealService } from '@salesos/core';
import { getOrganizationId } from '@salesos/core';

export const metadata = {
  title: 'Deals Pipeline | SalesOS',
  description: 'Manage your deals and pipeline.',
};

export default async function DealsPage() {
  const orgId = getOrganizationId();

  // Fetch deals (DealService handles context if orgId is undefined, but explicit is better if available)
  const deals = await DealService.getDeals(orgId);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Deals Pipeline</h1>
          <p className="text-slate-500">Manage your opportunities and track progress.</p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <KanbanBoard deals={deals} />
      </div>
    </div>
  );
}
