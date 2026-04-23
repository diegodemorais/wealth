'use client';

import { useUiStore } from '@/store/uiStore';
import { ReactNode } from 'react';
import { pvMoney } from '@/utils/privacyTransform';

export interface PrivacyMaskProps {
  children: ReactNode;
  /** If provided, transforms the numeric value instead of masking */
  value?: number;
  /** Format function for the transformed value */
  format?: (v: number) => string;
  /** Legacy fallback for non-numeric content */
  fallback?: string;
}

export function PrivacyMask({ children, value, format, fallback = '••••' }: PrivacyMaskProps) {
  const privacyMode = useUiStore(s => s.privacyMode);

  if (!privacyMode) {
    return <span>{children}</span>;
  }

  // If numeric value provided, transform it (preserves proportions)
  if (value != null && format) {
    const transformed = pvMoney(value);
    return <span>{format(transformed)}</span>;
  }

  // Legacy: mask with ••••
  return <span className="pv" style={styles.masked}>{fallback}</span>;
}

const styles: Record<string, React.CSSProperties> = {
  masked: {
    filter: 'blur(4px)',
    userSelect: 'none',
  },
};
