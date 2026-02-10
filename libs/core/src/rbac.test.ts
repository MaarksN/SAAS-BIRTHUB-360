import { describe, it, expect } from 'vitest';
import { User, Role } from '@prisma/client';
import { hasRole, assertRole } from './rbac';

describe('RBAC', () => {
  const mockUser = (role: Role): User => ({
    role,
    id: 'user-id',
    email: 'test@example.com',
    name: 'Test User',
    organizationId: 'org-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  } as User);

  describe('hasRole', () => {
    it('should return true for ADMIN when ADMIN role is required', () => {
      expect(hasRole(mockUser('ADMIN'), 'ADMIN')).toBe(true);
    });

    it('should return true for ADMIN when MANAGER role is required', () => {
      expect(hasRole(mockUser('ADMIN'), 'MANAGER')).toBe(true);
    });

    it('should return true for ADMIN when MEMBER role is required', () => {
      expect(hasRole(mockUser('ADMIN'), 'MEMBER')).toBe(true);
    });

    it('should return true for MANAGER when MANAGER role is required', () => {
      expect(hasRole(mockUser('MANAGER'), 'MANAGER')).toBe(true);
    });

    it('should return true for MANAGER when MEMBER role is required', () => {
      expect(hasRole(mockUser('MANAGER'), 'MEMBER')).toBe(true);
    });

    it('should return true for MEMBER when MEMBER role is required', () => {
      expect(hasRole(mockUser('MEMBER'), 'MEMBER')).toBe(true);
    });

    it('should return false for MANAGER when ADMIN role is required', () => {
      expect(hasRole(mockUser('MANAGER'), 'ADMIN')).toBe(false);
    });

    it('should return false for MEMBER when MANAGER role is required', () => {
      expect(hasRole(mockUser('MEMBER'), 'MANAGER')).toBe(false);
    });

    it('should return false for MEMBER when ADMIN role is required', () => {
      expect(hasRole(mockUser('MEMBER'), 'ADMIN')).toBe(false);
    });
  });

  describe('assertRole', () => {
    it('should not throw when user has sufficient role (exact match)', () => {
      expect(() => assertRole(mockUser('MANAGER'), 'MANAGER')).not.toThrow();
    });

    it('should not throw when user has higher role than required', () => {
      expect(() => assertRole(mockUser('ADMIN'), 'MEMBER')).not.toThrow();
    });

    it('should throw an Error with "Access denied" when user has insufficient role', () => {
      expect(() => assertRole(mockUser('MEMBER'), 'MANAGER')).toThrow('Access denied. Required role: MANAGER');
      expect(() => assertRole(mockUser('MANAGER'), 'ADMIN')).toThrow('Access denied. Required role: ADMIN');
      expect(() => assertRole(mockUser('MEMBER'), 'ADMIN')).toThrow('Access denied. Required role: ADMIN');
    });
  });
});
