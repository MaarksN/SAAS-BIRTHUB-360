import { Search } from 'lucide-react';
import React from 'react';

export const EmptyState: React.FC<{ title: string, description: string, action?: React.ReactNode }> = ({ title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-700 bg-slate-800/30 p-12 text-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-slate-700/50">
        <Search className="size-8 text-slate-400" />
      </div>
      <h3 className="mb-2 text-lg font-bold text-white">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-slate-400">{description}</p>
      {action}
    </div>
  );
};
