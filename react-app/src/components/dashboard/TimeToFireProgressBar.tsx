'use client';

import { useUiStore } from '@/store/uiStore';
import { decimalYearsToYearsMonths } from '@/utils/time';
import { fmtPrivacy } from '@/utils/privacyTransform';

export interface TimeToFireProgressBarProps {
  fireProgress: number;       // 0-1
  yearsToFire: number;        // decimal years
  patrimonioAtual?: number;
  patrimonioGatilho?: number;
  swrFireDay?: number;        // decimal (e.g., 0.0281)
}

export function TimeToFireProgressBar({
  fireProgress,
  yearsToFire,
  patrimonioAtual,
  patrimonioGatilho,
  swrFireDay,
}: TimeToFireProgressBarProps) {
  const { privacyMode } = useUiStore();

  const yearsLabel = decimalYearsToYearsMonths(yearsToFire).long;
  const currentYear = new Date().getFullYear();
  const targetYear = currentYear + Math.ceil(yearsToFire);
  const targetAge = 39 + Math.ceil(yearsToFire); // Diego: 39 anos em 2026

  const progressPct = Math.min(Math.max(fireProgress, 0), 1) * 100;

  const progressColor =
    fireProgress >= 0.8 ? 'var(--green)' :
    fireProgress >= 0.6 ? 'var(--yellow)' :
    'var(--accent)';

  return (
    <section className="bg-card border border-border/50 rounded py-5 px-5 mb-3.5">
      {/* Hero row: anos restantes + % */}
      <div className="flex items-baseline justify-between gap-4 mb-1">
        <div>
          <div className="font-black text-accent leading-none" style={{ fontSize: '2.2rem', lineHeight: 1 }}>
            {yearsLabel}
          </div>
          {!privacyMode && (
            <div className="text-sm font-medium text-muted mt-1">
              {targetYear} · {targetAge} anos
            </div>
          )}
        </div>
        <div className="text-right">
          <div
            className="font-black leading-none"
            style={{ fontSize: '2.2rem', lineHeight: 1, color: progressColor }}
          >
            {(fireProgress * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-muted mt-1">do caminho</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-5 rounded overflow-hidden bg-slate-700/30" style={{ boxShadow: '0 2px 8px rgba(59,130,246,0.1)' }}>
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${progressPct}%`,
            background: 'linear-gradient(90deg, var(--accent) 0%, var(--purple) 100%)',
          }}
        />
      </div>

      {/* Patrimônio labels */}
      {patrimonioAtual != null && patrimonioGatilho != null && (
        <div className="relative mt-1.5" style={{ height: 18 }}>
          <span className="absolute left-0 text-xs text-slate-500">Início</span>
          {!privacyMode && (
            <span
              className="absolute text-xs text-accent font-semibold whitespace-nowrap"
              style={{ left: `${Math.min(progressPct, 88)}%`, transform: 'translateX(-50%)' }}
            >
              Atual {patrimonioAtual >= 1e6
                ? `R$${(patrimonioAtual / 1e6).toFixed(2)}M`
                : `R$${Math.round(patrimonioAtual / 1000)}k`}
            </span>
          )}
          <span className="absolute right-0 text-xs text-slate-500 whitespace-nowrap">
            Meta {!privacyMode
              ? (patrimonioGatilho >= 1e6
                  ? `R$${(patrimonioGatilho / 1e6).toFixed(1)}M`
                  : `R$${Math.round(patrimonioGatilho / 1000)}k`)
              : fmtPrivacy(patrimonioGatilho, true)}
          </span>
        </div>
      )}

      {/* SWR */}
      {swrFireDay != null && (
        <div className="flex justify-between items-center text-xs mt-3 pt-2.5 border-t border-border/30">
          <span className="text-muted">SWR projetada no FIRE Day</span>
          <span className="font-bold text-sm" style={{ color: swrFireDay <= 0.03 ? 'var(--green)' : swrFireDay <= 0.035 ? 'var(--yellow)' : 'var(--red)' }}>
            {(swrFireDay * 100).toFixed(2)}% · meta ≤ 3.0%
          </span>
        </div>
      )}
    </section>
  );
}
