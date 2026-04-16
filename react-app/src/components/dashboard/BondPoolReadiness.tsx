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
    return <div className="text-muted-foreground">Bond pool data unavailable</div>
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

  const progressBar = (value: number, color = 'var(--accent)', height = '8px') => (
    <div style={{ height, background: 'var(--bg)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
      <div style={{ width: `${Math.min(value, 100)}%`, height: '100%', background: color, borderRadius: '4px' }} />
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Progress Bar Card */}
      <div className="bg-card border border-border rounded-md p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground m-0">
            Bond Pool Readiness
          </h3>
          <span
            className="text-xs px-2 py-1 rounded border"
            style={{
              border: `1px solid ${cfg.border}`,
              background: cfg.bg,
              color: cfg.color,
            }}
          >
            {cfg.label}
          </span>
        </div>

        <div className="relative mb-2">
          {progressBar(progressPct, 'var(--accent)', '20px')}
          <span className="absolute inset-0 flex items-center justify-center text-xs font-mono font-semibold text-text">
            {progressPct.toFixed(0)}%
          </span>
        </div>
        <p className="text-xs text-muted-foreground m-0">
          {anosGastos.toFixed(1)} / {metaAnos.toFixed(0)} anos de gastos cobertos
        </p>
      </div>

      {/* Stats 2x2 Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-md p-4">
          <p className="text-xs text-muted-foreground mb-1 mt-0">Valor Atual</p>
          <p className="font-mono text-lg font-bold text-foreground m-0">
            {privacyMode ? '••••' : `R$${(valorAtual / 1000).toFixed(0)}k`}
          </p>
        </div>
        <div className="bg-card border border-border rounded-md p-4">
          <p className="text-xs text-muted-foreground mb-1 mt-0">Meta</p>
          <p className="font-mono text-lg font-bold text-foreground m-0">
            {privacyMode ? '••••' : `R$${(metaBrl / 1000).toFixed(0)}k`}
          </p>
        </div>
        <div className="bg-card border border-border rounded-md p-4">
          <p className="text-xs text-muted-foreground mb-1 mt-0">Cobertura</p>
          <p className="font-mono text-lg font-bold text-foreground m-0">
            {anosGastos.toFixed(1)} <span className="text-xs text-muted-foreground">anos</span>
          </p>
        </div>
        <div className="bg-card border border-border rounded-md p-4">
          <p className="text-xs text-muted-foreground mb-1 mt-0">Status</p>
          <p className="text-lg font-semibold m-0" style={{ color: cfg.color }}>
            {cfg.label}
          </p>
        </div>
      </div>

      {/* Composition Table */}
      {composicaoItems.length > 0 && (
        <div className="bg-card border border-border rounded-md p-4">
          <h4 className="text-sm font-semibold text-foreground mb-3 mt-0">Composição</h4>
          <div className="flex flex-col gap-3">
            {composicaoItems.map((item) => (
              <div key={item.ativo}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs text-muted-foreground">{item.ativo}</span>
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-xs text-foreground">
                      {privacyMode ? '••••' : fmtBrl(item.valor)}
                    </span>
                    <span className="font-mono text-xs font-semibold text-muted-foreground">
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
        <div className="grid grid-cols-2 gap-3">
          {data.estrategia_a && (
            <div className="bg-card border rounded-md p-4" style={{ border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.05)' }}>
              <p className="text-sm font-semibold text-foreground mb-1 mt-0">{data.estrategia_a.label}</p>
              <p className="text-xs text-muted-foreground leading-relaxed m-0">
                {data.estrategia_a.descricao}
              </p>
            </div>
          )}
          {data.estrategia_b && (
            <div className="bg-card border border-border rounded-md p-4 opacity-70">
              <p className="text-sm font-semibold text-foreground mb-1 mt-0">{data.estrategia_b.label}</p>
              <p className="text-xs text-muted-foreground leading-relaxed m-0">
                {data.estrategia_b.descricao}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
