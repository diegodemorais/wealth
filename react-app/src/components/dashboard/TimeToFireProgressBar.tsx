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

  // Format years and months for "14a 0m" format
  const yearsInt = Math.floor(yearsToFire);
  const monthsInt = Math.round((yearsToFire - yearsInt) * 12);
  const yearsMonthsStr = `${yearsInt}a ${monthsInt}m`;

  // Clamp to 0-100
  const progressPct = Math.min(Math.max(fireProgress, 0), 1) * 100;

  return (
    <section className="bg-slate-900/50 border border-slate-700/40 rounded-lg p-4 mb-3.5">
      <h2 className="m-0 mb-3 text-base font-semibold text-slate-100">Time to FIRE</h2>

      {/* Progress Bar Container */}
      <div className="h-6 rounded overflow-hidden mb-1 bg-slate-700/30 shadow-lg" style={{ boxShadow: '0 2px 8px rgba(59, 130, 246, 0.1)' }}>
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${progressPct}%`,
            background: 'linear-gradient(90deg, var(--accent) 0%, var(--purple) 100%)',
          }}
        />
      </div>

      {/* Label below bar */}
      <div className="text-xs text-slate-500 mb-1 text-right">
        {privacyMode ? '••••' : yearsMonthsStr} restantes
      </div>

      {/* Secondary info: percentage */}
      <div className="text-sm font-medium text-blue-400 text-right">
        {privacyMode ? '••••' : fmtPct(fireProgress, 2)}
      </div>
    </section>
  );
}
