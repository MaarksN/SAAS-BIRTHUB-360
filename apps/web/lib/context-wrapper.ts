import { headers } from 'next/headers';
import { runWithContext } from '@salesos/core';

/**
 * Wraps a Server Component or Action with the Tenant Context.
 * Extracts x-org-id and x-user-id from headers (set by middleware).
 */
export async function withContext<T>(callback: () => Promise<T>): Promise<T> {
  const headersList = headers();
  let organizationId = headersList.get('x-org-id') || undefined;
  let userId = headersList.get('x-user-id') || undefined;
  let role = headersList.get('x-user-role') || undefined;

  // Check for Impersonation (if passed via headers in middleware)
  // Or assuming middleware handles token decoding and sets these headers correctly.
  // The 'generateImpersonationToken' produces a JWT.
  // Middleware should decode it.

  // If we are in 'IMPERSONATOR' mode, we might want to log it or set a flag.
  // For now, we trust the headers set by middleware (which needs to be updated to decode JWT).

  const context = {
    organizationId,
    userId,
    role
  };

  return runWithContext(context, callback);
}
