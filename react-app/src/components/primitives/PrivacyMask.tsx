'use client';

import { useUiStore } from '@/store/uiStore';
import { ReactNode } from 'react';

export interface PrivacyMaskProps {
  children: ReactNode;
  fallback?: string;
}

export function PrivacyMask({ children, fallback = '••••' }: PrivacyMaskProps) {
  const privacyMode = useUiStore(s => s.privacyMode);

  if (privacyMode) {
    return <span className="pv" style={styles.masked}>{fallback}</span>;
  }

  return <span>{children}</span>;
}

const styles: Record<string, React.CSSProperties> = {
  masked: {
    filter: 'blur(4px)',
    userSelect: 'none',
  },
};
