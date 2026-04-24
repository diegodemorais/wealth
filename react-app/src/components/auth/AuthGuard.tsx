'use client';

import { useAuthStore } from '@/store/authStore';
import { LoginScreen } from './LoginScreen';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <>{children}</>;
}
