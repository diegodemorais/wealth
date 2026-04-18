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

function r2Color(r2: number): { textColor: string; bg: string; border: string; label: string; className: string } {
  if (r2 >= 0.95) return { textColor: 'rgb(74, 222, 128)', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', label: 'Good', className: 'text-green bg-green-900/10 border-green-600/25' }
  if (r2 >= 0.80) return { textColor: 'rgb(250, 204, 21)', bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.3)', label: 'Good', className: 'text-yellow bg-yellow-900/10 border-yellow-600/25' }
  return { textColor: 'rgb(248, 113, 113)', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', label: 'Weak', className: 'text-red bg-red-900/10 border-red-600/25' }
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
    <div className="flex flex-col gap-4">
      {/* Quality Badges Row */}
      <div className="bg-card border border-border rounded p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-4 mt-0">
          Model Fit — R² Quality
        </h3>
        <div className="flex flex-wrap gap-2">
          {etfs.map(({ ticker, r2 }) => {
            const cfg = r2Color(r2)
            return (
              <div
                key={ticker}
                className={`flex items-center gap-2 rounded border p-1.5 ${cfg.className}`}
                title={
                  r2 < 0.80
                    ? `Modelo FF5 explica mal este ETF (R²=${(r2 * 100).toFixed(1)}%)`
                    : `R²=${(r2 * 100).toFixed(1)}%`
                }
              >
                <span className="font-mono text-sm font-semibold text-text">{ticker}</span>
                <span className="font-mono text-xs" style={{ color: cfg.textColor }}>
                  R² {(r2 * 100).toFixed(1)}%{r2Icon(r2)}
                </span>
                <span className="text-xs" style={{ color: cfg.textColor }}>{cfg.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Factor Significance Table */}
      <div className="bg-card border border-border rounded p-4">
        <h4 className="text-sm font-semibold text-text mb-3 mt-0">Factor Significance</h4>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-2 text-muted font-medium">ETF</th>
                {FACTOR_KEYS.map((f) => (
                  <th key={f} className="text-right p-2 text-muted font-medium">
                    {FACTOR_LABELS[f]}
                  </th>
                ))}
                <th className="text-right p-2 text-muted font-medium">R²</th>
                <th className="text-right p-2 text-muted font-medium">N</th>
              </tr>
            </thead>
            <tbody>
              {etfs.map(({ ticker, r2, n_months, t_stats, loadings }) => (
                <tr key={ticker} className="border-b border-border">
                  <td className="p-2 font-mono font-semibold text-text">{ticker}</td>
                  {FACTOR_KEYS.map((f) => {
                    const coef = typeof loadings[f] === "number" ? loadings[f] : 0
                    const tStat = typeof t_stats[f] === "number" ? t_stats[f] : 0
                    const significant = Math.abs(tStat) >= 2
                    return (
                      <td
                        key={f}
                        className="text-right p-2 font-mono"
                        style={{ opacity: significant ? 1 : 0.4 }}
                        title={`t-stat: ${tStat.toFixed(2)}`}
                      >
                        <span className={coef > 0 ? 'text-green' : coef < 0 ? 'text-red' : 'text-muted'}>
                          {coef >= 0 ? "+" : ""}
                          {coef.toFixed(2)}
                        </span>
                      </td>
                    )
                  })}
                  <td className="text-right p-2">
                    <span className="font-mono font-semibold" style={{ color: r2Color(r2).textColor }}>
                      {(r2 * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="text-right p-2 font-mono text-muted">
                    {n_months}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted mt-3 mb-0">
          Fama-French 5 + Momentum. Coefficients with |t-stat| &lt; 2 shown at 40% opacity (not significant).
        </p>
        <p className="text-xs text-muted mt-1 mb-0" style={{ fontStyle: 'italic' }}>
          Loadings calculados sobre proxies (AVUV/AVDV para AVGS, EIMI para AVEM) — ETFs alvo têm histórico &lt; 24 meses. Atualizar quando AVGS/AVEM completarem 24 meses de dados.
        </p>
      </div>
    </div>
  )
}
