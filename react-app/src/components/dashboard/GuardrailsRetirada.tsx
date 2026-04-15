"use client"

import { useState } from "react"

interface Guardrail {
  id: string
  guardrail: string
  condicao: string
  acao: string
  prioridade: "EXPANSIVO" | "MANTÉM" | "DEFESA"
}

interface GuardrailsRetiradaProps {
  guardrails: Guardrail[]
}

const priorityStyle = {
  EXPANSIVO: { color: '#4ade80', bg: 'rgba(34,197,94,0.2)', border: 'rgba(34,197,94,0.3)', rowBg: 'rgba(34,197,94,0.05)' },
  MANTÉM: { color: '#22d3ee', bg: 'rgba(6,182,212,0.2)', border: 'rgba(6,182,212,0.3)', rowBg: 'rgba(59,130,246,0.05)' },
  DEFESA: { color: '#f87171', bg: 'rgba(239,68,68,0.2)', border: 'rgba(239,68,68,0.3)', rowBg: 'rgba(239,68,68,0.05)' },
} as const

export function GuardrailsRetirada({ guardrails }: GuardrailsRetiradaProps) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div style={{ borderLeft: '4px solid #3b82f6', borderRadius: '0 8px 8px 0', background: 'var(--card)', padding: '24px', border: '1px solid var(--border)', borderLeftWidth: '4px', borderLeftColor: '#3b82f6' }}>
      <div
        style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', gap: '8px', cursor: 'pointer', opacity: 1 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>Guardrails de Retirada</h2>
          <span style={{ fontSize: '1.1rem', color: 'var(--muted)', transition: 'transform 0.2s', display: 'inline-block', transform: isOpen ? 'rotate(180deg)' : 'none' }}>▼</span>
        </div>
      </div>

      <p style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--muted)' }}>
        Regras de decisão: ajuste spending baseado em P(FIRE) e volatilidade
      </p>

      {isOpen && (
        <div style={{ marginTop: '24px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--border)', color: 'var(--muted)', fontWeight: 600 }}>Guardrail</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--border)', color: 'var(--muted)', fontWeight: 600 }}>Condição</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--border)', color: 'var(--muted)', fontWeight: 600 }}>Ação</th>
                <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid var(--border)', color: 'var(--muted)', fontWeight: 600, width: '96px' }}>Prioridade</th>
              </tr>
            </thead>
            <tbody>
              {guardrails.map((guardrail) => {
                const style = priorityStyle[guardrail.prioridade]
                return (
                  <tr key={guardrail.id} style={{ backgroundColor: style.rowBg }}>
                    <td style={{ padding: '8px', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--text)' }}>{guardrail.guardrail}</span>
                    </td>
                    <td style={{ padding: '8px', borderBottom: '1px solid var(--border)', fontFamily: 'monospace', fontSize: '0.875rem', color: 'var(--text)' }}>
                      {guardrail.condicao}
                    </td>
                    <td style={{ padding: '8px', borderBottom: '1px solid var(--border)', fontSize: '0.875rem', color: 'var(--text)' }}>
                      {guardrail.acao}
                    </td>
                    <td style={{ padding: '8px', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>
                      <span style={{
                        fontFamily: 'monospace', fontSize: '0.65rem', fontWeight: 600,
                        padding: '2px 6px', borderRadius: '4px',
                        backgroundColor: style.bg, color: style.color, border: `1px solid ${style.border}`,
                      }}>
                        {guardrail.prioridade}
                      </span>
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
