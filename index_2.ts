import { Role } from '@salesos/core';

export interface User {
  id: string;
  email: string;
  role: Role;
  name: string;
}

export interface Session {
  token: string;
  user: User;
  expiresAt: Date;
}

export const mockUser: User = {
  id: 'user_1',
  email: 'demo@salesos.io',
  role: 'ADMIN',
  name: 'Demo User'
};

export * from './provider';
export * from './rbac';
