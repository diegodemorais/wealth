'use client';

import { useEffect, useState } from 'react';
import { useUiStore } from '@/store/uiStore';

/**
 * Hook to manage privacy mode with localStorage persistence
 * and DOM class application
 */
export function usePrivacyMode() {
  const [mounted, setMounted] = useState(false);
  const privacyMode = useUiStore(s => s.privacyMode);
  const togglePrivacy = useUiStore(s => s.togglePrivacy);
  const setPrivacy = useUiStore(s => s.setPrivacy);

  // Apply privacy mode to body element
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

  // Return before mount to prevent hydration mismatch
  if (!mounted) {
    return {
      privacyMode: false,
      togglePrivacy,
      setPrivacy,
    };
  }

  return {
    privacyMode,
    togglePrivacy,
    setPrivacy,
  };
}
