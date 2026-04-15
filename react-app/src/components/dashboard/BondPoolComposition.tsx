"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useUiStore } from "@/store/uiStore"

interface BondPoolData {
  valor_atual_brl: number
  anos_gastos: number
  meta_anos: number
  status: "early" | "on_track" | "behind"
  composicao: {
    ipca2040?: number
    ipca2050?: number
    ipca2029?: number
  }
}

interface BondPoolCompositionProps {
  data: BondPoolData
  runwayAnosPosFire?: number
  poolTotal?: number
}

const statusColors = {
  early: "text-green-400",
  on_track: "text-yellow-400",
  behind: "text-red-400",
} as const

const statusLabels = {
  early: "Early Stage",
  on_track: "On Track",
  behind: "Behind",
} as const

export function BondPoolComposition({
  data,
  runwayAnosPosFire = 0,
  poolTotal = 0,
}: BondPoolCompositionProps) {
  const privacyMode = useUiStore(s => s.privacyMode);

  // Defensive: validate data exists and has required numeric fields
  if (!data || typeof data !== 'object') {
    return <div className="text-muted-foreground">Bond pool data unavailable</div>;
  }

  const valor = typeof data.valor_atual_brl === 'number' ? data.valor_atual_brl : 0;
  const anosGastos = typeof data.anos_gastos === 'number' ? data.anos_gastos : 0;
  const metaAnos = typeof data.meta_anos === 'number' ? data.meta_anos : 1;
  const runway = typeof runwayAnosPosFire === 'number' ? runwayAnosPosFire : 0;

  const progressPercent = (anosGastos / metaAnos) * 100
  const isHealthy = anosGastos >= metaAnos * 0.7

  // Calculate composition percentages
  const totalComposicao = Object.values(data.composicao).reduce(
    (sum, val) => sum + (val || 0),
    0
  )
  const comp2040Pct = totalComposicao
    ? ((data.composicao.ipca2040 || 0) / totalComposicao) * 100
    : 0
  const comp2050Pct = totalComposicao
    ? ((data.composicao.ipca2050 || 0) / totalComposicao) * 100
    : 0
  const comp2029Pct = totalComposicao
    ? ((data.composicao.ipca2029 || 0) / totalComposicao) * 100
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
          Bond Pool Status
        </h3>

        {/* Main Status Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            {/* Header: Status Badge + Valor */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Current Pool</p>
                <p className="font-mono text-2xl font-bold">
                  {privacyMode ? '••••' : `R$${(valor / 1000).toFixed(0)}k`}
                </p>
              </div>
              <div className={cn("text-right", statusColors[data.status])}>
                <p className="text-sm font-semibold">{statusLabels[data.status]}</p>
                <p className="text-xs font-mono">
                  {anosGastos.toFixed(1)}/{metaAnos.toFixed(0)} anos
                </p>
              </div>
            </div>

            {/* Progress Towards Meta */}
            <div className="mb-6">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-xs text-muted-foreground">Progress to Target</span>
                <span className="font-mono text-sm font-semibold">
                  {progressPercent.toFixed(0)}%
                </span>
              </div>
              <Progress
                value={Math.min(progressPercent, 100)}
                className="h-2"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Target: {metaAnos.toFixed(0)} years of expenses
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-border my-4 opacity-30" />

            {/* FIRE Runway */}
            <div className="mb-6">
              <p className="text-xs text-muted-foreground mb-2">Post-FIRE Runway</p>
              <p className="font-mono text-lg font-bold">
                {runway.toFixed(1)} years
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                of spending coverage available after FIRE date
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Composition Breakdown */}
        <Card>
          <CardContent className="pt-6">
            <h4 className="font-semibold text-sm mb-4">Composição por Vencimento</h4>

            <div className="space-y-3">
              {/* IPCA+ 2040 */}
              {data.composicao.ipca2040 !== undefined && data.composicao.ipca2040 > 0 && (
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-xs text-muted-foreground">IPCA+ 2040</span>
                    <span className="font-mono text-sm font-semibold">
                      {comp2040Pct.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={comp2040Pct} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {privacyMode ? '••••' : `R$${(data.composicao.ipca2040 / 1000).toFixed(0)}k`}
                  </p>
                </div>
              )}

              {/* IPCA+ 2050 */}
              {data.composicao.ipca2050 !== undefined && data.composicao.ipca2050 > 0 && (
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-xs text-muted-foreground">IPCA+ 2050</span>
                    <span className="font-mono text-sm font-semibold">
                      {comp2050Pct.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={comp2050Pct} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {privacyMode ? '••••' : `R$${(data.composicao.ipca2050 / 1000).toFixed(0)}k`}
                  </p>
                </div>
              )}

              {/* IPCA+ 2029 */}
              {data.composicao.ipca2029 !== undefined && data.composicao.ipca2029 > 0 && (
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-xs text-muted-foreground">IPCA+ 2029</span>
                    <span className="font-mono text-sm font-semibold">
                      {comp2029Pct.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={comp2029Pct} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {privacyMode ? '••••' : `R$${(data.composicao.ipca2029 / 1000).toFixed(0)}k`}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Status Note */}
        <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
          {isHealthy
            ? "✓ Bond pool on track. Continue building towards 7-year target for FIRE flexibility."
            : "⚠ Bond pool below healthy threshold. Prioritize building RF runway."}
        </p>
      </div>
    </div>
  )
}
