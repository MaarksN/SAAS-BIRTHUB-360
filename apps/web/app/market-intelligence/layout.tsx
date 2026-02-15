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
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wider">
              Role: Market Intelligence Analyst
            </span>
          </div>
          <div className="flex items-center gap-4">
             <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xs">
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
