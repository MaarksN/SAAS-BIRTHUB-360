'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@salesos/ui';
import { ChevronRight,Clock } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { SDR_TOOLS } from '../config/sdr-tools';
import { useLocalStorage } from '../hooks/use-local-storage';

export function RecentTools() {
  const [recentToolIds] = useLocalStorage<string[]>('sdr_recent_tools', []);

  // Filter valid tools and take top 3
  const recentTools = recentToolIds
    .map((id) => SDR_TOOLS.find((t) => t.id === id))
    .filter((t): t is typeof SDR_TOOLS[0] => Boolean(t))
    .slice(0, 3);

  if (recentTools.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center gap-2">
        <Clock className="size-4 text-slate-400" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Recentes</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {recentTools.map((tool) => (
          <Link href={`/dashboard/tool/${tool.id}`} key={tool.id} className="group block">
            <Card className="border-slate-200 bg-white transition-all hover:-translate-y-1 hover:shadow-md">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className={`bg- size-10 rounded-full${tool.color}-100 text- flex items-center justify-center${tool.color}-600`}>
                    <tool.icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{tool.name}</h3>
                    <p className="text-[10px] text-slate-500">{tool.desc}</p>
                  </div>
                </div>
                <ChevronRight className="size-4 text-slate-300 transition-colors group-hover:text-blue-500" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
