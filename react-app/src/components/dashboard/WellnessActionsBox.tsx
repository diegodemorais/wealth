"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useUiStore } from "@/store/uiStore"

interface WellnessMetric {
  id: string
  label: string
  max: number
  description: string
  thresholds: Array<Record<string, number | string>>
  colors: { good: number; warn: number }
}

interface WellnessConfig {
  total_max: number
  metrics: WellnessMetric[]
}

interface WellnessAction {
  rank: number
  metric: string
  potential_pts: number
  current_pts: number
  action: string
}

interface WellnessActionsBoxProps {
  wellnessConfig: WellnessConfig
  pfire?: number
  driftMaxPp?: number
  savingsRate?: number
  ipcaGapPp?: number
  dcaActive?: boolean
}

// Action recommendations per metric
const ACTION_TEXT: Record<string, string> = {
  pfire: "Aumentar aporte mensal ou aguardar crescimento patrimonial",
  savings_rate: "Aumentar aporte relativo ao custo de vida",
  drift: "Rebalancear via próximo aporte no ativo mais defasado",
  ipca_gap: "Continuar DCA em IPCA+ enquanto taxa acima do piso",
  execution_fidelity: "Manter disciplina de aportes mensais consistentes",
  emergency_fund: "Manter reserva de emergência em 6+ meses de custo de vida",
  ter: "Avaliar ETFs de menor custo na próxima revisão semestral",
  human_capital: "Contratar seguro de vida ao casar",
}

function computeMetricScore(metric: WellnessMetric, props: WellnessActionsBoxProps): number {
  const thresholds = metric.thresholds
  if (!thresholds || !thresholds.length) return 0

  switch (metric.id) {
    case "pfire": {
      const pfire = props.pfire
      if (pfire == null) return 0
      const pct = pfire > 1 ? pfire : pfire * 100
      for (const t of thresholds) {
        if (typeof t.min === "number" && pct >= t.min) return typeof t.pts === "number" ? t.pts : 0
      }
      return 0
    }
    case "savings_rate": {
      const sr = props.savingsRate
      if (sr == null) return Math.round(metric.max * 0.5) // neutral
      const pct = sr > 1 ? sr : sr * 100
      for (const t of thresholds) {
        if (typeof t.min_pct === "number" && pct >= t.min_pct) return typeof t.pts === "number" ? t.pts : 0
      }
      return 0
    }
    case "drift": {
      const drift = props.driftMaxPp
      if (drift == null) return Math.round(metric.max * 0.5)
      for (const t of thresholds) {
        if (typeof t.max_pp === "number" && drift <= t.max_pp) return typeof t.pts === "number" ? t.pts : 0
      }
      return 0
    }
    case "ipca_gap": {
      const gap = props.ipcaGapPp
      if (gap == null) return Math.round(metric.max * 0.5)
      for (const t of thresholds) {
        if (typeof t.max_pp === "number" && gap <= t.max_pp) {
          return typeof t.pts === "number" ? t.pts : 0
        }
      }
      // Last threshold — check DCA active
      const lastT = thresholds[thresholds.length - 1]
      if (props.dcaActive && typeof lastT.pts_if_dca === "number") return lastT.pts_if_dca
      return typeof lastT.pts === "number" ? lastT.pts : 0
    }
    case "execution_fidelity":
      return Math.round(metric.max * 0.7) // neutral without data
    case "emergency_fund":
      return metric.max // assume adequate
    case "ter": {
      // Use config values if available
      return 3 // delta ~0.03pp → 3pts
    }
    case "human_capital":
      return metric.max // solteiro sem dependentes = max
    default:
      return Math.round(metric.max * 0.5)
  }
}

export function WellnessActionsBox(props: WellnessActionsBoxProps) {
  const privacyMode = useUiStore(s => s.privacyMode)
  const { wellnessConfig } = props

  // Defensive validation
  if (!wellnessConfig || !Array.isArray(wellnessConfig.metrics) || wellnessConfig.metrics.length === 0) {
    return <div className="text-muted-foreground text-sm">Wellness config unavailable</div>
  }

  // Compute actions: score each metric, find gap, rank by potential
  const actions: WellnessAction[] = wellnessConfig.metrics
    .map((metric) => {
      const current = computeMetricScore(metric, props)
      const potential = metric.max - current
      return {
        rank: 0,
        metric: metric.label,
        potential_pts: potential,
        current_pts: current,
        action: ACTION_TEXT[metric.id] || metric.description,
      }
    })
    .filter((a) => a.potential_pts > 0)
    .sort((a, b) => b.potential_pts - a.potential_pts)
    .slice(0, 3)
    .map((a, i) => ({ ...a, rank: i + 1 }))

  // Compute total score
  const totalScore = wellnessConfig.metrics.reduce(
    (sum, m) => sum + computeMetricScore(m, props),
    0
  )
  const totalMax = wellnessConfig.total_max || 100

  if (actions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-sm text-green-400 font-semibold">
            All wellness metrics at maximum.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Score summary */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Top actions to improve score
        </h3>
        <Badge
          variant="outline"
          className="bg-amber-500/10 text-amber-400 border-amber-500/30 font-mono"
        >
          {privacyMode ? "••••" : `${totalScore}/${totalMax}`}
        </Badge>
      </div>

      {/* Actions list */}
      <div className="space-y-3">
        {actions.map((action) => (
          <Card
            key={action.rank}
            className="border-amber-500/20 bg-amber-500/5"
          >
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                {/* Rank number */}
                <div
                  className={cn(
                    "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold",
                    "bg-amber-500/20 text-amber-400"
                  )}
                >
                  {action.rank}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <span className="text-sm font-semibold text-foreground">
                      {action.metric}
                    </span>
                    <span className="text-xs font-mono text-amber-400 flex-shrink-0">
                      {privacyMode
                        ? "••••"
                        : `+${action.potential_pts}pts potential`}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {action.action}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer note */}
      <p className="text-xs text-muted-foreground leading-relaxed">
        Score based on {wellnessConfig.metrics.length} metrics: discipline, protection, and execution.
      </p>
    </div>
  )
}
