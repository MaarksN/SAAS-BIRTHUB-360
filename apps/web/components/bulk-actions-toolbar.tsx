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
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-4 animate-in slide-in-from-bottom z-50">
      <span>{selectedCount} selecionados</span>
      <button
        onClick={onDelete}
        className="text-red-400 font-bold hover:text-red-300 transition-colors"
      >
        Excluir
      </button>
      <button
        onClick={onCancel}
        className="hover:text-slate-300 transition-colors"
      >
        Cancelar
      </button>
    </div>
  );
}
