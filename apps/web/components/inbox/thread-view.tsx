import { prisma } from '@salesos/core';
import { Button } from '@salesos/ui';

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
    <div className="flex h-full flex-1 flex-col bg-slate-950">
      <div className="flex items-center justify-between border-b border-slate-700 bg-slate-900/50 p-4">
        <h2 className="text-lg font-bold text-slate-100">
          Project Proposal (Mock Subject)
        </h2>
        <div className="flex gap-2">
          <Button variant="secondary" className="h-8 text-xs">
            Archive
          </Button>
          <Button variant="secondary" className="h-8 text-xs">
            Delete
          </Button>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        {/* Mock Message */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>John Doe &lt;john@example.com&gt;</span>
            <span>Today, 10:23 AM</span>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 text-sm text-slate-300">
            <p>Hi Jules,</p>
            <p className="mt-2">
              Just following up on the proposal. Did you have a chance to
              review?
            </p>
            <p className="mt-2">
              Best,
              <br />
              John
            </p>
          </div>
        </div>

        {/* Reply Box */}
        <div className="mt-8 border-t border-slate-800 pt-6">
          <textarea
            className="w-full rounded-md border border-slate-700 bg-slate-900 p-3 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={4}
            placeholder="Write a reply..."
          />
          <div className="mt-2 flex justify-end">
            <Button className="bg-indigo-600 text-white hover:bg-indigo-500">
              Send Reply
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
