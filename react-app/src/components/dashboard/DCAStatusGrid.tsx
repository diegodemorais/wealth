"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useUiStore } from "@/store/uiStore"

interface DCAStatus {
  id: string
  nome: string
  regime: "ATIVO" | "PAUSADO"
  taxa_atual: number
  piso_compra: number
  piso_venda?: number
  gap_pp: number
  pct_carteira_atual: number
  alvo_pct: number
  proxima_acao: string
}

interface DCAStatusGridProps {
  items: DCAStatus[]
}

export function DCAStatusGrid({ items }: DCAStatusGridProps) {
  const privacyMode = useUiStore(s => s.privacyMode);
  // Defensive: validate items array
  const validItems = Array.isArray(items) ? items.filter(item => item && typeof item === 'object') : [];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
          DCA Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {validItems.map((item) => (
            <Card
              key={item.id}
              className={cn(
                "transition-opacity",
                item.regime === "PAUSADO" && "opacity-60 bg-muted/30"
              )}
            >
              <CardContent className="pt-4">
                {/* Helper: validate numeric fields */}
                {(() => {
                  const taxa = typeof item.taxa_atual === 'number' ? item.taxa_atual : 0;
                  const piso_c = typeof item.piso_compra === 'number' ? item.piso_compra : 0;
                  const piso_v = typeof item.piso_venda === 'number' ? item.piso_venda : undefined;
                  const gap = typeof item.gap_pp === 'number' ? item.gap_pp : 0;

                  return (
                    <>
                      {/* Header: Nome + Status Badge */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <h4 className="font-semibold text-sm">{item.nome}</h4>
                        <Badge
                          variant={item.regime === "ATIVO" ? "default" : "outline"}
                          className={cn(
                            item.regime === "ATIVO"
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {item.regime}
                        </Badge>
                      </div>

                      {/* Rows */}
                      <div className="space-y-2 text-xs">
                        {/* Taxa Atual */}
                        <div className="flex justify-between items-baseline">
                          <span className="text-muted-foreground">Taxa atual</span>
                          <span className="font-mono font-semibold">
                            {privacyMode ? '••••' : `${taxa.toFixed(2)}%`}
                          </span>
                        </div>

                        {/* Piso Compra */}
                        <div className="flex justify-between items-baseline">
                          <span className="text-muted-foreground">Piso compra</span>
                          <span className="font-mono">{privacyMode ? '••••' : `${piso_c.toFixed(1)}%`}</span>
                        </div>

                        {/* Piso Venda (if exists) */}
                        {piso_v !== undefined && (
                          <div className="flex justify-between items-baseline">
                            <span className="text-muted-foreground">Piso venda</span>
                            <span className="font-mono">
                              {privacyMode ? '••••' : `${piso_v.toFixed(1)}%`}
                            </span>
                          </div>
                        )}

                        {/* Gap vs Piso */}
                        <div className="flex justify-between items-baseline">
                          <span className="text-muted-foreground">Gap vs piso</span>
                          <span
                            className={cn(
                              "font-mono font-semibold",
                              gap > 0.5 ? "text-green-400" : "text-yellow-400"
                            )}
                          >
                            {privacyMode ? '••••' : `${gap > 0 ? "+" : ""}${gap.toFixed(2)}pp`}
                          </span>
                        </div>

                        {/* Portfolio % */}
                        {(() => {
                          const pct_atual = typeof item.pct_carteira_atual === 'number' ? item.pct_carteira_atual : 0;
                          const alvo = typeof item.alvo_pct === 'number' ? item.alvo_pct : 0;
                          return (
                            <div className="flex justify-between items-baseline">
                              <span className="text-muted-foreground">% carteira</span>
                              <span className="font-mono">
                                {privacyMode ? '••••' : `${pct_atual.toFixed(1)}% / ${alvo.toFixed(0)}%`}
                              </span>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Divider */}
                      <div className="border-t border-border my-3 opacity-30" />

                      {/* Próxima Ação */}
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.proxima_acao}
                      </p>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
