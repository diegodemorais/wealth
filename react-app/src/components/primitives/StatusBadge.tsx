'use client';

import React from 'react';
import { getStatusStyle } from '@/utils/statusStyles';

interface StatusBadgeProps {
  /** Status key — e.g. 'ATIVO', 'PAUSADO', 'SEMPRE', 'on_track', 'verde', etc. */
  status: string;
  /** Override the displayed label (default = status as-is) */
  label?: string;
  /** xs = 0.7rem, sm = 0.75rem (default xs) */
  size?: 'xs' | 'sm';
  className?: string;
}

/**
 * StatusBadge — consistent pill badge for status indicators.
 * Uses getStatusStyle internally for color mapping.
 * Privacy mode: caller is responsible for masking — this component has no privacy logic.
 */
export function StatusBadge({ status, label, size = 'xs', className }: StatusBadgeProps) {
  const style = getStatusStyle(status);
  const fontSize = size === 'sm' ? '0.75rem' : '0.7rem';

  return (
    <span
      className={className}
      style={{
        display: 'inline-block',
        fontSize,
        padding: '2px 8px',
        borderRadius: '4px',
        border: `1px solid ${style.border}`,
        background: style.bg,
        color: style.color,
        fontWeight: 600,
      }}
    >
      {label ?? status}
    </span>
  );
}
