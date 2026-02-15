import React from 'react';
import { cookies } from 'next/headers';
import { SDRSidebar } from '../../components/sdr-sidebar';
import { ApiKeyManager } from '../../components/api-key-manager';
import { OnboardingTour } from '../../components/OnboardingTour';
import { IMPERSONATE_COOKIE_NAME } from '../../lib/admin-auth';
import { stopImpersonating } from '../system-admin/users/actions';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isImpersonating = cookieStore.has(IMPERSONATE_COOKIE_NAME);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {isImpersonating && (
        <div className="bg-red-600 text-white p-2 flex justify-center items-center gap-4 shadow-md z-50">
          <span className="font-bold text-sm uppercase tracking-wider">System Admin Impersonation Mode</span>
          <form action={stopImpersonating}>
            <button type="submit" className="bg-white text-red-600 px-3 py-1 rounded text-xs font-bold hover:bg-slate-100 transition-colors">
              Stop Impersonating
            </button>
          </form>
        </div>
      )}
      <div className="flex flex-1">
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
        <OnboardingTour />
      </div>
    </div>
  );
}
