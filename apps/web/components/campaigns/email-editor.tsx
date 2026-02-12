'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/Button';

interface EmailEditorProps {
  value: string;
  onChange: (value: string) => void;
  variables?: string[];
}

const DEFAULT_VARIABLES = ['firstName', 'lastName', 'companyName', 'role', 'email'];

export function EmailEditor({ value, onChange, variables = DEFAULT_VARIABLES }: EmailEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertVariable = (variable: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const insertion = `{{${variable}}}`;

    const newText = text.substring(0, start) + insertion + text.substring(end);

    // Update parent state
    onChange(newText);

    // Restore focus and move cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + insertion.length, start + insertion.length);
    }, 0);
  };

  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden bg-slate-900">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 p-2 bg-slate-800 border-b border-slate-700 items-center">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2">Variables:</span>
        {variables.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => insertVariable(v)}
            className="px-2 py-1 text-xs font-medium bg-indigo-900/50 text-indigo-200 border border-indigo-700/50 rounded hover:bg-indigo-800 transition-colors"
          >
            {`{${v}}`}
          </button>
        ))}
      </div>

      {/* Editor Area */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-80 p-4 bg-slate-900 text-slate-200 font-mono text-sm focus:outline-none resize-y"
        placeholder="Hi {{firstName}}, I saw that {{companyName}} is growing..."
      />

      {/* Footer / Stats */}
      <div className="flex justify-between px-4 py-2 bg-slate-800/50 text-xs text-slate-500 border-t border-slate-700">
        <span>Markdown Supported</span>
        <span>{value.length} characters</span>
      </div>
    </div>
  );
}
