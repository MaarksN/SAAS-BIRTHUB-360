'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@salesos/ui';

import { ReferralDashboard } from '@/components/referrals/ReferralDashboard';

export default function ReferralsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Referrals</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Invite friends and earn credits for your organization.
        </p>
      </div>

      <ReferralDashboard />
    </div>
  );
}
