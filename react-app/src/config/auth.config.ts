/**
 * Authentication Configuration
 * Senha é verificada via SHA-256 hash com sal público
 * Sal: 'com.diegodemorais.dashboard.v1.2026'
 */

export const AUTH_CONFIG = {
  PASSWORD_HASH: process.env.NEXT_PUBLIC_AUTH_HASH || '',
  SALT: 'com.diegodemorais.dashboard.v1.2026',
  TOKEN_EXPIRY_DAYS: 30, // era 7, aumentar para 30
  STORAGE_KEY_TOKEN: 'dashboard_auth_token',
  STORAGE_KEY_EXPIRY: 'dashboard_auth_expiry',
};
