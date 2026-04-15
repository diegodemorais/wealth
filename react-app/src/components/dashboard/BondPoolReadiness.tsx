"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { PrivacyMask } from "@/components/primitives/PrivacyMask"
import { cn } from "@/lib/utils"
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

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  early: { color: "text-yellow-400", bg: "bg-yellow-500/20 border-yellow-500/30", label: "Early Stage" },
  "Em construção": { color: "text-yellow-400", bg: "bg-yellow-500/20 border-yellow-500/30", label: "Em construção" },
  on_track: { color: "text-green-400", bg: "bg-green-500/20 border-green-500/30", label: "On Track" },
  behind: { color: "text-red-400", bg: "bg-red-500/20 border-red-500/30", label: "Behind" },
}

function normalizeComposicao(
  composicao: BondPoolReadinessData["composicao"],
  metaBrl: number
): ComposicaoItem[] {
  if (Array.isArray(composicao)) return composicao

  const entries: ComposicaoItem[] = []
  if (composicao.ipca2029 && composicao.ipca2029 > 0) {
    entries.push({
      ativo: "IPCA+ 2029",
      valor: composicao.ipca2029,
      pct_meta: metaBrl > 0 ? (composicao.ipca2029 / metaBrl) * 100 : 0,
    })
  }
  if (composicao.ipca2040 && composicao.ipca2040 > 0) {
    entries.push({
      ativo: "IPCA+ 2040",
      valor: composicao.ipca2040,
      pct_meta: metaBrl > 0 ? (composicao.ipca2040 / metaBrl) * 100 : 0,
    })
  }
  if (composicao.ipca2050 && composicao.ipca2050 > 0) {
    entries.push({
      ativo: "IPCA+ 2050",
      valor: composicao.ipca2050,
      pct_meta: metaBrl > 0 ? (composicao.ipca2050 / metaBrl) * 100 : 0,
    })
  }
  return entries
}

export function BondPoolReadiness({ data }: BondPoolReadinessProps) {
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

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Bond Pool Readiness
            </h3>
            <Badge variant="outline" className={cn("text-xs", cfg.bg, cfg.color)}>
              {cfg.label}
            </Badge>
          </div>

          <div className="relative mb-2">
            <Progress
              value={Math.min(progressPct, 100)}
              className="h-5 bond-pool-bar"
            />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-mono font-semibold text-white drop-shadow-sm">
              {progressPct.toFixed(0)}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {anosGastos.toFixed(1)} / {metaAnos.toFixed(0)} anos de gastos cobertos
          </p>
        </CardContent>
      </Card>

      {/* Stats 2x2 Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground mb-1">Valor Atual</p>
            <p className="font-mono text-lg font-bold">
              <PrivacyMask>
                R${(valorAtual / 1000).toFixed(0)}k
              </PrivacyMask>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground mb-1">Meta</p>
            <p className="font-mono text-lg font-bold">
              <PrivacyMask>
                R${(metaBrl / 1000).toFixed(0)}k
              </PrivacyMask>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground mb-1">Cobertura</p>
            <p className="font-mono text-lg font-bold">
              {anosGastos.toFixed(1)} <span className="text-sm text-muted-foreground">anos</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground mb-1">Status</p>
            <p className={cn("text-lg font-semibold", cfg.color)}>
              {cfg.label}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Composition Table */}
      {composicaoItems.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h4 className="text-sm font-semibold mb-3">Composicao</h4>
            <div className="space-y-3">
              {composicaoItems.map((item) => (
                <div key={item.ativo}>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-xs text-muted-foreground">{item.ativo}</span>
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-xs">
                        <PrivacyMask>{fmtBrl(item.valor)}</PrivacyMask>
                      </span>
                      <span className="font-mono text-xs font-semibold text-muted-foreground">
                        {item.pct_meta.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <Progress value={Math.min(item.pct_meta, 100)} className="h-1.5" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strategy Cards */}
      {(data.estrategia_a || data.estrategia_b) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.estrategia_a && (
            <Card className="border-green-500/30 bg-green-500/5">
              <CardContent className="pt-4 pb-3">
                <p className="text-sm font-semibold mb-1">{data.estrategia_a.label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {data.estrategia_a.descricao}
                </p>
              </CardContent>
            </Card>
          )}
          {data.estrategia_b && (
            <Card className="border-muted/50 bg-muted/5 opacity-70">
              <CardContent className="pt-4 pb-3">
                <p className="text-sm font-semibold mb-1">{data.estrategia_b.label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {data.estrategia_b.descricao}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
