'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { useStore } from 'zustand';
import { createAuthStore, type AuthStore, type AuthState } from './auth-store';
import { AuthContext } from '@/iam/utils/get-auth-context';

const AuthStoreContext = createContext<AuthStore | null>(null);

type ProviderProps = {
  children: ReactNode;
  initialAuth: AuthContext | null;
};

export function AuthStoreProvider({ children, initialAuth }: ProviderProps) {
  const [store] = useState<AuthStore>(() => createAuthStore(initialAuth));

  return <AuthStoreContext.Provider value={store}>{children}</AuthStoreContext.Provider>;
}

function useAuthStoreBase<T>(selector: (state: AuthState) => T): T {
  const store = useContext(AuthStoreContext);
  if (!store) {
    throw new Error('useAuthStore must be used within <AuthStoreProvider>');
  }
  return useStore(store, selector);
}

/** Generic store selector */
export function useAuthStore<T>(selector: (state: AuthState) => T): T {
  return useAuthStoreBase(selector);
}

/** Convenience hooks */
export const useAuth = () => useAuthStore((s) => s.auth);
export const useAuthUser = () => useAuthStore((s) => s.auth?.user ?? null);
export const useIsAuthenticated = () => useAuthStore((s) => s.isAuthenticated);
