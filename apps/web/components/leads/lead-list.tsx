'use client';

import { useOptimistic, startTransition } from 'react';
import { LeadListItem } from './lead-list-item';
import { updateLeadStatus, deleteLead } from '../../actions/leads';
import { toast } from '@/components/sonner';

// Define the shape of our Lead (matching what we passed to LeadListItem earlier or close to it)
// We define it here or import from shared types.
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

export function LeadList({ initialLeads }: LeadListProps) {
  // Optimistic State
  const [optimisticLeads, addOptimisticLead] = useOptimistic(
    initialLeads,
    (state, updatedLead: Lead) => {
        // If it's a delete (we signal via status='DELETED' or similar, or handle differently)
        // For simplicity, let's assume 'updatedLead' replaces the old one.
        return state.map((lead) => (lead.id === updatedLead.id ? updatedLead : lead));
    }
  );

  // Handlers
  const handleStatusChange = async (lead: Lead, newStatus: string) => {
      // 1. Optimistic Update (Immediate Feedback)
      startTransition(() => {
          addOptimisticLead({ ...lead, status: newStatus });
      });

      // 2. Server Action
      const formData = new FormData();
      formData.append('leadId', lead.id);
      formData.append('status', newStatus);

      const result = await updateLeadStatus(formData);

      if (result.error) {
          toast.error(result.error);
          // Revert is handled automatically by Next.js revalidation/router refresh if we implemented rollback logic in useOptimistic properly or trigger refresh.
          // But useOptimistic is temporary state until server responds.
          // If server fails, we might want to manually revert or just show error.
          // The router.refresh() from revalidatePath will fix the state eventually.
      } else {
          toast.success('Status updated');
      }
  };

  return (
    <div className="space-y-4">
      {optimisticLeads.map((lead) => (
        <div key={lead.id} className="relative group">
            <LeadListItem lead={lead} />

            {/* Action Buttons (Demo overlay for simplicity) */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800/90 rounded p-1 flex gap-2">
                <form action={async (formData) => {
                    handleStatusChange(lead, 'QUALIFIED');
                }}>
                    <button type="submit" className="text-xs text-emerald-400 hover:text-emerald-300 px-2 py-1">
                        Qualify
                    </button>
                </form>
                <form action={async (formData) => {
                    handleStatusChange(lead, 'DISQUALIFIED');
                }}>
                    <button type="submit" className="text-xs text-red-400 hover:text-red-300 px-2 py-1">
                        Disqualify
                    </button>
                </form>
            </div>
        </div>
      ))}
      {optimisticLeads.length === 0 && (
          <div className="text-center py-10 text-slate-500">
              No leads found.
          </div>
      )}
    </div>
  );
}
