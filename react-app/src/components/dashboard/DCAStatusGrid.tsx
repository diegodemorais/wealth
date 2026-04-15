"use client"

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
  const validItems = Array.isArray(items) ? items.filter(item => item && typeof item === 'object') : [];

  const getBorderClass = (id: string): string => {
    if (id.includes('ipca2040') || id.includes('ipca_long')) return 'dca-card--border-cyan';
    if (id.includes('ipca2050')) return 'dca-card--border-violet';
    if (id.includes('renda') || id.includes('2065')) return 'dca-card--border-amber';
    return 'dca-card--border-default';
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
          DCA Status
        </h3>
        <div className="dca-grid">
          {validItems.map((item) => (
            <div
              key={item.id}
              className={`dca-card ${getBorderClass(item.id)} ${item.regime === "PAUSADO" ? "dca-card.paused" : ""}`}
            >
              <div className="pt-4 px-4 pb-4">
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
                        <span style={{
                          fontSize: '0.7rem',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          border: item.regime === "ATIVO" ? '1px solid rgba(34,197,94,0.3)' : '1px solid var(--border)',
                          background: item.regime === "ATIVO" ? 'rgba(34,197,94,0.2)' : 'var(--bg)',
                          color: item.regime === "ATIVO" ? 'var(--green)' : 'var(--muted)',
                          fontWeight: 600,
                        }}>
                          {item.regime}
                        </span>
                      </div>

                      {/* Rows */}
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-baseline">
                          <span className="text-muted-foreground">Taxa atual</span>
                          <span className="font-mono font-semibold">
                            {privacyMode ? '••••' : `${taxa.toFixed(2)}%`}
                          </span>
                        </div>

                        <div className="flex justify-between items-baseline">
                          <span className="text-muted-foreground">Piso compra</span>
                          <span className="font-mono">{privacyMode ? '••••' : `${piso_c.toFixed(1)}%`}</span>
                        </div>

                        {piso_v !== undefined && (
                          <div className="flex justify-between items-baseline">
                            <span className="text-muted-foreground">Piso venda</span>
                            <span className="font-mono">
                              {privacyMode ? '••••' : `${piso_v.toFixed(1)}%`}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between items-baseline">
                          <span className="text-muted-foreground">Gap vs piso</span>
                          <span
                            className="font-mono font-semibold"
                            style={{ color: gap > 0.5 ? 'var(--green)' : 'var(--yellow)' }}
                          >
                            {privacyMode ? '••••' : `${gap > 0 ? "+" : ""}${gap.toFixed(2)}pp`}
                          </span>
                        </div>

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

                      <div className="border-t border-border my-3 opacity-30" />

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.proxima_acao}
                      </p>
                    </>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
