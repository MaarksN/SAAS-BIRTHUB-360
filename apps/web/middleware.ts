import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-salesos-request-id', crypto.randomUUID());

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
  // Allow 'unsafe-inline' and 'unsafe-eval' for Next.js (Script optimization/HMR)
  // In production, this should be stricter (nonces).
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

// NOTE: Context injection for RLS (Cycle 31)
// Ideally, we would wrap the response or use a custom Server Component wrapper to set the AsyncLocalStorage context.
// However, Next.js Middleware runs in the Edge runtime, while AsyncLocalStorage is Node.js specific and request-scoped per lambda.
// In Next.js App Router, the recommended way to handle context is via a wrapper in `layout.tsx` or Higher-Order Component/Function for Server Actions.
// BUT, since `libs/core` uses `AsyncLocalStorage`, we need to initialize it at the entry point of the Node.js request handling.
// For App Router, this is tricky. A common pattern is to trust the `middleware` to set headers (x-org-id, x-user-id)
// and then have a utility function `authenticatedPrisma()` that reads these headers/cookies inside the Server Component
// and calls `runWithContext` before executing the query.

// Given the "Zero Trust" requirement, we cannot rely on developers remembering to call a wrapper.
// The Prisma Extension in `libs/core` reads from `AsyncLocalStorage`.
// We need to ensure `AsyncLocalStorage` is populated.
// In Next.js, we can't easily wrap the entire request in `context.run()` from middleware.
// We will modify `libs/core/src/prisma.ts` to ALSO look for headers if context is empty (Mocking context propagation for now)
// OR we enforce usage of a `getSessionContext()` helper in the App.

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
