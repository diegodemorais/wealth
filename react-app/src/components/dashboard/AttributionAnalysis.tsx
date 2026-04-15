'use client';

import React, { useState } from 'react';
import { useUiStore } from '@/store/uiStore';

interface ContributionItem {
  label: string;
  allocation: number; // percentage
  return: number; // percentage
  contribution: number; // percentage points
  color: string;
}

interface AttributionAnalysisProps {
  swrdAllocation: number; // SWRD weight %
  swrdReturn: number; // SWRD return %
  avgsAllocation: number; // AVGS weight %
  avgsReturn: number; // AVGS return %
  avemAllocation: number; // AVEM weight %
  avemReturn: number; // AVEM return %
  rfAllocation: number; // RF weight %
  rfReturn: number; // RF return %
  totalReturn: number; // Portfolio return %
  periodLabel: string; // "1 year", "3 years", etc
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

  // Calculate contributions
  const swrdContribution = (swrdAllocation / 100) * swrdReturn;
  const avgsContribution = (avgsAllocation / 100) * avgsReturn;
  const avemContribution = (avemAllocation / 100) * avemReturn;
  const rfContribution = (rfAllocation / 100) * rfReturn;

  const contributions: ContributionItem[] = [
    {
      label: 'SWRD (Global Large Cap)',
      allocation: swrdAllocation,
      return: swrdReturn,
      contribution: swrdContribution,
      color: '#3b82f6',
    },
    {
      label: 'AVGS (Quality)',
      allocation: avgsAllocation,
      return: avgsReturn,
      contribution: avgsContribution,
      color: '#06b6d4',
    },
    {
      label: 'AVEM (EM Value)',
      allocation: avemAllocation,
      return: avemReturn,
      contribution: avemContribution,
      color: '#10b981',
    },
    {
      label: 'Fixed Income',
      allocation: rfAllocation,
      return: rfReturn,
      contribution: rfContribution,
      color: '#f59e0b',
    },
  ];

  // Calculate which assets are contributing most
  const topContributor = contributions.reduce((max, item) =>
    item.contribution > max.contribution ? item : max
  );

  // Calculate diversification effect (actual return vs weighted average)
  const weightedAverageReturn = contributions.reduce((sum, item) => sum + item.contribution, 0);
  const diversificationEffect = totalReturn - weightedAverageReturn;

  return (
    <div
      style={{
        padding: '16px 18px',
        border: '1px solid rgba(71, 85, 105, 0.25)',
        borderRadius: '8px',
        marginBottom: '14px',
        backgroundColor: 'rgba(30, 41, 59, 0.4)',
      }}
    >
      <h2 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 14px', padding: 0 }}>
        Attribution — Contribuição ao Retorno ({periodLabel})
      </h2>

      {/* Portfolio return summary */}
      <div
        style={{
          padding: '12px 14px',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid #22c55e40',
          borderRadius: '6px',
          marginBottom: '14px',
        }}
      >
        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
          Retorno Total da Carteira
        </div>
        <div style={{ fontSize: '1.3rem', fontWeight: 700, color: totalReturn >= 0 ? '#22c55e' : '#ef4444' }}>
          {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
        </div>
      </div>

      {/* Contribution bars */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '10px' }}>
          Contribuição ao Retorno
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {contributions.map(item => (
            <div key={item.label}>
              {/* Label and values */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '4px',
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                }}
              >
                <span>{item.label}</span>
                <span>
                  {item.allocation.toFixed(1)}% × {item.return.toFixed(2)}% = {item.contribution.toFixed(2)}pp
                </span>
              </div>

              {/* Bar */}
              <div
                style={{
                  height: '20px',
                  backgroundColor: 'rgba(71, 85, 105, 0.1)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {/* Zero line marker */}
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: 0,
                    bottom: 0,
                    width: '1px',
                    backgroundColor: '#64748b',
                    opacity: 0.3,
                  }}
                />

                {/* Contribution bar (from left or right depending on sign) */}
                <div
                  style={{
                    height: '100%',
                    width: `${Math.abs((item.contribution / Math.max(...contributions.map(c => Math.abs(c.contribution)))) * 100)}%`,
                    backgroundColor: item.color,
                    marginLeft: item.contribution >= 0 ? '50%' : 'auto',
                    marginRight: item.contribution < 0 ? '50%' : 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    color: item.contribution !== 0 ? 'white' : 'transparent',
                  }}
                >
                  {Math.abs(item.contribution) > 0.1 && `${item.contribution.toFixed(2)}pp`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key metrics cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '10px',
          marginBottom: '14px',
        }}
      >
        {/* Biggest contributor */}
        <div
          style={{
            padding: '10px 12px',
            backgroundColor: `${topContributor.color}15`,
            border: `1px solid ${topContributor.color}40`,
            borderRadius: '6px',
          }}
        >
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
            Maior Contribuinte
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: topContributor.color, marginBottom: '2px' }}>
            {topContributor.label.split(' ')[0]}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            +{topContributor.contribution.toFixed(2)}pp
          </div>
        </div>

