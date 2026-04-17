'use client';

import { useEffect, useState } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { secOpen, secTitle } from '@/config/dashboard.config';
import { BacktestChart } from '@/components/charts/BacktestChart';
import { BacktestR7Chart } from '@/components/charts/BacktestR7Chart';
import { DrawdownHistChart } from '@/components/charts/DrawdownHistChart';
import { Button } from '@/components/ui/button';

// ── Period button types ───────────────────────────────────────────────────────

type BacktestPeriod = 'r7' | 'all' | 'since2009' | 'since2013' | 'since2020' | '5y' | '3y';
type ShadowPeriod = 'since2009' | 'since2013' | 'since2020' | '5y' | '3y' | 'all';

const BACKTEST_PERIODS: { key: BacktestPeriod; label: string; title: string }[] = [
  { key: 'r7',        label: 'Acadêmico (37a)',  title: 'jul/1989–atual (37 anos) · proxies acadêmicos Ken French + MSCI' },
  { key: 'all',       label: 'Completo (21a)',   title: 'jan/2005–abr/2026 (21 anos)' },
  { key: 'since2009', label: 'Pós-GFC (17a)',    title: 'jan/2009–abr/2026 (17 anos) · desde o fundo da crise de 2008' },
  { key: 'since2013', label: 'Pós-Euro (13a)',   title: 'jan/2013–abr/2026 (13 anos) · pós-crise da dívida europeia' },
  { key: 'since2020', label: 'Pós-COVID (6a)',   title: 'jan/2020–abr/2026 (6 anos) · desde o fundo de março 2020' },
  { key: '5y',        label: '5 anos',           title: 'jan/2021–abr/2026 (5 anos)' },
  { key: '3y',        label: '3 anos',           title: 'jan/2023–abr/2026 (3 anos)' },
];

