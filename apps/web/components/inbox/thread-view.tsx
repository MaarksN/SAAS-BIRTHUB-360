import { prisma } from '@salesos/core';
import { Button } from '@/components/Button';
import { Skeleton } from '@/components/ui/skeleton';

// Define Message Type
interface Message {
  id: string;
  from: any;
  to: any;
  body: string;
  receivedAt: Date;
}

export function ThreadView({ threadId }: { threadId: string }) {
  // Fetch messages (Mock)
  // In real app, pass data as prop from Server Component

  return (
    <div className="flex flex-col h-full bg-slate-950 flex-1">
      <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
        <h2 className="font-bold text-lg text-slate-100">Project Proposal (Mock Subject)</h2>
        <div className="flex gap-2">
            <Button variant="secondary" className="text-xs h-8">Archive</Button>
            <Button variant="secondary" className="text-xs h-8">Delete</Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Mock Message */}
        <div className="flex flex-col gap-2">
            <div className="flex justify-between text-slate-400 text-xs">
                <span>John Doe &lt;john@example.com&gt;</span>
                <span>Today, 10:23 AM</span>
            </div>
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 text-slate-300 text-sm">
                <p>Hi Jules,</p>
                <p className="mt-2">Just following up on the proposal. Did you have a chance to review?</p>
                <p className="mt-2">Best,<br/>John</p>
            </div>
        </div>

        {/* Reply Box */}
        <div className="mt-8 border-t border-slate-800 pt-6">
            <textarea
                className="w-full bg-slate-900 border border-slate-700 rounded-md p-3 text-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                rows={4}
                placeholder="Write a reply..."
            />
            <div className="mt-2 flex justify-end">
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white">Send Reply</Button>
            </div>
        </div>
      </div>
    </div>
  );
}
