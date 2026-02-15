import { verifyInviteToken } from '@salesos/core';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@salesos/ui';
import { redirect } from 'next/navigation';

import { Input } from '@/components/Input';

export default function AcceptInvitePage({
  params,
}: {
  params: { token: string };
}) {
  const payload = verifyInviteToken(params.token);

  if (!payload) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <Card className="border-red-800 bg-red-900/10">
          <CardContent className="p-6">
            <h1 className="text-xl font-bold text-red-500">
              Invalid or Expired Invite
            </h1>
            <p className="mt-2 text-slate-400">
              Please ask the administrator to send a new invitation.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  async function handleAccept(formData: FormData) {
    'use server';
    // Logic to create user would go here
    // 1. Verify token again
    // 2. Create User in DB
    // 3. Create Session
    // 4. Redirect to Dashboard
    redirect('/');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <Card className="w-full max-w-md border-slate-700 bg-slate-900">
        <CardHeader>
          <CardTitle className="text-center text-2xl text-slate-100">
            Join SalesOS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="mb-4 text-center text-slate-400">
            You have been invited to join via <strong>{payload.email}</strong>
          </div>

          <form action={handleAccept} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">
                Set Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                name="password"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">
                Confirm Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                name="confirmPassword"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-indigo-600 text-white hover:bg-indigo-500"
            >
              Create Account
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
