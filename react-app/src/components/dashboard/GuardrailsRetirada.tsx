"use client"

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
  return (
    <div style={{ overflowX: 'auto' }}>
      <p style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '8px', marginTop: 0 }}>
        Regras de decisão: ajuste spending baseado em P(FIRE) e volatilidade
      </p>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.8rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Guardrail</th>
            <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Condição</th>
            <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Ação</th>
            <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600, width: 90 }}>Prioridade</th>
          </tr>
        </thead>
        <tbody>
          {guardrails.map((guardrail) => {
            const style = priorityStyle[guardrail.prioridade]
            return (
              <tr key={guardrail.id} style={{ borderBottom: '1px solid var(--border)', backgroundColor: style.rowBg }}>
                <td style={{ padding: '6px 8px', fontWeight: 500 }}>{guardrail.guardrail}</td>
                <td style={{ padding: '6px 8px', fontFamily: 'monospace' }}>{guardrail.condicao}</td>
                <td style={{ padding: '6px 8px' }}>{guardrail.acao}</td>
                <td style={{ padding: '6px 8px', textAlign: 'right' }}>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '.7rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: 3,
                      display: 'inline-block',
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
  )
}
