/**
 * Authentication Configuration
 * Senha é verificada via SHA-256 hash com sal público
 * Sal: 'com.diegodemorais.dashboard.v1.2026'
 */

export const AUTH_CONFIG = {
  // SHA-256 hash da senha (injetado em build time)
  // Nunca armazena a senha literal
  PASSWORD_HASH: process.env.NEXT_PUBLIC_AUTH_HASH || '',

  // Sal público (usado para derivar hash no cliente)
  SALT: 'com.diegodemorais.dashboard.v1.2026',

  // Token expiry: 7 days
  TOKEN_EXPIRY_DAYS: 7,

  // Storage keys
  STORAGE_KEY_TOKEN: 'dashboard_auth_token',
  STORAGE_KEY_EXPIRY: 'dashboard_auth_expiry',
};
