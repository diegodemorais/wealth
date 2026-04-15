import React, { useState } from 'react';
import { useUiStore } from '@/store/uiStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

  const statusColors: Record<string, { bg: string; dot: string; text: string }> = {
    verde: {
      bg: 'rgba(34, 197, 94, 0.07)',
      dot: '#22c55e',
      text: '#22c55e',
    },
    amarelo: {
      bg: 'rgba(234, 179, 8, 0.07)',
      dot: '#eab308',
      text: '#eab308',
    },
    vermelho: {
      bg: 'rgba(239, 68, 68, 0.07)',
      dot: '#ef4444',
      text: '#ef4444',
    },
  };

  const typeBadges: Record<string, { bg: string; color: string; label: string }> = {
    taxa: {
      bg: 'rgba(6, 182, 212, 0.15)',
      color: '#06b6d4',
      label: 'taxa',
    },
    posicao: {
      bg: 'rgba(168, 85, 247, 0.15)',
      color: '#a855f7',
      label: 'posição',
    },
    crypto: {
      bg: 'rgba(234, 179, 8, 0.15)',
      color: '#eab308',
      label: 'crypto',
    },
  };

  const getSemaforoColor = (status: string) => {
    const colors = {
      verde: '#22c55e',
      amarelo: '#eab308',
      vermelho: '#ef4444',
    };
    return colors[status as keyof typeof colors] || '#94a3b8';
  };

  return (
    <Card className="bg-slate-900/40 border-slate-700/25 mb-4 section section-critical collapsible" data-in-tab="hoje">
      <CardHeader
        className="pb-3 cursor-pointer hover:bg-slate-800/20 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-200">
            Semáforos de Gatilhos
          </CardTitle>
          <span className="text-xs text-slate-400">
            {isOpen ? '▼' : '▶'}
          </span>
        </div>
      </CardHeader>

      {/* Summary when collapsed */}
      {!isOpen && (
        <div className="px-4 py-2 text-xs text-slate-400 flex items-center gap-1.5">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: getSemaforoColor(statusIpca) }}
          />
          {resumo}
        </div>
      )}

      {/* Expanded table */}
      {isOpen && (
        <CardContent>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-slate-700/25">
                <th className="px-2 py-1.5 text-slate-400 text-xs uppercase text-left font-semibold">
                  Gatilho
                </th>
                <th className="px-2 py-1.5 text-slate-400 text-xs uppercase text-center font-semibold">
                  Status
                </th>
                <th className="px-2 py-1.5 text-slate-400 text-xs uppercase text-right font-semibold">
                  Valor
                </th>
                <th className="px-2 py-1.5 text-slate-400 text-xs uppercase text-left font-semibold">
                  Ação
                </th>
              </tr>
            </thead>
            <tbody>
              {gatilhos.map((g, idx) => {
                const statusColor = statusColors[g.status];
                const typeBadge = typeBadges[g.tipo];

                return (
                  <tr key={idx} className="border-b border-slate-700/15">
                    <td className="px-2 py-1.5 text-xs">
                      <div className="mb-1">
                        {g.nome}
                        <span
                          className="text-xs px-1 rounded ml-1.5 inline-block"
                          style={{
                            backgroundColor: typeBadge.bg,
                            color: typeBadge.color,
                          }}
                        >
                          {typeBadge.label}
                        </span>
                      </div>
                      {g.contexto && (
                        <div className="text-xs text-slate-400 mt-1 tabular-nums">
                          {g.contexto}
                        </div>
                      )}
                    </td>
                    <td className="px-2 py-1.5 text-center text-xs">
                      <div className="flex items-center justify-center gap-1">
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: statusColor.dot }}
                        />
                        <span className="capitalize" style={{ color: statusColor.text }}>
                          {g.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-1.5 text-right text-xs tabular-nums">
                      {privacyMode ? '••••' : g.valorPrimario}
                    </td>
                    <td className="px-2 py-1.5 text-xs">
                      {g.acao}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      )}
    </Card>
  );
};

export default SemaforoGatilhos;
