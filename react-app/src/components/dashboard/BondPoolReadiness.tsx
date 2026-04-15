"use client"

import { useMemo } from "react"
import { useUiStore } from "@/store/uiStore"
import { fmtBrl, fmtPct } from "@/utils/formatters"

interface ComposicaoItem {
  ativo: string
  valor: number
  pct_meta: number
}

interface EstrategiaCard {
  label: string
  descricao: string
  status: string
}

interface BondPoolReadinessData {
  anos_gastos: number
  meta_anos: number
  valor_atual_brl: number
  meta_brl?: number
  status: string
  composicao:
    | ComposicaoItem[]
    | { ipca2040?: number; ipca2050?: number; ipca2029?: number }
  estrategia_a?: EstrategiaCard
  estrategia_b?: EstrategiaCard
}

interface BondPoolReadinessProps {
  data: BondPoolReadinessData
}

const statusConfig: Record<string, { color: string; bg: string; border: string; label: string }> = {
  early: { color: "var(--yellow)", bg: "rgba(234,179,8,0.2)", border: "rgba(234,179,8,0.3)", label: "Early Stage" },
  "Em construção": { color: "var(--yellow)", bg: "rgba(234,179,8,0.2)", border: "rgba(234,179,8,0.3)", label: "Em construção" },
  on_track: { color: "var(--green)", bg: "rgba(34,197,94,0.2)", border: "rgba(34,197,94,0.3)", label: "On Track" },
  behind: { color: "var(--red)", bg: "rgba(239,68,68,0.2)", border: "rgba(239,68,68,0.3)", label: "Behind" },
}

function normalizeComposicao(
  composicao: BondPoolReadinessData["composicao"],
  metaBrl: number
): ComposicaoItem[] {
  if (Array.isArray(composicao)) return composicao

  const entries: ComposicaoItem[] = []
  if (composicao.ipca2029 && composicao.ipca2029 > 0) {
    entries.push({ ativo: "IPCA+ 2029", valor: composicao.ipca2029, pct_meta: metaBrl > 0 ? (composicao.ipca2029 / metaBrl) * 100 : 0 })
  }
  if (composicao.ipca2040 && composicao.ipca2040 > 0) {
    entries.push({ ativo: "IPCA+ 2040", valor: composicao.ipca2040, pct_meta: metaBrl > 0 ? (composicao.ipca2040 / metaBrl) * 100 : 0 })
  }
  if (composicao.ipca2050 && composicao.ipca2050 > 0) {
    entries.push({ ativo: "IPCA+ 2050", valor: composicao.ipca2050, pct_meta: metaBrl > 0 ? (composicao.ipca2050 / metaBrl) * 100 : 0 })
  }
  return entries
}

export function BondPoolReadiness({ data }: BondPoolReadinessProps) {
  const privacyMode = useUiStore(s => s.privacyMode);

  if (!data || typeof data !== "object") {
    return <div style={{ color: 'var(--muted)' }}>Bond pool data unavailable</div>
  }

  const anosGastos = typeof data.anos_gastos === "number" ? data.anos_gastos : 0
  const metaAnos = typeof data.meta_anos === "number" ? data.meta_anos : 7
  const valorAtual = typeof data.valor_atual_brl === "number" ? data.valor_atual_brl : 0
  const metaBrl = typeof data.meta_brl === "number" ? data.meta_brl : metaAnos * 250000

  const progressPct = metaAnos > 0 ? (anosGastos / metaAnos) * 100 : 0
  const statusKey = data.status || "early"
  const cfg = statusConfig[statusKey] || statusConfig.early

  const composicaoItems = useMemo(
    () => normalizeComposicao(data.composicao, metaBrl),
    [data.composicao, metaBrl]
  )

  const cardStyle: React.CSSProperties = {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '16px',
  };

  const progressBar = (value: number, color = 'var(--accent)', height = '8px') => (
    <div style={{ height, background: 'var(--bg)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
      <div style={{ width: `${Math.min(value, 100)}%`, height: '100%', background: color, borderRadius: '4px' }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Progress Bar Card */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', margin: 0 }}>
            Bond Pool Readiness
          </h3>
          <span style={{
            fontSize: '0.75rem',
            padding: '2px 8px',
            borderRadius: '4px',
            border: `1px solid ${cfg.border}`,
            background: cfg.bg,
            color: cfg.color,
          }}>
            {cfg.label}
          </span>
        </div>

        <div style={{ position: 'relative', marginBottom: '8px' }}>
          {progressBar(progressPct, 'var(--accent)', '20px')}
          <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 600, color: 'white' }}>
            {progressPct.toFixed(0)}%
          </span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--muted)', margin: 0 }}>
          {anosGastos.toFixed(1)} / {metaAnos.toFixed(0)} anos de gastos cobertos
        </p>
      </div>

      {/* Stats 2x2 Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div style={cardStyle}>
          <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '4px', marginTop: 0 }}>Valor Atual</p>
          <p style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
            {privacyMode ? '••••' : `R$${(valorAtual / 1000).toFixed(0)}k`}
          </p>
        </div>
        <div style={cardStyle}>
          <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '4px', marginTop: 0 }}>Meta</p>
          <p style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
            {privacyMode ? '••••' : `R$${(metaBrl / 1000).toFixed(0)}k`}
          </p>
        </div>
        <div style={cardStyle}>
          <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '4px', marginTop: 0 }}>Cobertura</p>
          <p style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
            {anosGastos.toFixed(1)} <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>anos</span>
          </p>
        </div>
        <div style={cardStyle}>
          <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '4px', marginTop: 0 }}>Status</p>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, color: cfg.color, margin: 0 }}>
            {cfg.label}
          </p>
        </div>
      </div>

      {/* Composition Table */}
      {composicaoItems.length > 0 && (
        <div style={cardStyle}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', marginBottom: '12px', marginTop: 0 }}>Composicao</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {composicaoItems.map((item) => (
              <div key={item.ativo}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{item.ativo}</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text)' }}>
                      {privacyMode ? '••••' : fmtBrl(item.valor)}
                    </span>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)' }}>
                      {item.pct_meta.toFixed(1)}%
                    </span>
                  </div>
                </div>
                {progressBar(Math.min(item.pct_meta, 100), 'var(--accent)', '6px')}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strategy Cards */}
      {(data.estrategia_a || data.estrategia_b) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {data.estrategia_a && (
            <div style={{ ...cardStyle, border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.05)' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', marginBottom: '4px', marginTop: 0 }}>{data.estrategia_a.label}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.5, margin: 0 }}>
                {data.estrategia_a.descricao}
              </p>
            </div>
          )}
          {data.estrategia_b && (
            <div style={{ ...cardStyle, opacity: 0.7 }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', marginBottom: '4px', marginTop: 0 }}>{data.estrategia_b.label}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.5, margin: 0 }}>
                {data.estrategia_b.descricao}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
