'use client';

import { useAuthStore } from '@/store/authStore';
import { DASHBOARD_VERSION, BUILD_DATE } from '@/config/version';

function fmtBrt(iso: string): string {
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit', month: '2-digit', year: '2-digit',
      hour: '2-digit', minute: '2-digit',
    }) + ' BRT';
  } catch { return iso; }
}

export function LoginScreen() {
  const { initiateOAuthLogin, loginError, clearError } = useAuthStore();

  const handleGitHubLogin = () => {
    if (loginError) clearError();
    initiateOAuthLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-3xl font-black mb-2 text-accent">Wealth</div>
            <div className="text-sm text-muted">Dashboard Financeiro Pessoal</div>
          </div>

          {/* OAuth Info */}
          <div className="bg-blue-400/10 border border-blue-400/30 rounded px-3 py-2 mb-6">
            <p className="text-xs text-blue-200">
              ℹ️ Login seguro via GitHub (sua senha nunca é armazenada aqui)
            </p>
          </div>

          {/* GitHub Login Button */}
          <button
            onClick={handleGitHubLogin}
            className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-text font-semibold rounded flex items-center justify-center gap-2 transition"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.603-3.369-1.343-3.369-1.343-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.544 2.914 1.19.092-.926.35-1.557.636-1.913-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0110 4.617c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.137 18.192 20 14.435 20 10.017 20 4.484 15.522 0 10 0z" clipRule="evenodd" />
            </svg>
            Entrar com GitHub
          </button>

          {/* Error Message */}
          {loginError && (
            <div className="mt-4 text-xs text-red-400 bg-red-400/10 border border-red-400/30 rounded px-3 py-2">
              {loginError}
            </div>
          )}

          {/* Version Info */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <div className="text-xs text-muted text-center" style={{ fontFamily: 'monospace' }}>
              v{DASHBOARD_VERSION} · {fmtBrt(BUILD_DATE)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
