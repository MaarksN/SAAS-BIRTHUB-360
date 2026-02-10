import { prisma } from '@salesos/core';
import { LeadList } from '@/components/leads/lead-list';
import { Suspense } from 'react';
import { Skeleton } from '@/components/Skeleton';

export default async function LeadsPage() {
  // Fetch data
  const leads = await prisma.lead.findMany({
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Leads</h1>
        {/* Cycle 32 Export Button could go here */}
      </div>

      <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
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
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-1/4" />
                    </div>
                </div>
            ))}
        </div>
    );
}
