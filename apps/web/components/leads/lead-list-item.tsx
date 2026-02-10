import { Lead } from '@prisma/client'; // Use Prisma Client type directly in frontend? Usually via API response DTO.
// But @salesos/core exports Prisma models usually?
// Let's use any for now or try to import from core if possible.
// Actually, apps/web/tsconfig.json maps @salesos/core.

import { Skeleton } from '../Skeleton';

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
      <div className="p-4 border-b border-slate-700/50 bg-slate-900/50">
        <div className="flex gap-4 items-center">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
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
      <div className="hidden md:grid grid-cols-4 gap-4 p-4 border-b border-slate-700 hover:bg-slate-800/50 items-center transition-colors">
        <div className="font-medium text-slate-100">{lead.name || 'Unknown'}</div>
        <div className="text-sm text-slate-400">{lead.email}</div>
        <div>
           <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
             lead.status === 'NEW' ? 'bg-blue-900/50 text-blue-200 border border-blue-800' :
             lead.status === 'QUALIFIED' ? 'bg-emerald-900/50 text-emerald-200 border border-emerald-800' :
             'bg-slate-800 text-slate-400 border border-slate-700'
           }`}>
            {lead.status}
          </span>
        </div>
        <div className="text-right">
          <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">View Details</button>
        </div>
      </div>

      {/* Mobile View (Card) - Responsive Adaptation (Cycle 40) */}
      <div className="md:hidden p-4 border border-slate-700 rounded-lg mb-3 bg-slate-800 shadow-sm mx-2">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold">
              {(lead.name || '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">{lead.name || 'Unknown'}</h3>
              <p className="text-xs text-slate-500">{lead.companyName || 'No Company'}</p>
            </div>
          </div>
          <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
             lead.status === 'NEW' ? 'bg-blue-900 text-blue-200' : 'bg-slate-700 text-slate-400'
          }`}>
            {lead.status}
          </span>
        </div>

        <div className="space-y-2 text-sm text-slate-400 mb-4 pl-13">
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

        <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-700">
          <button className="flex items-center justify-center px-3 py-2 border border-slate-600 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-700 transition-colors touch-manipulation">
            Email
          </button>
          <button className="flex items-center justify-center px-3 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-900/20 touch-manipulation">
            Call
          </button>
        </div>
      </div>
    </div>
  );
}
