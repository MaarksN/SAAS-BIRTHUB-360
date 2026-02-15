import { prisma } from '@salesos/core';
import { Badge } from '@/components/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@salesos/ui';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// This is a Server Component
export default async function AuditLogPage() {
  // Fetch logs (System Context via prisma import, so we see all logs if we are God Mode)
  // But wait, prisma in libs/core exports an extended client that might expect context?
  // Actually, 'prisma' export in 'libs/core/src/prisma.ts' uses 'basePrisma.$extends'.
  // Inside $allOperations, it calls 'getOrganizationId()'.
  // If we are in a Server Component without running 'runWithContext', 'getOrganizationId()' returns undefined.
  // The logic says: "if (orgId && TENANT_MODELS.includes(model)) { inject filter }".
  // So if orgId is undefined, it might return ALL records (God Mode), which is what we want for /admin/audit.

  // However, we should be careful. 'AuditLog' is a TENANT_MODEL.
  // If orgId is undefined, does it filter?
  // "if (orgId && TENANT_MODELS...)". So if !orgId, it skips injection.
  // Yes, this is correct for Super Admin Dashboard.

  const logs = await prisma.auditLog.findMany({
    take: 50,
    orderBy: { createdAt: 'desc' },
    include: {
        organization: true
    }
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs (Compliance)</h1>
        <div className="flex gap-2">
            <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full font-mono">Immutable</span>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-mono">SOC2 Ready</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs">
                    {log.createdAt.toLocaleString()}
                  </TableCell>
                  <TableCell>{log.organization?.name || log.organizationId}</TableCell>
                  <TableCell>{log.actorId || 'System'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                        log.action.includes('DELETE') ? 'border-red-500 text-red-500' :
                        log.action.includes('UPDATE') ? 'border-amber-500 text-amber-500' :
                        'border-blue-500 text-blue-500'
                    }>
                        {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {log.entity}:{log.entityId}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {log.ipAddress || '-'}
                  </TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                  <TableRow>
                      <TableCell colSpan={6} className="text-center h-24 text-slate-500">
                          No audit logs found.
                      </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
