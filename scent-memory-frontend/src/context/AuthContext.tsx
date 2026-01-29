'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useMe } from '@/hooks/useAuth';
import { User } from '@/lib/api';

interface AuthContextType {
  user: User | null | undefined;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading: loading } = useMe();
  const router = useRouter();
  const queryClient = useQueryClient();

  const logout = (): void => {
    localStorage.removeItem('token');
    queryClient.clear();
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user: user ?? null, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
