import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE_NAME, IMPERSONATE_COOKIE_NAME } from '../../../../lib/admin-auth';

export async function POST(request: Request) {
  const cookieStore = await cookies();

  cookieStore.delete(ADMIN_COOKIE_NAME);
  cookieStore.delete(IMPERSONATE_COOKIE_NAME);

  const url = new URL(request.url);
  return NextResponse.redirect(new URL('/system-admin/login', url.origin));
}
