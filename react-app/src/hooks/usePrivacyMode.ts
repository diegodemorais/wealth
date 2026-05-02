'use client';

import { useEffect, useState } from 'react';
import { useUiStore } from '@/store/uiStore';

/**
 * Read privacyMode synchronously from the persist store on first paint.
 *
 * Without this, mounted=false at SSR/hydration would return false and any
 * component reading `privacyMode` flashes real values for one frame before
 * the store hydrates from localStorage. DEV-privacy-deep-fix.
 */
function getInitialPrivacyMode(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const stored = window.localStorage.getItem('dashboard-ui-store');
    if (!stored) return false;
    const parsed = JSON.parse(stored);
    return Boolean(parsed?.state?.privacyMode);
  } catch {
    return false;
  }
}

/**
 * Hook to manage privacy mode with localStorage persistence
 * and DOM class application.
 *
 * SSR safety: initial render reads localStorage synchronously to avoid
 * flashing real values before the Zustand persist store rehydrates.
 */
export function usePrivacyMode() {
  // Read sync from localStorage so SSR/hydration paint masks immediately.
  const [initialMode] = useState<boolean>(getInitialPrivacyMode);
  const [mounted, setMounted] = useState(false);
  const privacyMode = useUiStore(s => s.privacyMode);
  const togglePrivacy = useUiStore(s => s.togglePrivacy);
  const setPrivacy = useUiStore(s => s.setPrivacy);

  // Apply privacy mode class to <html> when state changes
  useEffect(() => {
    setMounted(true);

    if (typeof window !== 'undefined') {
      const body = document.documentElement;
      if (privacyMode) {
        body.classList.add('privacy-mode');
      } else {
        body.classList.remove('privacy-mode');
      }
    }
  }, [privacyMode]);

  // Before zustand hydrates (mounted=false), trust the synchronous read.
  // This avoids the one-frame flash of real values in privacy mode.
  return {
    privacyMode: mounted ? privacyMode : initialMode,
    togglePrivacy,
    setPrivacy,
  };
}
