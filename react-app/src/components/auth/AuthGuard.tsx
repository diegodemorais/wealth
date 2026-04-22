'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { LoginScreen } from './LoginScreen';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, validateToken } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Validate token on mount (e.g., after page refresh)
    const isValid = validateToken();
    setIsReady(true);
  }, [validateToken]);

  // Wait for hydration
  if (!isReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-muted">Carregando...</div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Show dashboard if authenticated
  return <>{children}</>;
}
