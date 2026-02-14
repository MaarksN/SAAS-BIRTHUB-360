'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { SDR_TOOLS } from '../config/sdr-tools';
import { Search, Loader2, ChevronRight, Zap, Database } from 'lucide-react';
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
    <aside className="w-64 border-r border-slate-200 bg-slate-50 min-h-screen flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center gap-2 mb-4 text-slate-800">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white">
                <Zap className="w-5 h-5 fill-current" />
            </div>
            <span className="font-bold text-lg tracking-tight">SDR <span className="text-blue-600">Commander</span></span>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar ferramenta..."
            className="pl-9 h-9 bg-white text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        <Link
            href="/dashboard"
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              pathname === '/dashboard'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
        >
            <div className="w-6 h-6 flex items-center justify-center">
                <Zap className="w-4 h-4" />
            </div>
            Dashboard
        </Link>

        <Link
            href="/dashboard/settings/data"
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              pathname === '/dashboard/settings/data'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
        >
            <div className="w-6 h-6 flex items-center justify-center">
                <Database className="w-4 h-4" />
            </div>
            Data Management
        </Link>

        <div className="pt-4 pb-2 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Ferramentas ({filteredTools.length})
        </div>

        {filteredTools.map((tool) => {
          const isActive = pathname === `/dashboard/tool/${tool.id}`;
          const isLoading = loadingToolId === tool.id && isPending;

          return (
            <button
              key={tool.id}
              onClick={() => handleNavigation(`/dashboard/tool/${tool.id}`, tool.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-all group ${
                isActive
                  ? `bg-${tool.color}-50 text-${tool.color}-700 border border-${tool.color}-100`
                  : 'text-slate-600 hover:bg-slate-100 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`w-6 h-6 flex-shrink-0 flex items-center justify-center rounded transition-colors ${isActive ? `text-${tool.color}-600` : 'text-slate-400 group-hover:text-slate-600'}`}>
                    <tool.icon className="w-4 h-4" />
                </div>
                <span className="truncate text-left">{tool.name}</span>
              </div>

              {isLoading && (
                <Loader2 className="w-3 h-3 animate-spin text-slate-400" />
              )}
              {isActive && !isLoading && (
                <ChevronRight className={`w-3 h-3 text-${tool.color}-500`} />
              )}
            </button>
          );
        })}

        {filteredTools.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-400">
                Nenhuma ferramenta encontrada.
            </div>
        )}
      </nav>

      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="text-[10px] text-center text-slate-400 font-medium">
            v1.2.0 • SalesOS
        </div>
      </div>
    </aside>
  );
}
