import { User } from './index';
import { Role } from '@salesos/core';

const ROLE_HIERARCHY: Record<Role, number> = {
  'ADMIN': 3,
  'MANAGER': 2,
  'MEMBER': 1
};

export function hasRole(user: User, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[requiredRole];
}

export function assertRole(user: User, requiredRole: Role): void {
  if (!hasRole(user, requiredRole)) {
    throw new Error(`Access denied. Required role: ${requiredRole}`);
  }
}
