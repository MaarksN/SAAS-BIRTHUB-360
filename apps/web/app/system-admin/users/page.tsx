import { prisma } from '@salesos/core';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge } from '../../../components/ui/table';
import { Search } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || '';
  const page = parseInt(params.page || '1');
  const limit = 20;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (query) {
    where.OR = [
      { email: { contains: query, mode: 'insensitive' } },
      { name: { contains: query, mode: 'insensitive' } },
      { organization: { name: { contains: query, mode: 'insensitive' } } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      include: { organization: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Users</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Users ({total})</CardTitle>
            <form className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  name="q"
                  defaultValue={query}
                  placeholder="Search users..."
                  className="pl-9 h-9 w-64 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900"
                />
              </div>
              <button type="submit" className="px-3 py-1 bg-slate-900 text-white rounded text-sm">Search</button>
            </form>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.role}</Badge>
                  </TableCell>
                  <TableCell>{user.organization?.name || 'No Org'}</TableCell>
                  <TableCell>
                    {user.deletedAt ? (
                      <span className="text-red-600 font-semibold text-xs">BANNED</span>
                    ) : (
                      <span className="text-green-600 font-semibold text-xs">ACTIVE</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Link href={`/system-admin/users/${user.id}`} className="text-blue-600 hover:underline">
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    No users found.
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
                <Link href={`/system-admin/users?q=${query}&page=${page - 1}`} className="px-3 py-1 border rounded hover:bg-slate-50">
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link href={`/system-admin/users?q=${query}&page=${page + 1}`} className="px-3 py-1 border rounded hover:bg-slate-50">
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
