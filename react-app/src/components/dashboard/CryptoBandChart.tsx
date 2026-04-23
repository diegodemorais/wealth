"use client"

import { useUiStore } from "@/store/uiStore"
import { fmtPrivacy } from '@/utils/privacyTransform';

interface BandData {
  min_pct: number
  alvo_pct: number
  max_pct: number
  atual_pct: number
  status: "verde" | "amarelo" | "vermelho"
}

interface CryptoBandChartProps {
  banda: BandData
  label?: string
  valor?: number
  pnl_pct?: number
}

export function CryptoBandChart({
  banda,
  label = "HODL11 — BTC Wrapper — B3",
  valor,
  pnl_pct,
}: CryptoBandChartProps) {
  const privacyMode = useUiStore(s => s.privacyMode);

  const min = typeof banda?.min_pct === "number" ? banda.min_pct : 0
  const alvo = typeof banda?.alvo_pct === "number" ? banda.alvo_pct : 0
  const max = typeof banda?.max_pct === "number" ? banda.max_pct : 0
  const atual = typeof banda?.atual_pct === "number" ? banda.atual_pct : 0
  const status = banda?.status || "verde"

  const chartMax = Math.max(max + 1, atual + 0.5)
  const chartMin = 0

  const toPercent = (val: number) =>
    Math.max(0, Math.min(100, ((val - chartMin) / (chartMax - chartMin)) * 100))

  const minPos = toPercent(min)
  const alvoPos = toPercent(alvo)
  const maxPos = toPercent(max)
  const atualPos = toPercent(atual)

  const isUnderweight = atual < min
  const isOverweight = atual > max
  const isInBand = !isUnderweight && !isOverweight

  const badgeColor = isInBand ? 'var(--green)' : isUnderweight ? 'var(--red)' : 'var(--yellow)'
  const badgeBg = isInBand ? 'rgba(34,197,94,0.2)' : isUnderweight ? 'rgba(239,68,68,0.2)' : 'rgba(234,179,8,0.2)'
  const badgeBorder = isInBand ? 'rgba(34,197,94,0.3)' : isUnderweight ? 'rgba(239,68,68,0.3)' : 'rgba(234,179,8,0.3)'
  const markerColor = isInBand ? 'var(--green)' : isUnderweight ? 'var(--red)' : 'var(--yellow)'

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: 'var(--space-5)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h4 style={{ fontWeight: 600, fontSize: 'var(--text-md)', color: 'var(--text)', margin: '0 0 4px 0' }}>{label}</h4>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', margin: 0 }}>
            Atual: {atual.toFixed(1)}% · Alvo {alvo.toFixed(0)}% · Banda{" "}
            {min.toFixed(1)}–{max.toFixed(1)}%
          </p>
        </div>
        <span style={{
          fontSize: 'var(--text-sm)',
          padding: '2px 8px',
          borderRadius: '4px',
          border: `1px solid ${badgeBorder}`,
          background: badgeBg,
          color: badgeColor,
        }}>
          {isInBand ? "In Band" : isUnderweight ? "Underweight" : "Overweight"}
        </span>
      </div>

      {/* Band Visualization */}
      <div style={{ position: 'relative', height: '40px', marginBottom: '8px' }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '20px', background: 'var(--bg)', overflow: 'hidden' }}>
          {/* Red zone: 0 to min */}
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: '0%', width: `${minPos}%`, background: 'rgba(239,68,68,0.2)' }} />
          {/* Green zone: min to max */}
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${minPos}%`, width: `${maxPos - minPos}%`, background: 'rgba(34,197,94,0.2)' }} />
          {/* Yellow zone: max to end */}
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${maxPos}%`, width: `${100 - maxPos}%`, background: 'rgba(234,179,8,0.15)' }} />
        </div>

        {/* Min threshold line */}
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${minPos}%`, width: '1px', background: 'rgba(239,68,68,0.6)' }} />
        {/* Alvo center line */}
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${alvoPos}%`, width: '1px', background: 'rgba(34,197,94,0.4)', borderRight: '1px dashed rgba(34,197,94,0.4)' }} />
        {/* Max threshold line */}
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${maxPos}%`, width: '1px', background: 'rgba(234,179,8,0.6)' }} />

        {/* Current position marker */}
        <div style={{ position: 'absolute', top: '50%', left: `${atualPos}%`, transform: 'translate(-50%, -50%)', zIndex: 10 }}>
          <div style={{
            width: '16px', height: '16px', borderRadius: '50%',
            background: markerColor, border: `2px solid ${markerColor}55`,
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }} />
        </div>
      </div>

      {/* Scale labels */}
      <div style={{ position: 'relative', height: '20px', fontSize: '10px', color: 'var(--muted)', fontFamily: 'monospace' }}>
        <span style={{ position: 'absolute', transform: 'translateX(-50%)', left: `${minPos}%` }}>{min.toFixed(1)}%</span>
        <span style={{ position: 'absolute', transform: 'translateX(-50%)', left: `${alvoPos}%` }}>{alvo.toFixed(0)}%</span>
        <span style={{ position: 'absolute', transform: 'translateX(-50%)', left: `${maxPos}%` }}>{max.toFixed(1)}%</span>
        <span style={{ position: 'absolute', transform: 'translateX(-50%)', left: `${atualPos}%`, fontWeight: 600, color: markerColor }}>
          ▲ {atual.toFixed(1)}%
        </span>
      </div>

      {/* Footer stats */}
      {(valor !== undefined || pnl_pct !== undefined) && (
        <>
          <div style={{ borderTop: '1px solid var(--border)', margin: '12px 0', opacity: 0.3 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
            {valor !== undefined && (
              <span>Posição: {privacyMode ? '••••' : `R$${(valor / 1000).toFixed(0)}k`}</span>
            )}
            {pnl_pct !== undefined && (
              <span style={{ fontFamily: 'monospace', color: pnl_pct >= 0 ? 'var(--green)' : 'var(--red)' }}>
                P&amp;L: {privacyMode ? '••••' : `${pnl_pct >= 0 ? "+" : ""}${pnl_pct.toFixed(1)}%`}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  )
}
