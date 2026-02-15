import React, { createContext, useContext, ReactNode } from 'react';
import { User, Session, mockUser } from './index';

interface AuthContextType {
  session: Session | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = React.useState<Session | null>({
    token: 'mock-token',
    user: mockUser,
    expiresAt: new Date(Date.now() + 3600 * 1000)
  });

  const login = () => {
    console.log('Login logic here');
    setSession({
      token: 'new-token',
      user: mockUser,
      expiresAt: new Date(Date.now() + 3600 * 1000)
    });
  };

  const logout = () => {
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
