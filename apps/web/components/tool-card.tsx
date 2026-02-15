'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@salesos/ui';
import { Tool } from '../config/sdr-tools';
import { Loader2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
    <div onClick={handleClick} className="group relative cursor-pointer block h-full">
      <Card className={`h-full border-slate-200 hover:border-${tool.color}-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden`}>
        <div className={`absolute top-0 right-0 w-24 h-24 bg-${tool.color}-50 rounded-bl-[4rem] -mr-8 -mt-8 opacity-50 group-hover:scale-150 transition-transform duration-700 pointer-events-none`}></div>

        <CardHeader className="pb-2 relative z-10">
          <div className="flex justify-between items-start">
            <div className={`w-12 h-12 rounded-2xl bg-${tool.color}-100 flex items-center justify-center text-${tool.color}-600 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-sm`}>
              <tool.icon className="w-6 h-6" />
            </div>
            <span className="text-2xl filter grayscale group-hover:grayscale-0 transition-all transform group-hover:scale-125">{tool.emoji}</span>
          </div>
        </CardHeader>

        <CardContent className="pt-4 relative z-10">
          <CardTitle className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
            {tool.name}
          </CardTitle>
          <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed h-8">
            {tool.desc}
          </p>

          <div className={`mt-4 flex items-center gap-2 text-[10px] font-bold text-${tool.color}-500 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0`}>
            <span>Acessar</span>
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            )}
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] rounded-lg flex items-center justify-center z-20">
            <Loader2 className={`w-8 h-8 text-${tool.color}-500 animate-spin`} />
        </div>
      )}
    </div>
  );
}
