import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const existingRequestId = request.headers.get('x-request-id');
  const requestId = existingRequestId || crypto.randomUUID();

  // Set consistent request ID
  requestHeaders.set('x-request-id', requestId);

  // Allow admin routes but ensure protection (handled by separate service or custom logic here if needed)
  // Our dashboard is separate service proxied by Nginx, so this middleware only sees /api/* or page routes.
  // /admin/queues is proxied BEFORE hitting Next.js, so this middleware won't run for it.

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Echo back in response
  response.headers.set('x-request-id', requestId);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes - wait, we want API routes to have ID)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
