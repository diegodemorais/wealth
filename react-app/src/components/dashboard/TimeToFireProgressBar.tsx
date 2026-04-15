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
    <section className="mb-8 p-4 rounded border bg-slate-900/40 border-slate-700/25">
      <h2 className="m-0 mb-4 text-base font-semibold text-slate-200">Time to FIRE</h2>

      {/* Progress Bar Container */}
      <div className="h-6 rounded overflow-hidden mb-2 bg-slate-700/20 shadow-lg" style={{ boxShadow: '0 2px 8px rgba(59, 130, 246, 0.1)' }}>
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${progressPct}%`,
            background: 'linear-gradient(90deg, #3b82f6 0%, #a855f7 100%)',
          }}
        />
      </div>

      {/* Label below bar */}
      <div className="text-xs text-slate-500 mb-2 text-right">
        {privacyMode ? '••••' : yearsMonthsStr} restantes
      </div>

      {/* Secondary info: percentage */}
      <div className="text-sm font-medium text-blue-400 text-right">
        {privacyMode ? '••••' : fmtPct(fireProgress, 2)}
      </div>
    </section>
  );
}
