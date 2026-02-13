'use client';

import React from 'react';
import { Card, Button } from '@salesos/ui';
import { MarketTool } from '@/lib/market-intelligence-tools';
import { ArrowRight, Lock } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface ToolCardProps {
  tool: MarketTool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const Icon = tool.icon;

  const handlePlanned = () => {
     toast.info('This tool is coming soon!');
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-slate-200 dark:border-slate-800 flex flex-col h-full group bg-white dark:bg-slate-900 overflow-hidden">
      <div className="flex flex-col h-full">
        <div className="p-6 pb-3">
            <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-blue-100 dark:ring-blue-800">
                <Icon size={24} />
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                tool.status === 'ready'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
                : tool.status === 'beta'
                ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
                : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700'
            }`}>
                {tool.status === 'ready' ? 'Ready' : tool.status === 'beta' ? 'Beta' : 'Planned'}
            </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">
            {tool.name}
            </h3>
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
            {tool.function}
            </p>
        </div>

        <div className="px-6 flex-1 flex flex-col">
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4 line-clamp-3">
            {tool.description}
            </p>

            <div className="mt-auto bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 mb-4 border border-slate-100 dark:border-slate-800">
                <div className="flex items-start gap-2">
                    <span className="text-xs font-bold text-slate-500 uppercase mt-0.5 shrink-0">Pain:</span>
                    <span className="text-xs text-slate-700 dark:text-slate-300 italic line-clamp-2">"{tool.pain}"</span>
                </div>
            </div>
        </div>

        <div className="p-6 pt-2 mt-auto">
            {tool.status === 'planned' ? (
                 <Button
                    variant="secondary"
                    className="w-full justify-between group-hover:bg-slate-200 transition-colors"
                    onClick={handlePlanned}
                    disabled
                >
                    <span>Notify Me</span>
                    <Lock size={16} />
                </Button>
            ) : (
                <Link href={`/market-intelligence/tool/${tool.id}`} className="w-full block">
                    <Button
                        variant="primary"
                        className="w-full justify-between group-hover:bg-blue-700 transition-colors"
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
