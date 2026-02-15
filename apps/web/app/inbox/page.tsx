import { prisma } from '@salesos/core';
import { ThreadList } from '@/components/inbox/thread-list';
import { ThreadView } from '@/components/inbox/thread-view';

export default async function InboxPage({ searchParams }: { searchParams: { threadId?: string } }) {
  // Fetch threads
  const threads = await prisma.emailThread.findMany({
    take: 20,
    orderBy: { lastMessageAt: 'desc' }
  });

  const selectedThreadId = searchParams.threadId;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      <ThreadList threads={threads} selectedId={selectedThreadId} />
      {selectedThreadId ? (
        <ThreadView threadId={selectedThreadId} />
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-500 bg-slate-950">
          Select a conversation to start reading
        </div>
      )}
    </div>
  );
}
