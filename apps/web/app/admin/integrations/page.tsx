import { prisma } from '@salesos/core';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@salesos/ui';

import { Badge } from '@/components/ui/table'; // Reuse badge

export default async function IntegrationsPage() {
  // Fetch integrations
  // In a real server component, we need the context/user.
  // Assume generic fetch for now or "God Mode" list for demo.
  // Ideally, use a helper to get current org integrations.
  const integrations = await prisma.integration.findMany({
      take: 10
  });

  const hubspotConnected = integrations.find(i => i.provider === 'HUBSPOT' && i.isActive);

  return (
    <div className="container mx-auto space-y-6 p-8">
      <h1 className="text-3xl font-bold text-slate-100">Integrations</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* HubSpot Card */}
        <Card className="border-slate-700 bg-slate-900">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <CardTitle className="text-white">HubSpot CRM</CardTitle>
                    {hubspotConnected ? (
                        <Badge className="border-emerald-800 bg-emerald-900 text-emerald-200">Connected</Badge>
                    ) : (
                        <Badge className="bg-slate-800 text-slate-400">Disconnected</Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <p className="mb-4 text-sm text-slate-400">
                    Sync leads and deals bi-directionally between SalesOS and HubSpot.
                </p>
                {hubspotConnected ? (
                    <Button variant="outline" className="w-full border-red-900 text-red-400 hover:bg-red-900/20">
                        Disconnect
                    </Button>
                ) : (
                    <a href="/api/integrations/hubspot/install">
                        <Button className="w-full bg-[#ff7a59] text-white hover:bg-[#ff8f73]">
                            Connect HubSpot
                        </Button>
                    </a>
                )}
            </CardContent>
        </Card>

        {/* Salesforce Placeholder */}
        <Card className="border-slate-700 bg-slate-900 opacity-75">
            <CardHeader>
                <CardTitle className="text-white">Salesforce</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="mb-4 text-sm text-slate-400">
                    Coming soon. Enterprise syncing with SFDC.
                </p>
                <Button disabled className="w-full bg-slate-800 text-slate-500">
                    Coming Soon
                </Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
