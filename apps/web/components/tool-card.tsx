'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@salesos/ui';
import { ArrowRight,Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { Tool } from '../config/sdr-tools';

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    router.push(`/dashboard/tool/${tool.id}`);
    // Loading state will persist until navigation completes (page unmounts)
  };

  return (
    <div onClick={handleClick} className="group relative block h-full cursor-pointer">
      <Card className={`hover:border- h-full border-slate-200${tool.color}-200 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}>
        <div className={`bg- absolute right-0 top-0 size-24${tool.color}-50 pointer-events-none -mr-8 -mt-8 rounded-bl-[4rem] opacity-50 transition-transform duration-700 group-hover:scale-150`}></div>

        <CardHeader className="relative z-10 pb-2">
          <div className="flex items-start justify-between">
            <div className={`bg- size-12 rounded-2xl${tool.color}-100 text- flex items-center justify-center${tool.color}-600 shadow-sm transition-transform group-hover:rotate-6 group-hover:scale-110`}>
              <tool.icon className="size-6" />
            </div>
            <span className="text-2xl grayscale transition-all group-hover:scale-125 group-hover:grayscale-0">{tool.emoji}</span>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 pt-4">
          <CardTitle className="mb-2 line-clamp-1 text-lg font-bold text-slate-800 transition-colors group-hover:text-blue-600">
            {tool.name}
          </CardTitle>
          <p className="line-clamp-2 h-8 text-xs font-medium leading-relaxed text-slate-500">
            {tool.desc}
          </p>

          <div className={`text- mt-4 flex items-center gap-2 text-[10px] font-bold${tool.color}-500 translate-y-2 uppercase tracking-wider opacity-0 transition-opacity group-hover:translate-y-0 group-hover:opacity-100`}>
            <span>Acessar</span>
            {isLoading ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
            )}
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-lg bg-white/50 backdrop-blur-[1px]">
            <Loader2 className={`text- size-8${tool.color}-500 animate-spin`} />
        </div>
      )}
    </div>
  );
}
