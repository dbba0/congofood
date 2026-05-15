import { create } from 'zustand';
import type { AuthUser, AuthTokens } from '@congofood/types';

interface AuthState {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  setUser: (user: AuthUser, tokens: AuthTokens) => void;
  setTokens: (tokens: AuthTokens) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tokens: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user, tokens) =>
    set({ user, tokens, isAuthenticated: true, isLoading: false }),

  setTokens: (tokens) => set({ tokens }),

  logout: () =>
    set({ user: null, tokens: null, isAuthenticated: false, isLoading: false }),

  setLoading: (isLoading) => set({ isLoading }),
}));
