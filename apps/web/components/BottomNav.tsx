import { Bell, Home, PlusSquare, Search, User } from 'lucide-react';
import React from 'react';

export const BottomNav: React.FC = () => {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-around border-t border-slate-800 bg-slate-900 p-4 md:hidden">
      <Home className="size-6 text-slate-400" />
      <Search className="size-6 text-slate-400" />
      <PlusSquare className="-mt-4 size-8 rounded-lg bg-slate-900 text-indigo-500 shadow-lg" />
      <Bell className="size-6 text-slate-400" />
      <User className="size-6 text-slate-400" />
    </div>
  );
};
