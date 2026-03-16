import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { User } from '@/constants/types';
import { TokenKeys } from '@/services/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (tokens: { accessToken: string; refreshToken: string }, user: User) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  login: async ({ accessToken, refreshToken }, user) => {
    await Promise.all([
      SecureStore.setItemAsync(TokenKeys.access, accessToken),
      SecureStore.setItemAsync(TokenKeys.refresh, refreshToken),
    ]);
    set({ user, accessToken, refreshToken, isAuthenticated: true });
  },

  logout: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(TokenKeys.access),
      SecureStore.deleteItemAsync(TokenKeys.refresh),
    ]);
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user }),

  hydrate: async () => {
    try {
      const [accessToken, refreshToken] = await Promise.all([
        SecureStore.getItemAsync(TokenKeys.access),
        SecureStore.getItemAsync(TokenKeys.refresh),
      ]);

      if (accessToken && refreshToken) {
        set({ accessToken, refreshToken, isAuthenticated: true, isLoading: false });
      } else {
        set({ isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ isAuthenticated: false, isLoading: false });
    }
  },
}));
