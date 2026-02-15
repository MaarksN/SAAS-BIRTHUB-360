import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

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
    'max-age=31536000; includeSubDomains',
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
    console.log(
      JSON.stringify({
        event: 'http_request',
        requestId,
        method: request.method,
        url: request.url,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      }),
    );
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
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