const SHADOW_PERIODS: { key: ShadowPeriod; label: string }[] = [
  { key: 'since2009', label: 'Desde 2009' },
  { key: 'since2013', label: 'Desde 2013' },
  { key: 'since2020', label: 'Desde 2020' },
  { key: '5y',        label: '5 anos' },
  { key: '3y',        label: '3 anos' },
  { key: 'all',       label: 'Tudo (21a)' },
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

// ── Backtest Histórico section ────────────────────────────────────────────────

function BacktestHistoricoSection() {
  const data = useDashboardStore(s => s.data);
  const [period, setPeriod] = useState<BacktestPeriod>('since2009');

  const backtest = data?.backtest;
  // backtestR5 covers 2005-01 → present (21 years) — used for long periods
  const backtestR5 = (data as any)?.backtestR5 ?? null;

  // For long periods, use backtestR5 if available; otherwise fall back to backtest
  const LONG_PERIODS = new Set(['all', 'since2009', 'since2013']);
  const activeDataset = LONG_PERIODS.has(period) && backtestR5 ? backtestR5 : backtest;

  // Determine earliest available date in backtest data
  const earliestDate: string | null = activeDataset?.dates?.[0] ?? null;
  const periodMinDates: Record<string, string> = {
    all: '2005-01', since2009: '2009-01', since2013: '2013-01',
    since2020: '2020-01', '5y': '2021-01', '3y': '2023-01', r7: '1989-07',
  };
  const periodLimited = (key: string) => {
    const ds = LONG_PERIODS.has(key) && backtestR5 ? backtestR5 : backtest;
    const earliest = ds?.dates?.[0] ?? null;
    if (!earliest) return false;
    const minNeeded = periodMinDates[key] ?? '2000-01';
    return earliest > minNeeded;
  };

  // Metrics for selected period
  const metrics = backtest?.metrics_by_period?.[period] ?? backtest?.metrics ?? null;
  const targetMetrics = metrics?.target ?? metrics;
  // Benchmark is 'shadowA' (first shadow portfolio) in current data schema
  const benchMetrics = metrics?.bench ?? metrics?.shadowA ?? null;

  // CAGR and TWR values
  const cagrPatrimonial: number | null = data?.attribution?.cagr_total ?? null;
  const twrUsd: number | null = targetMetrics?.cagr ?? targetMetrics?.twr_usd ?? null;

  // Build metrics table rows
  // Data uses keys: cagr, sharpe, maxdd, vol (not max_drawdown, volatility)
  const metricRows: { label: string; target: string; vwra: string; delta: string; deltaVal: number | null }[] = [];
  if (targetMetrics) {
    const pairs: { label: string; tKey: string; bKey?: string; fmt?: 'pct' | 'num' }[] = [
      { label: 'CAGR',      tKey: 'cagr',               bKey: 'cagr',    fmt: 'pct' },
      { label: 'Sharpe',    tKey: 'sharpe',              bKey: 'sharpe',  fmt: 'num' },
      { label: 'Volatility',tKey: 'vol',                 bKey: 'vol',     fmt: 'pct' },
      { label: 'Max DD',    tKey: 'maxdd',               bKey: 'maxdd',   fmt: 'pct' },
      { label: 'Alpha',     tKey: 'alpha_pp',            bKey: undefined, fmt: 'pct' },
    ];
    pairs.forEach(({ label, tKey, bKey, fmt }) => {
      const tVal = targetMetrics[tKey];
      const bVal = bKey ? benchMetrics?.[bKey] : null;
      const dVal = tVal != null && bVal != null ? tVal - bVal : null;
      const fmtVal = (v: number) => fmt === 'num' ? v.toFixed(2) : fmtPct(v);
      metricRows.push({
        label,
        target: tVal != null ? fmtVal(tVal) : '—',
        vwra:   bVal != null ? fmtVal(bVal) : '—',
        delta:  dVal != null ? fmtPct(dVal) : '—',
        deltaVal: dVal,
      });
    });
  }

  // Proxy warning note
  const notaProxy = backtest?.nota_proxy ?? null;

  return (
    <CollapsibleSection id="backtest-historico" title={secTitle('backtest', 'backtest-historico', 'Backtest Histórico — Target vs VWRA')} defaultOpen={secOpen('backtest', 'backtest-historico')}>
      {/* Period buttons */}
      <div className="period-btns" style={{ marginBottom: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {BACKTEST_PERIODS.map(p => {
          const limited = p.key !== 'r7' && periodLimited(p.key);
          return (
            <Button
              key={p.key}
              variant={period === p.key ? 'default' : 'outline'}
              size="sm"
              title={limited ? `${p.title} — dados disponíveis desde ${earliestDate}` : p.title}
              onClick={() => setPeriod(p.key)}
              style={limited && period !== p.key ? { opacity: 0.55 } : undefined}
            >
              {p.label}{limited ? ' *' : ''}
            </Button>
          );
        })}
      </div>

      {/* Note when period data is limited */}
      {period !== 'r7' && periodLimited(period) && earliestDate && (
        <div style={{ marginBottom: 8, padding: '6px 10px', background: 'rgba(234,179,8,.08)', borderRadius: 5, borderLeft: '3px solid var(--yellow)', fontSize: '.72rem', color: 'var(--muted)' }}>
          * Dados disponíveis desde {earliestDate} — período completo não disponível neste backtest.
        </div>
      )}

      {/* Chart */}
      {data && period === 'r7' && <BacktestR7Chart data={data} />}
      {data && period !== 'r7' && (
        <BacktestChart
          data={data}
          period={period}
          dataset={LONG_PERIODS.has(period) && backtestR5 ? backtestR5 : undefined}
        />
      )}

      {/* Metrics table */}
      {metricRows.length > 0 && (
        <div style={{ overflowX: 'auto', marginTop: '12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Métrica</th>
                <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Target</th>
                <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>VWRA</th>
                <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Delta</th>
              </tr>
            </thead>
            <tbody>
              {metricRows.map(row => (
                <tr key={row.label} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '6px 8px' }}>{row.label}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 600 }}>{row.target}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right' }}>{row.vwra}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', color: deltaColor(row.deltaVal), fontWeight: 600 }}>{row.delta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CAGR vs TWR cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '14px' }}>
        <div style={{ background: 'var(--card2)', borderRadius: 'var(--radius-md)', padding: '12px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '.7rem', color: 'var(--muted)', marginBottom: '6px' }}>CAGR Patrimonial (incl. aportes)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '6px' }} className="pv">
            {cagrPatrimonial != null ? fmtPct(cagrPatrimonial) : '—'}
          </div>
          <div style={{ fontSize: '.65rem', color: 'var(--muted)' }}>
            Crescimento total do patrimônio. Inflado por aportes — NÃO é performance dos ETFs.
          </div>
        </div>
        <div style={{ background: 'var(--card2)', borderRadius: 'var(--radius-md)', padding: '12px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '.7rem', color: 'var(--muted)', marginBottom: '6px' }}>TWR USD (retorno puro, ex-aportes)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '6px' }}>
            {twrUsd != null ? fmtPct(twrUsd) : '—'}
          </div>
          <div style={{ fontSize: '.65rem', color: 'var(--muted)' }}>
            Time-Weighted Return do backtest. Performance real dos ETFs sem efeito de aportes.
          </div>
        </div>
      </div>

      {/* Proxy warning */}
      {notaProxy && (
        <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(234,179,8,.08)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--yellow)', fontSize: '.72rem' }}>
          {notaProxy}
        </div>
      )}
    </CollapsibleSection>
  );
}

// ── Shadow Portfolios section ─────────────────────────────────────────────────

function ShadowPortfoliosSection() {
  const data = useDashboardStore(s => s.data);
  const [period, setPeriod] = useState<ShadowPeriod>('since2009');
  const backtestR5 = (data as any)?.backtestR5 ?? null;
  const SHADOW_LONG = new Set(['all', 'since2009', 'since2013']);
  const shadowActiveDataset = SHADOW_LONG.has(period) && backtestR5 ? backtestR5 : data?.backtest;
  const earliestDate: string | null = shadowActiveDataset?.dates?.[0] ?? null;
  const shadowPeriodMinDates: Record<string, string> = {
    since2009: '2009-01', since2013: '2013-01', since2020: '2020-01',
    '5y': '2021-01', '3y': '2023-01', all: '2005-01',
  };
  const shadowPeriodLimited = (key: string) => {
    const ds = SHADOW_LONG.has(key) && backtestR5 ? backtestR5 : data?.backtest;
    const earliest = ds?.dates?.[0] ?? null;
    if (!earliest) return false;
    return earliest > (shadowPeriodMinDates[key] ?? '2000-01');
  };

  // Q1 snapshot from data.shadows
  const snap = (data as any)?.shadows ?? null;
  const snapPeriodo = snap?.periodo ?? null;

  // Metrics from backtest.metrics for summary table
  const metrics = data?.backtest?.metrics ?? null;
  const targetM = metrics?.target ?? null;
  const shadowAM = metrics?.shadowA ?? null;

  const kpiRows = targetM ? [
    { label: 'CAGR',   target: targetM.cagr,   vwra: shadowAM?.cagr,   fmt: 'pct' as const },
    { label: 'Sharpe', target: targetM.sharpe,  vwra: shadowAM?.sharpe, fmt: 'num' as const },
    { label: 'Max DD', target: targetM.maxdd,   vwra: shadowAM?.maxdd,  fmt: 'pct' as const },
    { label: 'Vol',    target: targetM.vol,     vwra: shadowAM?.vol,    fmt: 'pct' as const },
  ] : [];

  return (
    <CollapsibleSection id="backtest-shadows" title={secTitle('backtest', 'shadow', 'Shadow Portfolios — Target vs VWRA')} defaultOpen={secOpen('backtest', 'shadow')}>

      {/* Period buttons */}
      <div className="period-btns" style={{ marginBottom: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {SHADOW_PERIODS.map(p => {
          const limited = shadowPeriodLimited(p.key);
          return (
            <Button
              key={p.key}
              variant={period === p.key ? 'default' : 'outline'}
              size="sm"
              title={limited ? `Dados disponíveis desde ${earliestDate}` : undefined}
              style={limited && period !== p.key ? { opacity: 0.55 } : undefined}
              onClick={() => setPeriod(p.key)}
            >
              {p.label}{limited ? ' *' : ''}
            </Button>
          );
        })}
      </div>
      {shadowPeriodLimited(period) && earliestDate && (
        <div style={{ marginBottom: 8, padding: '6px 10px', background: 'rgba(234,179,8,.08)', borderRadius: 5, borderLeft: '3px solid var(--yellow)', fontSize: '.72rem', color: 'var(--muted)' }}>
          * Dados disponíveis desde {earliestDate} — período completo não disponível.
        </div>
      )}

      {/* Equity curve chart — Target vs VWRA filtered by period */}
      {data && (
        <BacktestChart
          data={data}
          period={period}
          height={260}
          dataset={SHADOW_LONG.has(period) && backtestR5 ? backtestR5 : undefined}
        />
      )}

      {/* Metrics table */}
      {kpiRows.length > 0 && (
        <div style={{ overflowX: 'auto', marginTop: '10px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '5px 8px', color: 'var(--muted)', fontWeight: 600 }}>Métrica</th>
                <th style={{ textAlign: 'right', padding: '5px 8px', color: 'var(--muted)', fontWeight: 600 }}>Target</th>
                <th style={{ textAlign: 'right', padding: '5px 8px', color: 'var(--muted)', fontWeight: 600 }}>VWRA</th>
                <th style={{ textAlign: 'right', padding: '5px 8px', color: 'var(--muted)', fontWeight: 600 }}>Delta</th>
              </tr>
            </thead>
            <tbody>
              {kpiRows.map(row => {
                const fv = (v: number | null | undefined) =>
                  v == null ? '—' : row.fmt === 'num' ? v.toFixed(2) : fmtPct(v);
                const delta = row.target != null && row.vwra != null ? row.target - row.vwra : null;
                return (
                  <tr key={row.label} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '5px 8px' }}>{row.label}</td>
                    <td style={{ padding: '5px 8px', textAlign: 'right', fontWeight: 600 }}>{fv(row.target)}</td>
                    <td style={{ padding: '5px 8px', textAlign: 'right' }}>{fv(row.vwra)}</td>
                    <td style={{ padding: '5px 8px', textAlign: 'right', color: deltaColor(delta), fontWeight: 600 }}>
                      {delta != null ? fmtPct(delta) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Q1 snapshot if available */}
      {snap && snapPeriodo && (
        <div style={{ marginTop: '10px', padding: '10px', background: 'var(--card2)', borderRadius: 6, fontSize: '.78rem' }}>
          <div style={{ fontWeight: 600, color: 'var(--muted)', fontSize: '.65rem', textTransform: 'uppercase', marginBottom: '6px' }}>
            Performance {snapPeriodo}
          </div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {[
              { label: 'Carteira', value: snap.atual },
              { label: 'Target', value: snap.target },
              { label: 'Shadow A (VWRA)', value: snap.q1_2026?.shadow_a ?? null },
              { label: 'Shadow B', value: snap.q1_2026?.shadow_b ?? null },
              { label: 'Δ vs VWRA', value: snap.delta_vwra },
            ].filter(x => x.value != null).map(x => (
              <div key={x.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '.6rem', color: 'var(--muted)' }}>{x.label}</div>
                <div style={{ fontWeight: 700, color: (x.value ?? 0) >= 0 ? 'var(--green)' : 'var(--red)' }}>
                  {fmtPct(x.value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="src">
        Target: SWRD 50% / AVGS 30% / AVEM 20% (UCITS proxies) · Benchmark: VWRA.L (Vanguard FTSE All-World) · Rebase = 100 no início do período
      </div>
    </CollapsibleSection>
  );
}

// ── Backtest Longo — Regime 7 ─────────────────────────────────────────────────

function BacktestLongoSection() {
  const data = useDashboardStore(s => s.data);
  // backtest_r7 is at top-level of data; all sub-keys are directly on backtest_r7 (no .r7 sub-key)
  const r7 = data?.backtest_r7 ?? null;

  // Metrics — real field: metricas_globais (not .metrics)
  const metrics = r7?.metricas_globais ?? null;
  // win_rates — real field: at top-level of backtest_r7 (not inside metrics)
  const winRates = r7?.win_rates ?? null;
  const winRatePct = winRates?.['120m_pct'] ?? winRates?.['240m_pct'] ?? null;

  const metricCards = metrics ? [
    // cagr_target_pct is already in % (e.g. 9.79)
    { label: 'CAGR', value: metrics.cagr_target_pct != null ? `${metrics.cagr_target_pct.toFixed(2)}%` : '—', color: undefined as string | undefined },
    { label: 'Alpha vs VWRA', value: metrics.alpha_pp != null ? `${metrics.alpha_pp >= 0 ? '+' : ''}${metrics.alpha_pp.toFixed(2)}pp` : '—', color: metrics.alpha_pp != null ? deltaColor(metrics.alpha_pp) : undefined },
    { label: 'Sharpe', value: metrics.sharpe_target != null ? metrics.sharpe_target.toFixed(2) : '—', color: undefined as string | undefined },
    // max_dd_target_pct is already in % (e.g. -54.37)
    { label: 'Max DD', value: metrics.max_dd_target_pct != null ? `${metrics.max_dd_target_pct.toFixed(1)}%` : '—', color: undefined as string | undefined },
    // win_rates.120m_pct is already in % (e.g. 67.8)
    { label: 'Win Rate 10a', value: winRatePct != null ? `${winRatePct.toFixed(1)}%` : '—', color: undefined as string | undefined },
  ] : [];

  // CAGR by decade — real field: cagr_por_decada (list, not object)
  // Each entry: { Decada, Target, Benchmark, Delta, N_meses }
  const decadesList: Array<{ Decada: string; Target: number; Benchmark: number; Delta: number }> =
    r7?.cagr_por_decada ?? null;

  // Factor regression — real field: factor_regression (not ff5_regression)
  const ff5 = r7?.factor_regression ?? null;

  return (
    <CollapsibleSection id="backtest-r7" title={secTitle('backtest', 'longo-prazo', 'Backtest Longo — Regime 7 (1995–2026)')} defaultOpen={secOpen('backtest', 'longo-prazo', false)}>
      {/* Metrics grid */}
      {metricCards.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginBottom: '14px' }}>
          {metricCards.map(m => (
            <div key={m.label} style={{ background: 'var(--card2)', borderRadius: 'var(--radius-md)', padding: '10px', textAlign: 'center', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '.65rem', color: 'var(--muted)', marginBottom: '4px' }}>{m.label}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: m.color ?? 'var(--text)' }}>{m.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Risk Grid: Factor Drought + Drawdown Recovery */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
        <div style={{ background: 'var(--card2)', borderRadius: 'var(--radius-md)', padding: '10px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '.7rem', color: 'var(--muted)', marginBottom: '6px', fontWeight: 600 }}>Factor Drought</div>
          <div style={{ fontSize: '.75rem', color: 'var(--text)' }}>
            {r7?.factor_drought?.max_meses != null
              ? `Maior seca: ${(r7.factor_drought.max_meses / 12).toFixed(1)}a (${r7.factor_drought.max_meses}m)`
              : '—'}
          </div>
          {r7?.factor_drought?.nota && (
            <div style={{ fontSize: '.65rem', color: 'var(--muted)', marginTop: '4px' }}>{r7.factor_drought.nota}</div>
          )}
        </div>
        <div style={{ background: 'var(--card2)', borderRadius: 'var(--radius-md)', padding: '10px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '.7rem', color: 'var(--muted)', marginBottom: '6px', fontWeight: 600 }}>Drawdown Recovery</div>
          <div style={{ fontSize: '.75rem', color: 'var(--text)' }}>
            {r7?.drawdown_recovery?.max_meses != null
              ? `Máx recuperação: ${r7.drawdown_recovery.max_meses}m`
              : '—'}
          </div>
          {r7?.drawdown_recovery?.p90_meses != null && (
            <div style={{ fontSize: '.65rem', color: 'var(--muted)', marginTop: '2px' }}>P90: {r7.drawdown_recovery.p90_meses}m</div>
          )}
        </div>
      </div>

      {/* CAGR por Década — list format: [{ Decada, Target, Benchmark, Delta, N_meses }] */}
      {decadesList && decadesList.length > 0 && (
        <div style={{ marginTop: '14px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.82rem' }}>
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
      )}

      {/* Chart */}
      {data && <BacktestR7Chart data={data} />}

      {/* Factor Regression FF5 — collapsible */}
      <details style={{ marginTop: '10px' }}>
        <summary style={{ cursor: 'pointer', fontSize: '.8rem', color: 'var(--muted)', padding: '4px 0' }}>
          ▸ Factor Regression FF5 (técnico)
        </summary>
        {ff5 ? (
          <div style={{ marginTop: '8px', fontSize: '.78rem', background: 'var(--card2)', borderRadius: 'var(--radius-md)', padding: '10px' }}>
            {/* Top-level scalars */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px', marginBottom: '8px' }}>
              {Object.entries(ff5)
                .filter(([, v]) => typeof v === 'number')
                .map(([k, v]: [string, any]) => (
                  <div key={k} style={{ textAlign: 'center', padding: '6px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '.6rem', color: 'var(--muted)' }}>{k}</div>
                    <div style={{ fontWeight: 700 }}>{v.toFixed(3)}</div>
                  </div>
                ))
              }
            </div>
            {/* Betas sub-object */}
            {ff5.betas && (
              <div>
                <div style={{ fontSize: '.65rem', color: 'var(--muted)', marginBottom: '4px' }}>Betas</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '6px' }}>
                  {Object.entries(ff5.betas).map(([k, v]: [string, any]) => (
                    <div key={k} style={{ textAlign: 'center', padding: '5px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontSize: '.6rem', color: 'var(--muted)' }}>{k}</div>
                      <div style={{ fontWeight: 700 }}>{typeof v === 'number' ? v.toFixed(3) : String(v)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ marginTop: '8px', fontSize: '.75rem', color: 'var(--muted)' }}>Dados FF5 não disponíveis</div>
        )}
      </details>

      <div className="src">
        Dados: MSCI World NR USD (yfinance ^990100-USD-STRD) + DFA DFSVX/DISVX/DFEMX + Ken French EM. Rebalanceamento anual (dezembro). RF variável Ken French.
      </div>
    </CollapsibleSection>
  );
}

// ── Drawdown Histórico section ────────────────────────────────────────────────

function DrawdownHistoricoSection() {
  const data = useDashboardStore(s => s.data);
  const crises = data?.backtest?.crises ?? data?.drawdown_crises ?? [];

  return (
    <CollapsibleSection id="backtest-drawdown" title={secTitle('backtest', 'drawdown-historico', 'Drawdown Histórico — Série Completa')} defaultOpen={secOpen('backtest', 'drawdown-historico')}>
      {/* Chart */}
      {data && <DrawdownHistChart data={data} />}

      {/* Crises table */}
      {crises.length > 0 && (
        <div style={{ marginTop: '10px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.78rem' }}>
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
      )}

      {/* Colored lines legend */}
      <div style={{ marginTop: '10px', fontSize: '.6rem', color: 'var(--muted)', lineHeight: 1.6 }}>
        <span style={{ color: 'rgba(96,165,250,.7)' }}>┈┈</span> Tracejada azul = Sharpe em USD vs T-Bill (performance do equity isolado, sem câmbio).<br />
        <span style={{ color: 'rgba(255,255,255,.3)' }}>┈┈</span> Cinza = referência Sharpe=1.<br />
        <span style={{ color: 'rgba(239,68,68,.4)' }}>┈┈</span> Vermelha = zero (break-even vs CDI).<br />
        Método: TWR (time-weighted, sem efeito de aportes), σ populacional, anualizado √12.
      </div>

      <div className="src">
        Método: TWR (time-weighted, sem efeito de aportes), σ populacional, anualizado √12.
      </div>
    </CollapsibleSection>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BacktestPage() {
  const loadDataOnce = useDashboardStore(s => s.loadDataOnce);
  const data = useDashboardStore(s => s.data);
  const isLoading = useDashboardStore(s => s.isLoadingData);
  const dataError = useDashboardStore(s => s.dataLoadError);

  useEffect(() => {
    loadDataOnce().catch(e => console.error('Failed to load data:', e));
  }, [loadDataOnce]);

  if (isLoading) {
    return <div className="loading-state">⏳ Carregando backtest...</div>;
  }

  if (dataError) {
    return (
      <div className="error-state">
        <strong>❌ Erro ao carregar backtest:</strong> {dataError}
      </div>
    );
  }

  if (!data) {
    return <div className="warning-state">⚠️ Dados carregados mas seção backtest não disponível</div>;
  }

  return (
    <div>
      {/* 1. Backtest Histórico — Target vs VWRA */}
      <BacktestHistoricoSection />

      {/* 2. Drawdown Histórico — Série Completa (moved up: contexto de risco após retorno) */}
      <DrawdownHistoricoSection />

      {/* 3. Shadow Portfolios — Tracking */}
      <ShadowPortfoliosSection />

      {/* 4. Backtest Longo — Regime 7 (collapsed: análise histórica longa) */}
      <BacktestLongoSection />
    </div>
  );
}
