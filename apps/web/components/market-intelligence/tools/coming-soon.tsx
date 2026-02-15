'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@salesos/ui';
import { Button } from '@salesos/ui';
import Link from 'next/link';
import React from 'react';

import { MarketTool } from '@/lib/market-intelligence-tools';

interface ComingSoonProps {
  tool: MarketTool;
}

export function ComingSoon({ tool }: ComingSoonProps) {
  const Icon = tool.icon;
  return (
    <Card className="mx-auto mt-20 max-w-2xl p-12 text-center">
      <div className="mb-6 flex justify-center">
        <div className="rounded-full bg-slate-100 p-4 dark:bg-slate-800">
          <Icon size={48} className="text-slate-400" />
        </div>
      </div>
      <h1 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white">
        {tool.name} is coming soon!
      </h1>
      <p className="mx-auto mb-8 max-w-lg text-lg text-slate-600 dark:text-slate-400">
        We are working hard to build this tool. It will help you solve "
        {tool.pain}" by providing {tool.description.toLowerCase()}.
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
