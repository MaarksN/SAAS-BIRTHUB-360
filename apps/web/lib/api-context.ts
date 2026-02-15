import { RequestContext, runWithContext, updateContext } from '@salesos/core';
import { NextRequest } from 'next/server';

/**
 * Extrai contexto do NextRequest e executa callback dentro do contexto
 */
export async function withRequestContext<T>(
  req: NextRequest,
  callback: () => Promise<T>,
): Promise<T> {
  const requestId =
    req.headers.get('x-request-id') ||
    req.headers.get('x-amzn-trace-id') ||
    crypto.randomUUID();

  const ip =
    req.headers.get('x-client-ip') ||
    req.headers.get('x-forwarded-for') ||
    req.ip ||
    'unknown';

  const userAgent = req.headers.get('user-agent') || 'unknown';

  // Tenta extrair ID e Org dos headers (caso venha de um gateway ou middleware upstream)
  const userId = req.headers.get('x-user-id') || undefined;
  const organizationId = req.headers.get('x-org-id') || undefined;
  const role = req.headers.get('x-user-role') || undefined;

  const context: Partial<RequestContext> = {
    requestId,
    ip,
    userAgent,
    userId,
    organizationId,
    role,
  };

  return runWithContext(context, callback);
}

/**
 * Extrai contexto de autenticação (JWT) e atualiza o contexto atual
 */
export function extractAuthContext(decoded: {
  userId?: string;
  organizationId?: string;
  role?: string;
}) {
  updateContext({
    userId: decoded.userId,
    organizationId: decoded.organizationId,
    role: decoded.role,
  });
}
