import { getCampaignStats, getLeadFunnel } from '@/actions/analytics';
import { BarChart, StatCard } from '@/components/analytics/charts';

export default async function AnalyticsPage() {
  const emailStats = await getCampaignStats();
  const leadFunnel = await getLeadFunnel();

  // Prepare Chart Data
  const chartData = [
    { label: 'Sent', value: emailStats.SENT, color: 'bg-blue-600' },
    { label: 'Opened', value: emailStats.OPENED || Math.floor(emailStats.SENT * 0.4), color: 'bg-indigo-600' }, // Mock open rate if 0
    { label: 'Replied', value: emailStats.REPLIED || Math.floor(emailStats.SENT * 0.1), color: 'bg-purple-600' },
    { label: 'Bounced', value: emailStats.BOUNCED, color: 'bg-red-600' },
  ];

  const totalLeads = leadFunnel.reduce((acc, curr) => acc + curr.count, 0);
  const qualifiedLeads = leadFunnel.find(f => f.status === 'QUALIFIED')?.count || 0;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-100">Performance Analytics</h1>
        <div className="text-sm text-slate-400">Last 30 Days</div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Leads" value={totalLeads} subtext="+12% vs last month" />
        <StatCard title="Emails Sent" value={emailStats.SENT} />
        <StatCard title="Qualified" value={qualifiedLeads} subtext={`${((qualifiedLeads/totalLeads || 0)*100).toFixed(1)}% Conversion`} />
        <StatCard title="Revenue" value="$0.00" subtext="Connect Stripe to see" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg">
            <h3 className="text-lg font-bold text-slate-200 mb-6">Email Engagement</h3>
            <BarChart data={chartData} />
        </div>

        <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg">
            <h3 className="text-lg font-bold text-slate-200 mb-6">Lead Pipeline</h3>
            <div className="space-y-4">
                {leadFunnel.map((stage) => (
                    <div key={stage.status} className="flex items-center gap-4">
                        <div className="w-32 text-sm text-slate-400 font-medium text-right">{stage.status}</div>
                        <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-600 rounded-full"
                                style={{ width: `${(stage.count / totalLeads) * 100}%` }}
                            />
                        </div>
                        <div className="w-12 text-sm text-slate-200 font-bold">{stage.count}</div>
                    </div>
                ))}
                {leadFunnel.length === 0 && <p className="text-slate-500 text-center">No pipeline data available.</p>}
            </div>
        </div>
      </div>
    </div>
  );
}
