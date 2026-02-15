'use client';

import React from 'react';

interface BulkActionsToolbarProps {
  selectedCount: number;
  onDelete: () => void;
  onCancel: () => void;
}

export function BulkActionsToolbar({ selectedCount, onDelete, onCancel }: BulkActionsToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="animate-in slide-in-from-bottom fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-full bg-slate-800 px-6 py-3 text-white shadow-xl">
      <span>{selectedCount} selecionados</span>
      <button
        onClick={onDelete}
        className="font-bold text-red-400 transition-colors hover:text-red-300"
      >
        Excluir
      </button>
      <button
        onClick={onCancel}
        className="transition-colors hover:text-slate-300"
      >
        Cancelar
      </button>
    </div>
  );
}
