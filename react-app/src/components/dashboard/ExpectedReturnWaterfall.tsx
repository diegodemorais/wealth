'use client';

import React, { useState } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────────
interface FactorStep {
  factor: string;
  loading: number;
  premium_gross_pct: number;
  premium_net_pct: number;
}

interface ETFBreakdown {
  steps: FactorStep[];
  total_gross_pct: number;
  total_net_pct: number;
}

interface FactorData {
  haircut_pct: number;
  portfolio_weights: Record<string, number>;
  etf_breakdown: Record<string, ETFBreakdown>;
  portfolio_weighted: { total_gross_pct: number; total_net_pct: number };
}

// ── Dados calculados por factor_waterfall.py (metodológicos — não mudam sem mudar o modelo) ──
const FACTOR_DATA: FactorData = {
  haircut_pct: 0.58,
  portfolio_weights: { SWRD: 0.50, AVGS: 0.30, AVEM: 0.20 },
  etf_breakdown: {
    SWRD: {
      steps: [
        { factor: 'market', loading: 1.0, premium_gross_pct: 5.0, premium_net_pct: 2.1 },
        { factor: 'quality', loading: 0.05, premium_gross_pct: 0.175, premium_net_pct: 0.074 },
      ],
      total_gross_pct: 5.175,
      total_net_pct: 2.174,
    },
    AVGS: {
      steps: [
        { factor: 'market', loading: 1.0, premium_gross_pct: 5.0, premium_net_pct: 2.1 },
        { factor: 'value', loading: 0.35, premium_gross_pct: 1.4, premium_net_pct: 0.588 },
        { factor: 'size', loading: 0.3, premium_gross_pct: 0.6, premium_net_pct: 0.252 },
        { factor: 'quality', loading: 0.2, premium_gross_pct: 0.7, premium_net_pct: 0.294 },
      ],
      total_gross_pct: 7.7,
      total_net_pct: 3.234,
    },
    AVEM: {
      steps: [
        { factor: 'market', loading: 1.0, premium_gross_pct: 5.0, premium_net_pct: 2.1 },
        { factor: 'value', loading: 0.4, premium_gross_pct: 1.6, premium_net_pct: 0.672 },
        { factor: 'size', loading: 0.25, premium_gross_pct: 0.5, premium_net_pct: 0.21 },
        { factor: 'quality', loading: 0.15, premium_gross_pct: 0.525, premium_net_pct: 0.221 },
      ],
      total_gross_pct: 7.625,
      total_net_pct: 3.203,
    },
  },
  portfolio_weighted: {
    total_gross_pct: 6.423,
    total_net_pct: 2.698,
  },
};

const FACTOR_LABELS: Record<string, string> = {
  market: 'Market',
  value: 'Value (HML)',
  size: 'Size (SMB)',
  quality: 'Quality (CMA)',
  momentum: 'Momentum',
};

const FACTOR_COLORS: Record<string, string> = {
  market: '#3b82f6',
  value: '#a855f7',
  size: '#f59e0b',
  quality: '#22c55e',
  momentum: '#ec4899',
};

interface FactorBarProps {
  gross: number;
  net: number;
  maxGross: number;
  color: string;
}

function FactorBar({ gross, net, maxGross, color }: FactorBarProps) {
  const grossPct = maxGross > 0 ? (gross / maxGross) * 100 : 0;
  const netPct = gross > 0 ? (net / gross) * 100 : 0;
  return (
    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 3, height: 6, overflow: 'hidden', minWidth: 60, flex: 1 }}>
      <div style={{ width: `${grossPct}%`, background: 'rgba(255,255,255,0.18)', height: '100%', position: 'relative' }}>
        <div style={{ width: `${netPct}%`, background: color, height: '100%' }} />
      </div>
    </div>
  );
}

interface ETFCardProps {
  ticker: string;
  weight: number;
  breakdown: ETFBreakdown;
  maxGross: number;
}

