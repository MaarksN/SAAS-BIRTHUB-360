import { prisma } from '@salesos/core';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/table';

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; org?: string; action?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const org = params.org;
  const action = params.action;

  const limit = 50;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (org) where.organizationId = org;
  if (action) where.action = { contains: action, mode: 'insensitive' };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { organization: true },
    }),
    prisma.auditLog.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
      </div>

      <Card>
        <CardHeader>
           <div className="flex justify-between items-center">
             <CardTitle>System Logs ({total})</CardTitle>
           </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xs">
                    {log.organization?.name || log.organizationId}
                  </TableCell>
                  <TableCell className="text-xs font-mono">{log.actorId || 'System'}</TableCell>
                  <TableCell className="text-sm font-medium">{log.action}</TableCell>
                  <TableCell className="text-xs">
                    {log.entity} {log.entityId && <span className="text-slate-400">({log.entityId})</span>}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 max-w-xs truncate">
                    {log.metadata ? JSON.stringify(log.metadata) : '-'}
                  </TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                   <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                     No logs found.
                   </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

           {/* Pagination */}
           <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-slate-500">
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`/system-admin/audit-logs?page=${page - 1}`} className="px-3 py-1 border rounded hover:bg-slate-50">
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link href={`/system-admin/audit-logs?page=${page + 1}`} className="px-3 py-1 border rounded hover:bg-slate-50">
                  Next
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
