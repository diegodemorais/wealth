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
  EXPANSIVO: { color: 'rgba(34, 197, 94, 0.8)', bg: 'rgba(34,197,94,0.2)', border: 'rgba(34,197,94,0.3)', rowBg: 'rgba(34,197,94,0.05)' },
  MANTÉM: { color: 'var(--cyan)', bg: 'rgba(6,182,212,0.2)', border: 'rgba(6,182,212,0.3)', rowBg: 'rgba(59,130,246,0.05)' },
  DEFESA: { color: 'rgba(239, 68, 68, 0.7)', bg: 'rgba(239,68,68,0.2)', border: 'rgba(239,68,68,0.3)', rowBg: 'rgba(239,68,68,0.05)' },
} as const

export function GuardrailsRetirada({ guardrails }: GuardrailsRetiradaProps) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="bg-card border-l-4 border-l-primary border border-border rounded-r-md p-6">
      <div
        className="flex w-full items-center justify-between gap-2 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-foreground m-0">Guardrails de Retirada</h2>
          <span className="text-lg text-muted-foreground transition-transform inline-block" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}>▼</span>
        </div>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        Regras de decisão: ajuste spending baseado em P(FIRE) e volatilidade
      </p>

      {isOpen && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-2 py-2 text-muted-foreground font-semibold">Guardrail</th>
                <th className="text-left px-2 py-2 text-muted-foreground font-semibold">Condição</th>
                <th className="text-left px-2 py-2 text-muted-foreground font-semibold">Ação</th>
                <th className="text-right px-2 py-2 text-muted-foreground font-semibold w-24">Prioridade</th>
              </tr>
            </thead>
            <tbody>
              {guardrails.map((guardrail) => {
                const style = priorityStyle[guardrail.prioridade]
                return (
                  <tr key={guardrail.id} className="border-b border-border" style={{ backgroundColor: style.rowBg }}>
                    <td className="px-2 py-2">
                      <span className="font-medium text-sm text-foreground">{guardrail.guardrail}</span>
                    </td>
                    <td className="px-2 py-2 font-mono text-sm text-foreground">
                      {guardrail.condicao}
                    </td>
                    <td className="px-2 py-2 text-sm text-foreground">
                      {guardrail.acao}
                    </td>
                    <td className="px-2 py-2 text-right">
                      <span
                        className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded border inline-block"
                        style={{
                          backgroundColor: style.bg,
                          color: style.color,
                          border: `1px solid ${style.border}`,
                        }}
                      >
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
