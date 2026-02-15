'use client';

import { Zap } from 'lucide-react';
import React from 'react';

import { RecentTools } from '../../components/recent-tools';
import { ToolCard } from '../../components/tool-card';
import { SDR_TOOLS } from '../../config/sdr-tools';

export default function DashboardPage() {
  return (
    <div className="animate-in fade-in space-y-12 duration-500">

      {/* Header */}
      <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
        <div className="mb-4 inline-flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-xl shadow-blue-500/20">
            <Zap className="size-8 animate-pulse text-white" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
          Bem-vindo ao <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">SDR Commander</span>
        </h1>
        <p className="max-w-2xl text-lg text-slate-500">
          Sua central de inteligência tática para vendas de alta performance.
          Selecione uma ferramenta abaixo para começar.
        </p>
      </div>

      <RecentTools />

      <div>
        <div className="mb-6 flex items-center gap-2">
            <div className="h-6 w-1 rounded-full bg-blue-600"></div>
            <h2 className="text-xl font-bold text-slate-800">Arsenal Tático</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {SDR_TOOLS.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
            ))}
        </div>
      </div>
    </div>
  );
}
