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
        Spending Breakdown — Análise de Gastos por Categoria
      </h2>

      {/* Total spending summary */}
      <div
        style={{
          padding: '12px 14px',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          border: '1px solid #8b5cf640',
          borderRadius: '6px',
          marginBottom: '14px',
        }}
      >
        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
          Despesa Anual Total (Baseline)
        </div>
        <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#8b5cf6', marginBottom: '4px' }}>
          {privacyMode ? 'R$••••' : fmtBrl(totalAnual)}
        </div>
        <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
          {privacyMode ? '••' : (totalMonthly).toFixed(0)} /mês em média
        </div>
      </div>

      {/* Stacked bar visualization */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '10px' }}>
          Distribuição de Gastos
        </div>

        <div
          style={{
            display: 'flex',
            height: '60px',
            backgroundColor: 'rgba(71, 85, 105, 0.15)',
            borderRadius: '6px',
            overflow: 'hidden',
            gap: 0,
            marginBottom: '8px',
          }}
        >
          {/* Must-Have */}
          <div
            style={{
              flex: mustavePercent,
              backgroundColor: '#ef4444',
              opacity: 0.8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              color: 'white',
              fontWeight: 600,
              minWidth: '40px',
            }}
            title={`Essencial: ${mustavePercent.toFixed(1)}%`}
          >
            {mustavePercent > 12 && `${mustavePercent.toFixed(0)}%`}
          </div>

          {/* Like-to-Have */}
          <div
            style={{
              flex: likesPercent,
              backgroundColor: '#f59e0b',
              opacity: 0.8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              color: 'white',
              fontWeight: 600,
              minWidth: '40px',
            }}
            title={`Conforto: ${likesPercent.toFixed(1)}%`}
          >
            {likesPercent > 12 && `${likesPercent.toFixed(0)}%`}
          </div>

          {/* Imprevistos */}
          <div
            style={{
              flex: imprevistosPercent,
              backgroundColor: '#8b5cf6',
              opacity: 0.8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              color: 'white',
              fontWeight: 600,
              minWidth: '40px',
            }}
            title={`Buffer: ${imprevistosPercent.toFixed(1)}%`}
          >
            {imprevistosPercent > 12 && `${imprevistosPercent.toFixed(0)}%`}
          </div>
        </div>
      </div>

      {/* Category cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '10px',
          marginBottom: '14px',
        }}
      >
        {/* Must-Have */}
        <div
          style={{
            padding: '10px 12px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #ef444440',
            borderRadius: '6px',
          }}
        >
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
            Essencial
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ef4444', marginBottom: '2px' }}>
            {mustavePercent.toFixed(1)}%
          </div>
          <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
            {privacyMode ? '••' : fmtBrl(mustaveMonthly)}/mês
          </div>
        </div>

        {/* Like-to-Have */}
        <div
          style={{
            padding: '10px 12px',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid #f59e0b40',
            borderRadius: '6px',
          }}
        >
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
            Conforto
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f59e0b', marginBottom: '2px' }}>
            {likesPercent.toFixed(1)}%
          </div>
          <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
            {privacyMode ? '••' : fmtBrl(likesMonthly)}/mês
          </div>
        </div>

        {/* Imprevistos */}
        <div
          style={{
            padding: '10px 12px',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid #8b5cf640',
            borderRadius: '6px',
          }}
        >
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
            Buffer
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#8b5cf6', marginBottom: '2px' }}>
            {imprevistosPercent.toFixed(1)}%
          </div>
          <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
            {privacyMode ? '••' : fmtBrl(imprevistosMonthly)}/mês
          </div>
        </div>

        {/* Flexibility Assessment */}
        <div
          style={{
            padding: '10px 12px',
            backgroundColor: isWellBalanced
              ? 'rgba(34, 197, 94, 0.1)'
              : isFlexible
                ? 'rgba(59, 130, 246, 0.1)'
                : 'rgba(245, 158, 11, 0.1)',
            border: isWellBalanced
              ? '1px solid #22c55e40'
              : isFlexible
                ? '1px solid #3b82f640'
                : '1px solid #f59e0b40',
            borderRadius: '6px',
          }}
        >
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
            Flexibilidade
          </div>
          <div
            style={{
              fontSize: '0.9rem',
              fontWeight: 700,
              color: isWellBalanced ? '#22c55e' : isFlexible ? '#3b82f6' : '#f59e0b',
              marginBottom: '2px',
            }}
          >
            {isWellBalanced ? '✅ Balanceado' : isFlexible ? '🟢 Muito Flexível' : '⚠️ Rígido'}
          </div>
          <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
            vs. 50-60% ideal
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
          Detalhes Mensais
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
                  Categoria
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
                  Mensal
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
                  Anual
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
                  % Total
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, idx) => (
                <tr key={idx}>
                  <td
                    style={{
                      padding: '8px',
                      borderBottom: '1px solid rgba(71, 85, 105, 0.15)',
                      color: cat.color,
                      fontWeight: 600,
                    }}
                  >
                    {cat.categoria}
                  </td>
                  <td
                    style={{
                      textAlign: 'right',
                      padding: '8px',
                      borderBottom: '1px solid rgba(71, 85, 105, 0.15)',
                      color: '#cbd5e1',
                    }}
                  >
                    {privacyMode ? '••' : fmtBrl(cat.totalMensal)}
                  </td>
                  <td
                    style={{
                      textAlign: 'right',
                      padding: '8px',
                      borderBottom: '1px solid rgba(71, 85, 105, 0.15)',
                      color: '#cbd5e1',
                    }}
                  >
                    {privacyMode ? '••' : fmtBrl(cat.totalMensal * 12)}
                  </td>
                  <td
                    style={{
                      textAlign: 'right',
                      padding: '8px',
                      borderBottom: '1px solid rgba(71, 85, 105, 0.15)',
                      color: cat.color,
                      fontWeight: 600,
                    }}
                  >
                    {((cat.totalMensal * 12 / totalAnual) * 100).toFixed(1)}%
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
                  {privacyMode ? '••' : fmtBrl(totalMonthly)}
                </td>
                <td
                  style={{
                    textAlign: 'right',
                    padding: '8px',
                    borderBottom: '1px solid rgba(71, 85, 105, 0.25)',
                    color: '#cbd5e1',
                  }}
                >
                  {privacyMode ? '••' : fmtBrl(totalAnual)}
                </td>
                <td
                  style={{
                    textAlign: 'right',
                    padding: '8px',
                    borderBottom: '1px solid rgba(71, 85, 105, 0.25)',
                    color: '#cbd5e1',
                    fontWeight: 700,
                  }}
                >
                  100.0%
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
        <strong>📌 Nota:</strong> Ideal é 50-60% essencial, 30-35% conforto, 5-10% imprevistos. Spending smile durante aposentadoria pode mudar essa proporção.
      </div>
    </div>
  );
};

export default SpendingBreakdown;
