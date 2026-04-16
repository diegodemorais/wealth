'use client';

import { useUiStore } from '@/store/uiStore';
import { fmtPct } from '@/utils/formatters';

export interface TimeToFireProgressBarProps {
  fireProgress: number; // 0-1 (e.g., 0.2477 for 24.77%)
  yearsToFire: number; // decimal years (e.g., 14.0)
}

export function TimeToFireProgressBar({
  fireProgress,
  yearsToFire,
}: TimeToFireProgressBarProps) {
  const privacyMode = useUiStore(s => s.privacyMode);

  // Format years and months
  const yearsInt = Math.floor(yearsToFire);
  const monthsInt = Math.round((yearsToFire - yearsInt) * 12);
  const yearsLabel = `${yearsInt} ${yearsInt === 1 ? 'ano' : 'anos'} ${monthsInt} ${monthsInt === 1 ? 'mês' : 'meses'}`;

  // Target year: current year + ceil(years to fire)
  const currentYear = new Date().getFullYear();
  const targetYear = currentYear + Math.ceil(yearsToFire);
  const targetAge = 39 + Math.ceil(yearsToFire); // Diego: 39 anos em 2026
  const subtitleStr = `· ${targetYear} (${targetAge} anos)`;

  // Clamp to 0-100
  const progressPct = Math.min(Math.max(fireProgress, 0), 1) * 100;

  return (
    <section className="bg-bg/50 border border-border/40 rounded py-6 px-5 mb-3.5">
      {/* Label */}
      <div className="text-xs uppercase font-semibold text-muted mb-2 tracking-widest">Time to FIRE</div>

      {/* HERO: big number */}
      <div className="mb-1">
        <div
          className="font-black text-accent leading-none"
          style={{ fontSize: '4rem', lineHeight: 1 }}
        >
          {privacyMode ? '••••' : yearsLabel}
        </div>
        {!privacyMode && (
          <div className="text-2xl font-semibold text-muted mt-2">
            {subtitleStr}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mt-5 h-5 rounded overflow-hidden bg-slate-700/30 shadow-lg" style={{ boxShadow: '0 2px 8px rgba(59, 130, 246, 0.1)' }}>
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${progressPct}%`,
            background: 'linear-gradient(90deg, var(--accent) 0%, var(--purple) 100%)',
          }}
        />
      </div>

      {/* Progress label */}
      <div className="flex justify-between items-center mt-1.5">
        <div className="text-xs text-slate-500">
          {privacyMode ? '••••' : `${progressPct.toFixed(1)}% do caminho`}
        </div>
        <div className="text-xs font-medium text-accent">
          {privacyMode ? '••••' : fmtPct(fireProgress, 2)}
        </div>
      </div>
    </section>
  );
}
