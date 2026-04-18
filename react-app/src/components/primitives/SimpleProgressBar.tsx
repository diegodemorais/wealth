'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SimpleProgressBarProps {
  /** Value 0–100 */
  value: number;
  /** CSS color string; default 'var(--accent)' */
  color?: string;
  /** Tailwind height class for the track; default 'h-1.5' */
  height?: string;
  /** Extra Tailwind classes for the outer wrapper */
  className?: string;
}

/**
 * SimpleProgressBar — minimal filled progress bar primitive.
 * For bars with markers, thresholds, or zone overlays, use inline implementation.
 */
export function SimpleProgressBar({ value, color = 'var(--accent)', height = 'h-1.5', className }: SimpleProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={cn(height, 'bg-card2/40 rounded-sm overflow-hidden', className)}>
      <div
        className={cn(height, 'rounded-sm transition-all duration-500')}
        style={{ width: `${clampedValue}%`, background: color }}
      />
    </div>
  );
}
