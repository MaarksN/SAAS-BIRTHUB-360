import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { validateRequest } from './lib/api-gateway';

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-salesos-request-id', crypto.randomUUID());

  // API Gateway Logic for External Routes
  if (request.nextUrl.pathname.startsWith('/api/external')) {
    const result = await validateRequest(request);

    if (!result.authorized) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status, headers: result.headers as any }
      );
    }

    // Append Rate Limit Headers to response
    if (result.headers) {
      Object.entries(result.headers).forEach(([key, value]) => {
        requestHeaders.set(key, value);
      });
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
