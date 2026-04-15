'use client';

import React from 'react';
import { useUiStore } from '@/store/uiStore';

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
        Bond Pool Runway — Sustentabilidade Pos-FIRE
      </h2>

      {/* Safety status */}
      <div
        style={{
          padding: '12px 14px',
          backgroundColor:
            isSafe ? 'rgba(34, 197, 94, 0.1)' : isWarning ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border:
            isSafe ? '1px solid #22c55e40' : isWarning ? '1px solid #f59e0b40' : '1px solid #ef444440',
          borderRadius: '6px',
          marginBottom: '14px',
        }}
      >
        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
          Status de Sustentabilidade
        </div>
        <div
          style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color: isSafe ? '#22c55e' : isWarning ? '#f59e0b' : '#ef4444',
            marginBottom: '4px',
          }}
        >
          {isSafe ? '✅ Seguro' : isWarning ? '⚠️ Atenção' : '🚨 Crítico'}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
          {isSafe
            ? 'Bond pool cobre 2.5+ anos de gastos'
            : isWarning
              ? 'Bond pool cobre 1.5-2.5 anos de gastos'
              : 'Bond pool cobre menos de 1.5 anos de gastos'}
        </div>
      </div>

      {/* Key metrics grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        {/* Current coverage */}
        <div
          style={{
            padding: '10px 12px',
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            border: '1px solid #06b6d440',
            borderRadius: '6px',
          }}
        >
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
            Cobertura Hoje
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#06b6d4', marginBottom: '2px' }}>
            {currentCoverage.toFixed(1)}x
          </div>
          <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
            {(currentCoverage * 12).toFixed(0)} meses de gasto
          </div>
        </div>

        {/* Future pool value */}
        <div
          style={{
            padding: '10px 12px',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid #8b5cf640',
            borderRadius: '6px',
          }}
        >
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
            Pool em +{projectedYears}a
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#8b5cf6' }}>
            {privacyMode ? 'R$••••' : fmtBrl(futurePoolValue)}
          </div>
          <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
            Valor projetado
          </div>
        </div>

        {/* Future coverage */}
        <div
          style={{
            padding: '10px 12px',
            backgroundColor:
              isSafe ? 'rgba(34, 197, 94, 0.1)' : isWarning ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border:
              isSafe ? '1px solid #22c55e40' : isWarning ? '1px solid #f59e0b40' : '1px solid #ef444440',
            borderRadius: '6px',
          }}
        >
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
            Cobertura em +{projectedYears}a
          </div>
          <div
            style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: isSafe ? '#22c55e' : isWarning ? '#f59e0b' : '#ef4444',
              marginBottom: '2px',
            }}
          >
            {futureCoverage.toFixed(1)}x
          </div>
          <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
            {(futureCoverage * 12).toFixed(0)} meses de gasto
          </div>
        </div>
      </div>

      {/* Runway table */}
      <div style={{ marginBottom: '14px', overflowX: 'auto' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '10px' }}>
          Projeção Anual
        </div>

        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.75rem',
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
                Ano
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
                Saldo Inicial
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
                Despesa
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
                Saldo Final
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
                Cobertura
              </th>
            </tr>
          </thead>
          <tbody>
            {runwayData.map((row, idx) => (
              <tr key={idx}>
                <td
                  style={{
                    padding: '8px',
                    borderBottom: '1px solid rgba(71, 85, 105, 0.15)',
                    color: row.year === 0 ? '#cbd5e1' : '#94a3b8',
                    fontWeight: row.year === 0 ? 600 : 400,
                  }}
                >
                  {row.year === 0 ? 'Hoje' : row.year === yearsToFire ? 'FIRE' : `+${row.year}a`}
                </td>
                <td
                  style={{
                    textAlign: 'right',
                    padding: '8px',
                    borderBottom: '1px solid rgba(71, 85, 105, 0.15)',
                    color: '#cbd5e1',
                  }}
                >
                  {privacyMode ? '••' : (row.startBalance / 1000000).toFixed(2) + 'M'}
                </td>
                <td
                  style={{
                    textAlign: 'right',
                    padding: '8px',
                    borderBottom: '1px solid rgba(71, 85, 105, 0.15)',
                    color: '#22c55e',
                  }}
                >
                  {privacyMode ? '••' : `+${(row.investmentReturn / 1000000).toFixed(2)}M`}
                </td>
                <td
                  style={{
                    textAlign: 'right',
                    padding: '8px',
                    borderBottom: '1px solid rgba(71, 85, 105, 0.15)',
                    color: row.fireExpense > 0 ? '#ef4444' : '#94a3b8',
                  }}
                >
                  {privacyMode ? '••' : `−${(row.fireExpense / 1000000).toFixed(2)}M`}
                </td>
                <td
                  style={{
                    textAlign: 'right',
                    padding: '8px',
                    borderBottom: '1px solid rgba(71, 85, 105, 0.15)',
                    color: row.endBalance > 0 ? '#cbd5e1' : '#ef4444',
                    fontWeight: 600,
                  }}
                >
                  {privacyMode ? '••' : (row.endBalance / 1000000).toFixed(2) + 'M'}
                </td>
                <td
                  style={{
                    textAlign: 'right',
                    padding: '8px',
                    borderBottom: '1px solid rgba(71, 85, 105, 0.15)',
                    color:
                      row.fireExpense > 0
                        ? row.coverage >= 2.5
                          ? '#22c55e'
                          : row.coverage >= 1.5
                            ? '#f59e0b'
                            : '#ef4444'
                        : '#94a3b8',
                  }}
                >
                  {row.fireExpense > 0 ? row.coverage.toFixed(1) + 'x' : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div
        style={{
          padding: '12px 14px',
          backgroundColor: 'rgba(71, 85, 105, 0.1)',
          border: '1px solid rgba(71, 85, 105, 0.3)',
          borderRadius: '6px',
        }}
      >
        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px', fontWeight: 600 }}>
          Resumo de Sustentabilidade
        </div>
        <div style={{ fontSize: '0.7rem', color: '#cbd5e1', lineHeight: '1.5' }}>
          <strong>Gasto anual FIRE:</strong> {privacyMode ? 'R$••••' : fmtBrl(fireAnnualExpense)} <br />
          <strong>Taxa de retorno assumida:</strong> {expectedReturn.toFixed(2)}%/ano <br />
          <strong>Taxa sustentável (SWR):</strong> {swrPercent.toFixed(2)}% <br />
          {runoutYear !== Infinity && runoutYear > projectedYears && (
            <>
              <strong style={{ color: '#f59e0b' }}>⚠️ Atenção:</strong> Com despesas de {fmtBrl(fireAnnualExpense)}/ano,
              a cobertura esgota em ~{(runoutYear + 1) * 12} meses
            </>
          )}
          {isSafe && (
            <>
              <strong style={{ color: '#22c55e' }}>✅ Seguro:</strong> Bond pool sustenta gastos por 2.5+ anos em média
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
        <strong>📌 Nota:</strong> Runway assume taxa de retorno {expectedReturn.toFixed(1)}% pós-FIRE. Cenário conservador (não inclui
        aumento de despesas com inflação ou mudanças de taxa).
      </div>
    </div>
  );
};

export default BondPoolRunway;
