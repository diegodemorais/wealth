import React from 'react';
import { cn } from '@/lib/utils';
import { TooltipInfo } from '@/components/primitives/Tooltip';

export interface MetricCardProps {
  /** Card title / label (can include a semaphore dot node) */
  label: string | React.ReactNode;
  /** Main value displayed prominently */
  value: string | React.ReactNode;
  /** Optional sub-label below the value */
  sub?: string | React.ReactNode;
  /**
   * Visual size variant:
   * - 'md' (default): p-4, text-2xl — used in primary KPI grids
   * - 'sm': p-3, text-xl — used in secondary / context grids
   */
  size?: 'sm' | 'md';
  /**
   * When true: adds border-2 border-accent/40 and colors the value with text-accent.
   * When false (default): uses border border-border/50.
   */
  accent?: boolean;
  /**
   * When true: adds left border 4px solid var(--accent) for visual accent.
   * Used in primary KPI grids to highlight critical metrics.
   */
  accentLeftBorder?: boolean;
  /**
   * Optional Tailwind color class applied to the value element.
   * Overrides the accent coloring when provided (e.g. 'text-green', 'text-red').
   */
  valueColor?: string;
  /** Extra Tailwind classes applied to the wrapper div */
  className?: string;
  /** data-testid for Playwright assertions */
  'data-testid'?: string;
  /**
   * Tooltip explicativo do KPI (popover ao hover/focus do ícone Info).
   * Privacy: caller é responsável por mascarar R$/USD literais antes de passar.
   */
  tooltip?: string | React.ReactNode;
}

/**
 * MetricCard — reusable label / value / sub-label card primitive.
 *
 * Extracts the repeating pattern:
 *   <div class="bg-card border* rounded p-* text-center">
 *     <div class="text-xs uppercase ...">LABEL</div>
 *     <div class="text-*xl font-black ...">VALUE</div>
 *     <div class="text-xs text-muted ...">SUB</div>
 *   </div>
 *
 * Privacy mode: the caller is responsible for masking sensitive values
 * before passing them as props. This component has no privacy logic.
 */
export function MetricCard({
  label,
  value,
  sub,
  size = 'md',
  accent = false,
  accentLeftBorder = false,
  valueColor,
  className,
  'data-testid': dataTestId,
  tooltip,
}: MetricCardProps) {
  const isMd = size === 'md';

  const wrapperCls = cn(
    'bg-card rounded text-center',
    isMd ? 'p-4' : 'p-3',
    accent
      ? 'border-2 border-accent/40'
      : 'border border-border/50',
    accentLeftBorder && 'border-l-4',
    className,
  );

  // Apply left border color when accentLeftBorder is true
  const style = accentLeftBorder
    ? { borderLeftColor: 'var(--accent)' }
    : undefined;

  const valueCls = cn(
    'font-black',
    isMd ? 'text-2xl' : 'text-xl',
    // Priority: explicit valueColor > accent default > text-text fallback
    valueColor ?? (accent ? 'text-accent' : 'text-text'),
  );

  return (
    <div className={wrapperCls} data-testid={dataTestId} style={style}>
      <div className="text-xs uppercase font-semibold text-muted mb-1 tracking-widest flex items-center justify-center gap-1">
        {label}
        {tooltip != null && (
          <TooltipInfo
            content={tooltip}
            data-testid="metric-card-tooltip"
            ariaLabel={typeof label === 'string' ? `Informação sobre ${label}` : 'Mais informações'}
          />
        )}
      </div>
      <div className={valueCls}>{value}</div>
      {sub != null && (
        <div className="text-xs text-muted mt-1">{sub}</div>
      )}
    </div>
  );
}
