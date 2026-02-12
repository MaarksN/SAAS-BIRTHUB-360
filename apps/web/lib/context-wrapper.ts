import { headers } from 'next/headers';
import { runWithContext } from '@salesos/core';

/**
 * Wraps a Server Component or Action with the Tenant Context.
 * Extracts x-org-id and x-user-id from headers (set by middleware).
 */
export async function withContext<T>(callback: () => Promise<T>): Promise<T> {
  const headersList = headers();
  const organizationId = headersList.get('x-org-id') || undefined;
  const userId = headersList.get('x-user-id') || undefined;
  const role = headersList.get('x-user-role') || undefined;

  const context = {
    organizationId,
    userId,
    role
  };

  return runWithContext(context, callback);
}
