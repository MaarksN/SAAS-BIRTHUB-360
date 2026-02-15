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
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-700 w-80 overflow-y-auto">
      <div className="p-4 border-b border-slate-700">
        <h2 className="font-bold text-slate-100">Inbox</h2>
      </div>
      {threads.map(thread => (
        <a
            key={thread.id}
            href={`/inbox?threadId=${thread.id}`}
            className={`p-4 border-b border-slate-800 hover:bg-slate-800 cursor-pointer transition-colors ${selectedId === thread.id ? 'bg-slate-800 border-l-2 border-l-indigo-500' : ''}`}
        >
          <div className="flex justify-between mb-1">
            <span className={`text-sm font-semibold truncate ${thread.isUnread ? 'text-white' : 'text-slate-400'}`}>
                {/* Parse participants to show name */}
                {(thread.participants as string[])[0] || 'Unknown'}
            </span>
            <span className="text-xs text-slate-500 whitespace-nowrap ml-2">
                {thread.lastMessageAt.toLocaleDateString()}
            </span>
          </div>
          <div className={`text-sm mb-1 truncate ${thread.isUnread ? 'text-slate-200 font-medium' : 'text-slate-400'}`}>
            {thread.subject}
          </div>
          <div className="text-xs text-slate-500 truncate">
            {thread.snippet}
          </div>
        </a>
      ))}
    </div>
  );
}