        {/* Diversification effect */}
        <div
          style={{
            padding: '10px 12px',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid #8b5cf640',
            borderRadius: '6px',
          }}
        >
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
            Efeito Diversificação
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: diversificationEffect >= 0 ? '#22c55e' : '#ef4444', marginBottom: '2px' }}>
            {diversificationEffect >= 0 ? '+' : ''}{diversificationEffect.toFixed(2)}pp
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Ganho da correlação
          </div>
        </div>

        {/* Lowest contributor */}
        <div
          style={{
            padding: '10px 12px',
            backgroundColor: 'rgba(71, 85, 105, 0.1)',
            border: '1px solid rgba(71, 85, 105, 0.4)',
            borderRadius: '6px',
          }}
        >
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
            Menor Contribuinte
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '2px' }}>
            {contributions.reduce((min, item) =>
              item.contribution < min.contribution ? item : min
            ).label.split(' ')[0]}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {Math.min(...contributions.map(c => c.contribution)).toFixed(2)}pp
          </div>
        </div>
      </div>

      {/* Expandable details */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          paddingTop: '14px',
          borderTop: '1px solid rgba(71, 85, 105, 0.15)',
        }}
        onClick={() => setExpandDetails(!expandDetails)}
      >
        <h3 style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0, color: '#cbd5e1' }}>
          Detalhes por Ativo
        </h3>
        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
          {expandDetails ? '▼' : '▶'}
        </span>
      </div>

      {expandDetails && (
        <div style={{ marginTop: '12px', overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.8rem',
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '8px',
                    borderBottom: '1px solid rgba(71, 85, 105, 0.25)',
                    color: '#94a3b8',
                    fontWeight: 600,
                  }}
                >
                  Ativo
                </th>
                <th
                  style={{
                    textAlign: 'right',
                    padding: '8px',
                    borderBottom: '1px solid rgba(71, 85, 105, 0.25)',
                    color: '#cbd5e1',
                    fontWeight: 600,
                  }}
                >
                  Alocação
                </th>
                <th
                  style={{
                    textAlign: 'right',
                    padding: '8px',
                    borderBottom: '1px solid rgba(71, 85, 105, 0.25)',
                    color: '#cbd5e1',
                    fontWeight: 600,
                  }}
                >
                  Retorno
                </th>
                <th
                  style={{
                    textAlign: 'right',
                    padding: '8px',
                    borderBottom: '1px solid rgba(71, 85, 105, 0.25)',
                    color: '#cbd5e1',
                    fontWeight: 600,
                  }}
                >
                  Contribuição
                </th>
              </tr>
            </thead>
            <tbody>
              {contributions.map((item, idx) => (
                <tr key={idx}>
                  <td
                    style={{
                      padding: '8px',
                      borderBottom: '1px solid rgba(71, 85, 105, 0.15)',
                      color: item.color,
                      fontWeight: 600,
                    }}
                  >
                    {item.label.split(' ')[0]}
                  </td>
                  <td
                    style={{
                      textAlign: 'right',
                      padding: '8px',
                      borderBottom: '1px solid rgba(71, 85, 105, 0.15)',
                      color: '#cbd5e1',
                    }}
                  >
                    {item.allocation.toFixed(1)}%
                  </td>
                  <td
                    style={{
                      textAlign: 'right',
                      padding: '8px',
                      borderBottom: '1px solid rgba(71, 85, 105, 0.15)',
                      color: item.return >= 0 ? '#22c55e' : '#ef4444',
                    }}
                  >
                    {item.return >= 0 ? '+' : ''}{item.return.toFixed(2)}%
                  </td>
                  <td
                    style={{
                      textAlign: 'right',
                      padding: '8px',
                      borderBottom: '1px solid rgba(71, 85, 105, 0.15)',
                      color: item.contribution >= 0 ? '#22c55e' : '#ef4444',
                      fontWeight: 600,
                    }}
                  >
                    {item.contribution >= 0 ? '+' : ''}{item.contribution.toFixed(2)}pp
                  </td>
                </tr>
              ))}
              <tr style={{ backgroundColor: 'rgba(71, 85, 105, 0.1)' }}>
                <td
                  style={{
                    padding: '8px',
                    borderBottom: '1px solid rgba(71, 85, 105, 0.25)',
                    color: '#cbd5e1',
                    fontWeight: 700,
                  }}
                >
                  Total
                </td>
                <td
                  style={{
                    textAlign: 'right',
                    padding: '8px',
                    borderBottom: '1px solid rgba(71, 85, 105, 0.25)',
                    color: '#cbd5e1',
                  }}
                >
                  100.0%
                </td>
                <td
                  style={{
                    textAlign: 'right',
                    padding: '8px',
                    borderBottom: '1px solid rgba(71, 85, 105, 0.25)',
                    color: '#cbd5e1',
                  }}
                >
                  —
                </td>
                <td
                  style={{
                    textAlign: 'right',
                    padding: '8px',
                    borderBottom: '1px solid rgba(71, 85, 105, 0.25)',
                    color: totalReturn >= 0 ? '#22c55e' : '#ef4444',
                    fontWeight: 700,
                  }}
                >
                  {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Footer note */}
      <div
        style={{
          marginTop: '12px',
          fontSize: '0.7rem',
          color: '#64748b',
          padding: '8px',
          backgroundColor: 'rgba(71, 85, 105, 0.08)',
          borderRadius: '4px',
        }}
      >
        <strong>📌 Nota:</strong> Attribution mostra quanto cada posição contribuiu para o retorno total. Efeito diversificação é positivo quando correlação entre ativos reduz volatilidade sem sacrificar retorno.
      </div>
    </div>
  );
};

export default AttributionAnalysis;
