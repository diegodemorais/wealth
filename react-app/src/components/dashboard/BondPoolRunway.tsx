'use client';

import React from 'react';
import { useUiStore } from '@/store/uiStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RunwayYear {
  year: number;
  startBalance: number;
  fireExpense: number;
  investmentReturn: number;
  endBalance: number;
  coverage: number; // years of expenses covered
}

interface BondPoolRunwayProps {
  poolCurrentValue: number; // Current bond pool value in BRL
  fireAnnualExpense: number; // Annual spending need in FIRE (BRL)
  expectedReturn: number; // Expected annual return on pool
  projectedYears: number; // How many years to project ahead
  yearsToFire: number; // Years until retirement
  swrPercent: number; // Sustainable withdrawal rate
}

const BondPoolRunway: React.FC<BondPoolRunwayProps> = ({
  poolCurrentValue,
  fireAnnualExpense,
  expectedReturn,
  projectedYears = 5,
  yearsToFire,
  swrPercent,
}) => {
  const { privacyMode } = useUiStore();

  const fmtBrl = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Calculate runway progression
  const runwayData: RunwayYear[] = [];
  let currentBalance = poolCurrentValue;

  for (let i = 0; i <= projectedYears; i++) {
    const startBalance = currentBalance;
    const investmentReturn = startBalance * (expectedReturn / 100);
    const expense = i < yearsToFire ? 0 : fireAnnualExpense; // Only spend after FIRE
    const endBalance = startBalance + investmentReturn - expense;
    const coverage = expense > 0 ? endBalance / expense : 0;

    runwayData.push({
      year: i,
      startBalance,
      fireExpense: expense,
      investmentReturn,
      endBalance: Math.max(0, endBalance),
      coverage,
    });

    currentBalance = endBalance;
  }

  // Find critical metrics
  const currentCoverage = poolCurrentValue / fireAnnualExpense;
  const futurePoolValue = runwayData[runwayData.length - 1]?.endBalance || poolCurrentValue;
  const futureCoverage = futurePoolValue / fireAnnualExpense;
  const runoutYear = runwayData.find(r => r.endBalance <= 0)?.year ?? Infinity;

  // Safety thresholds
  const isSafe = futureCoverage >= 2.5; // 2.5+ years of expenses = safe
  const isWarning = futureCoverage >= 1.5 && futureCoverage < 2.5; // Warning zone
  const isCritical = futureCoverage < 1.5; // Critical

  const statusColor = isSafe ? '#22c55e' : isWarning ? '#f59e0b' : '#ef4444';
  const statusBg = isSafe ? 'bg-green-500/10' : isWarning ? 'bg-amber-500/10' : 'bg-red-500/10';
  const statusBorder = isSafe ? 'border-green-500/25' : isWarning ? 'border-amber-500/25' : 'border-red-500/25';
  const statusText = isSafe ? 'text-green-500' : isWarning ? 'text-amber-500' : 'text-red-500';
  const statusLabel = isSafe ? '✅ Seguro' : isWarning ? '⚠️ Atenção' : '🚨 Crítico';
  const statusDesc = isSafe
    ? 'Bond pool cobre 2.5+ anos de gastos'
    : isWarning
      ? 'Bond pool cobre 1.5-2.5 anos de gastos'
      : 'Bond pool cobre menos de 1.5 anos de gastos';

  return (
    <Card className="bg-slate-900/40 border-slate-700/25 mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-200">
          Bond Pool Runway — Sustentabilidade Pos-FIRE
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Safety status */}
        <div className={`p-3 rounded border ${statusBg} ${statusBorder}`}>
          <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
            Status de Sustentabilidade
          </div>
          <div className={`text-base font-bold mb-1 ${statusText}`}>
            {statusLabel}
          </div>
          <div className="text-xs text-slate-500">
            {statusDesc}
          </div>
        </div>

        {/* Key metrics grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Current coverage */}
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/25 rounded">
            <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
              Cobertura Hoje
            </div>
            <div className="text-base font-bold text-cyan-400 mb-1">
              {currentCoverage.toFixed(1)}x
            </div>
            <div className="text-xs text-slate-500">
              {(currentCoverage * 12).toFixed(0)} meses de gasto
            </div>
          </div>

          {/* Future pool value */}
          <div className="p-3 bg-violet-500/10 border border-violet-500/25 rounded">
            <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
              Pool em +{projectedYears}a
            </div>
            <div className="text-base font-bold text-violet-400">
              {privacyMode ? 'R$••••' : fmtBrl(futurePoolValue)}
            </div>
            <div className="text-xs text-slate-500">
              Valor projetado
            </div>
          </div>

          {/* Future coverage */}
          <div className={`p-3 rounded border ${statusBg} ${statusBorder}`}>
            <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
              Cobertura em +{projectedYears}a
            </div>
            <div className={`text-base font-bold mb-1 ${statusText}`}>
              {futureCoverage.toFixed(1)}x
            </div>
            <div className="text-xs text-slate-500">
              {(futureCoverage * 12).toFixed(0)} meses de gasto
            </div>
          </div>
        </div>

        {/* Runway table */}
        <div className="overflow-x-auto">
          <div className="text-sm font-semibold text-slate-200 mb-3">
            Projeção Anual
          </div>

          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className="text-left p-2 border-b border-slate-700/25 text-slate-400 font-semibold">
                  Ano
                </th>
                <th className="text-right p-2 border-b border-slate-700/25 text-slate-200 font-semibold">
                  Saldo Inicial
                </th>
                <th className="text-right p-2 border-b border-slate-700/25 text-slate-200 font-semibold">
                  Retorno
                </th>
                <th className="text-right p-2 border-b border-slate-700/25 text-slate-200 font-semibold">
                  Despesa
                </th>
                <th className="text-right p-2 border-b border-slate-700/25 text-slate-200 font-semibold">
                  Saldo Final
                </th>
                <th className="text-right p-2 border-b border-slate-700/25 text-slate-200 font-semibold">
                  Cobertura
                </th>
              </tr>
            </thead>
            <tbody>
              {runwayData.map((row, idx) => {
                const coverageColor = row.fireExpense > 0
                  ? row.coverage >= 2.5
                    ? 'text-green-500'
                    : row.coverage >= 1.5
                      ? 'text-amber-500'
                      : 'text-red-500'
                  : 'text-slate-400';

                return (
                  <tr key={idx}>
                    <td className={`p-2 border-b border-slate-700/15 ${row.year === 0 ? 'text-slate-200 font-semibold' : 'text-slate-400'}`}>
                      {row.year === 0 ? 'Hoje' : row.year === yearsToFire ? 'FIRE' : `+${row.year}a`}
                    </td>
                    <td className="text-right p-2 border-b border-slate-700/15 text-slate-200">
                      {privacyMode ? '••' : (row.startBalance / 1000000).toFixed(2) + 'M'}
                    </td>
                    <td className="text-right p-2 border-b border-slate-700/15 text-green-500">
                      {privacyMode ? '••' : `+${(row.investmentReturn / 1000000).toFixed(2)}M`}
                    </td>
                    <td className={`text-right p-2 border-b border-slate-700/15 ${row.fireExpense > 0 ? 'text-red-500' : 'text-slate-400'}`}>
                      {privacyMode ? '••' : `−${(row.fireExpense / 1000000).toFixed(2)}M`}
                    </td>
                    <td className={`text-right p-2 border-b border-slate-700/15 font-semibold ${row.endBalance > 0 ? 'text-slate-200' : 'text-red-500'}`}>
                      {privacyMode ? '••' : (row.endBalance / 1000000).toFixed(2) + 'M'}
                    </td>
                    <td className={`text-right p-2 border-b border-slate-700/15 ${coverageColor}`}>
                      {row.fireExpense > 0 ? row.coverage.toFixed(1) + 'x' : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="p-3 bg-slate-700/10 border border-slate-700/30 rounded">
          <div className="text-xs text-slate-400 mb-2 font-semibold">
            Resumo de Sustentabilidade
          </div>
          <div className="text-xs text-slate-200 leading-relaxed space-y-1">
            <div>
              <strong>Gasto anual FIRE:</strong> {privacyMode ? 'R$••••' : fmtBrl(fireAnnualExpense)}
            </div>
            <div>
              <strong>Taxa de retorno assumida:</strong> {expectedReturn.toFixed(2)}%/ano
            </div>
            <div>
              <strong>Taxa sustentável (SWR):</strong> {swrPercent.toFixed(2)}%
            </div>
            {runoutYear !== Infinity && runoutYear > projectedYears && (
              <div className="text-amber-400">
                <strong>⚠️ Atenção:</strong> Com despesas de {fmtBrl(fireAnnualExpense)}/ano,
                a cobertura esgota em ~{(runoutYear + 1) * 12} meses
              </div>
            )}
            {isSafe && (
              <div className="text-green-500">
                <strong>✅ Seguro:</strong> Bond pool sustenta gastos por 2.5+ anos em média
              </div>
            )}
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-3 p-2 text-xs text-slate-500 bg-slate-700/5 rounded">
          <strong>📌 Nota:</strong> Runway assume taxa de retorno {expectedReturn.toFixed(1)}% pós-FIRE. Cenário conservador (não inclui
          aumento de despesas com inflação ou mudanças de taxa).
        </div>
      </CardContent>
    </Card>
  );
};

export default BondPoolRunway;
