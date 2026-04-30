'use client';

import { useUiStore } from '@/store/uiStore';
import { fmtPrivacy } from '@/utils/privacyTransform';

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
  duration?: number | null; // Duration in years for interest rate sensitivity
}

interface RFStatusPanelProps {
  rows: RFStatusRow[];
}

// Deriva ação recomendada com base na taxa atual vs gatilhos de carteira.md
function getAcaoRecomendada(row: RFStatusRow): { text: string; color: string } | null {
  const taxa = row.taxaAtual;
  if (taxa == null) return null;
  if (row.id === 'renda2065') {
    if (taxa >= 6.5) return { text: '→ DCA ativo (gatilho ativo)', color: 'var(--green)' };
    if (taxa >= 6.0) return { text: '→ Monitorar', color: 'var(--yellow)' };
    return { text: '→ Aguardar', color: 'var(--muted)' };
  }
  // IPCA+ 2040 e 2050
  if (taxa >= 6.0) return { text: '→ Comprar (gatilho ativo)', color: 'var(--green)' };
  if (taxa >= 5.5) return { text: '→ Monitorar — próximo do gatilho', color: 'var(--yellow)' };
  return { text: '→ Aguardar', color: 'var(--muted)' };
}

/**
 * Consolidates IPCA+ Taxa Progress and DCA Status per RF instrument.
 * Shows, per instrument (IPCA+2040 / IPCA+2050 / Renda+2065):
 *   taxa atual · piso · gap · % atual · % alvo · posição R$ · ação recomendada
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
              {r.duration != null && (
                <div className="flex justify-between text-xs mt-0.5">
                  <span className="text-muted">Duration</span>
                  <span className="font-mono text-yellow-400">{r.duration.toFixed(1)}a</span>
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
              {(() => {
                const acao = getAcaoRecomendada(r);
                if (!acao) return null;
                return (
                  <div className="font-mono text-xs mt-1.5 pt-1 border-t border-border/20" style={{ color: acao.color }}>
                    {acao.text}
                  </div>
                );
              })()}
              {r.pctAtual != null && r.pctAlvo != null && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted">% carteira</span>
                  <span className="font-mono">
                    {`${r.pctAtual.toFixed(1)}% / ${r.pctAlvo.toFixed(0)}%`}
                  </span>
                </div>
              )}
              {r.valor != null && (
                <div className="flex justify-between text-xs mt-1 pt-1 border-t border-border/30">
                  <span className="text-muted">Posição</span>
                  <span className="font-mono font-semibold">
                    {fmtPrivacy(r.valor / 1000, privacyMode)}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="text-xs text-slate-500">
        Duration = sensibilidade do preço a mudança de 1pp em taxa. Renda+ 2065 (43.6a) é 2x mais volátil que IPCA+ 2040 (21.3a) em alta de juros.
      </div>
    </div>
  );
}
