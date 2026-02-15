'use client';

import { Button } from '@salesos/ui';
import { useRef,useState } from 'react';

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
    <div className="overflow-hidden rounded-lg border border-slate-700 bg-slate-900">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-700 bg-slate-800 p-2">
        <span className="mr-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Variables:</span>
        {variables.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => insertVariable(v)}
            className="rounded border border-indigo-700/50 bg-indigo-900/50 px-2 py-1 text-xs font-medium text-indigo-200 transition-colors hover:bg-indigo-800"
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
        className="h-80 w-full resize-y bg-slate-900 p-4 font-mono text-sm text-slate-200 focus:outline-none"
        placeholder="Hi {{firstName}}, I saw that {{companyName}} is growing..."
      />

      {/* Footer / Stats */}
      <div className="flex justify-between border-t border-slate-700 bg-slate-800/50 px-4 py-2 text-xs text-slate-500">
        <span>Markdown Supported</span>
        <span>{value.length} characters</span>
      </div>
    </div>
  );
}
