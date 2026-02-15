'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { LeadListItem } from './lead-list-item';

interface Lead {
  id: string;
  name: string | null;
  email: string;
  companyName: string | null;
  phone: string | null;
  status: string;
}

interface LeadListProps {
  initialLeads: Lead[];
}

async function fetchLeads() {
  const res = await fetch('/api/leads');
  if (!res.ok) throw new Error('Failed to fetch leads');
  const data = await res.json();
  return data.data; // Assuming wrapper response
}

async function updateLeadStatusApi(leadId: string, status: string) {
  const res = await fetch(`/api/leads/${leadId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update lead');
  return res.json();
}

export function LeadList({ initialLeads }: LeadListProps) {
  const queryClient = useQueryClient();

  const { data: leads } = useQuery({
    queryKey: ['leads'],
    queryFn: fetchLeads,
    initialData: initialLeads,
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateLeadStatusApi(id, status),
    // Optimistic Update
    onMutate: async (newLead) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['leads'] });

      // Snapshot the previous value
      const previousLeads = queryClient.getQueryData<Lead[]>(['leads']);

      // Optimistically update to the new value
      queryClient.setQueryData<Lead[]>(['leads'], (old) => {
        if (!old) return [];
        return old.map((lead) =>
          lead.id === newLead.id ? { ...lead, status: newLead.status } : lead,
        );
      });

      // Return context with the snapshotted value
      return { previousLeads };
    },
    onError: (err, newLead, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousLeads) {
        queryClient.setQueryData<Lead[]>(['leads'], context.previousLeads);
      }
      toast.error('Failed to update status');
    },
    onSettled: () => {
      // Always refetch after error or success to ensure data is in sync
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onSuccess: () => {
      toast.success('Status updated');
    },
  });

  return (
    <div className="space-y-4">
      {leads.map((lead) => (
        <div key={lead.id} className="group relative">
          <LeadListItem lead={lead} />

          {/* Quick Actions (Demo) */}
          <div className="absolute right-2 top-2 flex gap-2 rounded bg-slate-800/90 p-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={() =>
                mutation.mutate({ id: lead.id, status: 'QUALIFIED' })
              }
              className="px-2 py-1 text-xs text-emerald-400 hover:text-emerald-300"
              disabled={mutation.isPending}
            >
              Qualify
            </button>
            <button
              onClick={() =>
                mutation.mutate({ id: lead.id, status: 'DISQUALIFIED' })
              }
              className="px-2 py-1 text-xs text-red-400 hover:text-red-300"
              disabled={mutation.isPending}
            >
              Disqualify
            </button>
          </div>
        </div>
      ))}
      {leads.length === 0 && (
        <div className="py-10 text-center text-slate-500">No leads found.</div>
      )}
    </div>
  );
}
