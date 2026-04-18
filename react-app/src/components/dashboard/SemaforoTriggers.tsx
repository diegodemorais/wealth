"use client"

import { useState } from "react"
import { StatusDot } from "./StatusDot"
import { DcaItem } from "@/types/dashboard"
import { useUiStore } from "@/store/uiStore"

interface SemaforoTriggersProps {
  items: DcaItem[]
}

const CATEGORY_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  rf_ipca:  { color: 'var(--cyan)',   bg: 'rgba(6,182,212,0.1)',   border: 'rgba(6,182,212,0.3)' },
  rf_renda: { color: 'var(--cyan)',   bg: 'rgba(6,182,212,0.1)',   border: 'rgba(6,182,212,0.3)' },
  crypto:   { color: 'var(--yellow)', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
}

const ROW_BG: Record<string, string> = {
  vermelho: 'rgba(239,68,68,0.03)',
  amarelo:  'rgba(234,179,8,0.03)',
  verde:    'rgba(34,197,94,0.03)',
}

function buildDetalhe(item: DcaItem, privacyMode: boolean): string {
  if (item.categoria === 'crypto') {
    const b = item.bandaAtual != null
      ? `atual ${item.bandaAtual.toFixed(1)}% · banda ${item.bandaMin?.toFixed(1)}–${item.bandaMax?.toFixed(1)}%`
      : '';
    return b;
  }
  const parts: string[] = [];
  if (item.taxa != null) parts.push(`taxa ${item.taxa.toFixed(2)}%`);
  const ref = item.pisoVenda ?? item.pisoCompra;
  if (ref != null) parts.push(`piso ${ref.toFixed(1)}%`);
  if (item.gapPiso != null) parts.push(`gap ${item.gapPiso >= 0 ? '+' : ''}${item.gapPiso.toFixed(2)}pp`);
  if (item.posicaoBrl > 0) parts.push(privacyMode ? '••••' : `R$${(item.posicaoBrl / 1000).toFixed(0)}k`);
  return parts.join(' · ');
}

export function SemaforoTriggers({ items }: SemaforoTriggersProps) {
  const [isOpen, setIsOpen] = useState(true)
  const { privacyMode } = useUiStore()

  const verdeCount    = items.filter(i => i.status === 'verde').length
  const amareloCount  = items.filter(i => i.status === 'amarelo').length
  const vermelhoCount = items.filter(i => i.status === 'vermelho').length
  const summaryBadge  = vermelhoCount > 0 ? 'vermelho' : amareloCount > 0 ? 'amarelo' : 'verde'

  return (
    <div style={{ borderLeft: '4px solid var(--yellow)', borderRadius: '8px', background: 'var(--card)', padding: 'var(--space-7)', marginBottom: '16px' }}>
      {/* Header */}
      <div
        style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)', cursor: 'pointer', marginBottom: '12px' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: isOpen ? '24px' : '0' }}>
        <StatusDot status={summaryBadge} size="sm" />
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
          {items.length} gatilhos monitorados · {vermelhoCount} vermelho · {amareloCount} amarelo · {verdeCount} verde
        </span>
      </div>

      {/* Collapsible content */}
      {isOpen && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 'var(--space-2)', borderBottom: '1px solid var(--border)', color: 'var(--muted)', fontWeight: 600 }}>Gatilho</th>
                <th style={{ textAlign: 'left', padding: 'var(--space-2)', borderBottom: '1px solid var(--border)', color: 'var(--muted)', fontWeight: 600, width: '80px' }}>Status</th>
                <th style={{ textAlign: 'right', padding: 'var(--space-2)', borderBottom: '1px solid var(--border)', color: 'var(--muted)', fontWeight: 600, width: '128px' }}>Valor</th>
                <th style={{ textAlign: 'left', padding: 'var(--space-2)', borderBottom: '1px solid var(--border)', color: 'var(--muted)', fontWeight: 600 }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const catStyle = CATEGORY_STYLE[item.categoria] ?? CATEGORY_STYLE.rf_ipca
                const detalhe  = buildDetalhe(item, privacyMode)

                return (
                  <tr key={item.id} style={{ backgroundColor: ROW_BG[item.status] ?? 'transparent' }}>
                    <td style={{ padding: 'var(--space-2)', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          <span style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--text)' }}>
                            {item.nome}
                          </span>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: 'var(--text-xs)',
                            fontWeight: 600,
                            color: catStyle.color,
                            background: catStyle.bg,
                            border: `1px solid ${catStyle.border}`,
                            textTransform: 'uppercase',
                          }}>
                            {item.categoria === 'crypto' ? 'crypto' : 'taxa'}
                          </span>
                          {item.dcaAtivo && (
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: 'var(--text-xs)',
                              fontWeight: 600,
                              color: 'var(--green)',
                              background: 'rgba(62,211,129,0.1)',
                              border: '1px solid rgba(62,211,129,0.3)',
                            }}>
                              DCA
                            </span>
                          )}
                        </div>
                        {detalhe && (
                          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', fontFamily: 'monospace' }}>
                            {detalhe}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: 'var(--space-2)', borderBottom: '1px solid var(--border)' }}>
                      <StatusDot status={item.status} size="sm" />
                    </td>
                    <td style={{ textAlign: 'right', padding: 'var(--space-2)', borderBottom: '1px solid var(--border)', fontFamily: 'monospace', fontSize: '0.875rem', color: 'var(--text)' }}>
                      {item.taxa != null ? `${item.taxa.toFixed(2)}%` : (item.bandaAtual != null ? `${item.bandaAtual.toFixed(1)}%` : '—')}
                      {(() => {
                        const ref = item.pisoVenda ?? item.pisoCompra;
                        return ref != null ? (
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                            piso {ref.toFixed(1)}%
                          </div>
                        ) : null;
                      })()}
                    </td>
                    <td style={{ padding: 'var(--space-2)', borderBottom: '1px solid var(--border)', fontSize: '0.875rem', color: 'var(--text)' }}>
                      {item.proxAcao}
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
