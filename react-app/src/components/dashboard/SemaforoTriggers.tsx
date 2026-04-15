"use client"

import { useState } from "react"
import { StatusDot } from "./StatusDot"

interface Trigger {
  id: string
  label: string
  category: "taxa" | "posicao" | "crypto"
  status: "verde" | "amarelo" | "vermelho"
  valor: number
  unidade: string
  piso?: number
  gap: number
  posicao_r: number
  acao: string
  detalhe: string
}

interface SemaforoTriggersProps {
  triggers: Trigger[]
}

const categoryColors: Record<string, { color: string; bg: string; border: string }> = {
  taxa: { color: '#06b6d4', bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.3)' },
  posicao: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.3)' },
  crypto: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
}

const rowBg: Record<string, string> = {
  vermelho: 'rgba(239,68,68,0.03)',
  amarelo: 'rgba(234,179,8,0.03)',
  verde: 'rgba(34,197,94,0.03)',
}

export function SemaforoTriggers({ triggers }: SemaforoTriggersProps) {
  const [isOpen, setIsOpen] = useState(true)

  const verdeCount = triggers.filter((t) => t.status === "verde").length
  const amareloCount = triggers.filter((t) => t.status === "amarelo").length
  const vermelhoCount = triggers.filter((t) => t.status === "vermelho").length

  const summaryBadge =
    vermelhoCount > 0 ? "vermelho" : amareloCount > 0 ? "amarelo" : "verde"

  return (
    <div style={{ borderLeft: '4px solid #eab308', borderRadius: '8px', background: 'var(--card)', padding: '24px', marginBottom: '16px' }}>
      {/* Header — clickable trigger */}
      <div
        style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', gap: '8px', cursor: 'pointer', marginBottom: '12px' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>
            Semáforos de Gatilhos
          </h2>
          <span style={{
            fontSize: '1.25rem',
            display: 'inline-block',
            transition: 'transform 0.2s',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            color: 'var(--muted)',
          }}>▼</span>
        </div>
      </div>

      {/* Summary row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: isOpen ? '24px' : '0' }}>
        <StatusDot status={summaryBadge} size="sm" />
        <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
          {triggers.length} gatilhos monitorados · {vermelhoCount} vermelho · {amareloCount} amarelo · {verdeCount} verde
        </span>
      </div>

      {/* Collapsible content */}
      {isOpen && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--border)', color: 'var(--muted)', fontWeight: 600 }}>Gatilho</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--border)', color: 'var(--muted)', fontWeight: 600, width: '80px' }}>Status</th>
                <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid var(--border)', color: 'var(--muted)', fontWeight: 600, width: '128px' }}>Valor</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--border)', color: 'var(--muted)', fontWeight: 600 }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {triggers.map((trigger) => {
                const catStyle = categoryColors[trigger.category] || categoryColors.taxa
                const valor = typeof trigger.valor === 'number' ? trigger.valor : 0
                const piso = typeof trigger.piso === 'number' ? trigger.piso : undefined

                return (
                  <tr key={trigger.id} style={{ backgroundColor: rowBg[trigger.status] || 'transparent' }}>
                    <td style={{ padding: '8px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--text)' }}>
                            {trigger.label}
                          </span>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            color: catStyle.color,
                            background: catStyle.bg,
                            border: `1px solid ${catStyle.border}`,
                            textTransform: 'uppercase',
                          }}>
                            {trigger.category}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontFamily: 'monospace' }}>
                          {trigger.detalhe}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '8px', borderBottom: '1px solid var(--border)' }}>
                      <StatusDot status={trigger.status} size="sm" />
                    </td>
                    <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid var(--border)', fontFamily: 'monospace', fontSize: '0.875rem', color: 'var(--text)' }}>
                      {valor.toFixed(2)}{trigger.unidade}
                      {piso !== undefined && (
                        <div style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>
                          piso {piso.toFixed(1)}%
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '8px', borderBottom: '1px solid var(--border)', fontSize: '0.875rem', color: 'var(--text)' }}>
                      {trigger.acao}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
