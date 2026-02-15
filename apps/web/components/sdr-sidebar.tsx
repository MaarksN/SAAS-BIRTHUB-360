'use client';

import { ChevronRight, Database,Loader2, Search, Zap } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState, useTransition } from 'react';

import { SDR_TOOLS } from '../config/sdr-tools';
import { Input } from './Input';

export function SDRSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingToolId, setLoadingToolId] = useState<string | null>(null);

  const filteredTools = SDR_TOOLS.filter((tool) =>
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNavigation = (href: string, toolId: string) => {
    if (pathname === href) return;
    setLoadingToolId(toolId);
    startTransition(() => {
      router.push(href);
      // We don't clear loadingToolId immediately because we want it to persist until navigation completes
      // However, usually Next.js handles this. But to be sure, we can't really know when it's *done* easily without context.
      // But standard transition is enough.
    });
  };

  // Reset loading state when pathname changes (navigation complete)
  React.useEffect(() => {
    setLoadingToolId(null);
  }, [pathname]);

  return (
    <aside className="sticky top-0 flex h-screen min-h-screen w-64 flex-col border-r border-slate-200 bg-slate-50">
      <div className="border-b border-slate-200 p-4">
        <div className="mb-4 flex items-center gap-2 text-slate-800">
            <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                <Zap className="size-5 fill-current" />
            </div>
            <span className="text-lg font-bold tracking-tight">SDR <span className="text-blue-600">Commander</span></span>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-4 text-slate-400" />
          <Input
            placeholder="Buscar ferramenta..."
            className="h-9 bg-white pl-9 text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <nav className="custom-scrollbar flex-1 space-y-1 overflow-y-auto p-2">
        <Link
            href="/dashboard"
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              pathname === '/dashboard'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
        >
            <div className="flex size-6 items-center justify-center">
                <Zap className="size-4" />
            </div>
            Dashboard
        </Link>

        <Link
            href="/dashboard/settings/data"
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              pathname === '/dashboard/settings/data'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
        >
            <div className="flex size-6 items-center justify-center">
                <Database className="size-4" />
            </div>
            Data Management
        </Link>

        <div className="px-3 pb-2 pt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Ferramentas ({filteredTools.length})
        </div>

        {filteredTools.map((tool) => {
          const isActive = pathname === `/dashboard/tool/${tool.id}`;
          const isLoading = loadingToolId === tool.id && isPending;

          return (
            <button
              key={tool.id}
              onClick={() => handleNavigation(`/dashboard/tool/${tool.id}`, tool.id)}
              className={`group flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-all ${
                isActive
                  ? `bg-${tool.color}-50 text-${tool.color}-700 border- border${tool.color}-100`
                  : 'border border-transparent text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`flex size-6 shrink-0 items-center justify-center rounded transition-colors ${isActive ? `text-${tool.color}-600` : 'text-slate-400 group-hover:text-slate-600'}`}>
                    <tool.icon className="size-4" />
                </div>
                <span className="truncate text-left">{tool.name}</span>
              </div>

              {isLoading && (
                <Loader2 className="size-3 animate-spin text-slate-400" />
              )}
              {isActive && !isLoading && (
                <ChevronRight className={`text- size-3${tool.color}-500`} />
              )}
            </button>
          );
        })}

        {filteredTools.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
                Nenhuma ferramenta encontrada.
            </div>
        )}
      </nav>

      <div className="border-t border-slate-200 bg-slate-50 p-4">
        <div className="text-center text-[10px] font-medium text-slate-400">
            v1.2.0 • SalesOS
        </div>
      </div>
    </aside>
  );
}
