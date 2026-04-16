'use client';

import { useUiStore } from '@/store/uiStore';
import { fmtPct } from '@/utils/formatters';

// Compact BRL formatter for hero display (e.g. R$3.59M)
function fmtBrlCompact(val: number): string {
  if (val >= 1_000_000) return `R$${(val / 1e6).toFixed(2)}M`;
  if (val >= 1_000) return `R$${Math.round(val / 1000)}k`;
  return `R$${Math.round(val)}`;
}

// Compact USD formatter for hero display (e.g. $695k)
function fmtUsdCompact(val: number): string {
  if (val >= 1_000_000) return `$${(val / 1e6).toFixed(2)}M`;
  if (val >= 1_000) return `$${Math.round(val / 1000)}k`;
  return `$${Math.round(val)}`;
}

export interface KpiHeroProps {
  networth: number;
  networthUsd: number;
  fireProgress: number; // 0-1
  yearsToFire: number;
  pfire: number; // 0-1, probability of FIRE
  cambio?: number;
  fireStatus?: 'on-track' | 'warning' | 'critical';
  fireYearBase?: number;
  fireAgeBase?: number;
  fireYearAspir?: number;
  fireAgeAspir?: number;
  firePatrimonioGatilho?: number;
}

export function KpiHero({
  networth,
  networthUsd,
  fireProgress,
  yearsToFire,
  pfire,
  cambio = 5.156,
  fireStatus = 'on-track',
  fireYearBase,
  fireAgeBase,
  fireYearAspir,
  fireAgeAspir,
  firePatrimonioGatilho,
}: KpiHeroProps) {
  const privacyMode = useUiStore(s => s.privacyMode);

  // Format years and months for "14a 0m" format
  const yearsInt = Math.floor(yearsToFire);
  const monthsInt = Math.round((yearsToFire - yearsInt) * 12);
  const yearsMonthsStr = `${yearsInt}a ${monthsInt}m`;

  // USD percentage of net worth (for subtitle "63% em USD")
  const usdPct = networthUsd && cambio && networth
    ? Math.round(((networthUsd * cambio) / networth) * 100)
    : null;

  // Compact display values
  const networthCompact = fmtBrlCompact(networth);
  const networthUsdCompact = networthUsd ? fmtUsdCompact(networthUsd) : null;

  // Fire subtitle: "Base: 2040 (53 anos) · Aspir: 2038 (49a)"
  const fireSubtitle = (() => {
    const parts: string[] = [];
    if (fireYearBase && fireAgeBase) parts.push(`Base: ${fireYearBase} (${fireAgeBase} anos)`);
    if (fireYearAspir && fireAgeAspir) parts.push(`Aspir: ${fireYearAspir} (${fireAgeAspir}a)`);
    return parts.join(' · ') || undefined;
  })();

  // Gatilho subtitle: "vs gatilho R$X.XM"
  const gatilhoSubtitle = firePatrimonioGatilho
    ? `vs gatilho ${fmtBrlCompact(firePatrimonioGatilho)}`
    : undefined;

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2.5 mb-4">
      {/* Card 1: Patrimônio Total */}
      <div className="kpi kpi-fire text-center border-l-4" style={{ borderLeftColor: 'var(--accent)' }}>
        <div className="kpi-label">Patrimônio Total</div>
        <div className="kpi-value text-4xl font-black mt-1 mb-0.5" style={{ fontSize: '2rem' }}>
          {privacyMode ? '••••' : networthCompact}
        </div>
        <div className="kpi-sub">
          {privacyMode ? '••••' : (usdPct != null ? `${usdPct}% em USD` : `${networthUsdCompact ? networthUsdCompact : '—'} em USD`)}
        </div>
      </div>

      {/* Card 2: Anos até FIRE */}
      <div className="kpi text-center border-l-4" style={{ borderLeftColor: 'var(--accent)' }}>
        <div className="kpi-label">Anos até FIRE</div>
        <div className="kpi-value font-black mt-1 mb-0.5" style={{ fontSize: '2rem' }}>
          {privacyMode ? '••••' : yearsMonthsStr}
        </div>
        {fireSubtitle && (
          <div className="kpi-sub" style={{ fontSize: '0.6rem' }}>
            {privacyMode ? '••••' : fireSubtitle}
          </div>
        )}
      </div>

      {/* Card 3: Progresso FIRE */}
      <div className="kpi text-center" style={{ borderTop: '3px solid var(--yellow)', borderRadius: 'var(--radius-md)' }}>
        <div className="kpi-label">Progresso FIRE</div>
        <div className="kpi-value font-black mt-1 mb-0.5" style={{ fontSize: '2rem', color: 'rgba(234,179,8,0.9)' }}>
          {privacyMode ? '••••' : fmtPct(fireProgress, 1)}
        </div>
        {gatilhoSubtitle && (
          <div className="kpi-sub" style={{ fontSize: '0.6rem' }}>
            {privacyMode ? '••••' : gatilhoSubtitle}
          </div>
        )}
      </div>
    </div>
  );
}
