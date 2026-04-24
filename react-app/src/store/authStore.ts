/**
 * Authentication Store — SHA-256 com cookies
 * Cookies 1st-party persistem melhor no iOS Safari (ITP-safe)
 * State inicializado síncronamente do cookie — sem race condition no AuthGuard
 */

import { create } from 'zustand';
import { AUTH_CONFIG } from '@/config/auth.config';

// Cookie helpers
function setCookie(name: string, value: string, days: number) {
  const maxAge = days * 24 * 60 * 60;
  // Secure flag só em HTTPS (GitHub Pages). Em localhost HTTP não funciona.
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
  // SameSite=Lax: mais compatível com iOS Safari que Strict (Strict bloqueia em navegações cross-site)
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; SameSite=Lax${secure}; Path=/`;
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.split('; ').find(row => row.startsWith(name + '='));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; Max-Age=0; Path=/`;
}

// SHA-256 via Web Crypto API
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Lê estado inicial do cookie de forma síncrona
function readInitialAuthState(): { isAuthenticated: boolean; authToken: string | null; authExpiry: number | null } {
  const cookie = getCookie('dashboard_auth');
  if (!cookie) return { isAuthenticated: false, authToken: null, authExpiry: null };

  const parts = cookie.split('|');
  if (parts.length !== 2) return { isAuthenticated: false, authToken: null, authExpiry: null };

  const [token, expiryStr] = parts;
  const expiry = parseInt(expiryStr, 10);

  if (isNaN(expiry) || expiry <= Date.now()) {
    deleteCookie('dashboard_auth');
    return { isAuthenticated: false, authToken: null, authExpiry: null };
  }

  return { isAuthenticated: true, authToken: token, authExpiry: expiry };
}

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

const initialAuth = readInitialAuthState();

export const useAuthStore = create<AuthState>((set, get) => ({
  // Estado inicial lido do cookie — síncrono, sem hydration async
  isAuthenticated: initialAuth.isAuthenticated,
  authToken: initialAuth.authToken,
  authExpiry: initialAuth.authExpiry,
  loginError: null,

  // Login: hash da senha + sal, compara com NEXT_PUBLIC_AUTH_HASH
  login: async (password: string): Promise<boolean> => {
    try {
      set({ loginError: null });

      const salted = password + AUTH_CONFIG.SALT;
      const hash = await sha256(salted);

      if (hash !== AUTH_CONFIG.PASSWORD_HASH) {
        set({ loginError: 'Senha incorreta. Tente novamente.' });
        return false;
      }

      const expiry = Date.now() + AUTH_CONFIG.TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
      const token = hash; // usa o próprio hash como token

      setCookie('dashboard_auth', `${token}|${expiry}`, AUTH_CONFIG.TOKEN_EXPIRY_DAYS);

      set({
        isAuthenticated: true,
        authToken: token,
        authExpiry: expiry,
        loginError: null,
      });

      return true;
    } catch (error) {
      set({ loginError: 'Erro interno. Tente novamente.' });
      console.error('Login error:', error);
      return false;
    }
  },

  // Logout: limpa cookie e estado
  logout: () => {
    deleteCookie('dashboard_auth');
    set({
      isAuthenticated: false,
      authToken: null,
      authExpiry: null,
      loginError: null,
    });
  },

  // Valida token — reler cookie do browser (resolve hydration mismatch no Next.js)
  validateToken: (): boolean => {
    // Reler do cookie agora que estamos no browser com document disponível
    const fresh = readInitialAuthState();

    if (!fresh.isAuthenticated) {
      set({ isAuthenticated: false, authToken: null, authExpiry: null });
      return false;
    }

    // Cookie válido — atualiza estado
    set({
      isAuthenticated: true,
      authToken: fresh.authToken,
      authExpiry: fresh.authExpiry,
    });
    return true;
  },

  // Limpa erro de login
  clearError: () => {
    set({ loginError: null });
  },
}));
