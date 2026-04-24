/**
 * Authentication Store — GitHub OAuth via Zustand
 * Manages GitHub token persistence and validation
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AUTH_CONFIG } from '@/config/auth.config';

export interface GitHubUser {
  login: string;
  id: number;
  email: string;
}

export interface AuthState {
  // State
  isAuthenticated: boolean;
  githubToken: string | null;
  user: GitHubUser | null;
  authExpiry: number | null;
  loginError: string | null;

  // Actions
  initiateOAuthLogin: () => void;
  exchangeCodeForToken: (code: string) => Promise<boolean>;
  logout: () => void;
  validateToken: () => boolean;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      githubToken: null,
      user: null,
      authExpiry: null,
      loginError: null,

      // Initiate OAuth: redirect to GitHub login
      initiateOAuthLogin: () => {
        try {
          set({ loginError: null });
          const authorizationUrl = new URL('https://github.com/login/oauth/authorize');
          authorizationUrl.searchParams.append('client_id', AUTH_CONFIG.GITHUB_CLIENT_ID);
          authorizationUrl.searchParams.append('redirect_uri', AUTH_CONFIG.GITHUB_REDIRECT_URI);
          authorizationUrl.searchParams.append('scope', AUTH_CONFIG.GITHUB_SCOPES);
          authorizationUrl.searchParams.append('allow_signup', 'false');
          window.location.href = authorizationUrl.toString();
        } catch (error) {
          set({ loginError: 'Erro ao iniciar login com GitHub' });
          console.error('OAuth initiation error:', error);
        }
      },

      // Exchange OAuth code for GitHub token
      exchangeCodeForToken: async (code: string): Promise<boolean> => {
        try {
          set({ loginError: null });

          // Call GitHub API to exchange code for access token
          const response = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/vnd.github.v3+json',
            },
            body: JSON.stringify({
              client_id: AUTH_CONFIG.GITHUB_CLIENT_ID,
              client_secret: process.env.NEXT_PUBLIC_GITHUB_CLIENT_SECRET || '',
              code,
            }),
          });

          const data = await response.json();

          if (data.error) {
            set({ loginError: `Erro GitHub: ${data.error_description}` });
            return false;
          }

          const token = data.access_token;
          if (!token) {
            set({ loginError: 'Falha ao obter token GitHub' });
            return false;
          }

          // Fetch user info to validate and get email
          const userResponse = await fetch('https://api.github.com/user', {
            headers: {
              'Authorization': `token ${token}`,
              'Accept': 'application/vnd.github.v3+json',
            },
          });

          const user: GitHubUser = await userResponse.json();

          // Calculate expiry (30 days from now)
          const expiryMs = Date.now() + AUTH_CONFIG.TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

          set({
            isAuthenticated: true,
            githubToken: token,
            user,
            authExpiry: expiryMs,
            loginError: null,
          });

          return true;
        } catch (error) {
          set({ loginError: 'Erro ao conectar com GitHub' });
          console.error('OAuth exchange error:', error);
          return false;
        }
      },

      // Logout: clear all auth state and revoke GitHub token
      logout: () => {
        const state = get();
        if (state.githubToken) {
          // Optionally revoke token on GitHub (requires client secret)
          // This is handled server-side in production
        }
        set({
          isAuthenticated: false,
          githubToken: null,
          user: null,
          authExpiry: null,
          loginError: null,
        });
      },

      // Validate token on mount/refresh
      validateToken: (): boolean => {
        const state = get();

        // No token = not authenticated
        if (!state.githubToken || !state.authExpiry) {
          if (state.isAuthenticated) {
            set({
              isAuthenticated: false,
              githubToken: null,
              user: null,
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
            githubToken: null,
            user: null,
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
      name: 'dashboard-auth-github',
      partialize: (state) => ({
        // Only persist these keys (token + user, not error state)
        githubToken: state.githubToken,
        user: state.user,
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
