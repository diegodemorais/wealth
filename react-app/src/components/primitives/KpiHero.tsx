'use client';

import { useUiStore } from '@/store/uiStore';
import { fmtPct, fmtBrlCompact } from '@/utils/formatters';
import { fmtPrivacy } from '@/utils/privacyTransform';
import { decimalYearsToYearsMonths } from '@/utils/time';
import { canonicalizePFire } from '@/utils/pfire-canonical';

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
  pfireFav?: number | null;   // G3: fav scenario % (e.g. 91.1)
  pfireStress?: number | null; // G3: stress scenario % (e.g. 78.7)
  cambio?: number;
  fireStatus?: 'on-track' | 'warning' | 'critical';
  fireYearBase?: number;
  fireAgeBase?: number;
  fireYearAspir?: number;
  fireAgeAspir?: number;
  firePatrimonioGatilho?: number;
  fireDateFormatted?: string; // e.g. "Abr/2040"
  // DC3 — IIFPT gap note: shows when RM or Est coverage < 0.3
  domainCoverageRm?: number | null;
  domainCoverageEst?: number | null;
}

export function KpiHero({
  networth,
  networthUsd,
  fireProgress,
  yearsToFire,
  pfire,
  pfireFav = null,
  pfireStress = null,
  cambio = 5.156,
  fireStatus = 'on-track',
  fireYearBase,
  fireAgeBase,
  fireYearAspir,
  fireAgeAspir,
  firePatrimonioGatilho,
  fireDateFormatted,
  domainCoverageRm,
  domainCoverageEst,
}: KpiHeroProps) {
  const privacyMode = useUiStore(s => s.privacyMode);

  // Format years and months for "14a 0m" format
  const yearsMonthsStr = decimalYearsToYearsMonths(yearsToFire).short;

  // USD percentage of net worth (for subtitle "63% em USD")
  const usdPct = networthUsd && cambio && networth
    ? Math.round(((networthUsd * cambio) / networth) * 100)
    : null;

  // Compact display values
  const networthCompact = fmtBrlCompact(networth, 2);
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
    ? `vs gatilho ${fmtBrlCompact(firePatrimonioGatilho, 2)}`
    : undefined;

  // DC3: gap note — shown if RM or Est coverage < 0.3
  const showGapNote = (domainCoverageRm != null && domainCoverageRm < 0.3)
    || (domainCoverageEst != null && domainCoverageEst < 0.3);
  const gapNoteText = (() => {
    const parts: string[] = [];
    if (domainCoverageRm != null && domainCoverageRm < 0.3) parts.push('RM ❌');
    if (domainCoverageEst != null && domainCoverageEst < 0.3) parts.push('Est ⏳');
    return parts.join(' ') + ' não modelados';
  })();

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2.5 mb-4">
      {/* Card 1: Patrimônio Total */}
      <div className="kpi kpi-fire text-center border-l-4" style={{ borderLeftColor: 'var(--accent)' }}>
        <div className="kpi-label">Patrimônio Total</div>
        <div className="kpi-value text-4xl font-black mt-1 mb-0.5" style={{ fontSize: '2rem' }} data-testid="patrimonio-total">
          {privacyMode ? 'R$ ••••' : networthCompact}
        </div>
        <div className="kpi-sub">
          {usdPct != null ? `${usdPct}% em USD` : (privacyMode ? '$ ••••' : `${networthUsdCompact ? networthUsdCompact : '—'} em USD`)}
        </div>
      </div>

      {/* Card 2: Anos até FIRE */}
      <div className="kpi text-center border-l-4" style={{ borderLeftColor: 'var(--accent)' }}>
        <div className="kpi-label">Anos até FIRE</div>
        <div className="kpi-value font-black mt-1 mb-0.5" style={{ fontSize: '2rem' }}>
          {yearsMonthsStr}
        </div>
        <div className="kpi-sub">
          {fireDateFormatted ?? fireSubtitle ?? null}
        </div>
      </div>

      {/* Card 3: Progresso FIRE */}
      <div className="kpi text-center border-l-4" style={{ borderLeftColor: 'var(--yellow)' }}>
        <div className="kpi-label">Progresso FIRE</div>
        <div className="kpi-value font-black mt-1 mb-0.5" style={{ fontSize: '2rem', color: 'rgba(234,179,8,0.9)' }}>
          {fmtPct(fireProgress, 1)}
        </div>
        {gatilhoSubtitle && (
          <div className="kpi-sub">
            {privacyMode && firePatrimonioGatilho ? `vs gatilho ${fmtPrivacy(firePatrimonioGatilho, true)}` : gatilhoSubtitle}
          </div>
        )}
        {/* DC3: IIFPT gap note — P(FIRE) modela apenas Inv+Ret; RM e Est fora do modelo */}
        {showGapNote && !privacyMode && (
          <div
            data-testid="iifpt-gap-note"
            title="P(FIRE) modela Investment + Retirement. RM e Estate não estão incluídos."
            style={{
              marginTop: 6,
              fontSize: 10,
              color: 'var(--muted)',
              lineHeight: 1.3,
              cursor: 'help',
            }}
          >
            {gapNoteText}
          </div>
        )}
      </div>

      {/* Card 4: P(FIRE) base — G3: mostra fav/stress como contexto */}
      {pfire > 0 && (
        <div className="kpi text-center border-l-4" style={{ borderLeftColor: 'var(--green)' }} data-testid="pfire-base-hero">
          <div className="kpi-label">P(FIRE)</div>
          <div
            className="kpi-value font-black mt-1 mb-0.5"
            style={{
              fontSize: '2rem',
              color: pfire >= 0.9 ? 'var(--green)' : pfire >= 0.8 ? 'var(--yellow)' : 'var(--red)',
            }}
            data-testid="pfire-base-value"
          >
            {privacyMode ? '••%' : canonicalizePFire(pfire, 'mc').percentStr}
          </div>
          {(pfireFav != null || pfireStress != null) && !privacyMode && (
            <div
              className="kpi-sub"
              data-testid="pfire-fav-stress"
              style={{ fontSize: 10, color: 'var(--muted)', lineHeight: 1.4 }}
            >
              {pfireFav != null && `fav ${pfireFav.toFixed(1)}%`}
              {pfireFav != null && pfireStress != null && ' · '}
              {pfireStress != null && `stress ${pfireStress.toFixed(1)}%`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
