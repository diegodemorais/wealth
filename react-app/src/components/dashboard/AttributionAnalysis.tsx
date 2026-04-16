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
    { label: 'SWRD (Global Large Cap)', allocation: swrdAllocation, return: swrdReturn, contribution: swrdContribution, color: 'var(--accent)' },
    { label: 'AVGS (Quality)', allocation: avgsAllocation, return: avgsReturn, contribution: avgsContribution, color: 'var(--cyan)' },
    { label: 'AVEM (EM Value)', allocation: avemAllocation, return: avemReturn, contribution: avemContribution, color: 'var(--green)' },
    { label: 'Fixed Income', allocation: rfAllocation, return: rfReturn, contribution: rfContribution, color: 'var(--yellow)' },
  ];

  const topContributor = contributions.reduce((max, item) => item.contribution > max.contribution ? item : max);
  const lowestContributor = contributions.reduce((min, item) => item.contribution < min.contribution ? item : min);
  const weightedAverageReturn = contributions.reduce((sum, item) => sum + item.contribution, 0);
  const diversificationEffect = totalReturn - weightedAverageReturn;
  const maxContributionWidth = Math.max(...contributions.map(c => Math.abs(c.contribution)));

  const totalReturnColor = totalReturn >= 0 ? 'var(--green)' : 'var(--red)';
  const diversificationColor = diversificationEffect >= 0 ? 'var(--green)' : 'var(--red)';

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-5">
      <h2 className="text-sm font-semibold text-text mb-4 mt-0">
        Attribution — Contribuição ao Retorno ({periodLabel})
      </h2>

      <div className="flex flex-col gap-4">
        {/* Portfolio return summary */}
        <div className="p-3 rounded border bg-green-900/10 border-green-600/25">
          <div className="text-xs text-muted mb-1 uppercase font-semibold">
            Retorno Total da Carteira
          </div>
          <div className="text-lg font-bold" style={{ color: totalReturnColor }}>
            {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
          </div>
        </div>

        {/* Contribution bars */}
        <div>
          <div className="text-sm font-semibold text-text mb-3">
            Contribuição ao Retorno
          </div>

          <div className="flex flex-col gap-3">
            {contributions.map(item => {
              const barWidth = (Math.abs(item.contribution) / maxContributionWidth) * 100;
              return (
                <div key={item.label}>
                  <div className="flex justify-between items-center mb-1 text-xs text-muted">
                    <span>{item.label}</span>
                    <span>{item.allocation.toFixed(1)}% × {item.return.toFixed(2)}% = {item.contribution.toFixed(2)}pp</span>
                  </div>
                  <div className="h-5 bg-secondary rounded overflow-hidden relative flex items-center">
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
                        <span className="text-xs font-semibold text-text">
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
        <div className="grid grid-cols-auto-fit gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
          <div className="p-3 rounded border" style={{ backgroundColor: `${topContributor.color}20`, borderColor: `${topContributor.color}40` }}>
            <div className="text-xs text-muted mb-1 uppercase font-semibold">
              Maior Contribuinte
            </div>
            <div className="text-sm font-bold mb-1" style={{ color: topContributor.color }}>
              {topContributor.label.split(' ')[0]}
            </div>
            <div className="text-xs text-muted">
              +{topContributor.contribution.toFixed(2)}pp
            </div>
          </div>

          <div className={`p-3 rounded border ${diversificationEffect >= 0 ? 'bg-green-900/10 border-green-600/25' : 'bg-red-900/10 border-red-600/25'}`}>
            <div className="text-xs text-muted mb-1 uppercase font-semibold">
              Efeito Diversificação
            </div>
            <div className="text-sm font-bold mb-1" style={{ color: diversificationColor }}>
              {diversificationEffect >= 0 ? '+' : ''}{diversificationEffect.toFixed(2)}pp
            </div>
            <div className="text-xs text-muted">
              Ganho da correlação
            </div>
          </div>

          <div className="p-3 rounded border bg-secondary/20 border-border">
            <div className="text-xs text-muted mb-1 uppercase font-semibold">
              Menor Contribuinte
            </div>
            <div className="text-sm font-bold mb-1 text-text">
              {lowestContributor.label.split(' ')[0]}
            </div>
            <div className="text-xs text-muted">
              {lowestContributor.contribution.toFixed(2)}pp
            </div>
          </div>
        </div>

        {/* Expandable details */}
        <div
          className="flex justify-between items-center p-3 cursor-pointer border-t border-border"
          onClick={() => setExpandDetails(!expandDetails)}
        >
          <h3 className="text-sm font-semibold m-0 text-text">
            Detalhes por Ativo
          </h3>
          <span className="text-xs text-muted">
            {expandDetails ? '▼' : '▶'}
          </span>
        </div>

        {expandDetails && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  <th className="text-left p-2 border-b border-border text-muted font-semibold">Ativo</th>
                  <th className="text-right p-2 border-b border-border text-text font-semibold">Alocação</th>
                  <th className="text-right p-2 border-b border-border text-text font-semibold">Retorno</th>
                  <th className="text-right p-2 border-b border-border text-text font-semibold">Contribuição</th>
                </tr>
              </thead>
              <tbody>
                {contributions.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-2 border-b border-border font-semibold" style={{ color: item.color }}>
                      {item.label.split(' ')[0]}
                    </td>
                    <td className="text-right p-2 border-b border-border text-text">
                      {item.allocation.toFixed(1)}%
                    </td>
                    <td className={`text-right p-2 border-b border-border ${item.return >= 0 ? 'text-green' : 'text-red'}`}>
                      {item.return >= 0 ? '+' : ''}{item.return.toFixed(2)}%
                    </td>
                    <td className={`text-right p-2 border-b border-border font-semibold ${item.contribution >= 0 ? 'text-green' : 'text-red'}`}>
                      {item.contribution >= 0 ? '+' : ''}{item.contribution.toFixed(2)}pp
                    </td>
                  </tr>
                ))}
                <tr className="bg-secondary/20">
                  <td className="p-2 border-b border-border text-text font-bold">Total</td>
                  <td className="text-right p-2 border-b border-border text-text">100.0%</td>
                  <td className="text-right p-2 border-b border-border text-text">—</td>
                  <td className="text-right p-2 border-b border-border font-bold" style={{ color: totalReturnColor }}>
                    {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Footer note */}
        <div className="p-3 text-xs text-muted bg-secondary/20 rounded">
          <strong>Nota:</strong> Attribution mostra quanto cada posição contribuiu para o retorno total. Efeito diversificação é positivo quando correlação entre ativos reduz volatilidade sem sacrificar retorno.
        </div>
      </div>
    </div>
  );
};

export default AttributionAnalysis;
