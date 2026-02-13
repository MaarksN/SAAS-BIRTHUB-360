import React from 'react';
import { SDRSidebar } from '../../components/sdr-sidebar';
import { ApiKeyManager } from '../../components/api-key-manager';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <SDRSidebar />
      <main className="flex-1 overflow-y-auto max-h-screen">
        <div className="max-w-7xl mx-auto px-8 py-8">
            <div className="mb-8 flex justify-end">
                <div className="w-full max-w-sm">
                    <ApiKeyManager />
                </div>
            </div>
            {children}
        </div>
      </main>
    </div>
  );
}
