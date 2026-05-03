'use client';

/**
 * NowHeroStrips — extraído de page.tsx em DEV-now-refactor.
 * Renderiza 3 mini-strips abaixo do KpiHero:
 *   1. P(FIRE) casal (C9)
 *   2. Guardrail zona + factor signal + AUM alerts (G1/G2/G13)
 *   3. Factor drought semáforo + loadings agregados (C4/C5)
 */
import { fmtPrivacy } from '@/utils/privacyTransform';

interface NowHeroStripsProps {
  data: any;
  privacyMode: boolean;
}

export function NowHeroStrips({ data, privacyMode }: NowHeroStripsProps) {
  return (
    <>
      <PfireCasalStrip data={data} privacyMode={privacyMode} />
      <GuardrailFactorStrip data={data} privacyMode={privacyMode} />
      <FactorDroughtLoadingsStrip data={data} />
    </>
  );
}

function PfireCasalStrip({ data, privacyMode }: { data: any; privacyMode: boolean }) {
  const pfireCasalBase: number | null = data?.pfire_by_profile?.casado?.base ?? null;
  if (pfireCasalBase == null) return null;
  const inssKatia: number = data?.premissas?.inss_katia_anual ?? 0;
  const pCasalColor = pfireCasalBase >= 85 ? 'var(--green)' : pfireCasalBase >= 75 ? 'var(--yellow)' : 'var(--red)';
  return (
    <div
      data-testid="pfire-casal-strip"
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 12px', marginBottom: 8, background: 'var(--card)', borderRadius: 6, border: '1px solid var(--border)', fontSize: 'var(--text-xs)' }}
    >
      <span style={{ color: 'var(--muted)' }}>💍 Cenário casal:</span>
      <span style={{ fontWeight: 700, color: pCasalColor }}>{privacyMode ? '••%' : `P(FIRE) ${pfireCasalBase.toFixed(1)}%`}</span>
      {inssKatia > 0 && <span style={{ color: 'var(--muted)' }}>· incl. INSS Katia {fmtPrivacy(inssKatia, privacyMode)}/ano</span>}
    </div>
  );
}

function GuardrailFactorStrip({ data, privacyMode }: { data: any; privacyMode: boolean }) {
  const sg = data?.spending_guardrails;
  const fs = data?.factor_signal;
  const swrP50Pct = data?.fire_swr_percentis?.swr_p50_pct as number | null ?? null;
  const zonaColor = sg?.zona === 'verde' ? 'var(--green)' : sg?.zona === 'amarelo' ? 'var(--yellow)' : sg?.zona === 'vermelho' ? 'var(--red)' : 'var(--muted)';
  const zonaLabel = sg?.zona === 'verde' ? 'Zona Verde' : sg?.zona === 'amarelo' ? 'Zona Amarela' : sg?.zona === 'vermelho' ? 'Zona Vermelha' : null;
  const showGuardrail = sg?.zona != null;
  const showFactor = fs?.avgs_ytd_pct != null && fs?.swrd_ytd_pct != null;
  const etfs = data?.etf_composition?.etfs as Record<string, Record<string, unknown>> | null ?? null;
  const aumAlerts: Array<{ ticker: string; aumEur: number; status: string }> = etfs
    ? Object.entries(etfs)
        .filter(([, e]) => e?.aum_status === 'amarelo' || e?.aum_status === 'vermelho')
        .map(([ticker, e]) => ({ ticker, aumEur: e.aum_eur as number, status: e.aum_status as string }))
    : [];
  if (!showGuardrail && !showFactor && aumAlerts.length === 0) return null;
  return (
    <div
      data-testid="guardrail-factor-strip"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
        padding: '7px 12px',
        marginBottom: 10,
        background: 'var(--card2)',
        borderRadius: 6,
        border: '1px solid var(--border)',
        fontSize: 'var(--text-xs)',
      }}
    >
      {showGuardrail && (
        <span data-testid="guardrail-zona" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: zonaColor, display: 'inline-block', flexShrink: 0 }} />
          <span style={{ color: zonaColor, fontWeight: 700 }}>{zonaLabel}</span>
          {swrP50Pct != null && (
            <span style={{ color: 'var(--muted)' }}>· SWR P50 {privacyMode ? '••%' : `${swrP50Pct.toFixed(2)}%`}</span>
          )}
        </span>
      )}
      {showGuardrail && showFactor && (
        <span style={{ color: 'var(--border)', userSelect: 'none' }}>|</span>
      )}
      {showFactor && !privacyMode && (
        <span data-testid="factor-signal-strip" style={{ color: 'var(--muted)' }}>
          <span style={{ color: 'var(--green)', fontWeight: 600 }}>AVGS {fs.avgs_ytd_pct >= 0 ? '+' : ''}{fs.avgs_ytd_pct.toFixed(1)}%</span>
          {' YTD · '}
          <span>SWRD {fs.swrd_ytd_pct >= 0 ? '+' : ''}{fs.swrd_ytd_pct.toFixed(1)}%</span>
          {fs.excess_ytd_pp != null && (
            <span style={{ color: 'var(--green)' }}>{` · excess +${fs.excess_ytd_pp.toFixed(1)}pp`}</span>
          )}
        </span>
      )}
      {aumAlerts.length > 0 && (showGuardrail || showFactor) && (
        <span style={{ color: 'var(--border)', userSelect: 'none' }}>|</span>
      )}
      {aumAlerts.map(alert => (
        <span
          key={alert.ticker}
          data-testid={`aum-alert-${alert.ticker.toLowerCase()}`}
          style={{ color: alert.status === 'vermelho' ? 'var(--red)' : 'var(--yellow)', fontWeight: 600 }}
        >
          ⚠ {alert.ticker} AUM €{Math.round(alert.aumEur / 1_000_000)}M
        </span>
      ))}
    </div>
  );
}

