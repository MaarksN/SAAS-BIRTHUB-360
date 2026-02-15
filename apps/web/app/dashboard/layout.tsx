import React from 'react';

import { ApiKeyManager } from '../../components/api-key-manager';
import { OnboardingTour } from '../../components/OnboardingTour';
import { SDRSidebar } from '../../components/sdr-sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <SDRSidebar />
      <main className="max-h-screen flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl p-8">
          <div className="mb-8 flex justify-end">
            <div className="w-full max-w-sm">
              <ApiKeyManager />
            </div>
          </div>
          {children}
        </div>
      </main>
      <OnboardingTour />
    </div>
  );
}
