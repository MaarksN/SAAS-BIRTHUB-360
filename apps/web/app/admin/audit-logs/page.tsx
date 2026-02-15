'use client';

import { Card } from '@salesos/ui';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useState } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface AuditLog {
  id: string;
  actorId?: string;
  action: string;
  entity: string;
  entityId: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}

interface AuditLogResponse {
  data: AuditLog[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery<AuditLogResponse>({
    queryKey: ['audit-logs', page],
    queryFn: async () => {
      const res = await fetch(`/api/audit-logs?page=${page}&limit=20`);
      if (!res.ok) throw new Error('Failed to fetch logs');
      return res.json();
    },
  });

  if (isError) {
    return (
      <div className="p-8 text-center text-red-500">
        Error loading audit logs. Please try again.
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground mt-2">
          View immutable records of system activity and user actions.
        </p>
      </div>

      <Card className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>IP Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                  </TableRow>
                ))
              : data?.data.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm:ss')}
                    </TableCell>
                    <TableCell>{log.actorId || 'System'}</TableCell>
                    <TableCell className="font-medium">{log.action}</TableCell>
                    <TableCell>
                      {log.entity}{' '}
                      <span className="text-muted-foreground text-xs">
                        ({log.entityId.slice(0, 8)}...)
                      </span>
                    </TableCell>
                    <TableCell>{log.ipAddress || '-'}</TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>

        {data && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-muted-foreground text-sm">
              Page {data.meta.page} of {data.meta.totalPages}
            </div>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded border px-3 py-1 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={page >= data.meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded border px-3 py-1 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
