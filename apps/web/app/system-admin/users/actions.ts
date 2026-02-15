'use server';

import { cookies } from 'next/headers';
import { prisma } from '@salesos/core';
import { IMPERSONATE_COOKIE_NAME, ADMIN_COOKIE_NAME } from '../../../lib/admin-auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function impersonateUser(userId: string) {
  const cookieStore = await cookies();

  // Verify Admin
  const adminToken = cookieStore.get(ADMIN_COOKIE_NAME);
  if (!adminToken) {
    throw new Error('Unauthorized');
  }

  cookieStore.set(IMPERSONATE_COOKIE_NAME, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax',
  });

  redirect('/dashboard');
}

export async function stopImpersonating() {
  const cookieStore = await cookies();
  cookieStore.delete(IMPERSONATE_COOKIE_NAME);
  redirect('/system-admin/users');
}

export async function toggleUserBan(userId: string) {
  const cookieStore = await cookies();
  if (!cookieStore.get(ADMIN_COOKIE_NAME)) {
    throw new Error('Unauthorized');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  await prisma.user.update({
    where: { id: userId },
    data: {
      deletedAt: user.deletedAt ? null : new Date(),
    },
  });

  revalidatePath(`/system-admin/users/${userId}`);
  revalidatePath('/system-admin/users');
}