function ETFCard({ ticker, weight, breakdown, maxGross }: ETFCardProps) {
  return (
    <div className="kpi" style={{ padding: '14px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{ticker}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{(weight * 100).toFixed(0)}% portfolio</div>
      </div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>Gross E[R]</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>{breakdown.total_gross_pct.toFixed(2)}%</div>
        </div>
        <div style={{ fontSize: 18, color: 'var(--muted)', alignSelf: 'center' }}>→</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>Net E[R]</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#22c55e' }}>{breakdown.total_net_pct.toFixed(2)}%</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {breakdown.steps.map((step) => (
          <div key={step.factor} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: FACTOR_COLORS[step.factor] ?? '#94a3b8',
              flexShrink: 0,
            }} />
            <div style={{ fontSize: 11, color: 'var(--muted)', width: 80, flexShrink: 0 }}>
              {FACTOR_LABELS[step.factor] ?? step.factor}
            </div>
            <div style={{ fontSize: 10, color: 'var(--muted)', width: 34, flexShrink: 0 }}>
              ×{step.loading.toFixed(2)}
            </div>
            <FactorBar
              gross={step.premium_gross_pct}
              net={step.premium_net_pct}
              maxGross={maxGross}
              color={FACTOR_COLORS[step.factor] ?? '#94a3b8'}
            />
            <div style={{ fontSize: 11, color: '#22c55e', width: 36, textAlign: 'right', flexShrink: 0 }}>
              {step.premium_net_pct.toFixed(2)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type ActiveView = 'todos' | 'SWRD' | 'AVGS' | 'AVEM';
const TICKERS = ['SWRD', 'AVGS', 'AVEM'] as const;

export function ExpectedReturnWaterfall() {
  const { etf_breakdown, portfolio_weighted, portfolio_weights, haircut_pct } = FACTOR_DATA;
  const [activeView, setActiveView] = useState<ActiveView>('todos');

  const allGross = Object.values(etf_breakdown).flatMap((b) =>
    b.steps.map((s) => s.premium_gross_pct)
  );
  const maxGross = Math.max(...allGross, 0.1);
  const haircutDisplay = `${(haircut_pct * 100).toFixed(0)}%`;
  const pctImprovement = portfolio_weighted.total_gross_pct > 0
    ? ((portfolio_weighted.total_net_pct / portfolio_weighted.total_gross_pct) * 100).toFixed(0)
    : '0';

  const visibleTickers = activeView === 'todos' ? TICKERS : [activeView as typeof TICKERS[number]];

  return (
    <div style={{ padding: '0 16px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: 10 }}>
        <h3 style={{ margin: '0 0 3px', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
          Expected Return Waterfall — Decomposição Fatorial
        </h3>
        <p style={{ margin: 0, fontSize: 11, color: 'var(--muted)' }}>
          Premiums FF6 × loadings × haircut McLean &amp; Pontiff ({haircutDisplay}) = alpha líquido
        </p>
      </div>

      {/* Ticker toggle */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
        {(['todos', ...TICKERS] as ActiveView[]).map((view) => {
          const isActive = activeView === view;
          const label = view === 'todos' ? 'Todos' : view;
          const weight = view !== 'todos' ? portfolio_weights[view] : null;
          return (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              style={{
                padding: '4px 12px',
                borderRadius: 6,
                border: '1px solid',
                borderColor: isActive ? 'rgba(59,130,246,0.5)' : 'var(--border)',
                background: isActive ? 'rgba(59,130,246,0.12)' : 'transparent',
                color: isActive ? '#3b82f6' : '#64748b',
                fontSize: 12,
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
              }}
            >
              {label}
              {weight != null && (
                <span style={{ marginLeft: 4, fontSize: 10, opacity: 0.7 }}>
                  {(weight * 100).toFixed(0)}%
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ETF cards */}
      <div
        className={activeView === 'todos' ? 'grid grid-cols-1 sm:grid-cols-3 gap-3' : ''}
        style={{ marginBottom: 12 }}
      >
        {visibleTickers.map((ticker) => (
          <ETFCard
            key={ticker}
            ticker={ticker}
            weight={portfolio_weights[ticker] ?? 0}
            breakdown={etf_breakdown[ticker] ?? { steps: [], total_gross_pct: 0, total_net_pct: 0 }}
            maxGross={maxGross}
          />
        ))}
      </div>

      {/* Portfolio ponderado — destaque (só no "Todos") */}
      {activeView === 'todos' && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(34,197,94,0.10) 100%)',
          border: '1px solid rgba(59,130,246,0.25)',
          borderRadius: 8,
          padding: '12px 16px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 16,
          marginBottom: 10,
        }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', flex: '1 1 120px' }}>
            Portfolio Ponderado (50/30/20)
          </div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 2 }}>Gross E[R]</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>
                {portfolio_weighted.total_gross_pct.toFixed(2)}%
              </div>
            </div>
            <div style={{ fontSize: 20, color: 'var(--muted)', alignSelf: 'center' }}>→</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 2 }}>Net E[R]</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#22c55e' }}>
                {portfolio_weighted.total_net_pct.toFixed(2)}%
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 2 }}>Retained</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b' }}>
                {pctImprovement}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legenda visual */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 20, height: 6, background: 'rgba(255,255,255,0.18)', borderRadius: 3 }} />
          <span style={{ fontSize: 10, color: 'var(--muted)' }}>Gross premium</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 20, height: 6, background: '#22c55e', borderRadius: 3 }} />
          <span style={{ fontSize: 10, color: 'var(--muted)' }}>Net (pós-haircut)</span>
        </div>
      </div>

      <p style={{ margin: 0, fontSize: 10, color: 'var(--muted)', fontStyle: 'italic' }}>
        Haircut {haircutDisplay} pós-publicação (McLean &amp; Pontiff 2016). Alpha líquido real: ~0.16%/ano.
        Loadings estimados: AVGS proxy FF5 via w_EUA×AVUV + (1−w)×AVDV.
      </p>
    </div>
  );
}

export default ExpectedReturnWaterfall;
