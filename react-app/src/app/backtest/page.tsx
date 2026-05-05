'use client';

import { useState, useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { usePageData } from '@/hooks/usePageData';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { secOpen, secTitle } from '@/config/dashboard.config';
import { BacktestChart, AllocationSeriesSpec } from '@/components/charts/BacktestChart';
import { BacktestR7Chart } from '@/components/charts/BacktestR7Chart';
import { Button } from '@/components/ui/button';
import { pageStateElement } from '@/components/primitives/PageStateGuard';
import DrawdownHistoryChart from '@/components/dashboard/DrawdownHistoryChart';
import DrawdownRecoveryTable from '@/components/dashboard/DrawdownRecoveryTable';
import { BtcIndicatorsChart } from '@/components/dashboard/BtcIndicatorsChart';
import { SectionDivider } from '@/components/primitives/SectionDivider';
import { DrawdownExtendedChart } from '@/components/charts/DrawdownExtendedChart';
import { TrendingDown, BarChart3 } from 'lucide-react';
import { ExpectedReturnWaterfall } from '@/components/dashboard/ExpectedReturnWaterfall';
import ETFFactorComposition from '@/components/dashboard/ETFFactorComposition';
import { RiskReturnScatter } from '@/components/charts/RiskReturnScatter';
import { BRFireSimSection } from './BRFireSimSection';
import { EChart } from '@/components/primitives/EChart';
import { EC } from '@/utils/echarts-theme';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { fmtPrivacy } from '@/utils/privacyTransform';
import { fmtBrlPrivate } from '@/utils/formatters';
import { useConfig } from '@/hooks/useConfig';
import { yearsFrom } from '@/utils/time';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

interface BtcIndicatorsData {
  generated_at: string;
  ma200w: {
    current_price_usd: number;
    ma200w_usd: number;
    pct_above_ma: number;
    zone: string;
    last_touch_below: string | null;
    series: Array<{ date: string; price_usd: number; ma200w_usd: number; growth_rate_pct: number }>;
  };
  mvrv_zscore: {
    current_value: number;
    signal: string;
    zone: string;
    market_cap_usd: number | null;
    realized_cap_usd: number | null;
    series: Array<{ date: string; zscore: number; market_cap_usd?: number | null; realized_cap_usd?: number | null }>;
    thresholds: Record<string, number>;
    z_range?: { min: number; max: number };
    note?: string;
  };
  errors?: string[] | null;
}

function useBtcIndicators() {
  const [btcData, setBtcData] = useState<BtcIndicatorsData | null>(null);
  const [btcError, setBtcError] = useState<string | null>(null);
  useEffect(() => {
    fetch(`${BASE_PATH}/btc_indicators.json`)
      .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
      .then((d: BtcIndicatorsData) => {
        if (!d.ma200w || !d.mvrv_zscore) throw new Error('Dados BTC incompletos');
        setBtcData(d);
      })
      .catch((e: Error) => setBtcError(e.message));
  }, []);
  return { btcData, btcError };
}

// ── Period button types ───────────────────────────────────────────────────────

type AllocPeriod = '1m' | '3m' | 'ytd' | '1y' | '3y' | 'all';
// LongoPeriod — period selector for BacktestLongoSection (R7 chart, 1995–present)
// Long historical periods restored: since2009, since2013, since2020, 5y (all supported by R7 data)
type LongoPeriod = '1m' | '3m' | 'ytd' | '1y' | '3y' | 'since2020' | 'since2013' | 'since2009' | '5y' | 'all';

// ── Allocation-total 5-series spec (approved DEV-shadow-allocation-series) ────
// Colors: protagonist uses EC.accent (area), others use distinct palette
const ALLOCATION_SERIES: AllocationSeriesSpec[] = [
  { name: 'Atual com Legados', key: 'atual_com_legados', color: EC.accent, area: true, style: 'solid' },
  // target_alocacao_total: dashed pre-2024-12 (proxy), solid post (see BacktestChart PROXY_CUTOFF logic)
  { name: 'Target (alocação total)', key: 'target_alocacao_total', color: EC.muted, style: 'solid' },
  { name: 'Shadow A (VWRA)', key: 'shadow_a', color: EC.green, style: 'dashed' },
  { name: 'Shadow B (100% IPCA+)', key: 'shadow_b', color: EC.yellow, style: 'dashed' },
  { name: 'Shadow C (benchmark justo)', key: 'shadow_c', color: EC.purple, style: 'dashed' },
];

const ALLOC_PERIODS: { key: AllocPeriod; label: string; title: string }[] = [
  { key: '1m',  label: '1m',  title: 'Último mês' },
  { key: '3m',  label: '3m',  title: 'Últimos 3 meses' },
  { key: 'ytd', label: 'YTD', title: 'Ano corrente (desde jan)' },
  { key: '1y',  label: '1a',  title: 'Últimos 12 meses' },
  { key: '3y',  label: '3a',  title: 'Últimos 3 anos' },
  { key: 'all', label: 'All', title: 'Série completa — desde abr/2021' },
];


// Period selector for BacktestLongoSection (R7 chart covers 1995–present, supports all historical windows)
// Long periods restored: since2020, since2013, since2009, 5y — dynamically labeled with yearsFrom()
const _longoHoje = new Date();
const _longoAteLabel = _longoHoje.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace(' de ', '/');
const _ySince2020L = yearsFrom('2020-01-01', _longoHoje);
const _ySince2013L = yearsFrom('2013-01-01', _longoHoje);
const _ySince2009L = yearsFrom('2009-01-01', _longoHoje);

const LONGO_PERIODS: { key: LongoPeriod; label: string; title: string }[] = [
  { key: '1m',        label: '1m',                                   title: 'Último mês' },
  { key: '3m',        label: '3m',                                   title: 'Últimos 3 meses' },
  { key: 'ytd',       label: 'YTD',                                  title: 'Ano corrente (desde jan)' },
  { key: '1y',        label: '1a',                                   title: 'Últimos 12 meses' },
  { key: '3y',        label: '3a',                                   title: 'Últimos 3 anos' },
  { key: '5y',        label: '5a',                                   title: 'Últimos 5 anos' },
  { key: 'since2020', label: `Pós-COVID (${_ySince2020L}a)`,         title: `jan/2020–${_longoAteLabel} · desde o fundo de março 2020` },
  { key: 'since2013', label: `Pós-Euro (${_ySince2013L}a)`,          title: `jan/2013–${_longoAteLabel} · pós-crise da dívida europeia` },
  { key: 'since2009', label: `Pós-GFC (${_ySince2009L}a)`,           title: `jan/2009–${_longoAteLabel} · desde o fundo da crise de 2008` },
  { key: 'all',       label: 'All (R7)',                             title: 'Série completa R7 — desde jan/1995' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtPct(v: number | null | undefined, dec = 2) {
  if (v == null || isNaN(v)) return '—';
  return `${v >= 0 ? '+' : ''}${v.toFixed(dec)}%`;
}

function deltaColor(v: number | null | undefined) {
  if (v == null) return 'var(--muted)';
  return v >= 0 ? 'var(--green)' : 'var(--red)';
}

// ── Allocation metrics calculation ────────────────────────────────────────────

const MONTHS_PT_SHORT = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];

/** Format a YYYY-MM string as "mai/2026" */
function fmtYm(ym: string): string {
  const [y, m] = ym.split('-');
  return MONTHS_PT_SHORT[parseInt(m, 10) - 1] + '/' + y;
}

/** Compute start YM for AllocPeriod or LongoPeriod relative to the last available date in the series */
function allocStartYm(period: AllocPeriod | LongoPeriod, lastDate: string): string {
  // Fixed anchor periods (not relative to lastDate)
  if (period === 'since2009') return '2009-01';
  if (period === 'since2013') return '2013-01';
  if (period === 'since2020') return '2020-01';
  // 'all' for AllocPeriod (allocation series starts 2021-04); LongoPeriod 'all' maps to R7 start (clamped by chart)
  if (period === 'all') return '1995-01';
  const [ly, lm] = lastDate.split('-').map(Number);
  const lastYear = ly;
  const lastMonth = lm;
  if (period === '1m') {
    const d = new Date(lastYear, lastMonth - 2, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
  if (period === '3m') {
    const d = new Date(lastYear, lastMonth - 4, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
  if (period === 'ytd') return `${lastYear}-01`;
  if (period === '1y') {
    const d = new Date(lastYear - 1, lastMonth - 1, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
  if (period === '3y') {
    const d = new Date(lastYear - 3, lastMonth - 1, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
  if (period === '5y') {
    const d = new Date(lastYear - 5, lastMonth - 1, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
  return '1995-01';
}

/** Slice a dated series to the window [startYm, …] and rebase to 100 */
function sliceAndRebase(dates: string[], values: number[], startYm: string): { dates: string[]; values: number[] } {
  // Clamp to series minimum
  const clampedStart = startYm < dates[0] ? dates[0] : startYm;
  const idx = dates.findIndex(d => d >= clampedStart);
  if (idx < 0) return { dates: [], values: [] };
  const slicedDates = dates.slice(idx);
  const slicedVals = values.slice(idx);
  const base = slicedVals[0] ?? 100;
  return { dates: slicedDates, values: slicedVals.map(v => (v / base) * 100) };
}

interface SeriesMetrics {
  totalReturn: number;   // total return % in period
  cagr: number;          // annualised
  vol: number;           // annualised std dev of monthly returns %
  maxdd: number;         // max drawdown % (negative)
  sharpe: number;        // (CAGR - rfRate) / vol
  alpha: number | null;  // vs Shadow C benchmark (pp), null for Shadow C itself
}

const RISK_FREE_RATE = 10.5; // % p.a. — hardcode per spec (Selic/IPCA+ proxy)

function computeMetrics(values: number[], benchmarkValues: number[] | null, isBenchmark: boolean): SeriesMetrics {
  if (values.length < 2) return { totalReturn: 0, cagr: 0, vol: 0, maxdd: 0, sharpe: 0, alpha: null };

  // Total return
  const totalReturn = (values[values.length - 1] / values[0] - 1) * 100;

  // CAGR
  const nMonths = values.length - 1;
  const nYears = nMonths / 12;
  const cagr = nYears > 0 ? ((values[values.length - 1] / values[0]) ** (1 / nYears) - 1) * 100 : 0;

  // Monthly returns for vol
  const monthlyRets: number[] = [];
  for (let i = 1; i < values.length; i++) {
    monthlyRets.push((values[i] / values[i - 1] - 1) * 100);
  }
  const mean = monthlyRets.reduce((a, b) => a + b, 0) / monthlyRets.length;
  const variance = monthlyRets.reduce((a, b) => a + (b - mean) ** 2, 0) / (monthlyRets.length - 1);
  const vol = Math.sqrt(variance * 12); // annualised

  // Max drawdown
  let peak = values[0];
  let maxdd = 0;
  for (const v of values) {
    if (v > peak) peak = v;
    const dd = (v / peak - 1) * 100;
    if (dd < maxdd) maxdd = dd;
  }

  // Sharpe
  const sharpe = vol > 0 ? (cagr - RISK_FREE_RATE) / vol : 0;

  // Alpha vs Shadow C
  let alpha: number | null = null;
  if (!isBenchmark && benchmarkValues && benchmarkValues.length >= 2) {
    const benchReturn = (benchmarkValues[benchmarkValues.length - 1] / benchmarkValues[0] - 1) * 100;
    const benchNYears = (benchmarkValues.length - 1) / 12;
    const benchCagr = benchNYears > 0 ? ((benchmarkValues[benchmarkValues.length - 1] / benchmarkValues[0]) ** (1 / benchNYears) - 1) * 100 : 0;
    alpha = cagr - benchCagr;
  }

  return { totalReturn, cagr, vol, maxdd, sharpe, alpha };
}

/** TER and TER All-in values per series (constant — not period-dependent) */
const ALLOC_SERIES_COSTS: Record<string, { ter: number; terAllin: number }> = {
  // Atual com Legados: legacy mix, use wellness_config current_ter
  atual_com_legados: { ter: 0.211, terAllin: 0.511 },
  // Target: equity 79% × blend + RF 15% × 0 + HODL 3% × 0.20 + Renda+ 3% × 0
  // Equity blend: SWRD 50% × 0.38% + AVGS 30% × 0.707% + AVEM 20% × 1.184% = 0.658% all-in
  // Total all-in: 0.79 × 0.658% + 0.03 × 0.20% = 0.526% (approx)
  target_alocacao_total: { ter: 0.247, terAllin: 0.526 },
  // Shadow A: VWRA ≈ SWRD in cost, using SWRD proxy
  shadow_a: { ter: 0.20, terAllin: 0.20 },
  // Shadow B: 100% IPCA+ — government bond, zero TER
  shadow_b: { ter: 0.0, terAllin: 0.0 },
  // Shadow C: 79% VWRA + 15% IPCA+ + 3% HODL11 + 3% Renda+ (benchmark justo)
  // 0.79 × 0.20 + 0.03 × 0.20 = 0.164%  (IPCA+/Renda+ zero TER)
  shadow_c: { ter: 0.207, terAllin: 0.22 },
};


/** Format a number with fixed decimals and optional sign; handles null → "—" */
function fmtNum(v: number | null | undefined, dec = 2, sign = false): string {
  if (v == null || isNaN(v as number)) return '—';
  const s = (v as number).toFixed(dec);
  return sign && (v as number) >= 0 ? '+' + s : s;
}

// ── Allocation Total — 5-series histórico (DEV-shadow-allocation-series) ─────

function AllocationHistoricoSection() {
  const data = useDashboardStore(s => s.data);
  const [period, setPeriod] = useState<AllocPeriod>('all');

  // Only render when allocation data is present
  const alloc = (data as any)?.backtest?.allocation;
  if (!alloc?.dates?.length) return null;

  const allDates: string[] = alloc.dates ?? [];
  const lastDate: string = allDates[allDates.length - 1] ?? '2026-05';

  // Compute period window for display
  const startYm = allocStartYm(period, lastDate);
  // Clamp start to series minimum
  const effectiveStart = startYm < allDates[0] ? allDates[0] : startYm;
  const periodLabel = `${fmtYm(effectiveStart)} → ${fmtYm(lastDate)}`;

  // Compute per-series metrics for the selected window
  const shadowCRaw: number[] = alloc['shadow_c'] ?? [];
  const { values: benchSliced } = sliceAndRebase(allDates, shadowCRaw, effectiveStart);

  const allocMetrics: Record<string, SeriesMetrics> = {};
  for (const s of ALLOCATION_SERIES) {
    const raw: number[] = alloc[s.key] ?? [];
    const { values: sliced } = sliceAndRebase(allDates, raw, effectiveStart);
    const isBench = s.key === 'shadow_c';
    allocMetrics[s.key] = computeMetrics(sliced, isBench ? null : benchSliced, isBench);
  }

  // Determine best series per metric row (for bold highlight)
  type MetricKey = 'totalReturn' | 'cagr' | 'vol' | 'maxdd' | 'sharpe' | 'alpha';
  // For vol and maxdd, lower is better (most negative = worst DD)
  const metricHigherIsBetter: Record<MetricKey, boolean> = {
    totalReturn: true, cagr: true, vol: false, maxdd: false, sharpe: true, alpha: true,
  };

  function bestSeriesKey(mKey: MetricKey): string | null {
    let bestKey: string | null = null;
    let bestVal: number = metricHigherIsBetter[mKey] ? -Infinity : Infinity;
    for (const s of ALLOCATION_SERIES) {
      const v = allocMetrics[s.key]?.[mKey];
      if (v == null) continue;
      if (metricHigherIsBetter[mKey] ? v > bestVal : v < bestVal) {
        bestVal = v;
        bestKey = s.key;
      }
    }
    return bestKey;
  }

  const colStyle = (key: string, color: string, isBest: boolean) => ({
    padding: '5px 8px',
    textAlign: 'right' as const,
    color: isBest ? color : undefined,
    fontWeight: isBest ? (700 as const) : undefined,
  });

  return (
    <div data-testid="allocation-historico">
      <CollapsibleSection
        id="backtest-allocation-total"
        title={secTitle('backtest', 'backtest-allocation-total', 'Shadow Portfolios — Alocação Total (série histórica)')}
        defaultOpen={secOpen('backtest', 'backtest-allocation-total', true)}
      >
        {/* Period buttons + period label */}
        <div style={{ marginBottom: '10px' }}>
          <div className="period-btns" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
            {ALLOC_PERIODS.map(p => (
              <Button
                key={p.key}
                variant={period === p.key ? 'default' : 'outline'}
                size="sm"
                title={p.title}
                onClick={() => setPeriod(p.key)}
              >
                {p.label}
              </Button>
            ))}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', fontStyle: 'italic' }}>
            Período: <strong style={{ color: 'var(--text)' }}>{periodLabel}</strong>
          </div>
        </div>

        {/* 5-series chart */}
        {data && (
          <BacktestChart
            data={data}
            period={period}
            height={320}
            series={ALLOCATION_SERIES}
          />
        )}

        {/* Metrics table */}
        <div style={{ overflowX: 'auto', marginTop: 14 }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 6 }}>
            Métricas — período: <strong style={{ color: 'var(--text)' }}>{periodLabel}</strong>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-xs)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '5px 8px', color: 'var(--muted)', fontWeight: 600, minWidth: 90 }}>Métrica</th>
                {ALLOCATION_SERIES.map(s => (
                  <th key={s.key} style={{ textAlign: 'right', padding: '5px 8px', color: s.color, fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {s.name.replace(' (alocação total)', '').replace(' (benchmark justo)', '').replace(' (100% IPCA+)', ' (IPCA+)').replace(' (VWRA)', '')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Rentabilidade */}
              {(() => {
                const mk: MetricKey = 'totalReturn';
                const best = bestSeriesKey(mk);
                return (
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '5px 8px', color: 'var(--muted)' }}>Rentabilidade</td>
                    {ALLOCATION_SERIES.map(s => {
                      const v = allocMetrics[s.key]?.totalReturn;
                      return (
                        <td key={s.key} style={colStyle(s.key, s.color, s.key === best)}>
                          {fmtPct(v)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })()}
              {/* CAGR */}
              {(() => {
                const mk: MetricKey = 'cagr';
                const best = bestSeriesKey(mk);
                return (
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '5px 8px', color: 'var(--muted)' }}>CAGR</td>
                    {ALLOCATION_SERIES.map(s => {
                      const v = allocMetrics[s.key]?.cagr;
                      return (
                        <td key={s.key} style={colStyle(s.key, s.color, s.key === best)}>
                          {fmtPct(v)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })()}
              {/* Volatilidade */}
              {(() => {
                const mk: MetricKey = 'vol';
                const best = bestSeriesKey(mk);
                return (
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '5px 8px', color: 'var(--muted)' }}>Volatilidade</td>
                    {ALLOCATION_SERIES.map(s => {
                      const v = allocMetrics[s.key]?.vol;
                      return (
                        <td key={s.key} style={colStyle(s.key, s.color, s.key === best)}>
                          {fmtNum(v)}%
                        </td>
                      );
                    })}
                  </tr>
                );
              })()}
              {/* Max DD */}
              {(() => {
                const mk: MetricKey = 'maxdd';
                const best = bestSeriesKey(mk);
                return (
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '5px 8px', color: 'var(--muted)' }}>Max DD</td>
                    {ALLOCATION_SERIES.map(s => {
                      const v = allocMetrics[s.key]?.maxdd;
                      return (
                        <td key={s.key} style={{ ...colStyle(s.key, s.color, s.key === best), color: s.key === best ? s.color : 'var(--red)' }}>
                          {fmtNum(v, 2, false)}%
                        </td>
                      );
                    })}
                  </tr>
                );
              })()}
              {/* Sharpe */}
              {(() => {
                const mk: MetricKey = 'sharpe';
                const best = bestSeriesKey(mk);
                return (
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '5px 8px', color: 'var(--muted)' }}>Sharpe</td>
                    {ALLOCATION_SERIES.map(s => {
                      const v = allocMetrics[s.key]?.sharpe;
                      return (
                        <td key={s.key} style={colStyle(s.key, s.color, s.key === best)}>
                          {fmtNum(v)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })()}
              {/* Alpha vs Shadow C */}
              {(() => {
                const mk: MetricKey = 'alpha';
                const best = bestSeriesKey(mk);
                return (
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '5px 8px', color: 'var(--muted)' }}>Alpha vs C</td>
                    {ALLOCATION_SERIES.map(s => {
                      const v = allocMetrics[s.key]?.alpha;
                      if (s.key === 'shadow_c') {
                        return <td key={s.key} style={{ padding: '5px 8px', textAlign: 'right', color: 'var(--muted)' }}>—</td>;
                      }
                      return (
                        <td key={s.key} style={{ ...colStyle(s.key, s.color, s.key === best), color: s.key === best ? s.color : deltaColor(v) }}>
                          {v != null ? fmtNum(v, 2, true) + 'pp' : '—'}
                        </td>
                      );
                    })}
                  </tr>
                );
              })()}
              {/* TER */}
              <tr style={{ borderBottom: '1px solid var(--border)', opacity: 0.85 }}>
                <td style={{ padding: '5px 8px', color: 'var(--muted)', fontStyle: 'italic' }}>TER (anual)</td>
                {ALLOCATION_SERIES.map(s => {
                  const costs = ALLOC_SERIES_COSTS[s.key];
                  return (
                    <td key={s.key} style={{ padding: '5px 8px', textAlign: 'right', color: 'var(--muted)' }}>
                      {costs != null ? costs.ter.toFixed(3) + '%' : '—'}
                    </td>
                  );
                })}
              </tr>
              {/* TER All-in */}
              <tr style={{ opacity: 0.85 }}>
                <td style={{ padding: '5px 8px', color: 'var(--muted)', fontStyle: 'italic' }}>TER All-in</td>
                {ALLOCATION_SERIES.map(s => {
                  const costs = ALLOC_SERIES_COSTS[s.key];
                  return (
                    <td key={s.key} style={{ padding: '5px 8px', textAlign: 'right', color: 'var(--muted)' }}>
                      {costs != null ? costs.terAllin.toFixed(3) + '%' : '—'}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 4, fontStyle: 'italic' }}>
            Sharpe: rf = {RISK_FREE_RATE}% a.a. (proxy Selic/IPCA+) · TER All-in inclui tracking difference estimada · Alpha = CAGR série − CAGR Shadow C
          </div>
        </div>

        {/* Legend / methodology note */}
        <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(88,166,255,0.06)', border: '1px solid rgba(88,166,255,0.15)', borderRadius: 6, fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
          <strong style={{ color: 'var(--text)' }}>Séries (alocação total, rebase 100 em abr/2021):</strong>{' '}
          <span style={{ color: EC.accent }}>Atual com Legados</span> — TWR real (Modified Dietz) incl. transitórios e RF ·{' '}
          <span style={{ color: EC.muted }}>Target</span> — 79% equity (50/30/20) + 15% IPCA+ + 3% HODL11 + 3% Renda+ 2065 (tracejado = proxy pré-2024-12) ·{' '}
          <span style={{ color: EC.green }}>Shadow A</span> — 100% VWRA ·{' '}
          <span style={{ color: EC.yellow }}>Shadow B</span> — 100% IPCA+ 2040 ·{' '}
          <span style={{ color: EC.purple }}>Shadow C</span> — benchmark justo (79% VWRA + 15% IPCA+ + 3% HODL11 + 3% Renda+)
        </div>

        {/* Footer anti-regret — obrigatório per spec */}
        <div
          data-testid="allocation-footer-anti-regret"
          style={{
            marginTop: 10,
            padding: '8px 12px',
            background: 'rgba(234,179,8,0.08)',
            border: '1px solid rgba(234,179,8,0.25)',
            borderLeft: '3px solid var(--yellow)',
            borderRadius: 6,
            fontSize: 'var(--text-xs)',
            color: 'var(--muted)',
          }}
        >
          ⚠ Realizar gap Atual→Target = IR 15% sobre ganho que destrói premium fatorial líquido (alpha 0.16%/ano)
        </div>

        <div className="src" style={{ marginTop: 8 }}>
          Fonte: dados/allocation_series.json · TWR Modified Dietz · proxies acadêmicos pré-2024-12 (URTH/DFSVX/DISVX/DFEMX) · BRL · rebase 100 = abr/2021
        </div>
      </CollapsibleSection>
    </div>
  );
}

// ── Regime Histórico R7 — period-selectable chart + 8-metric table ────────────
// Target equity vs R7 Benchmark (MSCI World regimes since 1995).
// Standard 6-button period selector: 1m · 3m · YTD · 1a · 3a · All
// Full 8-metric table per spec: Rentabilidade, CAGR, Vol, Max DD, Sharpe, Alpha, TER, TER All-in

/** TER costs for the R7 chart (Target equity vs R7 Benchmark — academic index, no ETF TER) */
const R7_SERIES_COSTS = {
  // Target equity portfolio: SWRD 50% × 0.38 + AVGS 30% × 0.707 + AVEM 20% × 1.184 = 0.658% all-in
  target: { ter: 0.247, terAllin: 0.658 },
  // R7 Benchmark: MSCI World NR index — no ETF wrapper, academic proxy
  bench: { ter: 0.0, terAllin: 0.0 },
};

function BacktestLongoSection() {
  const data = useDashboardStore(s => s.data);
  const [period, setPeriod] = useState<LongoPeriod>('all');

  // backtest_r7 is at top-level of data; cumulative_returns has YYYY-MM-DD dates
  const r7 = data?.backtest_r7 ?? null;

  // ── R7 date/period label ──────────────────────────────────────────────────────
  // R7 dates are YYYY-MM-DD; extract YYYY-MM for period computation
  const r7Dates: string[] = (r7 as any)?.cumulative_returns?.dates ?? [];
  const r7LastYm: string = r7Dates.length > 0 ? r7Dates[r7Dates.length - 1].slice(0, 7) : '2026-05';
  const r7FirstYm: string = r7Dates.length > 0 ? r7Dates[0].slice(0, 7) : '1995-01';

  // Compute startYm for the selected period (uses existing allocStartYm helper which works on YYYY-MM)
  const startYmRaw = allocStartYm(period, r7LastYm);
  // Clamp to series minimum
  const effectiveStartYm = startYmRaw < r7FirstYm ? r7FirstYm : startYmRaw;
  const periodLabel = r7Dates.length > 0 ? `${fmtYm(effectiveStartYm)} → ${fmtYm(r7LastYm)}` : '—';

  // ── Compute R7 metrics for the selected period window ─────────────────────────
  // Slice cumulative_returns arrays to window, then rebase to 100 at window start
  const r7Target: number[] = (r7 as any)?.cumulative_returns?.target ?? [];
  const r7Bench: number[] = (r7 as any)?.cumulative_returns?.bench ?? [];

  const r7StartIdx = r7Dates.findIndex(d => d.slice(0, 7) >= effectiveStartYm);
  const r7SliceIdx = r7StartIdx >= 0 ? r7StartIdx : 0;

  const r7TargetSliced = r7Target.slice(r7SliceIdx);
  const r7BenchSliced = r7Bench.slice(r7SliceIdx);

  // Rebase to 100 at window start for metrics computation
  const r7TBase = r7TargetSliced[0] ?? 1;
  const r7BBase = r7BenchSliced[0] ?? 1;
  const r7TargetRebased = r7TargetSliced.map(v => (v / r7TBase) * 100);
  const r7BenchRebased = r7BenchSliced.map(v => (v / r7BBase) * 100);

  const r7TargetM = computeMetrics(r7TargetRebased, r7BenchRebased, false);
  const r7BenchM = computeMetrics(r7BenchRebased, null, true);

  // Best series per metric row
  type R7Key = 'totalReturn' | 'cagr' | 'vol' | 'maxdd' | 'sharpe';
  const r7Higher: Record<R7Key, boolean> = {
    totalReturn: true, cagr: true, vol: false, maxdd: false, sharpe: true,
  };
  function bestR7(k: R7Key): 'target' | 'bench' {
    const tv = r7TargetM[k]; const bv = r7BenchM[k];
    return r7Higher[k] ? (tv >= bv ? 'target' : 'bench') : (tv <= bv ? 'target' : 'bench');
  }
  const colR7 = (isBest: boolean, isTarget: boolean) => ({
    padding: '5px 8px',
    textAlign: 'right' as const,
    color: isBest ? (isTarget ? 'var(--accent)' : 'var(--yellow)') : undefined,
    fontWeight: isBest ? (700 as const) : undefined,
  });

  // ── R7 summary metrics (full-series, from pipeline) ──────────────────────────
  const r7Metrics = r7?.metricas_globais ?? null;
  const winRates = r7?.win_rates ?? null;
  const winRatePct = winRates?.['120m_pct'] ?? winRates?.['240m_pct'] ?? null;
  const decadesList: Array<{ Decada: string; Target: number; Benchmark: number; Delta: number }> =
    r7?.cagr_por_decada ?? null;

  return (
    <div data-testid="backtest-regime-longo">
    {/* backtest-metricas testid kept for E2E compat */}
    <div data-testid="backtest-metricas">
    <CollapsibleSection
      id="section-backtest-r7"
      title={secTitle('backtest', 'longo-prazo', 'Backtest — Regime Histórico (Target vs R7 Benchmark)')}
      defaultOpen={secOpen('backtest', 'longo-prazo', true)}
    >
      {/* Period buttons + label */}
      <div style={{ marginBottom: '10px' }}>
        <div className="period-btns" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
          {LONGO_PERIODS.map(p => (
            <Button
              key={p.key}
              variant={period === p.key ? 'default' : 'outline'}
              size="sm"
              title={p.title}
              onClick={() => setPeriod(p.key)}
            >
              {p.label}
            </Button>
          ))}
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', fontStyle: 'italic' }}>
          Período: <strong style={{ color: 'var(--text)' }}>{periodLabel}</strong>
        </div>
      </div>

      {/* ── Regime Histórico R7 chart (period-filtered) ──────────────────────── */}
      {data && <BacktestR7Chart data={data} startYm={effectiveStartYm} />}

      {/* 8-metric table for R7: Target vs R7 Benchmark */}
      {(r7TargetRebased.length > 1 || r7BenchRebased.length > 1) && (
        <div style={{ overflowX: 'auto', marginTop: 14 }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 6 }}>
            Métricas — período: <strong style={{ color: 'var(--text)' }}>{periodLabel}</strong>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-xs)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '5px 8px', color: 'var(--muted)', fontWeight: 600, minWidth: 90 }}>Métrica</th>
                <th style={{ textAlign: 'right', padding: '5px 8px', color: 'var(--accent)', fontWeight: 600 }}>Target</th>
                <th style={{ textAlign: 'right', padding: '5px 8px', color: 'var(--yellow)', fontWeight: 600 }}>R7 Benchmark</th>
              </tr>
            </thead>
            <tbody>
              {/* Rentabilidade */}
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '5px 8px', color: 'var(--muted)' }}>Rentabilidade</td>
                <td style={colR7(bestR7('totalReturn') === 'target', true)}>{fmtPct(r7TargetM.totalReturn)}</td>
                <td style={colR7(bestR7('totalReturn') === 'bench', false)}>{fmtPct(r7BenchM.totalReturn)}</td>
              </tr>
              {/* CAGR */}
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '5px 8px', color: 'var(--muted)' }}>CAGR</td>
                <td style={colR7(bestR7('cagr') === 'target', true)}>{fmtPct(r7TargetM.cagr)}</td>
                <td style={colR7(bestR7('cagr') === 'bench', false)}>{fmtPct(r7BenchM.cagr)}</td>
              </tr>
              {/* Volatilidade */}
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '5px 8px', color: 'var(--muted)' }}>Volatilidade</td>
                <td style={colR7(bestR7('vol') === 'target', true)}>{fmtNum(r7TargetM.vol)}%</td>
                <td style={colR7(bestR7('vol') === 'bench', false)}>{fmtNum(r7BenchM.vol)}%</td>
              </tr>
              {/* Max DD */}
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '5px 8px', color: 'var(--muted)' }}>Max DD</td>
                <td style={{ ...colR7(bestR7('maxdd') === 'target', true), color: bestR7('maxdd') === 'target' ? 'var(--accent)' : 'var(--red)' }}>
                  {fmtNum(r7TargetM.maxdd, 2, false)}%
                </td>
                <td style={{ ...colR7(bestR7('maxdd') === 'bench', false), color: bestR7('maxdd') === 'bench' ? 'var(--yellow)' : 'var(--red)' }}>
                  {fmtNum(r7BenchM.maxdd, 2, false)}%
                </td>
              </tr>
              {/* Sharpe */}
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '5px 8px', color: 'var(--muted)' }}>Sharpe (rf={RISK_FREE_RATE}%)</td>
                <td style={colR7(bestR7('sharpe') === 'target', true)}>{fmtNum(r7TargetM.sharpe)}</td>
                <td style={colR7(bestR7('sharpe') === 'bench', false)}>{fmtNum(r7BenchM.sharpe)}</td>
              </tr>
              {/* Alpha vs R7 Benchmark */}
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '5px 8px', color: 'var(--muted)' }}>Alpha vs Benchmark</td>
                <td style={{ padding: '5px 8px', textAlign: 'right', color: r7TargetM.alpha != null ? deltaColor(r7TargetM.alpha) : undefined, fontWeight: r7TargetM.alpha != null && r7TargetM.alpha > 0 ? 700 : undefined }}>
                  {r7TargetM.alpha != null ? fmtNum(r7TargetM.alpha, 2, true) + 'pp' : '—'}
                </td>
                <td style={{ padding: '5px 8px', textAlign: 'right', color: 'var(--muted)' }}>—</td>
              </tr>
              {/* TER */}
              <tr style={{ borderBottom: '1px solid var(--border)', opacity: 0.85 }}>
                <td style={{ padding: '5px 8px', color: 'var(--muted)', fontStyle: 'italic' }}>TER (anual)</td>
                <td style={{ padding: '5px 8px', textAlign: 'right', color: 'var(--muted)' }}>{R7_SERIES_COSTS.target.ter.toFixed(3)}%</td>
                <td style={{ padding: '5px 8px', textAlign: 'right', color: 'var(--muted)' }}>— (índice)</td>
              </tr>
              {/* TER All-in */}
              <tr style={{ opacity: 0.85 }}>
                <td style={{ padding: '5px 8px', color: 'var(--muted)', fontStyle: 'italic' }}>TER All-in</td>
                <td style={{ padding: '5px 8px', textAlign: 'right', color: 'var(--muted)' }}>{R7_SERIES_COSTS.target.terAllin.toFixed(3)}%</td>
                <td style={{ padding: '5px 8px', textAlign: 'right', color: 'var(--muted)' }}>— (índice)</td>
              </tr>
            </tbody>
          </table>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 4, fontStyle: 'italic' }}>
            Sharpe: rf = {RISK_FREE_RATE}% a.a. · TER All-in inclui tracking difference estimada · Alpha = CAGR Target − CAGR Benchmark · R7 Benchmark = índice acadêmico (sem custo de ETF)
          </div>
        </div>
      )}

      {/* ── R7 full-series summary metrics ──────────────────────────────────── */}
      {r7 && (
        <>
          {/* Metrics grid */}
          {r7Metrics && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2" style={{ marginTop: 16, marginBottom: 4 }}>
              {[
                { label: 'CAGR R7', value: r7Metrics.cagr_target_pct != null ? `${r7Metrics.cagr_target_pct.toFixed(2)}%` : '—', color: undefined as string | undefined },
                { label: 'Alpha R7', value: r7Metrics.alpha_pp != null ? `${r7Metrics.alpha_pp >= 0 ? '+' : ''}${r7Metrics.alpha_pp.toFixed(2)}pp` : '—', color: r7Metrics.alpha_pp != null ? deltaColor(r7Metrics.alpha_pp) : undefined },
                { label: 'Sharpe R7', value: r7Metrics.sharpe_target != null ? r7Metrics.sharpe_target.toFixed(2) : '—', color: undefined as string | undefined },
                { label: 'Max DD R7', value: r7Metrics.max_dd_target_pct != null ? `${r7Metrics.max_dd_target_pct.toFixed(1)}%` : '—', color: undefined as string | undefined },
                { label: 'Win Rate 10a', value: winRatePct != null ? `${winRatePct.toFixed(1)}%` : '—', color: undefined as string | undefined },
              ].map(m => (
                <div key={m.label} style={{ background: 'var(--card2)', borderRadius: 'var(--radius-md)', padding: '10px', textAlign: 'center', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '4px' }}>{m.label}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: m.color ?? 'var(--text)' }}>{m.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Risk Grid: Factor Drought + Drawdown Recovery */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ marginTop: '10px' }}>
            <div style={{ background: 'var(--card2)', borderRadius: 'var(--radius-md)', padding: '10px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '6px', fontWeight: 600 }}>Factor Drought</div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
                {r7?.factor_drought?.max_meses != null
                  ? `Maior seca: ${(r7.factor_drought.max_meses / 12).toFixed(1)}a (${r7.factor_drought.max_meses}m)`
                  : '—'}
              </div>
              {r7?.factor_drought?.nota && (
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '4px' }}>{r7.factor_drought.nota}</div>
              )}
            </div>
            <div style={{ background: 'var(--card2)', borderRadius: 'var(--radius-md)', padding: '10px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '6px', fontWeight: 600 }}>Drawdown Recovery</div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text)' }}>
                {r7?.drawdown_recovery?.max_meses != null
                  ? `Máx recuperação: ${r7.drawdown_recovery.max_meses}m`
                  : '—'}
              </div>
              {r7?.drawdown_recovery?.p90_meses != null && (
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '2px' }}>P90: {r7.drawdown_recovery.p90_meses}m</div>
              )}
            </div>
          </div>

          {/* CAGR por Década — list format: [{ Decada, Target, Benchmark, Delta, N_meses }] */}
          {decadesList && decadesList.length > 0 && (
            <CollapsibleSection id="backtest-cagr-decada" title="CAGR por Década" defaultOpen={secOpen('backtest', 'cagr-decada', true)}>
              <div style={{ padding: '0 16px 16px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Década</th>
                      <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Target</th>
                      <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>VWRA</th>
                      <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Alpha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {decadesList.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '6px 8px' }}>{row.Decada ?? '—'}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 600 }}>
                          {row.Target != null ? `${(row.Target * 100).toFixed(2)}%` : '—'}
                        </td>
                        <td style={{ padding: '6px 8px', textAlign: 'right' }}>
                          {row.Benchmark != null ? `${(row.Benchmark * 100).toFixed(2)}%` : '—'}
                        </td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', color: deltaColor(row.Delta) }}>
                          {row.Delta != null ? fmtPct(row.Delta * 100) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CollapsibleSection>
          )}

          <div className="src" style={{ marginTop: 8 }}>
            R7 Dados: MSCI World NR USD (yfinance) + DFA DFSVX/DISVX/DFEMX + Ken French EM. Rebalanceamento anual (dezembro).
          </div>
        </>
      )}

      <div className="src">
        Target: SWRD 50% / AVGS 30% / AVEM 20% (UCITS proxies) · R7 Benchmark: MSCI World NR USD (índice acadêmico) · Rebase = 100 no início do período
      </div>
    </CollapsibleSection>
    </div>
    </div>
  );
}

// ── B9: Bond Tent Analysis ────────────────────────────────────────────────────

function BondTentAnalysisSection() {
  const data = useDashboardStore(s => s.data);
  const { privacyMode } = useEChartsPrivacy();

  const patrimonio: number = (data as any)?.premissas?.patrimonio_atual ?? 0;
  const bondPool: { atual_brl?: number; cobertura_anos?: number; meta_anos?: number; meta_brl?: number } =
    (data as any)?.bond_pool ?? {};
  const custoAnual: number = (data as any)?.premissas?.custo_vida_base ?? 250000;

  // Bond Tent: equity 79% → 40% nos 5 anos pré-FIRE (2035-2040)
  const equityAtual = 0.79;
  const equityFire  = 0.40;
  const tentFrac    = equityAtual - equityFire; // 0.39
  const tentBrl     = patrimonio * tentFrac;

  // RF necessária para cobrir o tent
  const bondPoolAtual = bondPool.atual_brl ?? 0;
  const bondPoolMeta  = bondPool.meta_brl ?? 0;
  const coberturaBondAtual = bondPool.cobertura_anos ?? 0;
  const metaAnos = bondPool.meta_anos ?? 7;

  const rfNecessaria  = tentBrl;
  const rfDisponivel  = bondPoolAtual;
  const gapRf         = rfNecessaria - rfDisponivel;
  const pctMeta       = patrimonio > 0 ? (bondPoolAtual / rfNecessaria) * 100 : 0;
  const coberturaTent = custoAnual > 0 ? rfNecessaria / custoAnual : 0;

  const fmtBrl = (v: number) => fmtBrlPrivate(v, privacyMode);
  const fmtAnos = (v: number) => `${v.toFixed(1)} anos`;

  const gapColor = gapRf <= 0 ? 'var(--green)' : gapRf < rfNecessaria * 0.5 ? 'var(--yellow)' : 'var(--red)';

  return (
    <CollapsibleSection
      id="bond-tent-analysis"
      title={secTitle('backtest', 'bond-tent-analysis', 'Bond Tent — Análise de Glide Path (2035-2040)')}
      defaultOpen={secOpen('backtest', 'bond-tent-analysis', false)}
    >
      <div style={{ padding: '0 16px 16px' }}>
        {/* Conceito */}
        <div style={{ padding: '10px 14px', background: 'rgba(88,166,255,.06)', border: '1px solid rgba(88,166,255,.2)', borderRadius: 8, marginBottom: 14, fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
          <strong style={{ color: 'var(--text)' }}>O que é Bond Tent?</strong> Estratégia de glide path onde a alocação em equity é
          reduzida progressivamente de <strong>{(equityAtual * 100).toFixed(0)}%</strong> para <strong>{(equityFire * 100).toFixed(0)}%</strong> nos
          5 anos pré-FIRE (2035–2040), mitigando o risco de sequence of returns.
          A RF "tent" cobre as despesas iniciais da aposentadoria sem forçar venda de equity em baixa.
        </div>

        {/* Métricas principais */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" style={{ marginBottom: 14 }}>
          <div style={{ background: 'var(--card2)', borderRadius: 'var(--radius-md)', padding: '10px', textAlign: 'center', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 4 }}>Tent Size</div>
            <div data-testid="b9-tent-size-brl" style={{ fontSize: '1.1rem', fontWeight: 700 }}>{fmtBrl(tentBrl)}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>39% × patrimônio</div>
          </div>
          <div style={{ background: 'var(--card2)', borderRadius: 'var(--radius-md)', padding: '10px', textAlign: 'center', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 4 }}>Bond Pool Atual</div>
            <div data-testid="b9-bond-pool-atual" style={{ fontSize: '1.1rem', fontWeight: 700 }}>{fmtBrl(rfDisponivel)}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{fmtAnos(coberturaBondAtual)}</div>
          </div>
          <div style={{ background: 'var(--card2)', borderRadius: 'var(--radius-md)', padding: '10px', textAlign: 'center', border: `1px solid ${gapColor}` }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 4 }}>Gap RF</div>
            <div data-testid="b9-gap-rf" style={{ fontSize: '1.1rem', fontWeight: 700, color: gapColor }}>
              {gapRf <= 0 ? `${fmtBrl(Math.abs(gapRf))} excesso` : fmtBrl(gapRf)}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
              {pctMeta.toFixed(0)}% cobertura
            </div>
          </div>
          <div style={{ background: 'var(--card2)', borderRadius: 'var(--radius-md)', padding: '10px', textAlign: 'center', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 4 }}>Tent em Anos</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{fmtAnos(coberturaTent)}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>vs meta {metaAnos}a</div>
          </div>
        </div>

        {/* Glide path textual */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: 8 }}>Glide Path 2026–2040</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 'var(--text-sm)' }}>
            {[
              { ano: '2026 (hoje)', equity: 79, rf: 21, nota: 'Alocação atual' },
              { ano: '2031 (−9a)', equity: 71, rf: 29, nota: 'Redução gradual' },
              { ano: '2035 (−5a)', equity: 63, rf: 37, nota: 'Início do tent' },
              { ano: '2040 (FIRE)', equity: 40, rf: 60, nota: 'Máx proteção RF' },
            ].map(row => (
              <div key={row.ano} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ color: 'var(--muted)', minWidth: 110, fontSize: 'var(--text-xs)' }}>{row.ano}</span>
                <div style={{ flex: 1, height: 16, borderRadius: 4, overflow: 'hidden', background: 'var(--card)', display: 'flex' }}>
                  <div style={{ width: `${row.equity}%`, background: 'var(--accent)', transition: 'width .3s' }} />
                  <div style={{ width: `${row.rf}%`, background: 'var(--green)', opacity: 0.7 }} />
                </div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)', minWidth: 32 }}>{row.equity}%</span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--green)', minWidth: 32 }}>{row.rf}%</span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{row.nota}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--accent)', borderRadius: 2, marginRight: 4 }} />Equity</span>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--green)', opacity: 0.7, borderRadius: 2, marginRight: 4 }} />RF</span>
          </div>
        </div>

        {/* Situação atual vs meta */}
        <div style={{ padding: '10px 14px', background: 'var(--card2)', borderRadius: 8, border: '1px solid var(--border)', fontSize: 'var(--text-sm)' }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Situação Atual vs Meta Tent</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>RF necessária (tent 39%)</span>
              <span style={{ fontWeight: 600 }}>{fmtBrl(rfNecessaria)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>Bond pool disponível</span>
              <span>{fmtBrl(rfDisponivel)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 4, marginTop: 2 }}>
              <span style={{ color: 'var(--muted)' }}>Gap a acumular</span>
              <span style={{ fontWeight: 700, color: gapColor }}>{gapRf <= 0 ? 'Cobertura OK' : fmtBrl(gapRf)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>Meta bond pool (estrutural)</span>
              <span>{bondPoolMeta > 0 ? fmtBrl(bondPoolMeta) : '—'}</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 10, padding: '6px 10px', background: 'rgba(234,179,8,.06)', borderRadius: 6, borderLeft: '3px solid var(--yellow)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
          Bond Tent é estratégia pré-FIRE — a acumulação de RF deve ocorrer nos anos anteriores ao FIRE,
          não necessariamente hoje. O gap de {fmtBrl(gapRf > 0 ? gapRf : 0)} deve ser construído até 2035.
        </div>

        <div className="src" style={{ marginTop: 10 }}>
          Tent size = patrimônio × (equity_atual − equity_fire) = {fmtBrl(patrimonio)} × {(tentFrac * 100).toFixed(0)}% ·
          Bond pool: data.bond_pool · Equity atual: {(equityAtual * 100).toFixed(0)}% (IPS)
        </div>
      </div>
    </CollapsibleSection>
  );
}

