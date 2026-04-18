'use client';

import React from 'react';

interface InfoCardProps {
  label: string;
  value: string | React.ReactNode;
  description?: string | React.ReactNode;
  accentColor?: string;  // CSS color, ex: 'var(--green)'. Se omitido, sem borderLeft
  size?: 'md' | 'lg';   // md = 1.5rem, lg = 2rem (default md)
  bg?: string;           // default 'var(--card2)'
  className?: string;
}

export function InfoCard({ label, value, description, accentColor, size = 'md', bg = 'var(--card2)', className }: InfoCardProps) {
  return (
    <div
      className={className}
      style={{
        background: bg,
        borderRadius: '8px',
        padding: '14px 16px',
        border: '1px solid var(--border)',
        ...(accentColor ? { borderLeft: `4px solid ${accentColor}` } : {}),
      }}
    >
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ fontSize: size === 'lg' ? '2rem' : '1.5rem', fontWeight: 800, color: accentColor ?? 'var(--text)', lineHeight: 1.1, marginBottom: '4px' }}>
        {value}
      </div>
      {description && (
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
          {description}
        </div>
      )}
    </div>
  );
}
