import { NextRequest } from 'next/server';
import { runWithContext, RequestContext, updateContext } from '@salesos/core';

/**
 * Extrai contexto do NextRequest e executa callback dentro do contexto
 *
 * @example
 * export async function GET(req: NextRequest) {
 *   return withRequestContext(req, async () => {
 *     // Código da API route
 *     // getContext() agora retorna dados do request
 *   });
 * }
 */
export async function withRequestContext<T>(
  req: NextRequest,
  callback: () => Promise<T>
): Promise<T> {
  const requestId = req.headers.get('x-request-id') ||
                    req.headers.get('x-amzn-trace-id') ||
                    crypto.randomUUID();

  const ip = req.headers.get('x-client-ip') ||
             req.headers.get('x-forwarded-for') ||
             (req as any).ip ||
             'unknown';

  const userAgent = req.headers.get('user-agent') || 'unknown';

  const context: Partial<RequestContext> = {
    requestId,
    ip,
    userAgent,
    // userId e organizationId devem ser extraídos do JWT/Session depois
  };

  return runWithContext(context, callback);
}

/**
 * Extrai contexto de autenticação (JWT) e atualiza o contexto atual
 */
export function extractAuthContext(decoded: { userId?: string; organizationId?: string }) {
  updateContext({
    userId: decoded.userId,
    organizationId: decoded.organizationId
  });
}
