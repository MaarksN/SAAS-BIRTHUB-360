import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';

/**
 * Interface do contexto de requisição
 */
export interface RequestContext {
  requestId: string;
  userId?: string;
  organizationId?: string;
  role?: string; // Added for backward compatibility
  ip?: string;
  userAgent?: string;
  startTime: number;
}

/**
 * AsyncLocalStorage para propagar contexto através da stack
 */
const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

/**
 * Inicializa um novo contexto de requisição
 */
export function runWithContext<T>(
  context: Partial<RequestContext>,
  callback: () => T
): T {
  const fullContext: RequestContext = {
    requestId: context.requestId || randomUUID(),
    userId: context.userId,
    organizationId: context.organizationId,
    role: context.role,
    ip: context.ip,
    userAgent: context.userAgent,
    startTime: Date.now()
  };

  return asyncLocalStorage.run(fullContext, callback);
}

/**
 * Obtém o contexto atual
 */
export function getContext(): RequestContext | undefined {
  return asyncLocalStorage.getStore();
}

/**
 * Obtém o Request ID do contexto atual
 */
export function getRequestId(): string {
  const context = getContext();
  return context?.requestId || 'unknown';
}

/**
 * Obtém o Organization ID do contexto atual
 */
export function getOrganizationId(): string | undefined {
  const context = getContext();
  return context?.organizationId;
}

/**
 * Obtém o User ID do contexto atual
 */
export function getUserId(): string | undefined {
  const context = getContext();
  return context?.userId;
}

/**
 * Atualiza o contexto atual (merge)
 */
export function updateContext(updates: Partial<RequestContext>): void {
  const current = getContext();
  if (current) {
    Object.assign(current, updates);
  }
}
