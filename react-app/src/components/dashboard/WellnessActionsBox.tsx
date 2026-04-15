"use client"

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
      if (sr == null) return Math.round(metric.max * 0.5)
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
      const lastT = thresholds[thresholds.length - 1]
      if (props.dcaActive && typeof lastT.pts_if_dca === "number") return lastT.pts_if_dca
      return typeof lastT.pts === "number" ? lastT.pts : 0
    }
    case "execution_fidelity":
      return Math.round(metric.max * 0.7)
    case "emergency_fund":
      return metric.max
    case "ter": {
      return 3
    }
    case "human_capital":
      return metric.max
    default:
      return Math.round(metric.max * 0.5)
  }
}

export function WellnessActionsBox(props: WellnessActionsBoxProps) {
  const privacyMode = useUiStore(s => s.privacyMode)
  const { wellnessConfig } = props

  if (!wellnessConfig || !Array.isArray(wellnessConfig.metrics) || wellnessConfig.metrics.length === 0) {
    return <div style={{ color: 'var(--muted)', fontSize: '0.875rem' }}>Wellness config unavailable</div>
  }

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

  const totalScore = wellnessConfig.metrics.reduce(
    (sum, m) => sum + computeMetricScore(m, props),
    0
  )
  const totalMax = wellnessConfig.total_max || 100

  if (actions.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--green)', fontWeight: 600 }}>
          All wellness metrics at maximum.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Score summary */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', margin: 0 }}>
          Top actions to improve score
        </h3>
        <span style={{
          padding: '2px 10px',
          borderRadius: '4px',
          border: '1px solid rgba(245,158,11,0.3)',
          background: 'rgba(245,158,11,0.1)',
          color: 'var(--yellow)',
          fontFamily: 'monospace',
          fontSize: '0.75rem',
          fontWeight: 600,
        }}>
          {privacyMode ? "••••" : `${totalScore}/${totalMax}`}
        </span>
      </div>

      {/* Actions list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {actions.map((action) => (
          <div
            key={action.rank}
            style={{
              border: '1px solid rgba(245,158,11,0.2)',
              background: 'rgba(245,158,11,0.05)',
              borderRadius: '8px',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              {/* Rank number */}
              <div style={{
                flexShrink: 0,
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.875rem',
                fontWeight: 700,
                background: 'rgba(245,158,11,0.2)',
                color: 'var(--yellow)',
              }}>
                {action.rank}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>
                    {action.metric}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--yellow)', flexShrink: 0 }}>
                    {privacyMode ? "••••" : `+${action.potential_pts}pts potential`}
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.5, margin: 0 }}>
                  {action.action}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <p style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.5, margin: 0 }}>
        Score based on {wellnessConfig.metrics.length} metrics: discipline, protection, and execution.
      </p>
    </div>
  )
}
