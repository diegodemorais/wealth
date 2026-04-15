'use client';

import React from 'react';
import { useUiStore } from '@/store/uiStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MaturityBucket {
  label: string;
  yearsRange: string;
  value: number; // BRL
  percentage: number; // % of total bonds
  color: string;
}

interface BondMaturityLadderProps {
  bonds1y: number; // Bonds maturing in 0-1 year
  bonds2y: number; // Bonds maturing in 1-2 years
  bonds3y: number; // Bonds maturing in 2-3 years
  bonds5y: number; // Bonds maturing in 3-5 years
  bonds10y: number; // Bonds maturing in 5-10 years
  bondsOver10y: number; // Bonds maturing in 10+ years
  totalBonds: number; // Total value
}

const BondMaturityLadder: React.FC<BondMaturityLadderProps> = ({
  bonds1y,
  bonds2y,
  bonds3y,
  bonds5y,
  bonds10y,
  bondsOver10y,
  totalBonds,
}) => {
  const { privacyMode } = useUiStore();

  const fmtBrl = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const buckets: MaturityBucket[] = [
    {
      label: '1 ano',
      yearsRange: '0-1 anos',
      value: bonds1y,
      percentage: totalBonds > 0 ? (bonds1y / totalBonds) * 100 : 0,
      color: '#ef4444',
    },
    {
      label: '2 anos',
      yearsRange: '1-2 anos',
      value: bonds2y,
      percentage: totalBonds > 0 ? (bonds2y / totalBonds) * 100 : 0,
      color: '#f97316',
    },
    {
      label: '3 anos',
      yearsRange: '2-3 anos',
      value: bonds3y,
      percentage: totalBonds > 0 ? (bonds3y / totalBonds) * 100 : 0,
      color: '#f59e0b',
    },
    {
      label: '5 anos',
      yearsRange: '3-5 anos',
      value: bonds5y,
      percentage: totalBonds > 0 ? (bonds5y / totalBonds) * 100 : 0,
      color: '#06b6d4',
    },
    {
      label: '10 anos',
      yearsRange: '5-10 anos',
      value: bonds10y,
      percentage: totalBonds > 0 ? (bonds10y / totalBonds) * 100 : 0,
      color: '#3b82f6',
    },
    {
      label: '10+ anos',
      yearsRange: '10+ anos',
      value: bondsOver10y,
      percentage: totalBonds > 0 ? (bondsOver10y / totalBonds) * 100 : 0,
      color: '#8b5cf6',
    },
  ];

  // Calculate duration risk
  const shortTermPct = buckets
    .filter(b => b.yearsRange === '0-1 anos' || b.yearsRange === '1-2 anos')
    .reduce((sum, b) => sum + b.percentage, 0);
  const longTermPct = buckets
    .filter(b => b.yearsRange === '5-10 anos' || b.yearsRange === '10+ anos')
    .reduce((sum, b) => sum + b.percentage, 0);

  // Recommend action based on distribution
  const isWellLaddered = buckets.every(b => b.percentage > 5 && b.percentage < 30);
  const isTooShort = shortTermPct > 50;
  const isTooLong = longTermPct > 50;

  // Color helpers for ladder health
  const healthBg = isWellLaddered
    ? 'bg-green-500/10'
    : isTooShort || isTooLong
      ? 'bg-amber-500/10'
      : 'bg-red-500/10';
  const healthBorder = isWellLaddered
    ? 'border-green-500/25'
    : isTooShort || isTooLong
      ? 'border-amber-500/25'
      : 'border-red-500/25';
  const healthText = isWellLaddered
    ? 'text-green-500'
    : isTooShort || isTooLong
      ? 'text-amber-500'
      : 'text-red-500';

  return (
    <Card className="bg-slate-900/40 border-slate-700/25 mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-200">
          Bond Maturity Ladder — Estrutura de Vencimentos
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">

        {/* Ladder structure */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            {buckets.map(bucket => (
              <div
                key={bucket.label}
                className="p-3 rounded text-center border"
                style={{
                  backgroundColor: `${bucket.color}15`,
                  borderColor: `${bucket.color}40`,
                }}
              >
                <div className="text-xs text-slate-400 mb-1">
                  {bucket.yearsRange}
                </div>
                <div className="text-sm font-bold mb-1" style={{ color: bucket.color }}>
                  {bucket.percentage.toFixed(1)}%
                </div>
                <div className="text-xs text-slate-400">
                  {privacyMode ? '••' : fmtBrl(bucket.value)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visualization */}
        <div>
          <div className="text-sm font-semibold text-slate-200 mb-3">
            Distribuição por Vencimento
          </div>

          <div className="flex h-12 bg-slate-700/15 rounded overflow-hidden gap-0.5 p-0.5">
            {buckets.map(bucket => (
              <div
                key={bucket.label}
                className="flex items-center justify-center rounded text-xs font-semibold text-white"
                style={{
                  flex: bucket.percentage,
                  backgroundColor: bucket.color,
                  opacity: 0.8,
                  minWidth: '20px',
                }}
                title={`${bucket.label}: ${bucket.percentage.toFixed(1)}%`}
              >
                {bucket.percentage > 8 && `${bucket.percentage.toFixed(0)}%`}
              </div>
            ))}
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Short term */}
          <div className="p-3 bg-red-500/10 border border-red-500/25 rounded">
            <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
              Curto Prazo (0-2a)
            </div>
            <div className="text-base font-bold text-red-500">
              {shortTermPct.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-500">
              Próximos 2 anos
            </div>
          </div>

          {/* Medium term */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded">
            <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
              Médio Prazo (2-5a)
            </div>
            <div className="text-base font-bold text-amber-500">
              {buckets
                .filter(b => b.yearsRange === '2-3 anos' || b.yearsRange === '3-5 anos')
                .reduce((sum, b) => sum + b.percentage, 0)
                .toFixed(1)}
              %
            </div>
            <div className="text-xs text-slate-500">
              2-5 anos
            </div>
          </div>

          {/* Long term */}
          <div className="p-3 bg-blue-500/10 border border-blue-500/25 rounded">
            <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
              Longo Prazo (5+a)
            </div>
            <div className="text-base font-bold text-blue-500">
              {longTermPct.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-500">
              5+ anos
            </div>
          </div>

          {/* Ladder health */}
          <div className={`p-3 rounded border ${healthBg} ${healthBorder}`}>
            <div className="text-xs text-slate-400 mb-1 uppercase font-semibold">
              Saúde da Escada
            </div>
            <div className={`text-base font-bold mb-1 ${healthText}`}>
              {isWellLaddered ? '✅ Saudável' : isTooShort ? '⚠️ Curta' : isTooLong ? '⚠️ Longa' : '🚨 Desbalanceada'}
            </div>
            <div className="text-xs text-slate-500">
              Distribuição
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div className="p-3 bg-slate-700/10 border border-slate-700/25 rounded">
          <div className="text-xs text-slate-200 font-semibold mb-2">
            Recomendação
          </div>
          <div className="text-xs text-slate-400 leading-relaxed">
            {isWellLaddered && (
              <>✅ Escada bem distribuída — renova-se gradualmente. Mantenha a estratégia de rolar posições.</>
            )}
            {isTooShort && !isWellLaddered && (
              <>
                ⚠️ Escada muito curta — excesso de vencimentos próximos.
                <br />
                Considere adicionar posições de médio/longo prazo para reduzir risco de reinvestimento.
              </>
            )}
            {isTooLong && !isWellLaddered && (
              <>
                ⚠️ Escada muito longa — pouca liquidez de curto prazo.
                <br />
                Aumente alocação para títulos de 1-3 anos para melhorar cobertura de FIRE próximo.
              </>
            )}
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-3 p-2 text-xs text-slate-500 bg-slate-700/5 rounded">
          <strong>📌 Nota:</strong> Uma escada bem distribuída garante fluxo de caixa regular e reduz risco de reinvestimento. Rebalanceamento anual recomendado.
        </div>
      </CardContent>
    </Card>
  );
};

export default BondMaturityLadder;
