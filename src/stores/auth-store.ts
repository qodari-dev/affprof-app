import { AuthContext } from '@/iam/utils/get-auth-context';
import { createStore, type StoreApi } from 'zustand/vanilla';

export type AuthState = {
  auth: AuthContext | null;
  isAuthenticated: boolean;

  setAuth: (auth: AuthContext | null) => void;
  clearAuth: () => void;
};

export type AuthStore = StoreApi<AuthState>;

export function createAuthStore(initialAuth: AuthContext | null = null): AuthStore {
  return createStore<AuthState>((set) => ({
    auth: initialAuth,
    isAuthenticated: !!initialAuth,

    setAuth: (auth) => set({ auth, isAuthenticated: !!auth }),
    clearAuth: () => set({ auth: null, isAuthenticated: false }),
  }));
}
