export interface User {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
}

export interface Session {
  user: User;
  expires: string;
}

export interface AuthService {
  getSession(): Promise<Session | null>;
  signIn(): Promise<void>;
  signOut(): Promise<void>;
  getUserId(): Promise<string | null>;
}
