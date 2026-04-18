'use client';

/**
 * SectionLabel — consistent section/group heading label.
 *
 * Replaces the repeated pattern:
 *   <div className="text-xs uppercase font-semibold text-muted mb-1.5 tracking-widest">
 *     Label text
 *   </div>
 *
 * Props:
 *   children  — the label text
 *   mb        — bottom margin class suffix (default '1.5', use '2' for tighter groupings)
 *   className — extra Tailwind classes (merged)
 */

import React from 'react';

export interface SectionLabelProps {
  children: React.ReactNode;
  mb?: '1' | '1.5' | '2' | '3';
  className?: string;
}

export function SectionLabel({ children, mb = '1.5', className = '' }: SectionLabelProps) {
  return (
    <div
      className={`text-xs uppercase font-semibold text-muted tracking-widest mb-${mb} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
