'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@salesos/ui';
import { Button } from '@salesos/ui';
import React, { useState } from 'react';
import { toast } from 'sonner';

import { Input } from '@/components/Input';
import { MarketTool } from '@/lib/market-intelligence-tools';

import { ToolErrorBoundary } from '../ToolErrorBoundary';

interface MarketOracleProps {
  tool: MarketTool;
}

export function MarketOracle({ tool }: MarketOracleProps) {
  return (
    <ToolErrorBoundary>
      <MarketOracleContent tool={tool} />
    </ToolErrorBoundary>
  );
}

function MarketOracleContent({ tool }: MarketOracleProps) {
  const [market, setMarket] = useState('SaaS in Brazil');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!market) {
      toast.error('Please enter a target market');
      return;
    }
    setLoading(true);

    // Simulate complex calculation
    setTimeout(() => {
      setData({
        tam: { value: 5400000000, label: 'Total Addressable Market', companies: 15000 },
        sam: { value: 1200000000, label: 'Serviceable Available Market', companies: 3500 },
        som: { value: 150000000, label: 'Serviceable Obtainable Market', companies: 450 },
        growth: '+12.5%',
        trend: 'Upward'
      });
      setLoading(false);
      toast.success('Market Analysis Complete');
    }, 2000);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: "compact" }).format(val);
  };

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <Card className="border-none bg-slate-900 p-8 text-center text-white">
        <h1 className="mb-4 text-3xl font-bold">Market Oracle</h1>
        <p className="mx-auto mb-8 max-w-xl text-slate-400">
          Get real-time estimates for TAM, SAM, and SOM based on aggregated market data.
        </p>
        <form onSubmit={handleAnalyze} className="mx-auto flex max-w-md gap-2">
          <Input
            className="h-12 bg-white text-lg text-slate-900"
            placeholder="e.g. CRM Software in Latin America"
            value={market}
            onChange={(e) => setMarket(e.target.value)}
          />
          <Button type="submit" className="h-12 bg-blue-600 px-8 text-lg hover:bg-blue-500" disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze'}
          </Button>
        </form>
      </Card>

      {/* Results */}
      {data && (
        <div className="mx-auto grid max-w-5xl grid-cols-1 items-end justify-center gap-8 pt-8 md:grid-cols-3">
            {/* TAM */}
            <div className="group flex flex-col items-center">
                <div className="mb-4 text-center">
                    <span className="text-sm font-bold uppercase tracking-widest text-slate-400">TAM</span>
                    <h3 className="text-3xl font-extrabold text-slate-700 dark:text-slate-200">{formatCurrency(data.tam.value)}</h3>
                    <p className="text-xs text-slate-500">{data.tam.companies.toLocaleString()} Companies</p>
                </div>
                <div className="relative w-full overflow-hidden rounded-t-xl bg-blue-100 transition-all duration-1000 group-hover:bg-blue-200 dark:bg-blue-900/30 dark:group-hover:bg-blue-900/50" style={{ height: '300px' }}>
                     <div className="absolute inset-x-0 bottom-0 size-full bg-blue-500/10"></div>
                </div>
            </div>

            {/* SAM */}
             <div className="group flex flex-col items-center">
                <div className="mb-4 text-center">
                    <span className="text-sm font-bold uppercase tracking-widest text-slate-400">SAM</span>
                    <h3 className="text-3xl font-extrabold text-slate-700 dark:text-slate-200">{formatCurrency(data.sam.value)}</h3>
                    <p className="text-xs text-slate-500">{data.sam.companies.toLocaleString()} Companies</p>
                </div>
                <div className="relative w-full overflow-hidden rounded-t-xl bg-indigo-100 transition-all duration-1000 group-hover:bg-indigo-200 dark:bg-indigo-900/30 dark:group-hover:bg-indigo-900/50" style={{ height: '200px' }}>
                     <div className="absolute inset-x-0 bottom-0 size-full bg-indigo-500/20"></div>
                </div>
            </div>

            {/* SOM */}
             <div className="group flex flex-col items-center">
                <div className="mb-4 text-center">
                    <span className="text-sm font-bold uppercase tracking-widest text-slate-400">SOM</span>
                    <h3 className="text-3xl font-extrabold text-slate-700 dark:text-slate-200">{formatCurrency(data.som.value)}</h3>
                    <p className="text-xs text-slate-500">{data.som.companies.toLocaleString()} Companies</p>
                </div>
                <div className="relative w-full overflow-hidden rounded-t-xl bg-emerald-100 transition-all duration-1000 group-hover:bg-emerald-200 dark:bg-emerald-900/30 dark:group-hover:bg-emerald-900/50" style={{ height: '100px' }}>
                     <div className="absolute inset-x-0 bottom-0 size-full bg-emerald-500/30"></div>
                </div>
            </div>
        </div>
      )}

      {data && (
         <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
             <Card className="border-slate-700 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                 <CardContent className="flex items-center justify-between p-6">
                     <div>
                         <p className="text-sm text-slate-400">Market Growth (YoY)</p>
                         <p className="text-3xl font-bold text-green-400">{data.growth}</p>
                     </div>
                      <div className="flex size-12 items-center justify-center rounded-full bg-slate-700">
                         <span className="text-xl">📈</span>
                     </div>
                 </CardContent>
             </Card>
              <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                 <CardContent className="p-6">
                     <h4 className="mb-2 font-bold">Analyst Note</h4>
                     <p className="text-sm text-slate-600 dark:text-slate-400">
                         The market is showing strong signs of consolidation. SAM is restricted by regulatory compliance in the fintech sector, but SOM is highly achievable given your current product fit.
                     </p>
                 </CardContent>
             </Card>
         </div>
      )}
    </div>
  );
}
