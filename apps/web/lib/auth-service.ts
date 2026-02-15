import { Role } from '@salesos/core';

import { env } from '../env.mjs';

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
    const adminEmail = env.ADMIN_EMAIL;
    const adminPassword = env.ADMIN_PASSWORD;

    if (adminEmail && adminPassword && email === adminEmail && password === adminPassword) {
      return {
        userId: 'user_admin_123',
        email,
        role: Role.ADMIN,
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
      role: Role.MANAGER,
      organizationId: 'org_demo_123'
    };
  }
};
