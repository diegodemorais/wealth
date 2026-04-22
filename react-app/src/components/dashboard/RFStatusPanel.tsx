'use client';

import { useUiStore } from '@/store/uiStore';

interface RFStatusRow {
  id: string;
  label: string;
  taxaAtual?: number | null;
  piso?: number | null;
  gap?: number | null;
  pctAtual?: number | null;
  pctAlvo?: number | null;
  valor?: number | null;
  dcaAtivo?: boolean;
}

interface RFStatusPanelProps {
  rows: RFStatusRow[];
}

/**
 * Consolidates IPCA+ Taxa Progress and DCA Status per RF instrument.
 * Shows, per instrument (IPCA+2040 / IPCA+2050 / Renda+2065):
 *   taxa atual · piso · gap · % atual · % alvo · posição R$
 */
export default function RFStatusPanel({ rows }: RFStatusPanelProps) {
  const { privacyMode } = useUiStore();
  const valid = rows.filter(r => r.taxaAtual != null || r.valor != null);
  if (!valid.length) {
    return (
      <div style={{ padding: 12, fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
        Sem dados de RF Status
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {valid.map(r => {
          const gap = r.gap;
          const gapColor =
            gap == null ? 'var(--muted)'
            : gap > 0.5 ? 'var(--green)'
            : gap > 0 ? 'var(--yellow)'
            : 'var(--red)';
          const ativo = r.dcaAtivo;
          return (
            <div
              key={r.id}
              className="bg-slate-700/40 rounded p-2.5"
              style={{ borderLeft: '3px solid var(--accent)', opacity: 0.95 }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-xs font-semibold text-text">{r.label}</div>
                {ativo != null && (
                  <span
                    className="text-[10px] font-bold uppercase tracking-wide"
                    style={{ color: ativo ? 'var(--green)' : 'var(--yellow)' }}
                  >
                    {ativo ? 'DCA Ativo' : 'Pausado'}
                  </span>
                )}
              </div>

              {r.taxaAtual != null && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted">Taxa</span>
                  <span className="font-mono font-semibold">{r.taxaAtual.toFixed(2)}%</span>
                </div>
              )}
              {r.piso != null && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted">Piso</span>
                  <span className="font-mono">{r.piso.toFixed(1)}%</span>
                </div>
              )}
              {gap != null && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted">Gap</span>
                  <span className="font-mono font-semibold" style={{ color: gapColor }}>
                    {gap > 0 ? '+' : ''}{gap.toFixed(2)}pp
                  </span>
                </div>
              )}
              {r.pctAtual != null && r.pctAlvo != null && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted">% carteira</span>
                  <span className="font-mono">
                    {privacyMode ? '••%' : `${r.pctAtual.toFixed(1)}% / ${r.pctAlvo.toFixed(0)}%`}
                  </span>
                </div>
              )}
              {r.valor != null && (
                <div className="flex justify-between text-xs mt-1 pt-1 border-t border-border/30">
                  <span className="text-muted">Posição</span>
                  <span className="font-mono font-semibold">
                    {privacyMode ? '••••' : `R$${(r.valor / 1000).toFixed(0)}k`}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="text-xs text-slate-500">
        Fonte: Nubank / IBKR · DCA automático por gap vs alvo de alocação.
      </div>
    </div>
  );
}
