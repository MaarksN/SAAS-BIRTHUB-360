'use client';

import { Button } from '@salesos/ui';
import { Check, Copy, DollarSign, Gift, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Input } from '../Input';
import { ReferralStatsCard } from './ReferralStatsCard';

export function ReferralDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/referrals')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.data.stats);
          setCode(data.data.code);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = () => {
    const link =
      typeof window !== 'undefined'
        ? `${window.location.origin}/signup?ref=${code}`
        : `/signup?ref=${code}`;

    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Referral link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    try {
      const res = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Invite sent successfully!');
        setInviteEmail('');
      } else {
        toast.error(data.error?.message || 'Failed to send invite');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setInviteLoading(false);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-slate-500">
        Loading referral data...
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ReferralStatsCard
          title="Total Referrals"
          value={stats?.totalReferrals || 0}
          icon={Users}
          description="Friends invited"
        />
        <ReferralStatsCard
          title="Converted"
          value={stats?.convertedReferrals || 0}
          icon={Check}
          description="Successful signups"
        />
        <ReferralStatsCard
          title="Total Rewards"
          value={stats?.totalRewards || 0}
          icon={DollarSign}
          description="Credits earned"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-medium">
            <Gift className="size-5 text-blue-500" />
            Share your unique link
          </h3>
          <p className="mb-4 text-sm text-slate-500">
            Give your friends 50 credits to start. You'll get 50 credits when
            they sign up!
          </p>
          <div className="flex gap-2">
            <div className="flex-1 truncate rounded border border-slate-200 bg-white p-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-800">
              {typeof window !== 'undefined'
                ? `${window.location.origin}/signup?ref=${code}`
                : `.../signup?ref=${code}`}
            </div>
            <Button onClick={handleCopy} variant="outline" size="icon">
              {copied ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
          <h3 className="mb-4 text-lg font-medium">Invite by Email</h3>
          <form onSubmit={handleInvite} className="flex gap-2">
            <Input
              type="email"
              placeholder="friend@company.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" disabled={inviteLoading}>
              {inviteLoading ? 'Sending...' : 'Invite'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
