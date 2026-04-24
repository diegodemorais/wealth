'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { exchangeCodeForToken, loginError } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        // OAuth error from GitHub
        console.error('OAuth error:', error);
        router.push('/');
        return;
      }

      if (!code) {
        // No code returned
        router.push('/');
        return;
      }

      // Exchange code for token
      const success = await exchangeCodeForToken(code);

      if (success) {
        // Redirect to dashboard
        router.push('/');
      } else {
        // Stay on this page, show error
        setIsProcessing(false);
      }
    };

    processCallback();
  }, [searchParams, router, exchangeCodeForToken]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {isProcessing ? (
          <>
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent mb-4"></div>
            <p className="text-text mb-2">Processando autenticação...</p>
            <p className="text-xs text-muted">Você será redirecionado em breve</p>
          </>
        ) : (
          <>
            <p className="text-red-400 mb-4">{loginError || 'Erro ao autenticar'}</p>
            <a href="/" className="text-accent hover:underline text-sm">
              Voltar para login
            </a>
          </>
        )}
      </div>
    </div>
  );
}
