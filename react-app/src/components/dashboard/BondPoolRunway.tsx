'use client';

import React from 'react';
import { useUiStore } from '@/store/uiStore';

interface RunwayYear {
  year: number;
  startBalance: number;
  fireExpense: number;
  investmentReturn: number;
  endBalance: number;
  coverage: number;
}

interface BondPoolRunwayProps {
  poolCurrentValue: number;
  fireAnnualExpense: number;
  expectedReturn: number;
  projectedYears: number;
  yearsToFire: number;
  swrPercent: number;
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

  const runwayData: RunwayYear[] = [];
  let currentBalance = poolCurrentValue;

  for (let i = 0; i <= projectedYears; i++) {
    const startBalance = currentBalance;
    const investmentReturn = startBalance * (expectedReturn / 100);
    const expense = i < yearsToFire ? 0 : fireAnnualExpense;
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

  const currentCoverage = poolCurrentValue / fireAnnualExpense;
  const futurePoolValue = runwayData[runwayData.length - 1]?.endBalance || poolCurrentValue;
  const futureCoverage = futurePoolValue / fireAnnualExpense;
  const runoutYear = runwayData.find(r => r.endBalance <= 0)?.year ?? Infinity;

  const isSafe = futureCoverage >= 2.5;
  const isWarning = futureCoverage >= 1.5 && futureCoverage < 2.5;
  const isCritical = futureCoverage < 1.5;

  const statusColor = isSafe ? '#22c55e' : isWarning ? '#f59e0b' : '#ef4444';
  const statusBg = isSafe ? 'rgba(34,197,94,0.1)' : isWarning ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)';
  const statusBorder = isSafe ? 'rgba(34,197,94,0.25)' : isWarning ? 'rgba(245,158,11,0.25)' : 'rgba(239,68,68,0.25)';
  const statusLabel = isSafe ? '✅ Seguro' : isWarning ? '⚠️ Atenção' : '🚨 Crítico';
  const statusDesc = isSafe
    ? 'Bond pool cobre 2.5+ anos de gastos'
    : isWarning
      ? 'Bond pool cobre 1.5-2.5 anos de gastos'
      : 'Bond pool cobre menos de 1.5 anos de gastos';

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
      <h2 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', marginBottom: '16px', marginTop: 0 }}>
        Bond Pool Runway — Sustentabilidade Pos-FIRE
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Safety status */}
        <div style={{ padding: '12px', borderRadius: '4px', background: statusBg, border: `1px solid ${statusBorder}` }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
            Status de Sustentabilidade
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px', color: statusColor }}>
            {statusLabel}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
            {statusDesc}
          </div>
        </div>

        {/* Key metrics grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
          <div style={{ padding: '12px', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)', borderRadius: '4px' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
              Cobertura Hoje
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#06b6d4', marginBottom: '4px' }}>
              {currentCoverage.toFixed(1)}x
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
              {(currentCoverage * 12).toFixed(0)} meses de gasto
            </div>
          </div>

          <div style={{ padding: '12px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '4px' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
              Pool em +{projectedYears}a
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#a78bfa' }}>
              {privacyMode ? 'R$••••' : fmtBrl(futurePoolValue)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
              Valor projetado
            </div>
          </div>

          <div style={{ padding: '12px', borderRadius: '4px', background: statusBg, border: `1px solid ${statusBorder}` }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
              Cobertura em +{projectedYears}a
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px', color: statusColor }}>
              {futureCoverage.toFixed(1)}x
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
              {(futureCoverage * 12).toFixed(0)} meses de gasto
            </div>
          </div>
        </div>

        {/* Runway table */}
        <div style={{ overflowX: 'auto' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', marginBottom: '12px' }}>
            Projeção Anual
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--border)', color: 'var(--muted)', fontWeight: 600 }}>Ano</th>
                <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid var(--border)', color: 'var(--text)', fontWeight: 600 }}>Saldo Inicial</th>
                <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid var(--border)', color: 'var(--text)', fontWeight: 600 }}>Retorno</th>
                <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid var(--border)', color: 'var(--text)', fontWeight: 600 }}>Despesa</th>
                <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid var(--border)', color: 'var(--text)', fontWeight: 600 }}>Saldo Final</th>
                <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid var(--border)', color: 'var(--text)', fontWeight: 600 }}>Cobertura</th>
              </tr>
            </thead>
            <tbody>
              {runwayData.map((row, idx) => {
                const coverageColor = row.fireExpense > 0
                  ? row.coverage >= 2.5 ? '#22c55e' : row.coverage >= 1.5 ? '#f59e0b' : '#ef4444'
                  : 'var(--muted)';

                return (
                  <tr key={idx}>
                    <td style={{ padding: '8px', borderBottom: '1px solid var(--border)', color: row.year === 0 ? 'var(--text)' : 'var(--muted)', fontWeight: row.year === 0 ? 600 : 400 }}>
                      {row.year === 0 ? 'Hoje' : row.year === yearsToFire ? 'FIRE' : `+${row.year}a`}
                    </td>
                    <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid var(--border)', color: 'var(--text)' }}>
                      {privacyMode ? '••' : (row.startBalance / 1000000).toFixed(2) + 'M'}
                    </td>
                    <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid var(--border)', color: '#22c55e' }}>
                      {privacyMode ? '••' : `+${(row.investmentReturn / 1000000).toFixed(2)}M`}
                    </td>
                    <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid var(--border)', color: row.fireExpense > 0 ? '#ef4444' : 'var(--muted)' }}>
                      {privacyMode ? '••' : `−${(row.fireExpense / 1000000).toFixed(2)}M`}
                    </td>
                    <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid var(--border)', fontWeight: 600, color: row.endBalance > 0 ? 'var(--text)' : '#ef4444' }}>
                      {privacyMode ? '••' : (row.endBalance / 1000000).toFixed(2) + 'M'}
                    </td>
                    <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid var(--border)', color: coverageColor }}>
                      {row.fireExpense > 0 ? row.coverage.toFixed(1) + 'x' : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div style={{ padding: '12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '4px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '8px', fontWeight: 600 }}>
            Resumo de Sustentabilidade
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div><strong>Gasto anual FIRE:</strong> {privacyMode ? 'R$••••' : fmtBrl(fireAnnualExpense)}</div>
            <div><strong>Taxa de retorno assumida:</strong> {expectedReturn.toFixed(2)}%/ano</div>
            <div><strong>Taxa sustentável (SWR):</strong> {swrPercent.toFixed(2)}%</div>
            {runoutYear !== Infinity && runoutYear > projectedYears && (
              <div style={{ color: '#f59e0b' }}>
                <strong>⚠️ Atenção:</strong> Com despesas de {fmtBrl(fireAnnualExpense)}/ano,
                a cobertura esgota em ~{(runoutYear + 1) * 12} meses
              </div>
            )}
            {isSafe && (
              <div style={{ color: '#22c55e' }}>
                <strong>✅ Seguro:</strong> Bond pool sustenta gastos por 2.5+ anos em média
              </div>
            )}
          </div>
        </div>

        {/* Footer note */}
        <div style={{ padding: '8px', fontSize: '0.75rem', color: 'var(--muted)', background: 'var(--bg)', borderRadius: '4px' }}>
          <strong>📌 Nota:</strong> Runway assume taxa de retorno {expectedReturn.toFixed(1)}% pós-FIRE. Cenário conservador (não inclui aumento de despesas com inflação ou mudanças de taxa).
        </div>
      </div>
    </div>
  );
};

export default BondPoolRunway;
