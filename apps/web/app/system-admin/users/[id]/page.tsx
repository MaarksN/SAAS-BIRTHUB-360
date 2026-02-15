import { prisma } from '@salesos/core';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/table';
import { impersonateUser, toggleUserBan } from '../actions';
import { notFound } from 'next/navigation';

export default async function UserDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: { organization: true },
  });

  if (!user) {
    notFound();
  }

  // Ensure action is serializable or bound correctly
  const impersonateAction = impersonateUser.bind(null, user.id);
  const banAction = toggleUserBan.bind(null, user.id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">User Details</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-500">Name</label>
                <div className="text-lg font-medium text-slate-900">{user.name}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500">Email</label>
                <div className="text-lg font-medium text-slate-900">{user.email}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500">Role</label>
                <div className="text-lg font-medium text-slate-900">{user.role}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500">Status</label>
                <div className={`text-lg font-bold ${user.deletedAt ? 'text-red-600' : 'text-green-600'}`}>
                  {user.deletedAt ? 'BANNED' : 'ACTIVE'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500">Organization</label>
                <div className="text-lg font-medium text-slate-900">{user.organization?.name}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <form action={impersonateAction}>
                <button
                  type="submit"
                  className="w-full py-2 px-4 rounded-md font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                  Impersonate User
                </button>
              </form>

              <form action={banAction}>
                <button
                  type="submit"
                  className={`w-full py-2 px-4 rounded-md font-medium text-white transition-colors ${
                    user.deletedAt ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {user.deletedAt ? 'Unban User' : 'Ban User'}
                </button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
