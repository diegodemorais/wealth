"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ETFLoadings {
  r2: number
  n_months: number
  t_stats: Record<string, number>
  [key: string]: any
}

interface FactorLoadingsTableProps {
  data: Record<string, ETFLoadings>
}

function r2Color(r2: number): { text: string; bg: string; label: string } {
  if (r2 >= 0.95) return { text: "text-green-400", bg: "bg-green-500/20 border-green-500/30", label: "Good" }
  if (r2 >= 0.80) return { text: "text-yellow-400", bg: "bg-yellow-500/20 border-yellow-500/30", label: "Good" }
  return { text: "text-red-400", bg: "bg-red-500/20 border-red-500/30", label: "Weak" }
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
    return <div className="text-muted-foreground">Factor loadings data unavailable</div>
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
    <div className="space-y-4">
      {/* Quality Badges Row */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
            Model Fit — R&sup2; Quality
          </h3>
          <div className="flex flex-wrap gap-2">
            {etfs.map(({ ticker, r2 }) => {
              const cfg = r2Color(r2)
              return (
                <div
                  key={ticker}
                  className={cn(
                    "flex items-center gap-2 rounded-md border px-3 py-1.5",
                    cfg.bg
                  )}
                  title={
                    r2 < 0.80
                      ? `Modelo FF5 explica mal este ETF (R\u00B2=${(r2 * 100).toFixed(1)}%)`
                      : `R\u00B2=${(r2 * 100).toFixed(1)}%`
                  }
                >
                  <span className="font-mono text-sm font-semibold">{ticker}</span>
                  <span className={cn("font-mono text-xs", cfg.text)}>
                    R&sup2; {(r2 * 100).toFixed(1)}%{r2Icon(r2)}
                  </span>
                  <span className={cn("text-xs", cfg.text)}>{cfg.label}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Factor Significance Table */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="text-sm font-semibold mb-3">Factor Significance</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-3 text-muted-foreground font-medium">ETF</th>
                  {FACTOR_KEYS.map((f) => (
                    <th key={f} className="text-right py-2 px-2 text-muted-foreground font-medium">
                      {FACTOR_LABELS[f]}
                    </th>
                  ))}
                  <th className="text-right py-2 pl-3 text-muted-foreground font-medium">R&sup2;</th>
                  <th className="text-right py-2 pl-3 text-muted-foreground font-medium">N</th>
                </tr>
              </thead>
              <tbody>
                {etfs.map(({ ticker, r2, n_months, t_stats, loadings }) => (
                  <tr key={ticker} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2 pr-3 font-mono font-semibold">{ticker}</td>
                    {FACTOR_KEYS.map((f) => {
                      const coef = typeof loadings[f] === "number" ? loadings[f] : 0
                      const tStat = typeof t_stats[f] === "number" ? t_stats[f] : 0
                      const significant = Math.abs(tStat) >= 2
                      return (
                        <td
                          key={f}
                          className={cn(
                            "text-right py-2 px-2 font-mono",
                            significant ? "opacity-100" : "opacity-40"
                          )}
                          title={`t-stat: ${tStat.toFixed(2)}`}
                        >
                          <span
                            className={cn(
                              coef > 0 ? "text-green-400" : coef < 0 ? "text-red-400" : "text-muted-foreground"
                            )}
                          >
                            {coef >= 0 ? "+" : ""}
                            {coef.toFixed(2)}
                          </span>
                        </td>
                      )
                    })}
                    <td className="text-right py-2 pl-3">
                      <span className={cn("font-mono font-semibold", r2Color(r2).text)}>
                        {(r2 * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-right py-2 pl-3 font-mono text-muted-foreground">
                      {n_months}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Fama-French 5 + Momentum. Coefficients with |t-stat| &lt; 2 shown at 40% opacity (not significant).
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
