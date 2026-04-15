"use client"

import { useMemo } from "react"

interface ETFLoadings {
  r2: number
  n_months: number
  t_stats: Record<string, number>
  [key: string]: any
}

interface FactorLoadingsTableProps {
  data: Record<string, ETFLoadings>
}

function r2Color(r2: number): { textColor: string; bg: string; border: string; label: string } {
  if (r2 >= 0.95) return { textColor: '#4ade80', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', label: 'Good' }
  if (r2 >= 0.80) return { textColor: '#facc15', bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.3)', label: 'Good' }
  return { textColor: '#f87171', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', label: 'Weak' }
}

function r2Icon(r2: number): string {
  if (r2 >= 0.80) return ""
  return " \u26A0"
}

const FACTOR_KEYS = ["mkt_rf", "smb", "hml", "rmw", "cma", "mom"] as const
const FACTOR_LABELS: Record<string, string> = {
  mkt_rf: "Mkt-RF",
  smb: "SMB",
  hml: "HML",
  rmw: "RMW",
  cma: "CMA",
  mom: "Mom",
}

export function FactorLoadingsTable({ data }: FactorLoadingsTableProps) {
  if (!data || typeof data !== "object" || Object.keys(data).length === 0) {
    return <div style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Factor loadings data unavailable</div>
  }

  const etfs = useMemo(() => {
    return Object.entries(data)
      .map(([ticker, loadings]) => ({
        ticker,
        r2: typeof loadings.r2 === "number" ? loadings.r2 : 0,
        n_months: typeof loadings.n_months === "number" ? loadings.n_months : 0,
        t_stats: loadings.t_stats || {},
        loadings,
      }))
      .sort((a, b) => b.r2 - a.r2)
  }, [data])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Quality Badges Row */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
        <h3 style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', marginBottom: '16px', marginTop: 0 }}>
          Model Fit — R² Quality
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {etfs.map(({ ticker, r2 }) => {
            const cfg = r2Color(r2)
            return (
              <div
                key={ticker}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  borderRadius: '6px', border: `1px solid ${cfg.border}`,
                  padding: '6px 12px', background: cfg.bg,
                }}
                title={
                  r2 < 0.80
                    ? `Modelo FF5 explica mal este ETF (R²=${(r2 * 100).toFixed(1)}%)`
                    : `R²=${(r2 * 100).toFixed(1)}%`
                }
              >
                <span style={{ fontFamily: 'monospace', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>{ticker}</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: cfg.textColor }}>
                  R² {(r2 * 100).toFixed(1)}%{r2Icon(r2)}
                </span>
                <span style={{ fontSize: '0.75rem', color: cfg.textColor }}>{cfg.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Factor Significance Table */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', marginBottom: '12px', marginTop: 0 }}>Factor Significance</h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px 8px 0', color: 'var(--muted)', fontWeight: 500 }}>ETF</th>
                {FACTOR_KEYS.map((f) => (
                  <th key={f} style={{ textAlign: 'right', padding: '8px', color: 'var(--muted)', fontWeight: 500 }}>
                    {FACTOR_LABELS[f]}
                  </th>
                ))}
                <th style={{ textAlign: 'right', padding: '8px 0 8px 12px', color: 'var(--muted)', fontWeight: 500 }}>R²</th>
                <th style={{ textAlign: 'right', padding: '8px 0 8px 12px', color: 'var(--muted)', fontWeight: 500 }}>N</th>
              </tr>
            </thead>
            <tbody>
              {etfs.map(({ ticker, r2, n_months, t_stats, loadings }) => (
                <tr key={ticker} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px 12px 8px 0', fontFamily: 'monospace', fontWeight: 600, color: 'var(--text)' }}>{ticker}</td>
                  {FACTOR_KEYS.map((f) => {
                    const coef = typeof loadings[f] === "number" ? loadings[f] : 0
                    const tStat = typeof t_stats[f] === "number" ? t_stats[f] : 0
                    const significant = Math.abs(tStat) >= 2
                    return (
                      <td
                        key={f}
                        style={{ textAlign: 'right', padding: '8px', fontFamily: 'monospace', opacity: significant ? 1 : 0.4 }}
                        title={`t-stat: ${tStat.toFixed(2)}`}
                      >
                        <span style={{ color: coef > 0 ? '#4ade80' : coef < 0 ? '#f87171' : 'var(--muted)' }}>
                          {coef >= 0 ? "+" : ""}
                          {coef.toFixed(2)}
                        </span>
                      </td>
                    )
                  })}
                  <td style={{ textAlign: 'right', padding: '8px 0 8px 12px' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, color: r2Color(r2).textColor }}>
                      {(r2 * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', padding: '8px 0 8px 12px', fontFamily: 'monospace', color: 'var(--muted)' }}>
                    {n_months}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '12px', marginBottom: 0 }}>
          Fama-French 5 + Momentum. Coefficients with |t-stat| &lt; 2 shown at 40% opacity (not significant).
        </p>
      </div>
    </div>
  )
}