// ── B11: Timeline Attribution Chart ──────────────────────────────────────────

interface TimelineAttribution {
  dates: string[];
  rf: number[];
  equity_usd: number[];
  cambio: number[];
}

/** Aggregate monthly series into yearly totals */
function aggregateByYear(dates: string[], values: number[]): { years: string[]; totals: number[] } {
  const map = new Map<string, number>();
  dates.forEach((d, i) => {
    const year = d.slice(0, 4);
    map.set(year, (map.get(year) ?? 0) + (values[i] ?? 0));
  });
  const years = Array.from(map.keys()).sort();
  return { years, totals: years.map(y => map.get(y) ?? 0) };
}

function TimelineAttributionChart() {
  const data = useDashboardStore(s => s.data);
  const { pv, pvLabel, privacyMode } = useEChartsPrivacy();

  const ta = (data as Record<string, unknown>)?.timeline_attribution as TimelineAttribution | undefined;
  if (!ta?.dates?.length) return null;

  const { years, totals: rfTotals }     = aggregateByYear(ta.dates, ta.rf);
  const { totals: eqTotals }            = aggregateByYear(ta.dates, ta.equity_usd);
  const { totals: fxTotals }            = aggregateByYear(ta.dates, ta.cambio);

  // Accumulated totals across all years (for summary spans)
  const totalRf  = rfTotals.reduce((a, b) => a + b, 0);
  const totalEq  = eqTotals.reduce((a, b) => a + b, 0);
  const totalFx  = fxTotals.reduce((a, b) => a + b, 0);

  const option = {
    backgroundColor: 'transparent',
    grid: { left: 60, right: 16, top: 32, bottom: 48 },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: EC.card,
      borderColor: EC.border2,
      textStyle: { color: EC.text, fontSize: 11 },
      formatter: (params: Array<{ seriesName: string; value: number; color: string }>) => {
        const year = (params[0] as unknown as { axisValueLabel?: string; name?: string }).name ?? '';
        const rows = params.map(p => {
          const val = fmtBrlPrivate(p.value, privacyMode);
          return `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color};margin-right:4px"></span>${p.seriesName}: <b>${val}</b>`;
        }).join('<br/>');
        return `<b>${year}</b><br/>${rows}`;
      },
    },
    legend: {
      top: 6,
      textStyle: { color: EC.muted, fontSize: 11 },
      data: ['RF', 'Equity', 'FX/Câmbio'],
    },
    xAxis: {
      type: 'category',
      data: years,
      axisLabel: { color: EC.muted, fontSize: 11 },
      axisLine: { lineStyle: { color: EC.border2 } },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: EC.muted,
        fontSize: 10,
        formatter: (v: number) => pvLabel(v),
      },
      splitLine: { lineStyle: { color: EC.border3 } },
    },
    series: [
      {
        name: 'RF',
        type: 'bar',
        stack: 'total',
        data: rfTotals.map(v => pv(v)),
        itemStyle: { color: EC.green },
      },
      {
        name: 'Equity',
        type: 'bar',
        stack: 'total',
        data: eqTotals.map(v => pv(v)),
        itemStyle: { color: EC.accent },
      },
      {
        name: 'FX/Câmbio',
        type: 'bar',
        stack: 'total',
        data: fxTotals.map(v => pv(v)),
        itemStyle: { color: EC.orange },
      },
    ],
  };

  return (
    <CollapsibleSection
      id="attribution-by-period"
      title={secTitle('backtest', 'attribution-by-period', 'Atribuição de Retorno — RF vs Equity vs FX')}
      defaultOpen={secOpen('backtest', 'attribution-by-period', false)}
    >
      <div style={{ padding: '0 16px 16px' }}>
        <EChart option={option} style={{ height: 300 }} />

        {/* Accumulated totals */}
        <div className="grid grid-cols-3 gap-3" style={{ marginTop: 14 }}>
          {[
            { label: 'RF Total Acum.', testId: 'b11-attr-rf-total',     value: totalRf,  color: EC.green  },
            { label: 'Equity Total Acum.', testId: 'b11-attr-equity-total', value: totalEq,  color: EC.accent },
            { label: 'FX Total Acum.', testId: 'b11-attr-fx-total',     value: totalFx,  color: EC.orange },
          ].map(({ label, testId, value, color }) => (
            <div
              key={testId}
              style={{ background: 'var(--card2)', borderRadius: 'var(--radius-md)', padding: '10px', textAlign: 'center', border: '1px solid var(--border)' }}
            >
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 4 }}>{label}</div>
              <span
                data-testid={testId}
                style={{ fontSize: '1.05rem', fontWeight: 700, color }}
              >
                {fmtPrivacy(value, privacyMode)}
              </span>
            </div>
          ))}
        </div>

        <div className="src" style={{ marginTop: 10 }}>
          Atribuição mensal agregada por ano · Fonte: timeline_attribution (data.json) · BRL · 2021–2026
        </div>
      </div>
    </CollapsibleSection>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BacktestPage() {
  const { data, isLoading, dataError } = usePageData();
  const { btcData, btcError } = useBtcIndicators();
  const { config } = useConfig();

  const stateEl = pageStateElement({
    isLoading,
    dataError,
    data,
    loadingText: 'Carregando backtest...',
    errorPrefix: 'Erro ao carregar backtest:',
    warningText: 'Dados carregados mas seção backtest não disponível',
  });
  if (stateEl) return stateEl;

  return (
    <div>
      {/* 1. Allocation Total — 5 séries em alocação total com série histórica real */}
      <AllocationHistoricoSection />

      {/* 2. Backtest — Target vs VWRA + Regime Histórico (merged from BacktestHistoricoSection + BacktestLongoSection) */}
      <BacktestLongoSection />

      <SectionDivider label="Drawdown & Risco" />
      {/* 2. DrawdownAnalysis — MERGE: ECharts moderno + crises + recovery */}
      <div data-testid="drawdown-historico">
      <CollapsibleSection
        id="section-drawdown-analysis"
        title={secTitle('backtest', 'drawdown-analysis', 'Drawdown Analysis — Histórico, Crises & Recovery')}
        defaultOpen={secOpen('backtest', 'drawdown-analysis', true)}
        icon={<TrendingDown size={18} />}
      >
        <div style={{ padding: '0 16px 16px' }}>
          {(() => {
            const dh = (data as any)?.drawdown_history ?? {};
            return (
              <DrawdownHistoryChart
                dates={dh.dates ?? []}
                drawdownPct={dh.drawdown_pct ?? []}
                maxDrawdown={dh.max_drawdown ?? 0}
              />
            );
          })()}
          <div className="src">
            Drawdown histórico da carteira. Máximo drawdown: pico-a-vale máximo observado.
          </div>

          {/* Sub-seção: Crises históricas (tabela, colapsada) */}
          <div style={{ marginTop: 12 }}>
            <CollapsibleSection
              id="section-drawdown-crises"
              title="Crises Históricas — tabela detalhada"
              defaultOpen={secOpen('backtest', 'drawdown-crises', false)}
            >
              <div style={{ padding: '0 16px 16px' }}>
                {(() => {
                  const crises = (data as any)?.backtest?.crises ?? (data as any)?.drawdown_crises ?? [];
                  if (!crises.length) return <div style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>Sem crises registradas.</div>;
                  return (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            <th style={{ textAlign: 'left', padding: '5px 8px', color: 'var(--muted)', fontWeight: 600 }}>Crise</th>
                            <th style={{ textAlign: 'right', padding: '5px 8px', color: 'var(--muted)', fontWeight: 600 }}>Período</th>
                            <th style={{ textAlign: 'right', padding: '5px 8px', color: 'var(--muted)', fontWeight: 600 }}>Drawdown</th>
                            <th style={{ textAlign: 'right', padding: '5px 8px', color: 'var(--muted)', fontWeight: 600 }}>Recuperação</th>
                          </tr>
                        </thead>
                        <tbody>
                          {crises.map((c: any, i: number) => (
                            <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: '5px 8px' }}>{c.label ?? c.nome ?? '—'}</td>
                              <td style={{ padding: '5px 8px', textAlign: 'right', color: 'var(--muted)' }}>{c.periodo ?? c.period ?? '—'}</td>
                              <td style={{ padding: '5px 8px', textAlign: 'right', color: 'var(--red)', fontWeight: 600 }}>
                                {c.drawdown != null ? fmtPct(c.drawdown) : '—'}
                              </td>
                              <td style={{ padding: '5px 8px', textAlign: 'right', color: 'var(--muted)' }}>
                                {c.recovery_months != null ? `${c.recovery_months}m` : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
            </CollapsibleSection>

            {/* Sub-seção: Recovery Table — eventos 2021-2026 */}
            <CollapsibleSection
              id="section-drawdown-recovery"
              title="Recovery Table — eventos 2021–2026"
              defaultOpen={secOpen('backtest', 'drawdown-recovery', false)}
            >
              <div style={{ padding: '0 16px 16px' }}>
                {(() => {
                  const events = (data as any)?.drawdown_events?.events ?? (data as any)?.drawdown_history?.crises ?? [];
                  return <DrawdownRecoveryTable events={events} />;
                })()}
                <div className="src">
                  Eventos de drawdown reais (2021–2026). Profundidade, duração e recuperação.
                </div>
              </div>
            </CollapsibleSection>
          </div>
        </div>
      </CollapsibleSection>
      </div>

      {/* Extended Drawdown — multi-period with VWRA benchmark */}
      {(() => {
        const ext = (data as any)?.drawdown_extended;
        if (!ext?.periods) return null;
        return (
          <CollapsibleSection
            id="section-drawdown-extended"
            title="Drawdown Histórico — Multi-Período (Target vs VWRA)"
            defaultOpen={secOpen('backtest', 'drawdown-extended')}
          >
            <div style={{ padding: '0 16px 16px' }}>
              <DrawdownExtendedChart
                periods={ext.periods}
                summary={ext.summary ?? {}}
                backtest={(data as any)?.backtest ?? null}
                backtestR5={(data as any)?.backtestR5 ?? null}
                backtest_r7={(data as any)?.backtest_r7 ?? null}
              />
            </div>
          </CollapsibleSection>
        );
      })()}

      {/* B11: Timeline Attribution — RF vs Equity vs FX por período */}
      <TimelineAttributionChart />

      <SectionDivider label="Bitcoin" />
      {/* 7. Bitcoin On-Chain Indicators (renomeado) */}
      <CollapsibleSection id="section-btc-indicators" title={secTitle('backtest', 'btc-indicators', 'Bitcoin On-Chain — Indicadores Históricos')} defaultOpen={secOpen('backtest', 'btc-indicators', false)}>
        <div style={{ padding: '0 16px 16px' }}>
          {btcError ? (
            <div style={{ padding: 14, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 7, fontSize: 12, color: '#ef4444' }}>
              <strong>Dados BTC não disponíveis</strong>
              <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--muted)' }}>
                Rodar: <code>scripts/btc_indicators.py</code> — Erro: {btcError}
              </p>
            </div>
          ) : btcData ? (
            <>
              {btcData.errors && btcData.errors.length > 0 && (
                <div style={{ marginBottom: 10, padding: '6px 10px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 5, fontSize: 11, color: '#f59e0b' }}>
                  Avisos: {btcData.errors.join(' | ')}
                </div>
              )}
              {/* HODL11 Position Block — MOVIDO para PORTFOLIO page (seção Bitcoin & Crypto) */}
              <BtcIndicatorsChart ma200w={btcData.ma200w} mvrvZscore={btcData.mvrv_zscore} />
              <div className="src" style={{ marginTop: 10 }}>
                Dados gerados em: {new Date(btcData.generated_at).toLocaleString('pt-BR')}
                {' · '}Atualizar: <code style={{ fontSize: 9 }}>python scripts/btc_indicators.py</code>
              </div>
            </>
          ) : (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
              Carregando dados BTC...
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* G9: Histórico Taxa IPCA+2040 */}
      {(() => {
        const ntnb = (data as any)?.ntnb_history;
        if (!ntnb?.dates || !ntnb?.rates_pct || ntnb.dates.length === 0) return null;
        const dates: string[] = ntnb.dates;
        const rates: number[] = ntnb.rates_pct;
        const gatilho: number = ntnb.gatilho_pct ?? 6.0;
        const option = {
          backgroundColor: 'transparent',
          grid: { left: 48, right: 20, top: 28, bottom: 48 },
          tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(15,23,42,.95)',
            borderColor: '#334155',
            textStyle: { color: '#94a3b8', fontSize: 12 },
            formatter: (params: { axisValue: string; value: number }[]) => {
              const p = params[0];
              return `<b>${p.axisValue}</b><br/>IPCA+2040: <b style="color:#e2e8f0">${p.value.toFixed(2)}%</b>`;
            },
          },
          xAxis: {
            type: 'category',
            data: dates,
            axisLabel: { color: EC.muted, fontSize: 10, rotate: 30, interval: Math.floor(dates.length / 12) },
            axisLine: { lineStyle: { color: EC.border } },
          },
          yAxis: {
            type: 'value',
            axisLabel: { color: EC.muted, fontSize: 10, formatter: (v: number) => `${v.toFixed(1)}%` },
            splitLine: { lineStyle: { color: EC.border } },
          },
          series: [
            {
              name: 'IPCA+2040',
              type: 'line',
              data: rates,
              smooth: true,
              lineStyle: { color: EC.accent, width: 2 },
              itemStyle: { color: EC.accent },
              areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: `${EC.accent}30` }, { offset: 1, color: 'transparent' }] } },
              symbol: 'none',
            },
            {
              name: `Gatilho DCA ${gatilho}%`,
              type: 'line',
              markLine: {
                silent: true,
                data: [{ yAxis: gatilho, lineStyle: { color: EC.green, width: 1.5, type: 'dashed' }, label: { formatter: `Gatilho ${gatilho}%`, color: EC.green, fontSize: 10 } }],
              },
              data: [],
            },
          ],
        };
        return (
          <>
            <SectionDivider label="Taxas Históricas" />
            <CollapsibleSection
              id="section-ntnb-history"
              title={secTitle('backtest', 'ntnb-history', 'Histórico Taxa IPCA+2040')}
              defaultOpen={secOpen('backtest', 'ntnb-history', false)}
            >
              <div style={{ padding: '14px 16px' }}>
                <EChart option={option} style={{ height: 260 }} />
                <div className="src">
                  IPCA+2040 · taxa indicativa ANBIMA · linha tracejada = gatilho DCA ({gatilho}%)
                </div>
              </div>
            </CollapsibleSection>
          </>
        );
      })()}

      {/* Historical Cycle Simulation — HD-gaps-aposenteaos40-spec Feature 3 */}
      <SectionDivider label="Historical Cycle Simulation" />
      <CollapsibleSection
        id="section-brfiresim"
        title={secTitle('backtest', 'section-brfiresim', 'brFIRESim — Historical Cycle Simulation (Bengen/cFIREsim)')}
        defaultOpen={secOpen('backtest', 'section-brfiresim', false)}
      >
        <BRFireSimSection />
      </CollapsibleSection>

      {/* B9: Bond Tent — análise textual de glide path pré-FIRE */}
      <BondTentAnalysisSection />

      {/* ── Factor Analysis — movido de PERFORMANCE ─────────────────────────── */}
      <SectionDivider label="Análise Fatorial" />

      {/* Expected Return Waterfall */}
      <CollapsibleSection
        id="section-expected-return-waterfall"
        title={secTitle('backtest', 'factor-waterfall', 'Expected Return Waterfall — Decomposição Fatorial FF6')}
        defaultOpen={secOpen('backtest', 'factor-waterfall', false)}
      >
        <ExpectedReturnWaterfall />
      </CollapsibleSection>

      {/* ETF Factor Composition */}
      <CollapsibleSection
        id="section-etf-factor"
        title={secTitle('backtest', 'factor-regression', 'Exposição Fatorial — ETFs da Carteira')}
        defaultOpen={secOpen('backtest', 'factor-regression', false)}
        icon={<BarChart3 size={18} />}
      >
        <div style={{ padding: '16px' }}>
          <ETFFactorComposition />
          <div className="src">Fatores: Market, Value, Size, Quality (escala 0–100%)</div>
        </div>
      </CollapsibleSection>

      {/* Factor Loadings — Regressão Fama-French SF + Momentum */}
      <CollapsibleSection
        id="section-factor-loadings"
        title={secTitle('backtest', 'factor-loadings', 'Factor Loadings — Regressão Fama-French SF + Momentum')}
        defaultOpen={secOpen('backtest', 'factor-loadings', false)}
      >
        <div style={{ padding: '0 16px 16px' }}>
          {(() => {
            const fl = (data as any)?.factor_loadings ?? {};
            const fKeys = ['mkt_rf', 'smb', 'hml', 'rmw', 'cma', 'mom'];
            const factors = [
              { label: 'Mkt-RF', key: 'mkt_rf' },
              { label: 'SMB', key: 'smb' },
              { label: 'HML', key: 'hml' },
              { label: 'RMW', key: 'rmw' },
              { label: 'CMA', key: 'cma' },
              { label: 'Mom', key: 'mom' },
            ];

            // AVGS proxy: blend AVUV (US) + AVDV (Intl) via pesos canônicos
            const wUS = config.ui?.performance?.weightUS ?? 0.58;
            const wIntl = config.ui?.performance?.weightIntl ?? 0.42;
            const avgsProxy: Record<string, number> = {};
            for (const fKey of fKeys) {
              const u = fl['AVUV']?.[fKey];
              const d = fl['AVDV']?.[fKey];
              if (u != null && d != null) avgsProxy[fKey] = wUS * u + wIntl * d;
            }
            const hasProxy = Object.keys(avgsProxy).length > 0;

            const etfsReal = ['AVDV', 'AVUV', 'DGS', 'EIMI', 'SWRD', 'USCC', 'IWVL'].filter(e => fl[e] != null);

            // Portfolio weighted row: use posicoes to compute USD value weights
            const posicoes = (data as any)?.posicoes ?? {};
            // Map target ETFs to their loadings source:
            //   AVGS → avgsProxy (58% AVUV + 42% AVDV), AVEM → EIMI proxy, others direct
            const etfToLoadingKey: Record<string, string | 'avgsProxy'> = {
              SWRD: 'SWRD', AVGS: 'avgsProxy', AVEM: 'EIMI',
              AVUV: 'AVUV', AVDV: 'AVDV', EIMI: 'EIMI', DGS: 'DGS', USSC: 'USCC', IWVL: 'IWVL',
            };
            let totalUsd = 0;
            const etfWeights: Array<{ etf: string; usd: number; loadingKey: string | 'avgsProxy' }> = [];
            for (const [etf, lk] of Object.entries(etfToLoadingKey)) {
              const pos = posicoes[etf];
              if (!pos?.qty || !pos?.price) continue;
              const hasLoading = lk === 'avgsProxy' ? hasProxy : fl[lk] != null;
              if (!hasLoading) continue;
              const usd = pos.qty * pos.price;
              totalUsd += usd;
              etfWeights.push({ etf, usd, loadingKey: lk });
            }
            const portfolioLoading: Record<string, number> = {};
            if (totalUsd > 0 && etfWeights.length > 0) {
              for (const fKey of fKeys) {
                let weighted = 0;
                let covered = 0;
                for (const { usd, loadingKey } of etfWeights) {
                  const w = usd / totalUsd;
                  const val = loadingKey === 'avgsProxy' ? avgsProxy[fKey] : fl[loadingKey]?.[fKey];
                  if (val != null) { weighted += w * val; covered += w; }
                }
                if (covered > 0.5) portfolioLoading[fKey] = weighted / covered;
              }
            }
            const hasPortfolioRow = Object.keys(portfolioLoading).length > 0;

            if (!etfsReal.length) return <div style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>Sem dados de factor loadings</div>;
            return (
              <>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {etfsReal.map(etf => (
                    <span key={etf} style={{
                      background: 'var(--card2)',
                      borderRadius: 'var(--radius-xs)',
                      padding: '3px 8px',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 600,
                      color: 'var(--accent)',
                    }}>
                      {etf}
                    </span>
                  ))}
                  {hasProxy && (
                    <span style={{
                      background: 'rgba(88,166,255,.12)',
                      border: '1px dashed var(--accent)',
                      borderRadius: 'var(--radius-xs)',
                      padding: '3px 8px',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 600,
                      color: 'var(--accent)',
                    }}>
                      AVGS* proxy
                    </span>
                  )}
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--muted)' }}>Fator</th>
                        {etfsReal.map(etf => (
                          <th key={etf} style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--accent)' }}>{etf}</th>
                        ))}
                        {hasProxy && (
                          <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--accent)', opacity: 0.7, fontStyle: 'italic' }}>
                            AVGS*
                          </th>
                        )}
                        {hasPortfolioRow && (
                          <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--accent)', fontWeight: 700 }}>
                            Portfolio
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {factors.map(({ label, key: fKey }) => (
                        <tr key={label} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '6px 8px', fontWeight: 600 }}>{label}</td>
                          {etfsReal.map(etf => {
                            const val = fl[etf]?.[fKey];
                            const tstat = fl[etf]?.t_stats?.[fKey];
                            const sig = tstat != null && Math.abs(tstat) >= 1.65;
                            return (
                              <td key={etf} style={{
                                textAlign: 'right',
                                padding: '6px 8px',
                                color: val != null ? (val > 0.3 ? 'var(--green)' : val < -0.1 ? 'var(--red)' : 'var(--text)') : 'var(--muted)',
                                opacity: sig ? 1 : 0.55,
                                fontWeight: sig ? 600 : 400,
                              }}>
                                {val != null ? val.toFixed(2) : '—'}
                              </td>
                            );
                          })}
                          {hasProxy && (
                            <td style={{
                              textAlign: 'right',
                              padding: '6px 8px',
                              fontStyle: 'italic',
                              opacity: 0.75,
                              color: avgsProxy[fKey] != null ? (avgsProxy[fKey] > 0.3 ? 'var(--green)' : avgsProxy[fKey] < -0.1 ? 'var(--red)' : 'var(--text)') : 'var(--muted)',
                            }}>
                              {avgsProxy[fKey] != null ? avgsProxy[fKey].toFixed(2) : '—'}
                            </td>
                          )}
                          {hasPortfolioRow && (
                            <td style={{
                              textAlign: 'right',
                              padding: '6px 8px',
                              fontWeight: 700,
                              color: portfolioLoading[fKey] != null ? (portfolioLoading[fKey] > 0.3 ? 'var(--green)' : portfolioLoading[fKey] < -0.1 ? 'var(--red)' : 'var(--accent)') : 'var(--muted)',
                            }}>
                              {portfolioLoading[fKey] != null ? portfolioLoading[fKey].toFixed(2) : '—'}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                    {hasPortfolioRow && (
                      <tfoot>
                        <tr style={{ borderTop: '2px solid var(--border)' }}>
                          <td colSpan={etfsReal.length + (hasProxy ? 1 : 0) + 2} style={{ padding: '6px 8px', fontSize: 'var(--text-xs)', color: 'var(--muted)', fontStyle: 'italic' }}>
                            Portfolio = média ponderada pelo valor atual (USD) de cada posição
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </>
            );
          })()}
          <div className="src">
            Regressão FF5+Mom · Negrito = significativo (t ≥ 1.65, 90%+) · Desbotado = não significativo<br />
            *AVGS proxy = 58% AVUV + 42% AVDV (proxies canônicos Tier A — mesma metodologia Avantis · fonte: proxies-canonicos.md)<br />
            Loadings calculados sobre proxies (AVUV/AVDV para AVGS, EIMI para AVEM) — ETFs alvo têm histórico &lt; 24 meses. Atualizar quando AVGS/AVEM completarem 24 meses de dados.
          </div>
        </div>
      </CollapsibleSection>

      {/* Factor Regression FF5 */}
      <CollapsibleSection
        id="section-ff5-regression"
        title={secTitle('backtest', 'ff5-regression', 'Factor Regression FF5 (técnico)')}
        defaultOpen={secOpen('backtest', 'ff5-regression', false)}
        icon={<BarChart3 size={18} />}
      >
        <div style={{ padding: '0 16px 16px' }}>
          {(() => {
            const r7 = (data as any)?.backtest_r7 ?? null;
            const ff5 = r7?.factor_regression ?? null;
            if (!ff5) {
              return <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>Dados FF5 não disponíveis</div>;
            }
            return (
              <div style={{ fontSize: 'var(--text-sm)', background: 'var(--card2)', borderRadius: 'var(--radius-md)', padding: '10px' }}>
                {/* Top-level scalars */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mb-2">
                  {Object.entries(ff5)
                    .filter(([, v]) => typeof v === 'number')
                    .map(([k, v]: [string, any]) => (
                      <div key={k} style={{ textAlign: 'center', padding: '6px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{k}</div>
                        <div style={{ fontWeight: 700 }}>{v.toFixed(3)}</div>
                      </div>
                    ))}
                </div>
                {/* Betas sub-object */}
                {ff5.betas && (
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '4px' }}>Betas</div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-1.5">
                      {Object.entries(ff5.betas).map(([k, v]: [string, any]) => (
                        <div key={k} style={{ textAlign: 'center', padding: '5px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{k}</div>
                          <div style={{ fontWeight: 700 }}>{typeof v === 'number' ? v.toFixed(3) : String(v)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
          <div className="src">
            Regime 7 · 37 anos (1989–2026) · Regressão Fama-French 5 fatores. Dados: backtest_r7.factor_regression.
          </div>
        </div>
      </CollapsibleSection>

      {/* ── Drawdown & Risco — Risk/Return Scatter ────────────────────────────── */}
      <SectionDivider label="Drawdown & Risco" />
      {(data as any)?.risk_return_scatter && (
        <CollapsibleSection
          id="section-risk-return-scatter"
          title={secTitle('backtest', 'risk-return-scatter', 'Retorno vs. Risco por Classe de Ativos')}
          defaultOpen={secOpen('backtest', 'risk-return-scatter', false)}
          icon={<BarChart3 size={18} />}
        >
          <RiskReturnScatter data={(data as any).risk_return_scatter} />
        </CollapsibleSection>
      )}
    </div>
  );
}
