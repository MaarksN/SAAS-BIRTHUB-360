import { prisma, generateImpersonationToken } from '@salesos/core';
import { Button } from '@/components/Button';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function UsersPage() {
  // In real app: Check Admin Permissions via Context
  const users = await prisma.user.findMany({
    take: 20,
    include: { organization: true }
  });

  async function impersonate(formData: FormData) {
    'use server';
    const userId = formData.get('userId') as string;
    const orgId = formData.get('orgId') as string;

    // Mock Admin ID (In real app, get from session)
    const adminId = 'admin-user-id';

    const token = generateImpersonationToken(adminId, userId, orgId);

    // Set cookie
    cookies().set('session', token, { httpOnly: true, secure: true });

    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto p-8 text-slate-100">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm">
            <thead className="bg-slate-800 text-slate-400">
                <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Organization</th>
                    <th className="p-4">Role</th>
                    <th className="p-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
                {users.map(user => (
                    <tr key={user.id} className="hover:bg-slate-800/50">
                        <td className="p-4 font-medium">{user.name}</td>
                        <td className="p-4 text-slate-400">{user.email}</td>
                        <td className="p-4">{user.organization.name}</td>
                        <td className="p-4">
                            <span className="bg-slate-800 border border-slate-700 px-2 py-1 rounded text-xs">
                                {user.role}
                            </span>
                        </td>
                        <td className="p-4 text-right">
                            <form action={impersonate}>
                                <input type="hidden" name="userId" value={user.id} />
                                <input type="hidden" name="orgId" value={user.organizationId} />
                                <Button variant="outline" className="text-xs h-8 border-indigo-500/50 text-indigo-400 hover:bg-indigo-900/20">
                                    👻 Impersonate
                                </Button>
                            </form>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}
