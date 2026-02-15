import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_COOKIE_NAME, verifyAdminSecret, IMPERSONATE_COOKIE_NAME, SYSTEM_ADMIN_HEADER } from './lib/admin-auth';

export function middleware(request: NextRequest) {
  // Gerar ou extrair Request ID
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();

  // Extrair informações do request
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  // Create Headers for the next request
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-request-id', requestId);
  requestHeaders.set('x-client-ip', ip);
  requestHeaders.set('x-user-agent', userAgent);

  // Admin Auth Logic
  const adminCookie = request.cookies.get(ADMIN_COOKIE_NAME);
  const adminSecret = adminCookie?.value;

  if (adminSecret && verifyAdminSecret(adminSecret)) {
    requestHeaders.set(SYSTEM_ADMIN_HEADER, 'true');
    // We treat this session as an Admin (or Owner) for RBAC purposes
    requestHeaders.set('x-user-role', 'OWNER');

    const impersonateId = request.cookies.get(IMPERSONATE_COOKIE_NAME)?.value;
    if (impersonateId) {
      requestHeaders.set('x-user-id', impersonateId);
    } else {
      // System Admin Session
      requestHeaders.set('x-user-id', '00000000-0000-0000-0000-000000000000');
      requestHeaders.set('x-org-id', '00000000-0000-0000-0000-000000000000');
    }
  }

  // Criar response passando os headers modificados
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Injetar Request ID no header de resposta
  response.headers.set('x-request-id', requestId);

  // Adicionar headers de contexto para serem lidos pelo cliente (opcional)
  response.headers.set('x-client-ip', ip);
  response.headers.set('x-user-agent', userAgent);

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

  // Logs estruturados (opcional)
  if (process.env.LOG_REQUESTS === 'true') {
    console.log(JSON.stringify({
      event: 'http_request',
      requestId,
      method: request.method,
      url: request.url,
      ip,
      userAgent,
      timestamp: new Date().toISOString()
    }));
  }

  return response;
}

// Configurar quais rotas o middleware deve processar
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)'
  ]
};
