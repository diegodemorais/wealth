'use client';

import React from 'react';

interface LabelValueRowProps {
  label: string;
  value: string | React.ReactNode;
  labelClass?: string;
  valueClass?: string;
  className?: string;
}

/**
 * LabelValueRow — consistent label→value row with space-between layout.
 * Replaces the repeated pattern:
 *   <div className="flex justify-between items-baseline gap-2">
 *     <span className="text-muted-foreground text-xs">{label}</span>
 *     <span className="font-semibold text-xs text-right">{value}</span>
 *   </div>
 *
 * Privacy mode: caller is responsible for masking values — no privacy logic here.
 */
export function LabelValueRow({ label, value, labelClass = '', valueClass = '', className = '' }: LabelValueRowProps) {
  return (
    <div className={`flex justify-between items-baseline gap-2 ${className}`.trim()}>
      <span className={`text-muted-foreground text-xs ${labelClass}`.trim()}>{label}</span>
      <span className={`font-semibold text-xs text-right ${valueClass}`.trim()}>{value}</span>
    </div>
  );
}
