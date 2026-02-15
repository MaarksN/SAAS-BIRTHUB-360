import { Role, User } from '@birthhub/database';

export { Role, User };

export type Permission =
  | 'organization:update'
  | 'organization:delete'
  | 'billing:manage'
  | 'billing:view'
  | 'user:create'
  | 'user:update'
  | 'user:delete'
  | 'user:view'
  | 'campaign:create'
  | 'campaign:update'
  | 'campaign:delete'
  | 'campaign:view'
  | 'lead:create'
  | 'lead:update'
  | 'lead:delete'
  | 'lead:view'
  | 'audit:view';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  OWNER: [
    'organization:update',
    'organization:delete',
    'billing:manage',
    'billing:view',
    'user:create',
    'user:update',
    'user:delete',
    'user:view',
    'campaign:create',
    'campaign:update',
    'campaign:delete',
    'campaign:view',
    'lead:create',
    'lead:update',
    'lead:delete',
    'lead:view',
    'audit:view',
  ],
  ADMIN: [
    'organization:update',
    'billing:view',
    'user:create',
    'user:update',
    'user:delete',
    'user:view',
    'campaign:create',
    'campaign:update',
    'campaign:delete',
    'campaign:view',
    'lead:create',
    'lead:update',
    'lead:delete',
    'lead:view',
    'audit:view',
  ],
  MANAGER: [
    'user:view',
    'campaign:create',
    'campaign:update',
    'campaign:view',
    'lead:create',
    'lead:update',
    'lead:view',
  ],
  MEMBER: [
    'campaign:create',
    'campaign:update',
    'campaign:view',
    'lead:create',
    'lead:update',
    'lead:view',
  ],
  VIEWER: [
    'user:view',
    'campaign:view',
    'lead:view',
    'billing:view',
  ],
};

export function hasPermission(user: User, permission: Permission): boolean {
  if (!user || !user.role) return false;
  const userPermissions = ROLE_PERMISSIONS[user.role] || [];
  return userPermissions.includes(permission);
}

export function assertPermission(user: User, permission: Permission): void {
  if (!hasPermission(user, permission)) {
    throw new Error(`Access denied. Required permission: ${permission}`);
  }
}

// Legacy Role Hierarchy (Deprecated but kept for backward compatibility)
export const ROLE_HIERARCHY: Record<Role, number> = {
  'OWNER': 4,
  'ADMIN': 3,
  'MANAGER': 2,
  'MEMBER': 1,
  'VIEWER': 0
};

export function hasRole(user: User, requiredRole: Role): boolean {
  if (!user || !user.role) return false;
  return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[requiredRole];
}

export function assertRole(user: User, requiredRole: Role): void {
  if (!hasRole(user, requiredRole)) {
    throw new Error(`Access denied. Required role: ${requiredRole}`);
  }
}
