'use client';

import React, { useState } from 'react';
import { useUiStore } from '@/store/uiStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SpendingCategory {
  categoria: string;
  mustSpendMensal: number;
  likeSpendMensal: number;
  imprevistossMensal: number;
  totalMensal: number;
  color: string;
}

interface SpendingBreakdownProps {
  musthave: number; // Must-spend (necessário)
  likes: number; // Like-to-have (conforto)
  imprevistos: number; // Imprevistos
  totalAnual: number; // Annual total
}

const SpendingBreakdown: React.FC<SpendingBreakdownProps> = ({
  musthave,
  likes,
  imprevistos,
  totalAnual,
}) => {
  const { privacyMode } = useUiStore();
  const [expandDetails, setExpandDetails] = useState(false);

  const fmtBrl = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const mustaveMonthly = musthave / 12;
  const likesMonthly = likes / 12;
  const imprevistosMonthly = imprevistos / 12;
  const totalMonthly = totalAnual / 12;

  const categories: SpendingCategory[] = [
    {
      categoria: 'Must-Have (Essencial)',
      mustSpendMensal: mustaveMonthly,
      likeSpendMensal: 0,
      imprevistossMensal: 0,
      totalMensal: mustaveMonthly,
      color: '#ef4444',
    },
    {
      categoria: 'Like-to-Have (Conforto)',
      mustSpendMensal: 0,
      likeSpendMensal: likesMonthly,
      imprevistossMensal: 0,
      totalMensal: likesMonthly,
      color: '#f59e0b',
    },
    {
      categoria: 'Imprevistos (Buffer)',
      mustSpendMensal: 0,
      likeSpendMensal: 0,
      imprevistossMensal: imprevistosMonthly,
      totalMensal: imprevistosMonthly,
      color: '#8b5cf6',
    },
  ];

  const mustavePercent = (musthave / totalAnual) * 100;
  const likesPercent = (likes / totalAnual) * 100;
  const imprevistosPercent = (imprevistos / totalAnual) * 100;

  // Categorize spending levels
  const isHighMustHave = mustavePercent > 70; // > 70% must-have = inflexible
  const isWellBalanced = mustavePercent <= 60 && mustavePercent >= 50; // 50-60% is ideal
  const isFlexible = mustavePercent < 50; // < 50% must-have = very flexible

  // Flexibility assessment colors
  const flexColor = isWellBalanced
    ? 'bg-green-500/10 border-green-500/25'
    : isFlexible
      ? 'bg-blue-500/10 border-blue-500/25'
      : 'bg-amber-500/10 border-amber-500/25';
  const flexTextColor = isWellBalanced ? 'text-green-500' : isFlexible ? 'text-blue-500' : 'text-amber-500';
  const flexLabel = isWellBalanced ? '✅ Balanceado' : isFlexible ? '🟢 Muito Flexível' : '⚠️ Rígido';

  return (
    <Card className="bg-slate-900/40 border-slate-700/25 mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-200">
          Spending Breakdown — Análise de Gastos por Categoria
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Total spending summary */}
        <div className="p-3 bg-violet-500/10 border border-violet-500/25 rounded">
          <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
            Despesa Anual Total (Baseline)
          </div>
          <div className="text-lg font-bold text-violet-400 mb-1">
            {privacyMode ? 'R$••••' : fmtBrl(totalAnual)}
          </div>
          <div className="text-xs text-slate-400">
            {privacyMode ? '••' : (totalMonthly).toFixed(0)} /mês em média
          </div>
        </div>

        {/* Stacked bar visualization */}
        <div>
          <div className="text-sm font-semibold text-slate-200 mb-3">
            Distribuição de Gastos
          </div>

          <div className="flex h-16 bg-slate-700/15 rounded overflow-hidden gap-0 mb-2">
            {/* Must-Have */}
            <div
              style={{ flex: mustavePercent, minWidth: '40px' }}
              className="bg-red-500 opacity-80 flex items-center justify-center"
              title={`Essencial: ${mustavePercent.toFixed(1)}%`}
            >
              {mustavePercent > 12 && (
                <span className="text-xs text-white font-semibold">{mustavePercent.toFixed(0)}%</span>
              )}
            </div>

            {/* Like-to-Have */}
            <div
              style={{ flex: likesPercent, minWidth: '40px' }}
              className="bg-amber-500 opacity-80 flex items-center justify-center"
              title={`Conforto: ${likesPercent.toFixed(1)}%`}
            >
              {likesPercent > 12 && (
                <span className="text-xs text-white font-semibold">{likesPercent.toFixed(0)}%</span>
              )}
            </div>

            {/* Imprevistos */}
            <div
              style={{ flex: imprevistosPercent, minWidth: '40px' }}
              className="bg-violet-500 opacity-80 flex items-center justify-center"
              title={`Buffer: ${imprevistosPercent.toFixed(1)}%`}
            >
              {imprevistosPercent > 12 && (
                <span className="text-xs text-white font-semibold">{imprevistosPercent.toFixed(0)}%</span>
              )}
            </div>
          </div>
        </div>

        {/* Category cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Must-Have */}
          <div className="p-3 bg-red-500/10 border border-red-500/25 rounded">
            <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
              Essencial
            </div>
            <div className="text-base font-bold text-red-500 mb-1">
              {mustavePercent.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-500">
              {privacyMode ? '••' : fmtBrl(mustaveMonthly)}/mês
            </div>
          </div>

          {/* Like-to-Have */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded">
            <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
              Conforto
            </div>
            <div className="text-base font-bold text-amber-500 mb-1">
              {likesPercent.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-500">
              {privacyMode ? '••' : fmtBrl(likesMonthly)}/mês
            </div>
          </div>

          {/* Imprevistos */}
          <div className="p-3 bg-violet-500/10 border border-violet-500/25 rounded">
            <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
              Buffer
            </div>
            <div className="text-base font-bold text-violet-500 mb-1">
              {imprevistosPercent.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-500">
              {privacyMode ? '••' : fmtBrl(imprevistosMonthly)}/mês
            </div>
          </div>

          {/* Flexibility Assessment */}
          <div className={`p-3 rounded border ${flexColor}`}>
            <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
              Flexibilidade
            </div>
            <div className={`text-base font-bold mb-1 ${flexTextColor}`}>
              {flexLabel}
            </div>
            <div className="text-xs text-slate-500">
              vs. 50-60% ideal
            </div>
          </div>
        </div>

        {/* Expandable details */}
        <div
          className="flex justify-between items-center p-3 cursor-pointer border-t border-slate-700/15 mt-3"
          onClick={() => setExpandDetails(!expandDetails)}
        >
          <h3 className="text-sm font-semibold m-0 text-slate-200">
            Detalhes Mensais
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
                    Categoria
                  </th>
                  <th className="text-right p-2 border-b border-slate-700/25 text-slate-200 font-semibold">
                    Mensal
                  </th>
                  <th className="text-right p-2 border-b border-slate-700/25 text-slate-200 font-semibold">
                    Anual
                  </th>
                  <th className="text-right p-2 border-b border-slate-700/25 text-slate-200 font-semibold">
                    % Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, idx) => (
                  <tr key={idx}>
                    <td
                      className="p-2 border-b border-slate-700/15 font-semibold"
                      style={{ color: cat.color }}
                    >
                      {cat.categoria}
                    </td>
                    <td className="text-right p-2 border-b border-slate-700/15 text-slate-200">
                      {privacyMode ? '••' : fmtBrl(cat.totalMensal)}
                    </td>
                    <td className="text-right p-2 border-b border-slate-700/15 text-slate-200">
                      {privacyMode ? '••' : fmtBrl(cat.totalMensal * 12)}
                    </td>
                    <td className="text-right p-2 border-b border-slate-700/15 font-semibold" style={{ color: cat.color }}>
                      {((cat.totalMensal * 12 / totalAnual) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-700/10">
                  <td className="p-2 border-b border-slate-700/25 text-slate-200 font-bold">
                    Total
                  </td>
                  <td className="text-right p-2 border-b border-slate-700/25 text-slate-200">
                    {privacyMode ? '••' : fmtBrl(totalMonthly)}
                  </td>
                  <td className="text-right p-2 border-b border-slate-700/25 text-slate-200">
                    {privacyMode ? '••' : fmtBrl(totalAnual)}
                  </td>
                  <td className="text-right p-2 border-b border-slate-700/25 text-slate-200 font-bold">
                    100.0%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Footer note */}
        <div className="mt-3 p-2 text-xs text-slate-500 bg-slate-700/5 rounded">
          <strong>📌 Nota:</strong> Ideal é 50-60% essencial, 30-35% conforto, 5-10% imprevistos. Spending smile durante aposentadoria pode mudar essa proporção.
        </div>
      </CardContent>
    </Card>
  );
};

export default SpendingBreakdown;
