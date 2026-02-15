'use client';

import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@salesos/ui';
import { MarketTool } from '@/lib/market-intelligence-tools';
import { Button } from '@salesos/ui';
import Link from 'next/link';

interface ComingSoonProps {
  tool: MarketTool;
}

export function ComingSoon({ tool }: ComingSoonProps) {
  const Icon = tool.icon;
  return (
    <Card className="max-w-2xl mx-auto mt-20 text-center p-12">
      <div className="flex justify-center mb-6">
        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
          <Icon size={48} className="text-slate-400" />
        </div>
      </div>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
        {tool.name} is coming soon!
      </h1>
      <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-lg mx-auto">
        We are working hard to build this tool. It will help you solve "{tool.pain}" by providing {tool.description.toLowerCase()}.
      </p>
      <div className="flex justify-center gap-4">
        <Link href="/market-intelligence">
          <Button variant="secondary">Go Back</Button>
        </Link>
        <Button disabled>Notify When Ready</Button>
      </div>
    </Card>
  );
}
