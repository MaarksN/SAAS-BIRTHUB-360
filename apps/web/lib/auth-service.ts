import { Role } from '@salesos/core/rbac';

export interface UserSession {
  userId: string;
  email: string;
  role: Role;
  organizationId: string;
}

export const authService = {
  // Mock login function
  login: async (email: string, password: string): Promise<UserSession | null> => {
    // In reality, verify with Auth0/Clerk
    if (email === 'admin@salesos.io' && password === 'admin') {
      return {
        userId: 'user_admin_123',
        email,
        role: 'ADMIN',
        organizationId: 'org_main_123'
      };
    }
    return null;
  },

  getSession: async (): Promise<UserSession | null> => {
    // Mock session retrieval
    return {
      userId: 'user_demo_123',
      email: 'demo@salesos.io',
      role: 'MANAGER',
      organizationId: 'org_demo_123'
    };
  }
};
