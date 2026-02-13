export type Role = 'ADMIN' | 'MANAGER' | 'MEMBER';

export const PERMISSIONS = {
  'VIEW_DASHBOARD': ['ADMIN', 'MANAGER', 'MEMBER'],
  'MANAGE_USERS': ['ADMIN'],
  'EXPORT_LEADS': ['ADMIN', 'MANAGER'],
  'DELETE_CONTACT': ['ADMIN', 'MANAGER'],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(role: Role, permission: Permission): boolean {
  const allowedRoles = PERMISSIONS[permission] as readonly string[];
  return allowedRoles.includes(role);
}
