/**
 * Authentication Configuration — GitHub OAuth
 * Usando GitHub como provider de identidade (seguro, nativa)
 * Senha gerenciada pelo GitHub, nunca exposta no dashboard
 */

export const AUTH_CONFIG = {
  // GitHub OAuth App credentials (injetados em build time via .env.local)
  GITHUB_CLIENT_ID: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || '',
  GITHUB_REDIRECT_URI: process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI || 'http://localhost:3000/auth/callback',

  // Scopes: 'user:email' para validar que é Diego
  GITHUB_SCOPES: 'user:email',

  // Token expiry: 30 dias (GitHub tokens não expiram, mas validamos este TTL)
  TOKEN_EXPIRY_DAYS: 30,

  // Storage keys
  STORAGE_KEY_TOKEN: 'dashboard_github_token',
  STORAGE_KEY_USER: 'dashboard_github_user',
};

