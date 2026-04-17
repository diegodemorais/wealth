'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface ChartCardProps {
  /** Card title displayed as h3 above the chart */
  title?: React.ReactNode;
  /** Extra class names applied to the outer div */
  className?: string;
  /** Inline styles applied to the outer div */
  style?: React.CSSProperties;
  children: React.ReactNode;
}

/**
 * Unified chart card wrapper — standardizes the bg-card / border / rounded / p-4 / mb-5
 * pattern that appears across all chart components.
 *
 * Usage:
 *   <ChartCard title="My Chart">
 *     <EChart ... />
 *   </ChartCard>
 */
export function ChartCard({ title, className, style, children }: ChartCardProps) {
  return (
    <div
      className={cn('bg-card border border-border rounded-md p-4 mb-5', className)}
      style={style}
    >
      {title && (
        <h3 className="text-sm font-semibold text-foreground mb-4 mt-0">{title}</h3>
      )}
      {children}
    </div>
  );
}
