import React, { useState } from 'react';
import { useUiStore } from '@/store/uiStore';

interface Gatilho {
  nome: string;
  tipo: 'taxa' | 'posicao' | 'crypto';
  status: 'verde' | 'amarelo' | 'vermelho';
  valorPrimario: string;
  contexto?: string;
  acao: string;
}

interface SemaforoGatilhosProps {
  gatilhos: Gatilho[];
  resumo: string;
  statusIpca: string;
}

const SemaforoGatilhos: React.FC<SemaforoGatilhosProps> = ({
  gatilhos,
  resumo,
  statusIpca,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { privacyMode } = useUiStore();

  const statusDotColor: Record<string, string> = {
    verde: 'var(--green)',
    amarelo: 'var(--yellow)',
    vermelho: 'var(--red)',
  };

  const typeBadges: Record<string, { bg: string; color: string; label: string }> = {
    taxa: { bg: 'rgba(6, 182, 212, 0.15)', color: 'var(--cyan)', label: 'taxa' },
    posicao: { bg: 'rgba(168, 85, 247, 0.15)', color: 'var(--purple)', label: 'posição' },
    crypto: { bg: 'rgba(234, 179, 8, 0.15)', color: 'var(--yellow)', label: 'crypto' },
  };

  const getSemaforoColor = (status: string) =>
    statusDotColor[status] ?? 'var(--muted)';

  return (
    <section className="mb-3.5 rounded-lg overflow-hidden border border-red-900/50 bg-red-950/20">
      {/* Header — collapsible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center cursor-pointer px-4 py-3 text-text hover:bg-red-900/10 transition-colors"
      >
        <h2 className="m-0 text-base font-semibold">Semáforos de Gatilhos ›</h2>
        <span className="text-xs text-muted">
          {isOpen ? '▼' : '▶'}
        </span>
      </button>

      {/* Summary when collapsed */}
      {!isOpen && (
        <div className="flex items-center gap-1.5 mx-4 mb-3 text-xs text-muted">
          <span
            className="inline-block w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: getSemaforoColor(statusIpca) }}
          />
          {resumo}
        </div>
      )}

      {/* Expanded table */}
      {isOpen && gatilhos.length > 0 && (
        <div className="overflow-x-auto px-4 pb-4 mt-3">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/50">
                <th className="px-2 py-1.5 text-muted-foreground text-xs uppercase font-semibold text-left">
                  Gatilho
                </th>
                <th className="px-2 py-1.5 text-muted-foreground text-xs uppercase font-semibold text-center">
                  Status
                </th>
                <th className="px-2 py-1.5 text-muted-foreground text-xs uppercase font-semibold text-right">
                  Valor
                </th>
                <th className="px-2 py-1.5 text-muted-foreground text-xs uppercase font-semibold text-left">
                  Ação
                </th>
              </tr>
            </thead>
            <tbody>
              {gatilhos.map((g, idx) => {
                const typeBadge = typeBadges[g.tipo] ?? typeBadges.taxa;

                return (
                  <tr key={idx} className="border-b border-border/30">
                    <td className="px-2 py-2">
                      <div className="text-slate-100">
                        {g.nome}
                        <span
                          className="inline-block text-xs px-1.5 py-0.5 rounded ml-1.5"
                          style={{
                            background: typeBadge.bg,
                            color: typeBadge.color,
                          }}
                        >
                          {typeBadge.label}
                        </span>
                      </div>
                      {g.contexto && (
                        <div className="text-xs text-muted mt-0.5">
                          {g.contexto}
                        </div>
                      )}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span
                          className="inline-block w-2 h-2 rounded-full"
                          style={{ background: getSemaforoColor(g.status) }}
                        />
                        <span style={{ color: getSemaforoColor(g.status) }}>
                          {g.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums text-slate-100">
                      {privacyMode ? '••••' : g.valorPrimario}
                    </td>
                    <td className="px-2 py-2 text-muted">
                      {g.acao}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default SemaforoGatilhos;
