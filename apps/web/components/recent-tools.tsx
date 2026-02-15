'use client';

import React from 'react';
import { useLocalStorage } from '../hooks/use-local-storage';
import { SDR_TOOLS } from '../config/sdr-tools';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@salesos/ui';
import { Clock, ChevronRight } from 'lucide-react';

export function RecentTools() {
  const [recentToolIds] = useLocalStorage<string[]>('sdr_recent_tools', []);

  // Filter valid tools and take top 3
  const recentTools = recentToolIds
    .map((id) => SDR_TOOLS.find((t) => t.id === id))
    .filter((t): t is typeof SDR_TOOLS[0] => !!t)
    .slice(0, 3);

  if (recentTools.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-slate-400" />
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Recentes</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recentTools.map((tool) => (
          <Link href={`/dashboard/tool/${tool.id}`} key={tool.id} className="block group">
            <Card className="hover:shadow-md transition-all hover:-translate-y-1 bg-white border-slate-200">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-${tool.color}-100 flex items-center justify-center text-${tool.color}-600`}>
                    <tool.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{tool.name}</h3>
                    <p className="text-[10px] text-slate-500">{tool.desc}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
