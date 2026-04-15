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
    <div
      className="section section-critical collapsible"
      style={{
        marginBottom: '14px',
        border: '1px solid rgba(71, 85, 105, 0.25)',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
      data-in-tab="hoje"
    >
      <h2
        onClick={() => setIsOpen(!isOpen)}
        style={{
          cursor: 'pointer',
          padding: '12px 14px',
          margin: 0,
          fontSize: '0.95rem',
          fontWeight: 600,
          borderBottom: isOpen ? '1px solid rgba(71, 85, 105, 0.25)' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span>Semáforos de Gatilhos</span>
        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
          {isOpen ? '▼' : '▶'}
        </span>
      </h2>

      {/* Summary when collapsed */}
      {!isOpen && (
        <div
          style={{
            fontSize: '0.75rem',
            color: '#94a3b8',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: getSemaforoColor(statusIpca),
            }}
          />
          {resumo}
        </div>
      )}

      {/* Expanded table */}
      {isOpen && (
        <div style={{ padding: '0 14px 14px' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.78rem',
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: '2px solid rgba(71, 85, 105, 0.25)',
                }}
              >
                <th
                  style={{
                    padding: '6px 8px',
                    color: '#94a3b8',
                    fontSize: '0.65rem',
                    textTransform: 'uppercase',
                    textAlign: 'left',
                    fontWeight: 600,
                  }}
                >
                  Gatilho
                </th>
                <th
                  style={{
                    padding: '6px 8px',
                    color: '#94a3b8',
                    fontSize: '0.65rem',
                    textTransform: 'uppercase',
                    textAlign: 'center',
                    fontWeight: 600,
                  }}
                >
                  Status
                </th>
                <th
                  style={{
                    padding: '6px 8px',
                    color: '#94a3b8',
                    fontSize: '0.65rem',
                    textTransform: 'uppercase',
                    textAlign: 'right',
                    fontWeight: 600,
                  }}
                >
                  Valor
                </th>
                <th
                  style={{
                    padding: '6px 8px',
                    color: '#94a3b8',
                    fontSize: '0.65rem',
                    textTransform: 'uppercase',
                    textAlign: 'left',
                    fontWeight: 600,
                  }}
                >
                  Ação
                </th>
              </tr>
            </thead>
            <tbody>
              {gatilhos.map((g, idx) => {
                const statusColor = statusColors[g.status];
                const typeBadge = typeBadges[g.tipo];

                return (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: '1px solid rgba(71, 85, 105, 0.15)',
                    }}
                  >
                    <td
                      style={{
                        padding: '7px 8px',
                        fontSize: '0.78rem',
                      }}
                    >
                      <div style={{ marginBottom: '4px' }}>
                        {g.nome}
                        <span
                          style={{
                            fontSize: '0.55rem',
                            backgroundColor: typeBadge.bg,
                            color: typeBadge.color,
                            padding: '1px 5px',
                            borderRadius: '4px',
                            marginLeft: '6px',
                            display: 'inline-block',
                          }}
                        >
                          {typeBadge.label}
                        </span>
                      </div>
                      {g.contexto && (
                        <div
                          style={{
                            fontSize: '0.65rem',
                            color: '#94a3b8',
                            marginTop: '2px',
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {g.contexto}
                        </div>
                      )}
                    </td>
                    <td
                      style={{
                        padding: '7px 8px',
                        textAlign: 'center',
                        fontSize: '0.75rem',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        <span
                          style={{
                            display: 'inline-block',
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: statusColor.dot,
                          }}
                        />
                        <span style={{ textTransform: 'capitalize', color: statusColor.text }}>
                          {g.status}
                        </span>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: '7px 8px',
                        textAlign: 'right',
                        fontSize: '0.78rem',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {privacyMode ? '••••' : g.valorPrimario}
                    </td>
                    <td
                      style={{
                        padding: '7px 8px',
                        fontSize: '0.75rem',
                      }}
                    >
                      {g.acao}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SemaforoGatilhos;
