import { Lead } from '@birthhub/database'; // Use Prisma Client type directly in frontend? Usually via API response DTO.

// But @salesos/core exports Prisma models usually?
// Let's use any for now or try to import from core if possible.
// Actually, apps/web/tsconfig.json maps @salesos/core.
import { Skeleton } from '@/components/ui/skeleton';

// Define a minimal interface to avoid deep dependency on backend types if possible,
// or import from shared lib if available.
interface LeadDTO {
  id: string;
  name: string | null;
  email: string;
  companyName: string | null;
  phone: string | null;
  status: string;
}

interface LeadListItemProps {
  lead?: LeadDTO;
  isLoading?: boolean;
}

export function LeadListItem({ lead, isLoading }: LeadListItemProps) {
  if (isLoading || !lead) {
    return (
      <div className="border-b border-slate-700/50 bg-slate-900/50 p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="block">
      {/* Desktop View (Table Row style using Grid) */}
      <div className="hidden grid-cols-4 items-center gap-4 border-b border-slate-700 p-4 transition-colors hover:bg-slate-800/50 md:grid">
        <div className="font-medium text-slate-100">
          {lead.name || 'Unknown'}
        </div>
        <div className="text-sm text-slate-400">{lead.email}</div>
        <div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              lead.status === 'NEW'
                ? 'border border-blue-800 bg-blue-900/50 text-blue-200'
                : lead.status === 'QUALIFIED'
                  ? 'border border-emerald-800 bg-emerald-900/50 text-emerald-200'
                  : 'border border-slate-700 bg-slate-800 text-slate-400'
            }`}
          >
            {lead.status}
          </span>
        </div>
        <div className="text-right">
          <button className="text-sm font-medium text-indigo-400 hover:text-indigo-300">
            View Details
          </button>
        </div>
      </div>

      {/* Mobile View (Card) - Responsive Adaptation (Cycle 40) */}
      <div className="mx-2 mb-3 rounded-lg border border-slate-700 bg-slate-800 p-4 shadow-sm md:hidden">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-slate-700 font-bold text-slate-300">
              {(lead.name || '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">
                {lead.name || 'Unknown'}
              </h3>
              <p className="text-xs text-slate-500">
                {lead.companyName || 'No Company'}
              </p>
            </div>
          </div>
          <span
            className={`rounded px-2 py-0.5 text-xs font-semibold ${
              lead.status === 'NEW'
                ? 'bg-blue-900 text-blue-200'
                : 'bg-slate-700 text-slate-400'
            }`}
          >
            {lead.status}
          </span>
        </div>

        <div className="pl-13 mb-4 space-y-2 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-4">📧</span>
            <span className="truncate">{lead.email}</span>
          </div>
          {lead.phone && (
            <div className="flex items-center gap-2">
              <span className="w-4">📱</span>
              <span>{lead.phone}</span>
            </div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-700 pt-3">
          <button className="flex touch-manipulation items-center justify-center rounded-md border border-slate-600 px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700">
            Email
          </button>
          <button className="flex touch-manipulation items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-900/20 transition-colors hover:bg-indigo-500">
            Call
          </button>
        </div>
      </div>
    </div>
  );
}
