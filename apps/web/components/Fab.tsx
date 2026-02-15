import React from 'react';
import { Plus } from 'lucide-react';

export const Fab: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="md:hidden fixed bottom-20 right-4 w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center shadow-2xl z-50 text-white"
    >
      <Plus className="w-6 h-6" />
    </button>
  );
};
