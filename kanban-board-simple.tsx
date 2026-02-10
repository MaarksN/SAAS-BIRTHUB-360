import React from 'react';

interface KanbanBoardSimpleProps<T> {
  items: T[];
  getStatus: (item: T) => string;
  renderCard: (item: T) => React.ReactNode;
  columns?: string[]; // Optional: Order and list of columns
  labels?: Record<string, string>; // Optional: Readable labels for columns
}

export function KanbanBoardSimple<T extends { id: string | number }>({
  items,
  getStatus,
  renderCard,
  columns: propColumns,
  labels,
}: KanbanBoardSimpleProps<T>) {
  // Determine all unique statuses if not provided
  const uniqueStatuses = propColumns || Array.from(new Set(items.map(getStatus)));

  // Group items by status
  const groupedItems = uniqueStatuses.reduce((acc, status) => {
    acc[status] = items.filter((item) => getStatus(item) === status);
    return acc;
  }, {} as Record<string, T[]>);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {uniqueStatuses.map((status) => (
        <div key={status} className="min-w-[300px] bg-slate-100 dark:bg-slate-800 p-4 rounded-xl">
          <h3 className="font-bold uppercase text-slate-500 mb-4">
            {labels?.[status] || status}
          </h3>
          <div className="space-y-3">
            {groupedItems[status]?.map((item) => (
              <div key={item.id}>
                {renderCard(item)}
              </div>
            ))}
            {groupedItems[status]?.length === 0 && (
              <div className="text-center p-4 border-2 border-dashed border-slate-300 rounded text-slate-400">
                Vazio
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
