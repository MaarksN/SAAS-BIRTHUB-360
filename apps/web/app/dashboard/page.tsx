'use client';

import React from 'react';
import { SDR_TOOLS } from '../../config/sdr-tools';
import { ToolCard } from '../../components/tool-card';
import { RecentTools } from '../../components/recent-tools';
import { Zap } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-12 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-xl shadow-primary/20 mb-4">
            <Zap className="w-8 h-8 text-primary-foreground animate-pulse" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
          Bem-vindo ao <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80">SDR Commander</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Sua central de inteligência tática para vendas de alta performance.
          Selecione uma ferramenta abaixo para começar.
        </p>
      </div>

      <RecentTools />

      <div>
        <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-primary rounded-full"></div>
            <h2 className="text-xl font-bold text-foreground">Arsenal Tático</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {SDR_TOOLS.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
            ))}
        </div>
      </div>
    </div>
  );
}
