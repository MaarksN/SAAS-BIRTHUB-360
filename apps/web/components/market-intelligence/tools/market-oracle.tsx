'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@salesos/ui';
import { Button } from '@salesos/ui';
import { MarketTool } from '@/lib/market-intelligence-tools';
import { Input } from '@/components/Input';
import { toast } from 'sonner';

interface MarketOracleProps {
  tool: MarketTool;
}

export function MarketOracle({ tool }: MarketOracleProps) {
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
      <Card className="bg-slate-900 text-white border-none p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Market Oracle</h1>
        <p className="text-slate-400 mb-8 max-w-xl mx-auto">
          Get real-time estimates for TAM, SAM, and SOM based on aggregated market data.
        </p>
        <form onSubmit={handleAnalyze} className="max-w-md mx-auto flex gap-2">
          <Input
            className="bg-white text-slate-900 h-12 text-lg"
            placeholder="e.g. CRM Software in Latin America"
            value={market}
            onChange={(e) => setMarket(e.target.value)}
          />
          <Button type="submit" className="h-12 px-8 text-lg bg-blue-600 hover:bg-blue-500" disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze'}
          </Button>
        </form>
      </Card>

      {/* Results */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end justify-center max-w-5xl mx-auto pt-8">
            {/* TAM */}
            <div className="flex flex-col items-center group">
                <div className="mb-4 text-center">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">TAM</span>
                    <h3 className="text-3xl font-extrabold text-slate-700 dark:text-slate-200">{formatCurrency(data.tam.value)}</h3>
                    <p className="text-xs text-slate-500">{data.tam.companies.toLocaleString()} Companies</p>
                </div>
                <div className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-t-xl relative overflow-hidden transition-all duration-1000 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50" style={{ height: '300px' }}>
                     <div className="absolute inset-x-0 bottom-0 bg-blue-500/10 h-full w-full"></div>
                </div>
            </div>

            {/* SAM */}
             <div className="flex flex-col items-center group">
                <div className="mb-4 text-center">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">SAM</span>
                    <h3 className="text-3xl font-extrabold text-slate-700 dark:text-slate-200">{formatCurrency(data.sam.value)}</h3>
                    <p className="text-xs text-slate-500">{data.sam.companies.toLocaleString()} Companies</p>
                </div>
                <div className="w-full bg-indigo-100 dark:bg-indigo-900/30 rounded-t-xl relative overflow-hidden transition-all duration-1000 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50" style={{ height: '200px' }}>
                     <div className="absolute inset-x-0 bottom-0 bg-indigo-500/20 h-full w-full"></div>
                </div>
            </div>

            {/* SOM */}
             <div className="flex flex-col items-center group">
                <div className="mb-4 text-center">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">SOM</span>
                    <h3 className="text-3xl font-extrabold text-slate-700 dark:text-slate-200">{formatCurrency(data.som.value)}</h3>
                    <p className="text-xs text-slate-500">{data.som.companies.toLocaleString()} Companies</p>
                </div>
                <div className="w-full bg-emerald-100 dark:bg-emerald-900/30 rounded-t-xl relative overflow-hidden transition-all duration-1000 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50" style={{ height: '100px' }}>
                     <div className="absolute inset-x-0 bottom-0 bg-emerald-500/30 h-full w-full"></div>
                </div>
            </div>
        </div>
      )}

      {data && (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
             <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-700">
                 <CardContent className="p-6 flex justify-between items-center">
                     <div>
                         <p className="text-slate-400 text-sm">Market Growth (YoY)</p>
                         <p className="text-3xl font-bold text-green-400">{data.growth}</p>
                     </div>
                      <div className="h-12 w-12 rounded-full bg-slate-700 flex items-center justify-center">
                         <span className="text-xl">📈</span>
                     </div>
                 </CardContent>
             </Card>
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                 <CardContent className="p-6">
                     <h4 className="font-bold mb-2">Analyst Note</h4>
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
