import { Plus } from 'lucide-react';
import React from 'react';

export const Fab: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 z-50 flex size-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-2xl md:hidden"
    >
      <Plus className="size-6" />
    </button>
  );
};
