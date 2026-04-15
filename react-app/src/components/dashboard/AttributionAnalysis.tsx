'use client';

import React, { useState } from 'react';
import { useUiStore } from '@/store/uiStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  const lowestContributor = contributions.reduce((min, item) =>
    item.contribution < min.contribution ? item : min
  );

  // Calculate diversification effect (actual return vs weighted average)
  const weightedAverageReturn = contributions.reduce((sum, item) => sum + item.contribution, 0);
  const diversificationEffect = totalReturn - weightedAverageReturn;

  // Color helpers
  const totalReturnColor = totalReturn >= 0 ? 'text-green-500' : 'text-red-500';
  const diversificationColor = diversificationEffect >= 0 ? 'text-green-500' : 'text-red-500';
  const maxContributionWidth = Math.max(...contributions.map(c => Math.abs(c.contribution)));

  return (
    <Card className="bg-slate-900/40 border-slate-700/25 mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-200">
          Attribution — Contribuição ao Retorno ({periodLabel})
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Portfolio return summary */}
        <div className="p-3 bg-green-500/10 border border-green-500/25 rounded">
          <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
            Retorno Total da Carteira
          </div>
          <div className={`text-lg font-bold ${totalReturnColor}`}>
            {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
          </div>
        </div>

        {/* Contribution bars */}
        <div>
          <div className="text-sm font-semibold text-slate-200 mb-3">
            Contribuição ao Retorno
          </div>

          <div className="flex flex-col gap-3">
            {contributions.map(item => {
              const barWidth = (Math.abs(item.contribution) / maxContributionWidth) * 100;
              const textColor = item.contribution >= 0 ? 'white' : 'white';

              return (
                <div key={item.label}>
                  {/* Label and values */}
                  <div className="flex justify-between items-center mb-1 text-xs text-slate-400">
                    <span>{item.label}</span>
                    <span>
                      {item.allocation.toFixed(1)}% × {item.return.toFixed(2)}% = {item.contribution.toFixed(2)}pp
                    </span>
                  </div>

                  {/* Bar */}
                  <div className="h-5 bg-slate-700/15 rounded overflow-hidden relative flex items-center">
                    {/* Zero line marker */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-600 opacity-30" />

                    {/* Contribution bar (from left or right depending on sign) */}
                    <div
                      style={{
                        height: '100%',
                        width: `${barWidth}%`,
                        backgroundColor: item.color,
                        marginLeft: item.contribution >= 0 ? '50%' : 'auto',
                        marginRight: item.contribution < 0 ? '50%' : 'auto',
                      }}
                      className="flex items-center justify-center"
                    >
                      {Math.abs(item.contribution) > 0.1 && (
                        <span className="text-xs font-semibold text-white">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Biggest contributor */}
          <div className="p-3 rounded border" style={{ backgroundColor: `${topContributor.color}15`, borderColor: `${topContributor.color}40` }}>
            <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
              Maior Contribuinte
            </div>
            <div className="text-base font-bold mb-1" style={{ color: topContributor.color }}>
              {topContributor.label.split(' ')[0]}
            </div>
            <div className="text-xs text-slate-500">
              +{topContributor.contribution.toFixed(2)}pp
            </div>
          </div>

          {/* Diversification effect */}
          <div className={`p-3 rounded border ${diversificationEffect >= 0 ? 'bg-green-500/10 border-green-500/25' : 'bg-red-500/10 border-red-500/25'}`}>
            <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
              Efeito Diversificação
            </div>
            <div className={`text-base font-bold mb-1 ${diversificationColor}`}>
              {diversificationEffect >= 0 ? '+' : ''}{diversificationEffect.toFixed(2)}pp
            </div>
            <div className="text-xs text-slate-500">
              Ganho da correlação
            </div>
          </div>

          {/* Lowest contributor */}
          <div className="p-3 bg-slate-700/10 border border-slate-700/40 rounded">
            <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
              Menor Contribuinte
            </div>
            <div className="text-base font-bold mb-1 text-slate-200">
              {lowestContributor.label.split(' ')[0]}
            </div>
            <div className="text-xs text-slate-500">
              {lowestContributor.contribution.toFixed(2)}pp
            </div>
          </div>
        </div>

        {/* Expandable details */}
        <div
          className="flex justify-between items-center p-3 cursor-pointer border-t border-slate-700/15 mt-3"
          onClick={() => setExpandDetails(!expandDetails)}
        >
          <h3 className="text-sm font-semibold m-0 text-slate-200">
            Detalhes por Ativo
          </h3>
          <span className="text-xs text-slate-400">
            {expandDetails ? '▼' : '▶'}
          </span>
        </div>

        {expandDetails && (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  <th className="text-left p-2 border-b border-slate-700/25 text-slate-400 font-semibold">
                    Ativo
                  </th>
                  <th className="text-right p-2 border-b border-slate-700/25 text-slate-200 font-semibold">
                    Alocação
                  </th>
                  <th className="text-right p-2 border-b border-slate-700/25 text-slate-200 font-semibold">
                    Retorno
                  </th>
                  <th className="text-right p-2 border-b border-slate-700/25 text-slate-200 font-semibold">
                    Contribuição
                  </th>
                </tr>
              </thead>
              <tbody>
                {contributions.map((item, idx) => (
                  <tr key={idx}>
                    <td
                      className="p-2 border-b border-slate-700/15 font-semibold"
                      style={{ color: item.color }}
                    >
                      {item.label.split(' ')[0]}
                    </td>
                    <td className="text-right p-2 border-b border-slate-700/15 text-slate-200">
                      {item.allocation.toFixed(1)}%
                    </td>
                    <td className={`text-right p-2 border-b border-slate-700/15 ${item.return >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {item.return >= 0 ? '+' : ''}{item.return.toFixed(2)}%
                    </td>
                    <td className={`text-right p-2 border-b border-slate-700/15 font-semibold ${item.contribution >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {item.contribution >= 0 ? '+' : ''}{item.contribution.toFixed(2)}pp
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-700/10">
                  <td className="p-2 border-b border-slate-700/25 text-slate-200 font-bold">
                    Total
                  </td>
                  <td className="text-right p-2 border-b border-slate-700/25 text-slate-200">
                    100.0%
                  </td>
                  <td className="text-right p-2 border-b border-slate-700/25 text-slate-200">
                    —
                  </td>
                  <td className={`text-right p-2 border-b border-slate-700/25 font-bold ${totalReturnColor}`}>
                    {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Footer note */}
        <div className="mt-3 p-2 text-xs text-slate-500 bg-slate-700/5 rounded">
          <strong>📌 Nota:</strong> Attribution mostra quanto cada posição contribuiu para o retorno total. Efeito diversificação é positivo quando correlação entre ativos reduz volatilidade sem sacrificar retorno.
        </div>
      </CardContent>
    </Card>
  );
};

export default AttributionAnalysis;
