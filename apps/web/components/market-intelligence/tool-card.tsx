'use client';

import { Button, Card } from '@salesos/ui';
import { ArrowRight, Lock } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { toast } from 'sonner';

import { MarketTool } from '@/lib/market-intelligence-tools';

interface ToolCardProps {
  tool: MarketTool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const Icon = tool.icon;

  const handlePlanned = () => {
    toast.info('This tool is coming soon!');
  };

  return (
    <Card className="group flex h-full flex-col overflow-hidden border-slate-200 bg-white transition-all duration-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-full flex-col">
        <div className="p-6 pb-3">
          <div className="mb-4 flex items-start justify-between">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600 shadow-sm ring-1 ring-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:ring-blue-800">
              <Icon size={24} />
            </div>
            <span
              className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                tool.status === 'ready'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400'
                  : tool.status === 'beta'
                    ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
                    : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400'
              }`}
            >
              {tool.status === 'ready'
                ? 'Ready'
                : tool.status === 'beta'
                  ? 'Beta'
                  : 'Planned'}
            </span>
          </div>
          <h3 className="mb-1 line-clamp-1 text-lg font-bold text-slate-900 dark:text-white">
            {tool.name}
          </h3>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            {tool.function}
          </p>
        </div>

        <div className="flex flex-1 flex-col px-6">
          <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {tool.description}
          </p>

          <div className="mb-4 mt-auto rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0 text-xs font-bold uppercase text-slate-500">
                Pain:
              </span>
              <span className="line-clamp-2 text-xs italic text-slate-700 dark:text-slate-300">
                "{tool.pain}"
              </span>
            </div>
          </div>
        </div>

        <div className="mt-auto p-6 pt-2">
          {tool.status === 'planned' ? (
            <Button
              variant="secondary"
              className="w-full justify-between transition-colors group-hover:bg-slate-200"
              onClick={handlePlanned}
              disabled
            >
              <span>Notify Me</span>
              <Lock size={16} />
            </Button>
          ) : (
            <Link
              href={`/market-intelligence/tool/${tool.id}`}
              className="block w-full"
            >
              <Button
                variant="primary"
                className="w-full justify-between transition-colors group-hover:bg-blue-700"
              >
                <span>Launch Tool</span>
                <ArrowRight size={16} />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}
