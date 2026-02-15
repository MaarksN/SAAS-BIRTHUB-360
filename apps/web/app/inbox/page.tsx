import { prisma } from '@salesos/core';

import { ThreadList } from '@/components/inbox/thread-list';
import { ThreadView } from '@/components/inbox/thread-view';

export default async function InboxPage({
  searchParams,
}: {
  searchParams: { threadId?: string };
}) {
  // Fetch threads
  const threads = await prisma.emailThread.findMany({
    take: 20,
    orderBy: { lastMessageAt: 'desc' },
  });

  const selectedThreadId = searchParams.threadId;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      <ThreadList threads={threads} selectedId={selectedThreadId} />
      {selectedThreadId ? (
        <ThreadView threadId={selectedThreadId} />
      ) : (
        <div className="flex flex-1 items-center justify-center bg-slate-950 text-slate-500">
          Select a conversation to start reading
        </div>
      )}
    </div>
  );
}
