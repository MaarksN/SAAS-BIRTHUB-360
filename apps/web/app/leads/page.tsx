import { prisma } from '@salesos/core';
import { Suspense } from 'react';

import { LeadList } from '@/components/leads/lead-list';
import { Skeleton } from '@/components/ui/skeleton';
import { withContext } from '@/lib/context-wrapper';

export default async function LeadsPage() {
  // Fetch data with security context
  const leads = await withContext(async () => {
      return prisma.lead.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            email: true,
            companyName: true,
            phone: true,
            status: true
        }
      });
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">Leads</h1>
        {/* Cycle 32 Export Button could go here */}
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-700 bg-slate-900">
        <Suspense fallback={<LeadsSkeleton />}>
           <LeadList initialLeads={leads} />
        </Suspense>
      </div>
    </div>
  );
}

function LeadsSkeleton() {
    return (
        <div className="space-y-4 p-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4">
                    <Skeleton className="size-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-1/4" />
                    </div>
                </div>
            ))}
        </div>
    );
}
