'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { marketIntelligenceTools } from '@/lib/market-intelligence-tools';
import { ChevronRight, ArrowLeft } from 'lucide-react';

import { IcpDataUnifier } from '@/components/market-intelligence/tools/icp-data-unifier';
import { MarketOracle } from '@/components/market-intelligence/tools/market-oracle';
import { ComingSoon } from '@/components/market-intelligence/tools/coming-soon';

export default function ToolPage() {
  const params = useParams();
  const id = params?.id as string;
  const tool = marketIntelligenceTools.find((t) => t.id === id);

  if (!tool) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Tool Not Found</h2>
        <Link href="/market-intelligence" className="text-blue-600 hover:underline mt-4 inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const renderToolComponent = () => {
    switch (tool.id) {
      case '1':
        return <IcpDataUnifier tool={tool} />;
      case '3':
        return <MarketOracle tool={tool} />;
      default:
        return <ComingSoon tool={tool} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Breadcrumb Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center gap-2 text-sm">
        <Link href="/market-intelligence" className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 flex items-center gap-1">
          <ArrowLeft size={14} /> Back to Tools
        </Link>
        <ChevronRight size={14} className="text-slate-400" />
        <span className="text-slate-500">{tool.function}</span>
        <ChevronRight size={14} className="text-slate-400" />
        <span className="font-semibold text-slate-900 dark:text-white">{tool.name}</span>
      </div>

      <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {renderToolComponent()}
      </div>
    </div>
  );
}
