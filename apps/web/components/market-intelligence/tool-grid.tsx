'use client';

import { Search } from 'lucide-react';
import React, { useState } from 'react';

import { marketIntelligenceTools } from '@/lib/market-intelligence-tools';

import { ToolCard } from './tool-card';

export function ToolGrid() {
  const [search, setSearch] = useState('');

  const filteredTools = marketIntelligenceTools.filter(tool =>
    tool.name.toLowerCase().includes(search.toLowerCase()) ||
    tool.function.toLowerCase().includes(search.toLowerCase()) ||
    tool.pain.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search tools, functions, or pains..."
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredTools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>

      {filteredTools.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 py-12 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900/50">
          <p>No tools found matching your search.</p>
          <button onClick={() => setSearch('')} className="mt-2 text-sm text-blue-600 hover:underline">Clear search</button>
        </div>
      )}
    </div>
  );
}
