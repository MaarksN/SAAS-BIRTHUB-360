import { prisma } from '@salesos/core';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/table';
import { createFlag } from './actions';
import { Button } from '@salesos/ui';

export default async function FeatureFlagsPage() {
  const flags = await prisma.featureFlag.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Feature Flags</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>All Flags</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flags.map((flag) => (
                  <TableRow key={flag.id}>
                    <TableCell className="font-medium font-mono text-xs">{flag.key}</TableCell>
                    <TableCell>
                      {flag.isEnabled ? (
                        <span className="text-green-600 font-bold text-xs bg-green-100 px-2 py-1 rounded">ENABLED</span>
                      ) : (
                        <span className="text-slate-500 font-bold text-xs bg-slate-100 px-2 py-1 rounded">DISABLED</span>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">{flag.description}</TableCell>
                    <TableCell>
                      <Link href={`/system-admin/feature-flags/${flag.key}`} className="text-blue-600 hover:underline">
                        Edit
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                {flags.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                      No flags found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create Flag</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createFlag} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Key</label>
                <input
                  name="key"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  placeholder="new-feature-key"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  name="description"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  rows={3}
                  required
                />
              </div>
              <button
                  type="submit"
                  className="w-full py-2 px-4 rounded-md font-medium text-white bg-slate-900 hover:bg-slate-800 transition-colors"
                >
                  Create Flag
                </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
