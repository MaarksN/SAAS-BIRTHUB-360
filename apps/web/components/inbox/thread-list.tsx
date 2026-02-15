import { prisma } from '@salesos/core';
import { formatDistanceToNow } from 'date-fns'; // Need date-fns or native Intl

// Mock data type
interface Thread {
  id: string;
  subject: string;
  snippet: string | null;
  lastMessageAt: Date;
  isUnread: boolean;
  participants: any;
}

export function ThreadList({ threads, selectedId }: { threads: Thread[], selectedId?: string }) {
  return (
    <div className="flex h-full w-80 flex-col overflow-y-auto border-r border-slate-700 bg-slate-900">
      <div className="border-b border-slate-700 p-4">
        <h2 className="font-bold text-slate-100">Inbox</h2>
      </div>
      {threads.map(thread => (
        <a
            key={thread.id}
            href={`/inbox?threadId=${thread.id}`}
            className={`cursor-pointer border-b border-slate-800 p-4 transition-colors hover:bg-slate-800 ${selectedId === thread.id ? 'border-l-2 border-l-indigo-500 bg-slate-800' : ''}`}
        >
          <div className="mb-1 flex justify-between">
            <span className={`truncate text-sm font-semibold ${thread.isUnread ? 'text-white' : 'text-slate-400'}`}>
                {/* Parse participants to show name */}
                {(thread.participants as string[])[0] || 'Unknown'}
            </span>
            <span className="ml-2 whitespace-nowrap text-xs text-slate-500">
                {thread.lastMessageAt.toLocaleDateString()}
            </span>
          </div>
          <div className={`mb-1 truncate text-sm ${thread.isUnread ? 'font-medium text-slate-200' : 'text-slate-400'}`}>
            {thread.subject}
          </div>
          <div className="truncate text-xs text-slate-500">
            {thread.snippet}
          </div>
        </a>
      ))}
    </div>
  );
}
