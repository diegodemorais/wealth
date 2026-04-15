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
    <section className="section section-critical" style={{ marginBottom: '14px' }}>
      {/* Header — collapsible */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
      >
        <h2 style={{ margin: 0 }}>Semáforos de Gatilhos ›</h2>
        <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
          {isOpen ? '▼' : '▶'}
        </span>
      </div>

      {/* Summary when collapsed */}
      {!isOpen && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '0.7rem', color: 'var(--muted)' }}>
          <span style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: getSemaforoColor(statusIpca),
            flexShrink: 0,
          }} />
          {resumo}
        </div>
      )}

      {/* Expanded table */}
      {isOpen && gatilhos.length > 0 && (
        <div style={{ marginTop: '12px', overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.7rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '6px 8px', color: 'var(--muted)', textTransform: 'uppercase', fontSize: '0.6rem', fontWeight: 600, textAlign: 'left' }}>Gatilho</th>
                <th style={{ padding: '6px 8px', color: 'var(--muted)', textTransform: 'uppercase', fontSize: '0.6rem', fontWeight: 600, textAlign: 'center' }}>Status</th>
                <th style={{ padding: '6px 8px', color: 'var(--muted)', textTransform: 'uppercase', fontSize: '0.6rem', fontWeight: 600, textAlign: 'right' }}>Valor</th>
                <th style={{ padding: '6px 8px', color: 'var(--muted)', textTransform: 'uppercase', fontSize: '0.6rem', fontWeight: 600, textAlign: 'left' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {gatilhos.map((g, idx) => {
                const typeBadge = typeBadges[g.tipo] ?? typeBadges.taxa;

                return (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '6px 8px' }}>
                      <div>
                        {g.nome}
                        <span style={{
                          fontSize: '0.6rem',
                          padding: '1px 5px',
                          borderRadius: '3px',
                          marginLeft: '6px',
                          background: typeBadge.bg,
                          color: typeBadge.color,
                        }}>
                          {typeBadge.label}
                        </span>
                      </div>
                      {g.contexto && (
                        <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginTop: '2px' }}>
                          {g.contexto}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                        <span style={{
                          display: 'inline-block',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: getSemaforoColor(g.status),
                          flexShrink: 0,
                        }} />
                        <span style={{ color: getSemaforoColor(g.status) }}>
                          {g.status}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                      {privacyMode ? '••••' : g.valorPrimario}
                    </td>
                    <td style={{ padding: '6px 8px', color: 'var(--muted)' }}>
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
