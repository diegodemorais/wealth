'use client';

import React from 'react';
import { useUiStore } from '@/store/uiStore';

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
        Bond Maturity Ladder — Estrutura de Vencimentos
      </h2>

      {/* Ladder structure */}
      <div style={{ marginBottom: '16px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: '10px',
          }}
        >
          {buckets.map(bucket => (
            <div
              key={bucket.label}
              style={{
                padding: '12px',
                backgroundColor: `${bucket.color}15`,
                border: `1px solid ${bucket.color}40`,
                borderRadius: '6px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.65rem', color: '#64748b', marginBottom: '4px' }}>
                {bucket.yearsRange}
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: bucket.color, marginBottom: '4px' }}>
                {bucket.percentage.toFixed(1)}%
              </div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                {privacyMode ? '••' : fmtBrl(bucket.value)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visualization */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '10px' }}>
          Distribuição por Vencimento
        </div>

        <div
          style={{
            display: 'flex',
            height: '40px',
            backgroundColor: 'rgba(71, 85, 105, 0.15)',
            borderRadius: '6px',
            overflow: 'hidden',
            gap: '2px',
            padding: '2px',
          }}
        >
          {buckets.map(bucket => (
            <div
              key={bucket.label}
              style={{
                flex: bucket.percentage,
                backgroundColor: bucket.color,
                opacity: 0.8,
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.65rem',
                color: 'white',
                fontWeight: 600,
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
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
          marginBottom: '14px',
        }}
      >
        {/* Short term */}
        <div
          style={{
            padding: '10px 12px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #ef444440',
            borderRadius: '6px',
          }}
        >
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
            Curto Prazo (0-2a)
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ef4444' }}>
            {shortTermPct.toFixed(1)}%
          </div>
          <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
            Próximos 2 anos
          </div>
        </div>

        {/* Medium term */}
        <div
          style={{
            padding: '10px 12px',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid #f59e0b40',
            borderRadius: '6px',
          }}
        >
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
            Médio Prazo (2-5a)
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b' }}>
            {buckets
              .filter(b => b.yearsRange === '2-3 anos' || b.yearsRange === '3-5 anos')
              .reduce((sum, b) => sum + b.percentage, 0)
              .toFixed(1)}
            %
          </div>
          <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
            2-5 anos
          </div>
        </div>

        {/* Long term */}
        <div
          style={{
            padding: '10px 12px',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid #3b82f640',
            borderRadius: '6px',
          }}
        >
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
            Longo Prazo (5+a)
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#3b82f6' }}>
            {longTermPct.toFixed(1)}%
          </div>
          <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
            5+ anos
          </div>
        </div>

        {/* Ladder health */}
        <div
          style={{
            padding: '10px 12px',
            backgroundColor:
              isWellLaddered
                ? 'rgba(34, 197, 94, 0.1)'
                : isTooShort || isTooLong
                  ? 'rgba(245, 158, 11, 0.1)'
                  : 'rgba(239, 68, 68, 0.1)',
            border:
              isWellLaddered
                ? '1px solid #22c55e40'
                : isTooShort || isTooLong
                  ? '1px solid #f59e0b40'
                  : '1px solid #ef444440',
            borderRadius: '6px',
          }}
        >
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
            Saúde da Escada
          </div>
          <div
            style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color:
                isWellLaddered
                  ? '#22c55e'
                  : isTooShort || isTooLong
                    ? '#f59e0b'
                    : '#ef4444',
            }}
          >
            {isWellLaddered ? '✅ Saudável' : isTooShort ? '⚠️ Curta' : isTooLong ? '⚠️ Longa' : '🚨 Desbalanceada'}
          </div>
          <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
            Distribuição
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div
        style={{
          padding: '12px 14px',
          backgroundColor: 'rgba(71, 85, 105, 0.1)',
          border: '1px solid rgba(71, 85, 105, 0.3)',
          borderRadius: '6px',
        }}
      >
        <div style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '6px' }}>
          Recomendação
        </div>
        <div style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: '1.5' }}>
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
        <strong>📌 Nota:</strong> Uma escada bem distribuída garante fluxo de caixa regular e reduz risco de
        reinvestimento. Rebalanceamento anual recomendado.
      </div>
    </div>
  );
};

export default BondMaturityLadder;
