import { Role, User } from '@birthhub/database';
import { describe, expect, it } from 'vitest';

import { assertPermission, hasPermission, hasRole, Permission } from './rbac';

// Helper to create a mock user with a specific role
const mockUser = (role: Role): User =>
  ({
    id: 'test-user-id',
    role: role,
    createdAt: new Date(),
    updatedAt: new Date(),
    email: 'test@example.com',
    name: 'Test User',
    passwordHash: 'hash',
    organizationId: 'org-id',
    deletedAt: null,
  }) as User;

describe('RBAC System', () => {
  describe('hasRole', () => {
    it('should return true for same role', () => {
      expect(hasRole(mockUser('ADMIN' as Role), 'ADMIN' as Role)).toBe(true);
      expect(hasRole(mockUser('MEMBER' as Role), 'MEMBER' as Role)).toBe(true);
    });

    it('should return true for higher role accessing lower role requirement', () => {
      // OWNER > ADMIN > MANAGER > MEMBER > VIEWER
      expect(hasRole(mockUser('OWNER' as Role), 'ADMIN' as Role)).toBe(true);
      expect(hasRole(mockUser('ADMIN' as Role), 'MANAGER' as Role)).toBe(true);
      expect(hasRole(mockUser('MANAGER' as Role), 'MEMBER' as Role)).toBe(true);
      expect(hasRole(mockUser('MEMBER' as Role), 'VIEWER' as Role)).toBe(true);
    });

    it('should return false for lower role accessing higher role requirement', () => {
      expect(hasRole(mockUser('ADMIN' as Role), 'OWNER' as Role)).toBe(false);
      expect(hasRole(mockUser('MANAGER' as Role), 'ADMIN' as Role)).toBe(false);
      expect(hasRole(mockUser('MEMBER' as Role), 'MANAGER' as Role)).toBe(
        false,
      );
      expect(hasRole(mockUser('VIEWER' as Role), 'MEMBER' as Role)).toBe(false);
    });

    it('should return false if user is undefined', () => {
      // We need to cast undefined to User because strict null checks might complain
      // or the function signature expects User.
      expect(hasRole(undefined as unknown as User, 'ADMIN' as Role)).toBe(
        false,
      );
    });

    it('should return false if user role is undefined', () => {
      const user = {
        ...mockUser('ADMIN' as Role),
        role: undefined,
      } as unknown as User;
      expect(hasRole(user, 'ADMIN' as Role)).toBe(false);
    });
  });

  describe('hasPermission', () => {
    it('should allow OWNER all permissions', () => {
      const owner = mockUser('OWNER' as Role);
      const permissions: Permission[] = [
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
      ];

      permissions.forEach((permission) => {
        expect(hasPermission(owner, permission)).toBe(true);
      });
    });

    it('should allow ADMIN specific permissions', () => {
      const admin = mockUser('ADMIN' as Role);
      // Should have
      expect(hasPermission(admin, 'user:create')).toBe(true);
      expect(hasPermission(admin, 'billing:view')).toBe(true);

      // Should not have
      expect(hasPermission(admin, 'billing:manage')).toBe(false);
      expect(hasPermission(admin, 'organization:delete')).toBe(false);
    });

    it('should allow MANAGER specific permissions', () => {
      const manager = mockUser('MANAGER' as Role);
      // Should have
      expect(hasPermission(manager, 'user:view')).toBe(true);
      expect(hasPermission(manager, 'campaign:create')).toBe(true);

      // Should not have
      expect(hasPermission(manager, 'user:delete')).toBe(false);
      expect(hasPermission(manager, 'billing:view')).toBe(false);
    });

    it('should allow MEMBER specific permissions', () => {
      const member = mockUser('MEMBER' as Role);
      // Should have
      expect(hasPermission(member, 'campaign:create')).toBe(true);
      expect(hasPermission(member, 'lead:view')).toBe(true);

      // Should not have
      expect(hasPermission(member, 'user:view')).toBe(false);
      expect(hasPermission(member, 'campaign:delete')).toBe(false);
    });

    it('should allow VIEWER specific permissions', () => {
      const viewer = mockUser('VIEWER' as Role);
      // Should have
      expect(hasPermission(viewer, 'campaign:view')).toBe(true);
      expect(hasPermission(viewer, 'billing:view')).toBe(true);

      // Should not have
      expect(hasPermission(viewer, 'campaign:create')).toBe(false);
      expect(hasPermission(viewer, 'lead:create')).toBe(false);
    });

    it('should return false if user is undefined', () => {
      expect(hasPermission(undefined as unknown as User, 'user:view')).toBe(
        false,
      );
    });
  });

  describe('assertPermission', () => {
    it('should throw error if permission is denied', () => {
      const member = mockUser('MEMBER' as Role);
      expect(() => assertPermission(member, 'user:delete')).toThrow(
        'Access denied',
      );
    });

    it('should not throw error if permission is granted', () => {
      const member = mockUser('MEMBER' as Role);
      expect(() => assertPermission(member, 'campaign:create')).not.toThrow();
    });
  });
});
