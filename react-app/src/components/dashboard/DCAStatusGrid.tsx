"use client"

import { useUiStore } from "@/store/uiStore"
import { DcaItem } from "@/types/dashboard"

interface DCAStatusGridProps {
  items: DcaItem[]
}

const BORDER_COLOR: Record<string, string> = {
  ipca2040: 'rgba(6,182,212,0.4)',  // cyan
  ipca2050: 'rgba(139,92,246,0.4)', // violet
  renda2065: 'rgba(245,158,11,0.4)', // amber
  hodl11: 'rgba(234,179,8,0.4)',    // yellow
}

export function DCAStatusGrid({ items }: DCAStatusGridProps) {
  const privacyMode = useUiStore(s => s.privacyMode)
  const validItems = Array.isArray(items) ? items.filter(i => i && typeof i === 'object') : []

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
          DCA Status
        </h3>
        <div className="dca-grid">
          {validItems.map(item => {
            const borderColor = BORDER_COLOR[item.id] ?? 'rgba(88,166,255,0.3)'
            const isAtivo = item.dcaAtivo
            const taxa = item.taxa
            const pisoC = item.pisoCompra
            const pisoV = item.pisoVenda
            const gap = item.gapPiso

            return (
              <div
                key={item.id}
                className="dca-card"
                style={{ borderLeft: `3px solid ${borderColor}` }}
              >
                <div className="pt-4 px-4 pb-4">
                  {/* Header: Nome + Status Badge */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <h4 className="font-semibold text-sm">{item.nome}</h4>
                    <span style={{
                      fontSize: '0.7rem',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      border: isAtivo ? '1px solid rgba(34,197,94,0.3)' : '1px solid var(--border)',
                      background: isAtivo ? 'rgba(34,197,94,0.2)' : 'var(--bg)',
                      color: isAtivo ? 'var(--green)' : 'var(--muted)',
                      fontWeight: 600,
                    }}>
                      {isAtivo ? 'ATIVO' : 'PAUSADO'}
                    </span>
                  </div>

                  {/* Rows */}
                  <div className="space-y-2 text-xs">
                    {taxa != null && (
                      <div className="flex justify-between items-baseline">
                        <span className="text-muted-foreground">Taxa atual</span>
                        <span className="font-mono font-semibold">
                          {privacyMode ? '••••' : `${taxa.toFixed(2)}%`}
                        </span>
                      </div>
                    )}

                    {pisoC != null && (
                      <div className="flex justify-between items-baseline">
                        <span className="text-muted-foreground">Piso compra</span>
                        <span className="font-mono">{privacyMode ? '••••' : `${pisoC.toFixed(1)}%`}</span>
                      </div>
                    )}

                    {pisoV != null && (
                      <div className="flex justify-between items-baseline">
                        <span className="text-muted-foreground">Piso venda</span>
                        <span className="font-mono">{privacyMode ? '••••' : `${pisoV.toFixed(1)}%`}</span>
                      </div>
                    )}

                    {gap != null && (
                      <div className="flex justify-between items-baseline">
                        <span className="text-muted-foreground">Gap vs piso</span>
                        <span
                          className="font-mono font-semibold"
                          style={{ color: gap > 0.5 ? 'var(--green)' : 'var(--yellow)' }}
                        >
                          {privacyMode ? '••••' : `${gap > 0 ? '+' : ''}${gap.toFixed(2)}pp`}
                        </span>
                      </div>
                    )}

                    {item.pctCarteira != null && item.alvoPct != null && (
                      <div className="flex justify-between items-baseline">
                        <span className="text-muted-foreground">% carteira</span>
                        <span className="font-mono">
                          {privacyMode ? '••••' : `${item.pctCarteira.toFixed(1)}% / ${item.alvoPct.toFixed(0)}%`}
                        </span>
                      </div>
                    )}

                    {item.categoria === 'crypto' && item.bandaAtual != null && (
                      <div className="flex justify-between items-baseline">
                        <span className="text-muted-foreground">Banda</span>
                        <span className="font-mono">
                          {privacyMode ? '••••' : `${item.bandaMin?.toFixed(1)}–${item.bandaMax?.toFixed(1)}%`}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border my-3 opacity-30" />

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.proxAcao}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
