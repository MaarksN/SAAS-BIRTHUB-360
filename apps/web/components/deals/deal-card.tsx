'use client';

import { DealWithScore } from '@salesos/core';
import { Draggable } from '@hello-pangea/dnd';
import { CalendarDays, TrendingUp, AlertCircle, AlertTriangle } from 'lucide-react';

// Simplified cn utility
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

interface DealCardProps {
  deal: DealWithScore;
  index: number;
}

export function DealCard({ deal, index }: DealCardProps) {
  const getHealthColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-700 border-green-200';
      case 'average': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'poor': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'good': return <TrendingUp className="h-3 w-3 mr-1" />;
      case 'average': return <AlertCircle className="h-3 w-3 mr-1" />;
      case 'poor': return <AlertTriangle className="h-3 w-3 mr-1" />;
      default: return null;
    }
  };

  return (
    <Draggable draggableId={deal.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            'group relative mb-3 rounded-lg border bg-white p-3 shadow-sm transition-all hover:shadow-md',
            snapshot.isDragging ? 'rotate-2 scale-105 shadow-xl ring-2 ring-primary ring-offset-2 z-50' : ''
          )}
          style={provided.draggableProps.style}
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium text-sm text-slate-900 line-clamp-2 pr-2">
              {deal.title}
            </h4>
            <div
              className={cn(
                'flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium border shrink-0',
                getHealthColor(deal.healthStatus)
              )}
              title={`Health Score: ${deal.healthScore}`}
            >
              {getHealthIcon(deal.healthStatus)}
              {deal.healthScore}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 mt-3">
             <span className="font-semibold text-slate-700">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  maximumFractionDigits: 0,
                }).format(Number(deal.value))}
              </span>

              {deal.expectedCloseDate && (
                <div className="flex items-center text-slate-400">
                  <CalendarDays className="h-3 w-3 mr-1" />
                  {new Date(deal.expectedCloseDate).toLocaleDateString()}
                </div>
              )}
          </div>

          {deal.company?.name && (
            <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400 truncate uppercase tracking-wider font-medium">
              {deal.company.name}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}
