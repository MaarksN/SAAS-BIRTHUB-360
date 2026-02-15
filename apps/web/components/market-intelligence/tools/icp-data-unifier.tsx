'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@salesos/ui';
import { Button } from '@salesos/ui';
import React, { useState } from 'react';
import { toast } from 'sonner';

import { Input } from '@/components/Input';
import { MarketTool } from '@/lib/market-intelligence-tools';

import { ToolErrorBoundary } from '../ToolErrorBoundary';

interface IcpDataUnifierProps {
  tool: MarketTool;
}

export function IcpDataUnifier({ tool }: IcpDataUnifierProps) {
  return (
    <ToolErrorBoundary>
      <IcpDataUnifierContent tool={tool} />
    </ToolErrorBoundary>
  );
}

function IcpDataUnifierContent({ tool }: IcpDataUnifierProps) {
  const [formData, setFormData] = useState({
    industry: 'Technology',
    employeeCount: '50-200',
    revenue: '$10M-$50M',
    location: 'United States',
    jobTitles: 'CTO, VP Engineering',
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
          { label: 'Growth Rate', value: '> 20% YoY' },
        ],
        topProspects: [
          { name: 'TechFlow Inc.', relevancy: '98%' },
          { name: 'DataStream Corp', relevancy: '95%' },
          { name: 'CloudScale', relevancy: '92%' },
        ],
      });
      setLoading(false);
      toast.success('ICP Profile Generated!');
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Input Section */}
      <div className="space-y-6 lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Define Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Industry
                </label>
                <Input
                  value={formData.industry}
                  onChange={(e) =>
                    setFormData({ ...formData, industry: e.target.value })
                  }
                  placeholder="e.g. SaaS, Fintech"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Employee Count
                </label>
                <select
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-700 dark:bg-slate-900"
                  value={formData.employeeCount}
                  onChange={(e) =>
                    setFormData({ ...formData, employeeCount: e.target.value })
                  }
                >
                  <option>1-10</option>
                  <option>11-50</option>
                  <option>50-200</option>
                  <option>201-500</option>
                  <option>500+</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Annual Revenue
                </label>
                <select
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-700 dark:bg-slate-900"
                  value={formData.revenue}
                  onChange={(e) =>
                    setFormData({ ...formData, revenue: e.target.value })
                  }
                >
                  <option>&lt; $1M</option>
                  <option>$1M - $10M</option>
                  <option>$10M - $50M</option>
                  <option>$50M+</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Location
                </label>
                <Input
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g. Brazil, North America"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Target Job Titles
                </label>
                <Input
                  value={formData.jobTitles}
                  onChange={(e) =>
                    setFormData({ ...formData, jobTitles: e.target.value })
                  }
                  placeholder="Comma separated"
                />
              </div>

              <Button type="submit" className="mt-4 w-full" disabled={loading}>
                {loading ? 'Analyzing...' : 'Generate Unified Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Result Section */}
      <div className="space-y-6 lg:col-span-2">
        {!result && !loading && (
          <div className="flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-slate-400 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="mb-4 rounded-full bg-slate-100 p-4 dark:bg-slate-800">
              <tool.icon size={32} />
            </div>
            <p>
              Enter criteria on the left to generate your Ideal Customer
              Profile.
            </p>
          </div>
        )}

        {loading && (
          <div className="animate-pulse space-y-4">
            <div className="h-48 rounded-lg bg-slate-200 dark:bg-slate-800"></div>
            <div className="h-24 rounded-lg bg-slate-200 dark:bg-slate-800"></div>
            <div className="h-64 rounded-lg bg-slate-200 dark:bg-slate-800"></div>
          </div>
        )}

        {result && (
          <>
            <Card className="border-none bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
              <CardContent className="p-8">
                <h2 className="mb-2 text-2xl font-bold">{result.summary}</h2>
                <div className="mt-6 flex gap-8">
                  <div>
                    <p className="text-sm font-semibold uppercase text-blue-100">
                      Match Score
                    </p>
                    <p className="text-4xl font-bold">{result.score}/100</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase text-blue-100">
                      Total Addressable
                    </p>
                    <p className="text-4xl font-bold">
                      {result.totalAddressable.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Key Attributes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {result.attributes.map((attr: any, i: number) => (
                      <li
                        key={i}
                        className="flex justify-between border-b border-slate-100 pb-2 last:border-0 dark:border-slate-800"
                      >
                        <span className="text-slate-500">{attr.label}</span>
                        <span className="font-semibold">{attr.value}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Prospects Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {result.topProspects.map((prospect: any, i: number) => (
                      <li
                        key={i}
                        className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50"
                      >
                        <span className="font-medium">{prospect.name}</span>
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
                          {prospect.relevancy} Match
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="mt-4 w-full text-xs">
                    View All Prospects
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
