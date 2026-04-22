/**
 * Authentication Store — Zustand with localStorage persistence
 * Manages login state, token validation, logout
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AUTH_CONFIG } from '@/config/auth.config';

export interface AuthState {
  // State
  isAuthenticated: boolean;
  authToken: string | null;
  authExpiry: number | null;
  loginError: string | null;

  // Actions
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  validateToken: () => boolean;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      authToken: null,
      authExpiry: null,
      loginError: null,

      // Login: validate password via SHA-256 hash
      login: async (password: string): Promise<boolean> => {
        try {
          set({ loginError: null });

          // Hash the input password with public salt
          const encoder = new TextEncoder();
          const data = encoder.encode(password + AUTH_CONFIG.SALT);
          const hashBuffer = await crypto.subtle.digest('SHA-256', data);
          const userHash = Array.from(new Uint8Array(hashBuffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');

          // Compare hashes
          const isValid = userHash === AUTH_CONFIG.PASSWORD_HASH;

          if (!isValid) {
            set({ loginError: 'Senha incorreta' });
            return false;
          }

          // Generate random token using crypto
          const token = `token_${crypto.randomUUID()}`;

          // Calculate expiry (7 days from now)
          const expiryMs = Date.now() + AUTH_CONFIG.TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

          set({
            isAuthenticated: true,
            authToken: token,
            authExpiry: expiryMs,
            loginError: null,
          });

          return true;
        } catch (error) {
          set({ loginError: 'Erro ao validar senha' });
          console.error('Auth login error:', error);
          return false;
        }
      },

      // Logout: clear all auth state
      logout: () => {
        set({
          isAuthenticated: false,
          authToken: null,
          authExpiry: null,
          loginError: null,
        });
      },

      // Validate token on mount/refresh
      validateToken: (): boolean => {
        const state = get();

        // No token = not authenticated
        if (!state.authToken || !state.authExpiry) {
          if (state.isAuthenticated) {
            set({
              isAuthenticated: false,
              authToken: null,
              authExpiry: null,
            });
          }
          return false;
        }

        // Check expiry
        const now = Date.now();
        const isExpired = state.authExpiry <= now;

        if (isExpired) {
          set({
            isAuthenticated: false,
            authToken: null,
            authExpiry: null,
          });
          return false;
        }

        // Token is still valid — restore authenticated state
        if (!state.isAuthenticated) {
          set({ isAuthenticated: true });
        }
        return true;
      },

      // Clear login error
      clearError: () => {
        set({ loginError: null });
      },
    }),

    // Persist config
    {
      name: 'dashboard-auth',
      partialize: (state) => ({
        // Only persist these keys
        authToken: state.authToken,
        authExpiry: state.authExpiry,
      }),
      // Validate on hydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Validate token after rehydrating from localStorage
          const isValid = state.validateToken?.();
          if (!isValid) {
            state.isAuthenticated = false;
          }
        }
      },
    }
  )
);
