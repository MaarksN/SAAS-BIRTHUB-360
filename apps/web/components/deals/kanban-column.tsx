'use client';

import { Droppable } from '@hello-pangea/dnd';
import { DealWithScore } from '@salesos/core';
import { DealCard } from './deal-card';

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

interface KanbanColumnProps {
  id: string;
  title: string;
  deals: DealWithScore[];
}

export function KanbanColumn({ id, title, deals }: KanbanColumnProps) {
  const totalValue = deals.reduce((sum, deal) => sum + (Number(deal.value) || 0), 0);

  return (
    <div className="flex w-80 shrink-0 flex-col rounded-xl bg-slate-50/50 border border-slate-100 h-full max-h-full">
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white/50 rounded-t-xl backdrop-blur-sm">
        <h3 className="font-semibold text-sm text-slate-700 uppercase tracking-tight">
          {title}
        </h3>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
          {deals.length}
        </span>
      </div>

      <div className="px-4 py-2 bg-slate-50 border-b border-slate-100/50 text-xs font-medium text-slate-400 flex justify-between">
        <span>Total Pipeline</span>
        <span className="text-slate-600">
           {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              maximumFractionDigits: 0,
              notation: 'compact',
            }).format(totalValue)}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <Droppable droppableId={id}>
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={cn(
                'min-h-[150px] transition-colors rounded-lg h-full',
                snapshot.isDraggingOver ? 'bg-slate-100/80 ring-2 ring-slate-200 ring-inset' : ''
              )}
            >
              {deals.map((deal, index) => (
                <DealCard key={deal.id} deal={deal} index={index} />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
}
