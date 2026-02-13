'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@salesos/ui';
import { Button } from '@salesos/ui';
import { MarketTool } from '@/lib/market-intelligence-tools';
import { Input } from '@/components/Input';
import { toast } from 'sonner';

interface IcpDataUnifierProps {
  tool: MarketTool;
}

export function IcpDataUnifier({ tool }: IcpDataUnifierProps) {
  const [formData, setFormData] = useState({
    industry: 'Technology',
    employeeCount: '50-200',
    revenue: '$10M-$50M',
    location: 'United States',
    jobTitles: 'CTO, VP Engineering'
  });

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setResult({
        summary: `Ideal Customer Profile: Mid-Market Tech Companies in US`,
        score: 85,
        totalAddressable: 12450,
        attributes: [
            { label: 'Technology Stack', value: 'React, AWS, Node.js' },
            { label: 'Funding Stage', value: 'Series B+' },
            { label: 'Growth Rate', value: '> 20% YoY' }
        ],
        topProspects: [
            { name: 'TechFlow Inc.', relevancy: '98%' },
            { name: 'DataStream Corp', relevancy: '95%' },
            { name: 'CloudScale', relevancy: '92%' },
        ]
      });
      setLoading(false);
      toast.success('ICP Profile Generated!');
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Input Section */}
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Define Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Industry</label>
                <Input
                  value={formData.industry}
                  onChange={(e) => setFormData({...formData, industry: e.target.value})}
                  placeholder="e.g. SaaS, Fintech"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Employee Count</label>
                <select
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-slate-900 dark:border-slate-700"
                  value={formData.employeeCount}
                  onChange={(e) => setFormData({...formData, employeeCount: e.target.value})}
                >
                  <option>1-10</option>
                  <option>11-50</option>
                  <option>50-200</option>
                  <option>201-500</option>
                  <option>500+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Annual Revenue</label>
                <select
                   className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-slate-900 dark:border-slate-700"
                   value={formData.revenue}
                   onChange={(e) => setFormData({...formData, revenue: e.target.value})}
                >
                  <option>&lt; $1M</option>
                  <option>$1M - $10M</option>
                  <option>$10M - $50M</option>
                  <option>$50M+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Location</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="e.g. Brazil, North America"
                />
              </div>
               <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Target Job Titles</label>
                <Input
                  value={formData.jobTitles}
                  onChange={(e) => setFormData({...formData, jobTitles: e.target.value})}
                  placeholder="Comma separated"
                />
              </div>

              <Button type="submit" className="w-full mt-4" disabled={loading}>
                {loading ? 'Analyzing...' : 'Generate Unified Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Result Section */}
      <div className="lg:col-span-2 space-y-6">
         {!result && !loading && (
             <div className="h-full flex flex-col items-center justify-center p-12 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                 <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
                    <tool.icon size={32} />
                 </div>
                 <p>Enter criteria on the left to generate your Ideal Customer Profile.</p>
             </div>
         )}

         {loading && (
             <div className="space-y-4 animate-pulse">
                 <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                 <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                 <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
             </div>
         )}

         {result && (
             <>
                <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-none">
                    <CardContent className="p-8">
                        <h2 className="text-2xl font-bold mb-2">{result.summary}</h2>
                        <div className="flex gap-8 mt-6">
                            <div>
                                <p className="text-blue-100 text-sm uppercase font-semibold">Match Score</p>
                                <p className="text-4xl font-bold">{result.score}/100</p>
                            </div>
                            <div>
                                <p className="text-blue-100 text-sm uppercase font-semibold">Total Addressable</p>
                                <p className="text-4xl font-bold">{result.totalAddressable.toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader><CardTitle>Key Attributes</CardTitle></CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {result.attributes.map((attr: any, i: number) => (
                                    <li key={i} className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0">
                                        <span className="text-slate-500">{attr.label}</span>
                                        <span className="font-semibold">{attr.value}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                     <Card>
                        <CardHeader><CardTitle>Top Prospects Preview</CardTitle></CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {result.topProspects.map((prospect: any, i: number) => (
                                    <li key={i} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                                        <span className="font-medium">{prospect.name}</span>
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">{prospect.relevancy} Match</span>
                                    </li>
                                ))}
                            </ul>
                             <Button variant="outline" className="w-full mt-4 text-xs">View All Prospects</Button>
                        </CardContent>
                    </Card>
                </div>
             </>
         )}
      </div>
    </div>
  );
}