function FactorDroughtLoadingsStrip({ data }: { data: any }) {
  const fr = data?.factor_rolling;
  const fl = data?.factor_loadings;
  if (!fr && !fl) return null;

  const droughtMonths: number = fr?.drought_months ?? 0;
  const factorStatus: string = fr?.status ?? 'green';
  const droughtColor = factorStatus === 'red' || droughtMonths >= 18 ? 'var(--red)'
    : factorStatus === 'amber' || droughtMonths >= 9 ? 'var(--yellow)'
    : 'var(--green)';
  const droughtLabel = droughtMonths >= 18 ? '🔴' : droughtMonths >= 9 ? '🟡' : '🟢';

  const pesos = data?.pesosTarget ?? {};
  const wSwrd = pesos.SWRD ?? 0.50;
  const wAvgs = pesos.AVGS ?? 0.30;
  const wAvem = pesos.AVEM ?? 0.20;
  const equityTotal = wSwrd + wAvgs + wAvem;
  const flSwrd = fl?.SWRD ?? {};
  const flAvuv = fl?.AVUV ?? {};
  const flAvdv = fl?.AVDV ?? {};
  const flEimi = fl?.EIMI ?? {};
  const avgsProxy: Record<string, number> = {};
  for (const k of ['smb', 'hml', 'rmw', 'cma']) {
    if (flAvuv[k] != null && flAvdv[k] != null) {
      avgsProxy[k] = 0.58 * flAvuv[k] + 0.42 * flAvdv[k];
    }
  }
  const hasProxy = Object.keys(avgsProxy).length > 0;
  const aggLoading = (fKey: string): number | null => {
    const s = flSwrd[fKey];
    const ag = avgsProxy[fKey];
    const em = flEimi[fKey];
    if (s == null) return null;
    let total = 0; let covered = 0;
    if (s != null) { total += (wSwrd / equityTotal) * s; covered += wSwrd / equityTotal; }
    if (ag != null && hasProxy) { total += (wAvgs / equityTotal) * ag; covered += wAvgs / equityTotal; }
    if (em != null) { total += (wAvem / equityTotal) * em; covered += wAvem / equityTotal; }
    return covered > 0.3 ? total / covered : null;
  };
  const aggSmb = aggLoading('smb');
  const aggHml = aggLoading('hml');
  const aggRmw = aggLoading('rmw');
  const fmtLoading = (v: number | null) => v != null ? (v >= 0 ? '+' : '') + v.toFixed(2) : '—';
  const loadingColor = (v: number | null, positive = true) =>
    v == null ? 'var(--muted)' : (positive ? v > 0.1 : v < -0.1) ? 'var(--green)'
    : (positive ? v < -0.05 : v > 0.05) ? 'var(--red)' : 'var(--text)';

  return (
    <div
      data-testid="factor-drought-loadings-strip"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
        padding: '7px 12px',
        marginBottom: 10,
        background: 'var(--card)',
        borderRadius: 6,
        border: '1px solid var(--border)',
        fontSize: 'var(--text-xs)',
      }}
    >
      {fr && (
        <span data-testid="factor-drought-semaforo" style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600 }}>
          <span>{droughtLabel}</span>
          <span style={{ color: droughtColor }}>Drought: {droughtMonths}m</span>
          <span style={{ color: 'var(--muted)', fontWeight: 400 }}>
            {droughtMonths === 0 ? '· fator ativo' : `· ${droughtMonths >= 18 ? 'revisar tese' : droughtMonths >= 9 ? 'monitorar' : 'ok'}`}
          </span>
        </span>
      )}
      {fr && (aggSmb != null || aggHml != null) && (
        <span style={{ color: 'var(--border)', userSelect: 'none' }}>|</span>
      )}
      {(aggSmb != null || aggHml != null || aggRmw != null) && (
        <span data-testid="factor-loadings-aggregate" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)' }}>
          <span style={{ color: 'var(--muted)', fontWeight: 500 }}>Portfolio β:</span>
          {aggSmb != null && (
            <span style={{ color: loadingColor(aggSmb, true), fontWeight: 600 }}>SMB {fmtLoading(aggSmb)}</span>
          )}
          {aggHml != null && (
            <span style={{ color: loadingColor(aggHml, true), fontWeight: 600 }}>HML {fmtLoading(aggHml)}</span>
          )}
          {aggRmw != null && (
            <span style={{ color: loadingColor(aggRmw, true), fontWeight: 600 }}>RMW {fmtLoading(aggRmw)}</span>
          )}
        </span>
      )}
    </div>
  );
}
