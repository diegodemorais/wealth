'use client';

import React, { useState } from 'react';
import { useUiStore } from '@/store/uiStore';

interface ContributionItem {
  label: string;
  allocation: number;
  return: number;
  contribution: number;
  color: string;
}

interface AttributionAnalysisProps {
  swrdAllocation: number;
  swrdReturn: number;
  avgsAllocation: number;
  avgsReturn: number;
  avemAllocation: number;
  avemReturn: number;
  rfAllocation: number;
  rfReturn: number;
  totalReturn: number;
  periodLabel: string;
}

const AttributionAnalysis: React.FC<AttributionAnalysisProps> = ({
  swrdAllocation,
  swrdReturn,
  avgsAllocation,
  avgsReturn,
  avemAllocation,
  avemReturn,
  rfAllocation,
  rfReturn,
  totalReturn,
  periodLabel,
}) => {
  const { privacyMode } = useUiStore();
  const [expandDetails, setExpandDetails] = useState(false);

  const swrdContribution = (swrdAllocation / 100) * swrdReturn;
  const avgsContribution = (avgsAllocation / 100) * avgsReturn;
  const avemContribution = (avemAllocation / 100) * avemReturn;
  const rfContribution = (rfAllocation / 100) * rfReturn;

  const contributions: ContributionItem[] = [
    { label: 'SWRD (Global Large Cap)', allocation: swrdAllocation, return: swrdReturn, contribution: swrdContribution, color: '#3b82f6' },
    { label: 'AVGS (Quality)', allocation: avgsAllocation, return: avgsReturn, contribution: avgsContribution, color: '#06b6d4' },
    { label: 'AVEM (EM Value)', allocation: avemAllocation, return: avemReturn, contribution: avemContribution, color: '#10b981' },
    { label: 'Fixed Income', allocation: rfAllocation, return: rfReturn, contribution: rfContribution, color: '#f59e0b' },
  ];

  const topContributor = contributions.reduce((max, item) => item.contribution > max.contribution ? item : max);
  const lowestContributor = contributions.reduce((min, item) => item.contribution < min.contribution ? item : min);
  const weightedAverageReturn = contributions.reduce((sum, item) => sum + item.contribution, 0);
  const diversificationEffect = totalReturn - weightedAverageReturn;
  const maxContributionWidth = Math.max(...contributions.map(c => Math.abs(c.contribution)));

  const totalReturnColor = totalReturn >= 0 ? 'var(--green)' : 'var(--red)';
  const diversificationColor = diversificationEffect >= 0 ? 'var(--green)' : 'var(--red)';

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
      <h2 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', marginBottom: '16px', marginTop: 0 }}>
        Attribution — Contribuição ao Retorno ({periodLabel})
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Portfolio return summary */}
        <div style={{ padding: '12px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '4px' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
            Retorno Total da Carteira
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: totalReturnColor }}>
            {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
          </div>
        </div>

        {/* Contribution bars */}
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', marginBottom: '12px' }}>
            Contribuição ao Retorno
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {contributions.map(item => {
              const barWidth = (Math.abs(item.contribution) / maxContributionWidth) * 100;
              return (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', fontSize: '0.75rem', color: 'var(--muted)' }}>
                    <span>{item.label}</span>
                    <span>{item.allocation.toFixed(1)}% × {item.return.toFixed(2)}% = {item.contribution.toFixed(2)}pp</span>
                  </div>
                  <div style={{ height: '20px', background: 'var(--bg)', borderRadius: '4px', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'var(--border)', opacity: 0.5 }} />
                    <div
                      style={{
                        height: '100%',
                        width: `${barWidth / 2}%`,
                        backgroundColor: item.color,
                        marginLeft: item.contribution >= 0 ? '50%' : 'auto',
                        marginRight: item.contribution < 0 ? '50%' : 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {Math.abs(item.contribution) > 0.1 && (
                        <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'white' }}>
                          {item.contribution.toFixed(2)}pp
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Key metrics cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
          <div style={{ padding: '12px', borderRadius: '4px', backgroundColor: `${topContributor.color}15`, border: `1px solid ${topContributor.color}40` }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
              Maior Contribuinte
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '4px', color: topContributor.color }}>
              {topContributor.label.split(' ')[0]}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
              +{topContributor.contribution.toFixed(2)}pp
            </div>
          </div>

          <div style={{
            padding: '12px', borderRadius: '4px',
            background: diversificationEffect >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${diversificationEffect >= 0 ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
          }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
              Efeito Diversificação
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '4px', color: diversificationColor }}>
              {diversificationEffect >= 0 ? '+' : ''}{diversificationEffect.toFixed(2)}pp
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
              Ganho da correlação
            </div>
          </div>

          <div style={{ padding: '12px', borderRadius: '4px', background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
              Menor Contribuinte
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text)' }}>
              {lowestContributor.label.split(' ')[0]}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
              {lowestContributor.contribution.toFixed(2)}pp
            </div>
          </div>
        </div>

        {/* Expandable details */}
        <div
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', cursor: 'pointer', borderTop: '1px solid var(--border)' }}
          onClick={() => setExpandDetails(!expandDetails)}
        >
          <h3 style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0, color: 'var(--text)' }}>
            Detalhes por Ativo
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
            {expandDetails ? '▼' : '▶'}
          </span>
        </div>

        {expandDetails && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--border)', color: 'var(--muted)', fontWeight: 600 }}>Ativo</th>
                  <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid var(--border)', color: 'var(--text)', fontWeight: 600 }}>Alocação</th>
                  <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid var(--border)', color: 'var(--text)', fontWeight: 600 }}>Retorno</th>
                  <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid var(--border)', color: 'var(--text)', fontWeight: 600 }}>Contribuição</th>
                </tr>
              </thead>
              <tbody>
                {contributions.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: '8px', borderBottom: '1px solid var(--border)', fontWeight: 600, color: item.color }}>
                      {item.label.split(' ')[0]}
                    </td>
                    <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid var(--border)', color: 'var(--text)' }}>
                      {item.allocation.toFixed(1)}%
                    </td>
                    <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid var(--border)', color: item.return >= 0 ? 'var(--green)' : 'var(--red)' }}>
                      {item.return >= 0 ? '+' : ''}{item.return.toFixed(2)}%
                    </td>
                    <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid var(--border)', fontWeight: 600, color: item.contribution >= 0 ? 'var(--green)' : 'var(--red)' }}>
                      {item.contribution >= 0 ? '+' : ''}{item.contribution.toFixed(2)}pp
                    </td>
                  </tr>
                ))}
                <tr style={{ background: 'var(--bg)' }}>
                  <td style={{ padding: '8px', borderBottom: '1px solid var(--border)', color: 'var(--text)', fontWeight: 700 }}>Total</td>
                  <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid var(--border)', color: 'var(--text)' }}>100.0%</td>
                  <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid var(--border)', color: 'var(--text)' }}>—</td>
                  <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid var(--border)', fontWeight: 700, color: totalReturnColor }}>
                    {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Footer note */}
        <div style={{ padding: '8px 12px', fontSize: '0.75rem', color: 'var(--muted)', background: 'var(--bg)', borderRadius: '4px' }}>
          <strong>Nota:</strong> Attribution mostra quanto cada posição contribuiu para o retorno total. Efeito diversificação é positivo quando correlação entre ativos reduz volatilidade sem sacrificar retorno.
        </div>
      </div>
    </div>
  );
};

export default AttributionAnalysis;
