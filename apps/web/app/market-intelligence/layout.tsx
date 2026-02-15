import React from 'react';

import { DashboardShell } from '@/components/DashboardShell';
import { Sidebar } from '@/components/Sidebar';

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Leads', href: '/leads' },
  { label: 'Market Intelligence', href: '/market-intelligence', active: true },
  { label: 'Campaigns', href: '/campaigns' },
  { label: 'Inbox', href: '/inbox' },
  { label: 'Settings', href: '/settings' },
];

export default function MarketIntelligenceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell
      sidebar={<Sidebar items={navItems} />}
      header={
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-blue-700">
              Role: Market Intelligence Analyst
            </span>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex size-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                JD
             </div>
          </div>
        </div>
      }
    >
      {children}
    </DashboardShell>
  );
}
