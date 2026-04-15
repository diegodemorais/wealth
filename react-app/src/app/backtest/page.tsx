'use client';

import { useEffect, useState } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { BacktestChart } from '@/components/charts/BacktestChart';
import { BacktestR7Chart } from '@/components/charts/BacktestR7Chart';
import { DrawdownHistChart } from '@/components/charts/DrawdownHistChart';

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

  // Metrics for selected period
  const metrics = backtest?.metrics_by_period?.[period] ?? backtest?.metrics ?? null;
  const targetMetrics = metrics?.target ?? metrics;
  const benchMetrics = metrics?.bench ?? null;

  // CAGR and TWR values
  const cagrPatrimonial: number | null = data?.attribution?.cagr_total ?? null;
  const twrUsd: number | null = targetMetrics?.cagr ?? targetMetrics?.twr_usd ?? null;

  // Build metrics table rows
  const metricRows: { label: string; target: string; vwra: string; delta: string; deltaVal: number | null }[] = [];
  if (targetMetrics) {
    const pairs: { label: string; tKey: string; bKey?: string }[] = [
      { label: 'CAGR',      tKey: 'cagr',          bKey: 'cagr' },
      { label: 'Sharpe',    tKey: 'sharpe',         bKey: 'sharpe' },
      { label: 'Volatility',tKey: 'volatility',     bKey: 'volatility' },
      { label: 'Max DD',    tKey: 'max_drawdown',   bKey: 'max_drawdown' },
      { label: 'Alpha',     tKey: 'alpha_pp',       bKey: undefined },
    ];
    pairs.forEach(({ label, tKey, bKey }) => {
      const tVal = targetMetrics[tKey];
      const bVal = bKey ? benchMetrics?.[bKey] : null;
      const dVal = tVal != null && bVal != null ? tVal - bVal : null;
      metricRows.push({
        label,
        target: tVal != null ? (tKey === 'sharpe' ? tVal.toFixed(2) : fmtPct(tVal)) : '—',
        vwra:   bVal != null ? (tKey === 'sharpe' ? bVal.toFixed(2) : fmtPct(bVal)) : '—',
        delta:  dVal != null ? fmtPct(dVal) : '—',
        deltaVal: dVal,
      });
    });
  }

  // Proxy warning note
  const notaProxy = backtest?.nota_proxy ?? null;

  return (
    <CollapsibleSection id="backtest-historico" title="Backtest Histórico — Target vs VWRA" defaultOpen={true}>
      {/* Period buttons */}
      <div className="period-btns" style={{ marginBottom: '12px' }}>
        {BACKTEST_PERIODS.map(p => (
          <button
            key={p.key}
            className={period === p.key ? 'active' : ''}
            title={p.title}
            onClick={() => setPeriod(p.key)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      {data && <BacktestChart data={data} />}

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
        <div style={{ background: 'var(--card2)', borderRadius: '8px', padding: '12px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '.7rem', color: 'var(--muted)', marginBottom: '6px' }}>CAGR Patrimonial (incl. aportes)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '6px' }} className="pv">
            {cagrPatrimonial != null ? fmtPct(cagrPatrimonial) : '—'}
          </div>
          <div style={{ fontSize: '.65rem', color: 'var(--muted)' }}>
            Crescimento total do patrimônio. Inflado por aportes — NÃO é performance dos ETFs.
          </div>
        </div>
        <div style={{ background: 'var(--card2)', borderRadius: '8px', padding: '12px', border: '1px solid var(--border)' }}>
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
        <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(234,179,8,.08)', borderRadius: '6px', borderLeft: '3px solid var(--yellow)', fontSize: '.72rem' }}>
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

  const shadows = data?.backtest?.shadows ?? data?.shadows ?? [];

  return (
    <CollapsibleSection id="backtest-shadows" title="Shadow Portfolios — Tracking" defaultOpen={true}>
      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.82rem', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '22%' }} />
            <col style={{ width: '32%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '26%' }} />
            <col style={{ width: '12%' }} />
          </colgroup>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Benchmark</th>
              <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Composição</th>
              <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>TER</th>
              <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Delta vs Carteira</th>
              <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {shadows.length > 0 ? shadows.map((s: any, i: number) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '6px 8px', fontWeight: 600 }}>{s.label ?? s.name ?? '—'}</td>
                <td style={{ padding: '6px 8px', color: 'var(--muted)', fontSize: '.75rem' }}>{s.composicao ?? s.composition ?? '—'}</td>
                <td style={{ padding: '6px 8px', textAlign: 'right' }}>{s.ter != null ? `${s.ter.toFixed(2)}%` : '—'}</td>
                <td style={{ padding: '6px 8px', textAlign: 'right', color: deltaColor(s.delta) }}>{s.delta != null ? fmtPct(s.delta) : '—'}</td>
                <td style={{ padding: '6px 8px', textAlign: 'right', fontSize: '.7rem' }}>{s.status ?? '—'}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} style={{ padding: '12px 8px', textAlign: 'center', color: 'var(--muted)', fontSize: '.8rem' }}>
                  Dados de shadow portfolios não disponíveis
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Period buttons */}
      <div className="period-btns" style={{ marginTop: '12px' }}>
        {SHADOW_PERIODS.map(p => (
          <button
            key={p.key}
            className={period === p.key ? 'active' : ''}
            onClick={() => setPeriod(p.key)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="src">
        Target: 50/30/20 UCITS proxies · Benchmark: VWRA.L (Vanguard FTSE All-World)
      </div>
    </CollapsibleSection>
  );
}

// ── Backtest Longo — Regime 7 ─────────────────────────────────────────────────

function BacktestLongoSection() {
  const data = useDashboardStore(s => s.data);
  const r7 = data?.backtest_r7 ?? data?.backtest?.r7 ?? null;

  // Metrics grid
  const metrics = r7?.metrics ?? null;
  const metricCards = metrics ? [
    { label: 'CAGR', value: metrics.cagr_target_pct != null ? `${metrics.cagr_target_pct.toFixed(2)}%` : '—' },
    { label: 'Alpha vs VWRA', value: metrics.alpha_pp != null ? `${metrics.alpha_pp >= 0 ? '+' : ''}${metrics.alpha_pp.toFixed(2)}pp` : '—' },
    { label: 'Sharpe', value: metrics.sharpe != null ? metrics.sharpe.toFixed(2) : '—' },
    { label: 'Max DD', value: metrics.max_drawdown != null ? fmtPct(metrics.max_drawdown) : '—' },
    { label: 'Volatility', value: metrics.volatility != null ? fmtPct(metrics.volatility) : '—' },
    { label: 'Win Rate', value: metrics.win_rate != null ? `${(metrics.win_rate * 100).toFixed(0)}%` : '—' },
  ] : [];

  // CAGR by decade
  const decades = r7?.cagr_decadas ?? r7?.decades ?? null;

  // FF5 regression
  const ff5 = r7?.ff5_regression ?? r7?.factor_regression ?? null;

  return (
    <CollapsibleSection id="backtest-r7" title="Backtest Longo — Regime 7 (1995–2026)" defaultOpen={true}>
      {/* Metrics grid */}
      {metricCards.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginBottom: '14px' }}>
          {metricCards.map(m => (
            <div key={m.label} style={{ background: 'var(--card2)', borderRadius: '8px', padding: '10px', textAlign: 'center', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '.65rem', color: 'var(--muted)', marginBottom: '4px' }}>{m.label}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{m.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Win Rate */}
      {r7?.win_rate_section && (
        <div style={{ marginBottom: '14px', padding: '10px', background: 'var(--card2)', borderRadius: '8px', fontSize: '.82rem' }}>
          <div style={{ color: 'var(--muted)', marginBottom: '4px', fontWeight: 600 }}>Win Rate</div>
          {r7.win_rate_section}
        </div>
      )}

      {/* Risk Grid: Factor Drought + Drawdown Recovery */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
        <div style={{ background: 'var(--card2)', borderRadius: '8px', padding: '10px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '.7rem', color: 'var(--muted)', marginBottom: '6px', fontWeight: 600 }}>Factor Drought</div>
          <div style={{ fontSize: '.75rem', color: 'var(--text)' }}>
            {r7?.factor_drought?.longest_drought_years != null
              ? `Maior seca: ${r7.factor_drought.longest_drought_years}a`
              : '—'}
          </div>
        </div>
        <div style={{ background: 'var(--card2)', borderRadius: '8px', padding: '10px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '.7rem', color: 'var(--muted)', marginBottom: '6px', fontWeight: 600 }}>Drawdown Recovery</div>
          <div style={{ fontSize: '.75rem', color: 'var(--text)' }}>
            {r7?.drawdown_recovery?.avg_months != null
              ? `Recuperação média: ${r7.drawdown_recovery.avg_months}m`
              : '—'}
          </div>
        </div>
      </div>

      {/* CAGR por Década */}
      {decades && (
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
              {Object.entries(decades).map(([decade, vals]: [string, any]) => (
                <tr key={decade} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '6px 8px' }}>{decade}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 600 }}>{vals.target != null ? `${vals.target.toFixed(2)}%` : '—'}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right' }}>{vals.bench != null ? `${vals.bench.toFixed(2)}%` : '—'}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', color: deltaColor(vals.alpha ?? (vals.target - vals.bench)) }}>
                    {vals.alpha != null ? fmtPct(vals.alpha) : (vals.target != null && vals.bench != null ? fmtPct(vals.target - vals.bench) : '—')}
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
          <div style={{ marginTop: '8px', fontSize: '.78rem', background: 'var(--card2)', borderRadius: '8px', padding: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px' }}>
              {Object.entries(ff5).map(([k, v]: [string, any]) => (
                <div key={k} style={{ textAlign: 'center', padding: '6px', border: '1px solid var(--border)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '.6rem', color: 'var(--muted)' }}>{k}</div>
                  <div style={{ fontWeight: 700 }}>{typeof v === 'number' ? v.toFixed(3) : String(v)}</div>
                </div>
              ))}
            </div>
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
    <CollapsibleSection id="backtest-drawdown" title="Drawdown Histórico — Série Completa" defaultOpen={false}>
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

      {/* 2. Shadow Portfolios — Tracking */}
      <ShadowPortfoliosSection />

      {/* 3. Backtest Longo — Regime 7 */}
      <BacktestLongoSection />

      {/* 4. Drawdown Histórico — Série Completa */}
      <DrawdownHistoricoSection />
    </div>
  );
}
