'use client';

import React from 'react';
import { useUiStore } from '@/store/uiStore';

interface MaturityBucket {
  label: string;
  yearsRange: string;
  value: number;
  percentage: number;
  color: string;
}

interface BondMaturityLadderProps {
  bonds1y: number;
  bonds2y: number;
  bonds3y: number;
  bonds5y: number;
  bonds10y: number;
  bondsOver10y: number;
  totalBonds: number;
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
    { label: '1 ano', yearsRange: '0-1 anos', value: bonds1y, percentage: totalBonds > 0 ? (bonds1y / totalBonds) * 100 : 0, color: 'var(--red)' },
    { label: '2 anos', yearsRange: '1-2 anos', value: bonds2y, percentage: totalBonds > 0 ? (bonds2y / totalBonds) * 100 : 0, color: 'var(--orange)' },
    { label: '3 anos', yearsRange: '2-3 anos', value: bonds3y, percentage: totalBonds > 0 ? (bonds3y / totalBonds) * 100 : 0, color: 'var(--yellow)' },
    { label: '5 anos', yearsRange: '3-5 anos', value: bonds5y, percentage: totalBonds > 0 ? (bonds5y / totalBonds) * 100 : 0, color: 'var(--cyan)' },
    { label: '10 anos', yearsRange: '5-10 anos', value: bonds10y, percentage: totalBonds > 0 ? (bonds10y / totalBonds) * 100 : 0, color: 'var(--accent)' },
    { label: '10+ anos', yearsRange: '10+ anos', value: bondsOver10y, percentage: totalBonds > 0 ? (bondsOver10y / totalBonds) * 100 : 0, color: 'var(--purple)' },
  ];

  const shortTermPct = buckets
    .filter(b => b.yearsRange === '0-1 anos' || b.yearsRange === '1-2 anos')
    .reduce((sum, b) => sum + b.percentage, 0);
  const longTermPct = buckets
    .filter(b => b.yearsRange === '5-10 anos' || b.yearsRange === '10+ anos')
    .reduce((sum, b) => sum + b.percentage, 0);

  const isWellLaddered = buckets.every(b => b.percentage > 5 && b.percentage < 30);
  const isTooShort = shortTermPct > 50;
  const isTooLong = longTermPct > 50;

  const healthColor = isWellLaddered ? 'var(--green)' : (isTooShort || isTooLong) ? 'var(--yellow)' : 'var(--red)';
  const healthBg = isWellLaddered ? 'rgba(34,197,94,0.1)' : (isTooShort || isTooLong) ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)';
  const healthBorder = isWellLaddered ? 'rgba(34,197,94,0.25)' : (isTooShort || isTooLong) ? 'rgba(245,158,11,0.25)' : 'rgba(239,68,68,0.25)';

  const mediumTermPct = buckets
    .filter(b => b.yearsRange === '2-3 anos' || b.yearsRange === '3-5 anos')
    .reduce((sum, b) => sum + b.percentage, 0);

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: 'var(--space-5)', marginBottom: '16px' }}>
      <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--text)', marginBottom: '16px', marginTop: 0 }}>
        Bond Maturity Ladder — Estrutura de Vencimentos
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {/* Ladder structure */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: 'var(--space-3)' }}>
          {buckets.map(bucket => (
            <div
              key={bucket.label}
              style={{
                padding: 'var(--space-3)',
                borderRadius: '4px',
                textAlign: 'center',
                backgroundColor: `${bucket.color}15`,
                border: `1px solid ${bucket.color}40`,
              }}
            >
              <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: '4px' }}>
                {bucket.yearsRange}
              </div>
              <div style={{ fontSize: 'var(--text-md)', fontWeight: 700, marginBottom: '4px', color: bucket.color }}>
                {bucket.percentage.toFixed(1)}%
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
                {privacyMode ? '••' : fmtBrl(bucket.value)}
              </div>
            </div>
          ))}
        </div>

        {/* Visualization */}
        <div>
          <div style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--text)', marginBottom: '12px' }}>
            Distribuição por Vencimento
          </div>
          <div style={{ display: 'flex', height: '48px', background: 'var(--bg)', borderRadius: '4px', overflow: 'hidden', gap: '2px', padding: '2px' }}>
            {buckets.map(bucket => (
              <div
                key={bucket.label}
                style={{
                  flex: bucket.percentage,
                  backgroundColor: bucket.color,
                  borderRadius: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '20px',
                  opacity: 0.8,
                }}
                title={`${bucket.label}: ${bucket.percentage.toFixed(1)}%`}
              >
                {bucket.percentage > 8 && (
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'white' }}>
                    {bucket.percentage.toFixed(0)}%
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Key metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--space-3)' }}>
          <div style={{ padding: 'var(--space-3)', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '4px' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Curto Prazo (0-2a)</div>
            <div style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--red)' }}>{shortTermPct.toFixed(1)}%</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Próximos 2 anos</div>
          </div>

          <div style={{ padding: 'var(--space-3)', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '4px' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Médio Prazo (2-5a)</div>
            <div style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--yellow)' }}>{mediumTermPct.toFixed(1)}%</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>2-5 anos</div>
          </div>

          <div style={{ padding: 'var(--space-3)', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: '4px' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Longo Prazo (5+a)</div>
            <div style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--accent)' }}>{longTermPct.toFixed(1)}%</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>5+ anos</div>
          </div>

          <div style={{ padding: 'var(--space-3)', background: healthBg, border: `1px solid ${healthBorder}`, borderRadius: '4px' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Saúde da Escada</div>
            <div style={{ fontSize: 'var(--text-md)', fontWeight: 700, marginBottom: '4px', color: healthColor }}>
              {isWellLaddered ? 'Saudável' : isTooShort ? 'Curta' : isTooLong ? 'Longa' : 'Desbalanceada'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Distribuição</div>
          </div>
        </div>

        {/* Recommendation */}
        <div style={{ padding: 'var(--space-3)', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '4px' }}>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text)', fontWeight: 600, marginBottom: '8px' }}>Recomendação</div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', lineHeight: 1.5 }}>
            {isWellLaddered && 'Escada bem distribuída — renova-se gradualmente. Mantenha a estratégia de rolar posições.'}
            {isTooShort && !isWellLaddered && 'Escada muito curta — excesso de vencimentos próximos. Considere adicionar posições de médio/longo prazo para reduzir risco de reinvestimento.'}
            {isTooLong && !isWellLaddered && 'Escada muito longa — pouca liquidez de curto prazo. Aumente alocação para títulos de 1-3 anos para melhorar cobertura de FIRE próximo.'}
          </div>
        </div>

        {/* Footer note */}
        <div style={{ padding: '8px 12px', fontSize: 'var(--text-sm)', color: 'var(--muted)', background: 'var(--bg)', borderRadius: '4px' }}>
          <strong>Nota:</strong> Uma escada bem distribuída garante fluxo de caixa regular e reduz risco de reinvestimento. Rebalanceamento anual recomendado.
        </div>
      </div>
    </div>
  );
};

export default BondMaturityLadder;
