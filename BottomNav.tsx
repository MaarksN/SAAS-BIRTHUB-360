import React from 'react';
import { Home, Search, PlusSquare, Bell, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-4 flex justify-around z-50">
      <Home className="w-6 h-6 text-slate-400" />
      <Search className="w-6 h-6 text-slate-400" />
      <PlusSquare className="w-8 h-8 text-indigo-500 -mt-4 bg-slate-900 rounded-lg shadow-lg" />
      <Bell className="w-6 h-6 text-slate-400" />
      <User className="w-6 h-6 text-slate-400" />
    </div>
  );
};
