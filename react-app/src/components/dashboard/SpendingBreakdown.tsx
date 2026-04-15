'use client';

import React, { useState } from 'react';
import { useUiStore } from '@/store/uiStore';

interface SpendingCategory {
  categoria: string;
  mustSpendMensal: number;
  likeSpendMensal: number;
  imprevistossMensal: number;
  totalMensal: number;
  color: string;
}

interface SpendingBreakdownProps {
  musthave: number;
  likes: number;
  imprevistos: number;
  totalAnual: number;
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

  const isHighMustHave = mustavePercent > 70;
  const isWellBalanced = mustavePercent <= 60 && mustavePercent >= 50;
  const isFlexible = mustavePercent < 50;

  const flexColor = isWellBalanced ? '#22c55e' : isFlexible ? '#3b82f6' : '#f59e0b';
  const flexBg = isWellBalanced ? 'rgba(34,197,94,0.1)' : isFlexible ? 'rgba(59,130,246,0.1)' : 'rgba(245,158,11,0.1)';
  const flexBorder = isWellBalanced ? 'rgba(34,197,94,0.25)' : isFlexible ? 'rgba(59,130,246,0.25)' : 'rgba(245,158,11,0.25)';
  const flexLabel = isWellBalanced ? '✅ Balanceado' : isFlexible ? '🟢 Muito Flexível' : '⚠️ Rígido';

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
      <h2 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', marginBottom: '16px', marginTop: 0 }}>
        Spending Breakdown — Análise de Gastos por Categoria
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Total spending summary */}
        <div style={{ padding: '12px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '4px' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
            Despesa Anual Total (Baseline)
          </div>
          <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#a78bfa', marginBottom: '4px' }}>
            {privacyMode ? 'R$••••' : fmtBrl(totalAnual)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
            {privacyMode ? '••' : totalMonthly.toFixed(0)} /mês em média
          </div>
        </div>

        {/* Stacked bar visualization */}
        <div>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', marginBottom: '12px' }}>
            Distribuição de Gastos
          </div>

          <div style={{ display: 'flex', height: '64px', background: 'rgba(71,85,105,0.15)', borderRadius: '4px', overflow: 'hidden', gap: 0, marginBottom: '8px' }}>
            {/* Must-Have */}
            <div
              style={{ flex: mustavePercent, backgroundColor: '#ef4444', opacity: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: mustavePercent > 12 ? 'auto' : '0px' }}
              title={`Essencial: ${mustavePercent.toFixed(1)}%`}
            >
              {mustavePercent > 12 && (
                <span style={{ fontSize: '0.75rem', color: 'white', fontWeight: 600 }}>{mustavePercent.toFixed(0)}%</span>
              )}
            </div>

            {/* Like-to-Have */}
            <div
              style={{ flex: likesPercent, backgroundColor: '#f59e0b', opacity: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: likesPercent > 12 ? 'auto' : '0px' }}
              title={`Conforto: ${likesPercent.toFixed(1)}%`}
            >
              {likesPercent > 12 && (
                <span style={{ fontSize: '0.75rem', color: 'white', fontWeight: 600 }}>{likesPercent.toFixed(0)}%</span>
              )}
            </div>

            {/* Imprevistos */}
            <div
              style={{ flex: imprevistosPercent, backgroundColor: '#8b5cf6', opacity: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: imprevistosPercent > 12 ? 'auto' : '0px' }}
              title={`Buffer: ${imprevistosPercent.toFixed(1)}%`}
            >
              {imprevistosPercent > 12 && (
                <span style={{ fontSize: '0.75rem', color: 'white', fontWeight: 600 }}>{imprevistosPercent.toFixed(0)}%</span>
              )}
            </div>
          </div>
        </div>

        {/* Category cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
          {/* Must-Have */}
          <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '4px' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
              Essencial
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ef4444', marginBottom: '4px' }}>
              {mustavePercent.toFixed(1)}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
              {privacyMode ? '••' : fmtBrl(mustaveMonthly)}/mês
            </div>
          </div>

          {/* Like-to-Have */}
          <div style={{ padding: '12px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '4px' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
              Conforto
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f59e0b', marginBottom: '4px' }}>
              {likesPercent.toFixed(1)}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
              {privacyMode ? '••' : fmtBrl(likesMonthly)}/mês
            </div>
          </div>

          {/* Imprevistos */}
          <div style={{ padding: '12px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '4px' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
              Buffer
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#8b5cf6', marginBottom: '4px' }}>
              {imprevistosPercent.toFixed(1)}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
              {privacyMode ? '••' : fmtBrl(imprevistosMonthly)}/mês
            </div>
          </div>

          {/* Flexibility Assessment */}
          <div style={{ padding: '12px', borderRadius: '4px', background: flexBg, border: `1px solid ${flexBorder}` }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
              Flexibilidade
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: flexColor, marginBottom: '4px' }}>
              {flexLabel}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
              vs. 50-60% ideal
            </div>
          </div>
        </div>

        {/* Expandable details */}
        <div
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', cursor: 'pointer', borderTop: '1px solid var(--border)', marginTop: '12px' }}
          onClick={() => setExpandDetails(!expandDetails)}
        >
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0, color: 'var(--text)' }}>
            Detalhes Mensais
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
            {expandDetails ? '▼' : '▶'}
          </span>
        </div>

        {expandDetails && (
          <div style={{ marginTop: '12px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--border)', color: 'var(--muted)', fontWeight: 600 }}>Categoria</th>
                  <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid var(--border)', color: 'var(--text)', fontWeight: 600 }}>Mensal</th>
                  <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid var(--border)', color: 'var(--text)', fontWeight: 600 }}>Anual</th>
                  <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid var(--border)', color: 'var(--text)', fontWeight: 600 }}>% Total</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: '8px', borderBottom: '1px solid var(--border)', color: cat.color, fontWeight: 600 }}>
                      {cat.categoria}
                    </td>
                    <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid var(--border)', color: 'var(--text)' }}>
                      {privacyMode ? '••' : fmtBrl(cat.totalMensal)}
                    </td>
                    <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid var(--border)', color: 'var(--text)' }}>
                      {privacyMode ? '••' : fmtBrl(cat.totalMensal * 12)}
                    </td>
                    <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid var(--border)', color: cat.color, fontWeight: 600 }}>
                      {((cat.totalMensal * 12 / totalAnual) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
                <tr style={{ backgroundColor: 'rgba(71,85,105,0.1)' }}>
                  <td style={{ padding: '8px', borderBottom: '1px solid var(--border)', color: 'var(--text)', fontWeight: 700 }}>Total</td>
                  <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid var(--border)', color: 'var(--text)' }}>
                    {privacyMode ? '••' : fmtBrl(totalMonthly)}
                  </td>
                  <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid var(--border)', color: 'var(--text)' }}>
                    {privacyMode ? '••' : fmtBrl(totalAnual)}
                  </td>
                  <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid var(--border)', color: 'var(--text)', fontWeight: 700 }}>100.0%</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Footer note */}
        <div style={{ padding: '8px', fontSize: '0.75rem', color: 'var(--muted)', background: 'var(--bg)', borderRadius: '4px' }}>
          <strong>📌 Nota:</strong> Ideal é 50-60% essencial, 30-35% conforto, 5-10% imprevistos. Spending smile durante aposentadoria pode mudar essa proporção.
        </div>
      </div>
    </div>
  );
};

export default SpendingBreakdown;
