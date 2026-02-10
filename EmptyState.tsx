import React from 'react';
import { Search } from 'lucide-react';

export const EmptyState: React.FC<{ title: string, description: string, action?: React.ReactNode }> = ({ title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-700 rounded-3xl bg-slate-800/30">
      <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
        <Search className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
};
