import React from 'react';
import { ToolGrid } from '@/components/market-intelligence/tool-grid';

export const metadata = {
  title: 'Market Intelligence | SalesOS',
  description: 'Tools for Market Intelligence Analysts',
};

export default function MarketIntelligencePage() {
  return (
    <div className="container mx-auto max-w-7xl py-8">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
          Analyst Workbench
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
          Access a suite of <span className="text-blue-600 font-semibold">robust, intelligent, and complete tools</span> designed to solve your specific market intelligence challenges.
          From defining your ICP to generating strategic reports, accelerate your workflow here.
        </p>
      </div>

      <div className="bg-slate-50 dark:bg-slate-950/50 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <ToolGrid />
      </div>
    </div>
  );
}
