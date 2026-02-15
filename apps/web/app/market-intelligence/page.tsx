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
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Analyst Workbench
        </h1>
        <p className="max-w-3xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">
          Access a suite of <span className="font-semibold text-blue-600">robust, intelligent, and complete tools</span> designed to solve your specific market intelligence challenges.
          From defining your ICP to generating strategic reports, accelerate your workflow here.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950/50">
        <ToolGrid />
      </div>
    </div>
  );
}
