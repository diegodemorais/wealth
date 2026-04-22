'use client';

import { useState } from 'react';
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
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, loginError, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(password);

    setIsLoading(false);

    if (success) {
      setPassword('');
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (loginError) {
      clearError();
    }
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-muted mb-2">
                Senha de Acesso
              </label>
              <input
                type="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                disabled={isLoading}
                autoFocus
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded text-text placeholder-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent disabled:opacity-50 transition"
              />
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/30 rounded px-3 py-2">
                {loginError}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !password}
              className="w-full px-4 py-3 bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-semibold rounded transition"
            >
              {isLoading ? 'Validando...' : 'Acessar Dashboard'}
            </button>
          </form>

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
