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

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Security Headers (Cycle 35)
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );

  // Content Security Policy (CSP)
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https://api.stripe.com",
    "frame-src 'self' https://js.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
