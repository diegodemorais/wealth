"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useUiStore } from "@/store/uiStore"

interface BandData {
  min_pct: number
  alvo_pct: number
  max_pct: number
  atual_pct: number
  status: "verde" | "amarelo" | "vermelho"
}

interface CryptoBandChartProps {
  banda: BandData
  label?: string
  valor?: number
  pnl_pct?: number
}

/**
 * Horizontal band chart showing allocation position relative to min/alvo/max zones.
 * Zones: underweight (red) | safe (green) | overweight (yellow) | over-limit (red)
 */
export function CryptoBandChart({
  banda,
  label = "HODL11 — BTC Wrapper — B3",
  valor,
  pnl_pct,
}: CryptoBandChartProps) {
  const privacyMode = useUiStore(s => s.privacyMode);

  // Defensive validation
  const min = typeof banda?.min_pct === "number" ? banda.min_pct : 0
  const alvo = typeof banda?.alvo_pct === "number" ? banda.alvo_pct : 0
  const max = typeof banda?.max_pct === "number" ? banda.max_pct : 0
  const atual = typeof banda?.atual_pct === "number" ? banda.atual_pct : 0
  const status = banda?.status || "verde"

  // Chart range: 0% to max + 1% (or atual if over max)
  const chartMax = Math.max(max + 1, atual + 0.5)
  const chartMin = 0

  // Position helpers (percentage of chart width)
  const toPercent = (val: number) =>
    Math.max(0, Math.min(100, ((val - chartMin) / (chartMax - chartMin)) * 100))

  const minPos = toPercent(min)
  const alvoPos = toPercent(alvo)
  const maxPos = toPercent(max)
  const atualPos = toPercent(atual)

  // Zone determination
  const isUnderweight = atual < min
  const isOverweight = atual > max
  const isInBand = !isUnderweight && !isOverweight

  const statusColors = {
    verde: "text-green-400",
    amarelo: "text-yellow-400",
    vermelho: "text-red-400",
  }

  const statusLabels = {
    verde: "In Band",
    amarelo: "Near Limit",
    vermelho: "Out of Band",
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h4 className="font-semibold text-sm">{label}</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Atual: {atual.toFixed(1)}% · Alvo {alvo.toFixed(0)}% · Banda{" "}
              {min.toFixed(1)}–{max.toFixed(1)}%
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "text-xs",
                isInBand
                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                  : isUnderweight
                    ? "bg-red-500/20 text-red-400 border-red-500/30"
                    : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
              )}
            >
              {isInBand ? "In Band" : isUnderweight ? "Underweight" : "Overweight"}
            </Badge>
          </div>
        </div>

        {/* Band Visualization */}
        <div className="relative h-10 mb-2">
          {/* Background track */}
          <div className="absolute inset-0 rounded-full bg-muted/30 overflow-hidden">
            {/* Red zone: 0 to min */}
            <div
              className="absolute top-0 bottom-0 bg-red-500/20"
              style={{ left: "0%", width: `${minPos}%` }}
            />
            {/* Green zone: min to max */}
            <div
              className="absolute top-0 bottom-0 bg-green-500/20"
              style={{ left: `${minPos}%`, width: `${maxPos - minPos}%` }}
            />
            {/* Yellow/red zone: max to end */}
            <div
              className="absolute top-0 bottom-0 bg-yellow-500/15"
              style={{ left: `${maxPos}%`, width: `${100 - maxPos}%` }}
            />
          </div>

          {/* Min threshold line */}
          <div
            className="absolute top-0 bottom-0 w-px bg-red-500/60"
            style={{ left: `${minPos}%` }}
          />
          {/* Alvo center line */}
          <div
            className="absolute top-0 bottom-0 w-px bg-green-500/40 border-dashed"
            style={{ left: `${alvoPos}%` }}
          />
          {/* Max threshold line */}
          <div
            className="absolute top-0 bottom-0 w-px bg-yellow-500/60"
            style={{ left: `${maxPos}%` }}
          />

          {/* Current position marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
            style={{ left: `${atualPos}%` }}
          >
            <div
              className={cn(
                "w-4 h-4 rounded-full border-2 shadow-lg",
                isInBand
                  ? "bg-green-500 border-green-300"
                  : isUnderweight
                    ? "bg-red-500 border-red-300"
                    : "bg-yellow-500 border-yellow-300"
              )}
            />
          </div>
        </div>

        {/* Scale labels */}
        <div className="relative h-5 text-[10px] text-muted-foreground font-mono">
          <span
            className="absolute -translate-x-1/2"
            style={{ left: `${minPos}%` }}
          >
            {min.toFixed(1)}%
          </span>
          <span
            className="absolute -translate-x-1/2"
            style={{ left: `${alvoPos}%` }}
          >
            {alvo.toFixed(0)}%
          </span>
          <span
            className="absolute -translate-x-1/2"
            style={{ left: `${maxPos}%` }}
          >
            {max.toFixed(1)}%
          </span>
          <span
            className="absolute -translate-x-1/2 font-semibold"
            style={{ left: `${atualPos}%` }}
          >
            ▲ {atual.toFixed(1)}%
          </span>
        </div>

        {/* Footer stats */}
        {(valor !== undefined || pnl_pct !== undefined) && (
          <>
            <div className="border-t border-border my-3 opacity-30" />
            <div className="flex justify-between text-xs text-muted-foreground">
              {valor !== undefined && (
                <span>
                  Posição: {privacyMode ? '••••' : `R$${(valor / 1000).toFixed(0)}k`}
                </span>
              )}
              {pnl_pct !== undefined && (
                <span
                  className={cn(
                    "font-mono",
                    pnl_pct >= 0 ? "text-green-400" : "text-red-400"
                  )}
                >
                  P&L: {privacyMode ? '••••' : `${pnl_pct >= 0 ? "+" : ""}${pnl_pct.toFixed(1)}%`}
                </span>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
