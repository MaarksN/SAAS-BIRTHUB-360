'use client';

import { useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { DealWithScore } from '@salesos/core';
import { KanbanColumn } from './kanban-column';
import { updateDealStageAction } from '@/actions/deals';
import { toast } from 'sonner';

interface KanbanBoardProps {
  deals: DealWithScore[];
}

const STAGES = [
  'Discovery',
  'Demo',
  'Negotiation',
  'Closed Won',
  'Closed Lost',
];

export function KanbanBoard({ deals: initialDeals }: KanbanBoardProps) {
  const [deals, setDeals] = useState<DealWithScore[]>(initialDeals);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStage = destination.droppableId;

    // Find the deal
    const dealIndex = deals.findIndex(d => d.id === draggableId);
    if (dealIndex === -1) return;

    const updatedDeal = { ...deals[dealIndex], stage: newStage };

    // Optimistic update
    const newDeals = [...deals];
    newDeals[dealIndex] = updatedDeal;
    setDeals(newDeals);

    try {
      const response = await updateDealStageAction(draggableId, newStage);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update');
      }
      toast.success(`Deal moved to ${newStage}`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update deal stage');
      // Revert the change
      setDeals((prev) =>
        prev.map((d) => (d.id === draggableId ? { ...d, stage: source.droppableId } : d))
      );
    }
  };

  return (
    <div className="flex h-full gap-4 overflow-x-auto pb-4 px-1 w-full">
      <DragDropContext onDragEnd={onDragEnd}>
        {STAGES.map((stage) => (
          <KanbanColumn
            key={stage}
            id={stage}
            title={stage}
            deals={deals.filter((d) => d.stage === stage)}
          />
        ))}
      </DragDropContext>
    </div>
  );
}
