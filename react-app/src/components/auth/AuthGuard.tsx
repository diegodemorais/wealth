'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { LoginScreen } from './LoginScreen';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, validateToken } = useAuthStore();
  // mounted evita hydration mismatch: server não tem cookie, browser tem
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Re-valida token depois que o browser hidratou — lê cookie no contexto correto
    validateToken();
    setMounted(true);
  }, [validateToken]);

  // Aguarda hidratação para evitar flash de login screen quando autenticado
  if (!mounted) return null;

  if (!isAuthenticated) return <LoginScreen />;

  return <>{children}</>;
}
