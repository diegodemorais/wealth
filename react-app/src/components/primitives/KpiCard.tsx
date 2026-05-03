'use client';

import React from 'react';
import { TooltipInfo } from '@/components/primitives/Tooltip';

/**
 * KpiCard — KPI primitive with hero value, optional delta chip, inline progress bar, sub text.
 *
 * Usado em NOW (CAGR Real) e PERFORMANCE (strip de 4). Mais expressivo que
 * MetricCard (que é centered). KpiCard é left-aligned, com hierarquia de
 * valor hero + chip de delta + progress opcional.
 */

export interface KpiCardProps {
  label: string;
  value: string;
  /** Cor do valor + border-left accent. Ex: 'var(--green)' */
  accent: string;
  /** Chip de delta inline (ex: '+2.5pp vs 4.5%') */
  delta?: { text: string; positive?: boolean };
  /** Barra de progresso 0..1 (opcional) */
  progress?: number;
  /** Texto descritivo abaixo */
  sub?: string;
  /** Tooltip explicativo (popover ao lado do label). Não vaza R$ literais. */
  tooltip?: React.ReactNode;
  /** data-testid no wrapper */
  'data-testid'?: string;
}

export function KpiCard({ label, value, accent, delta, progress, sub, tooltip, 'data-testid': dataTestId }: KpiCardProps) {
  return (
    <div
      data-testid={dataTestId}
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderLeft: `3px solid ${accent}`,
        borderRadius: 'var(--radius-md)',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        minHeight: 118,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 'var(--text-xs)',
          color: 'var(--muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          fontWeight: 600,
        }}
      >
        <span>{label}</span>
        {tooltip != null && (
          <TooltipInfo
            content={tooltip}
            data-testid="metric-card-tooltip"
            ariaLabel={`Informação sobre ${label}`}
          />
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
        <div
          style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: accent,
            lineHeight: 1.05,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value}
        </div>
        {delta && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: 'var(--radius-sm)',
              background: `color-mix(in srgb, ${delta.positive ? 'var(--green)' : 'var(--red)'} 14%, transparent)`,
              color: delta.positive ? 'var(--green)' : 'var(--red)',
              letterSpacing: '0.02em',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {delta.text}
          </span>
        )}
      </div>

      {progress != null && (
        <div
          aria-hidden
          style={{
            height: 4,
            background: 'color-mix(in srgb, var(--border) 60%, transparent)',
            borderRadius: 2,
            overflow: 'hidden',
            marginTop: 2,
          }}
        >
          <div
            style={{
              width: `${Math.max(0, Math.min(1, progress)) * 100}%`,
              height: '100%',
              background: accent,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      )}

      {sub && (
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 'auto' }}>
          {sub}
        </div>
      )}
    </div>
  );
}
