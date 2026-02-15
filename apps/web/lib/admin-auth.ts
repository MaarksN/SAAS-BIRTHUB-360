export const ADMIN_COOKIE_NAME = 'admin_token';
export const IMPERSONATE_COOKIE_NAME = 'impersonate_user_id';
export const SYSTEM_ADMIN_HEADER = 'x-is-super-admin';

export function verifyAdminSecret(secret: string): boolean {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) return false;
  return secret === adminSecret;
}
