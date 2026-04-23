'use client';

import React from 'react';
import { fmtPrivacy } from '@/utils/privacyTransform';

interface ScenarioBadgeProps {
  label: string;
  gasto: number;
  privacyMode: boolean;
}

/**
 * ScenarioBadge — inline pill tag that reflects the active scenario.
 * Shows scenario label + annual cost (hidden in privacy mode).
 * Privacy mode: passed as a prop — caller decides what to mask.
 */
export function ScenarioBadge({ label, gasto, privacyMode }: ScenarioBadgeProps) {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      marginBottom: 8,
      padding: '3px 8px',
      borderRadius: 999,
      background: 'rgba(99,179,237,.10)',
      border: '1px solid rgba(99,179,237,.3)',
      fontSize: '11px',
      color: 'var(--accent)',
      fontWeight: 600,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
      {label} · {privacyMode ? '••••' : `R$${(gasto / 1000).toFixed(0)}k/ano`}
    </div>
  );
}
