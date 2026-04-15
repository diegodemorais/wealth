'use client';

import React, { useMemo, useState } from 'react';
import { useUiStore } from '@/store/uiStore';
import { fmtBrl, fmtPct } from '@/utils/formatters';

interface FireMatrixData {
  perfis: Record<string, { label: string; gasto_anual: number; descricao: string }>;
  patrimonios: number[];
  gastos: number[];
  cenarios: Record<string, Record<string, number>>;
}

interface FireMatrixTableProps {
  data: FireMatrixData;
}

export function FireMatrixTable({ data }: FireMatrixTableProps) {
  const privacyMode = useUiStore(s => s.privacyMode);
  const [selectedScenario, setSelectedScenario] = useState<'base' | 'fav' | 'stress'>('base');

  if (!data || !data.patrimonios || !data.gastos || !data.cenarios) {
    return <div style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>FIRE Matrix data unavailable</div>;
  }

  const patrimonios = data.patrimonios;
  const gastos = data.gastos;
  const scenario = data.cenarios[selectedScenario] || {};

  const getPfire = (pat: number, gasto: number): number => {
    const key = `${pat}_${gasto}`;
    return scenario[key] ?? 0;
  };

  const getColor = (pfire: number): string => {
    if (pfire >= 90) return 'rgba(34, 197, 94, 0.15)';
    if (pfire >= 70) return 'rgba(234, 179, 8, 0.15)';
    if (pfire >= 50) return 'rgba(249, 158, 11, 0.15)';
    return 'rgba(239, 68, 68, 0.15)';
  };

  const getTextColor = (pfire: number): string => {
    if (pfire >= 90) return '#22c55e';
    if (pfire >= 70) return '#eab308';
    if (pfire >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Title & Scenario Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>
          FIRE Matrix — P(FIRE) by Patrimônio × Gasto
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['base', 'fav', 'stress'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSelectedScenario(s)}
              style={{
                padding: '4px 12px', fontSize: '0.75rem', fontWeight: 600,
                border: selectedScenario === s ? '1px solid #3b82f6' : '1px solid var(--border)',
                borderRadius: '4px', cursor: 'pointer',
                background: selectedScenario === s ? 'rgba(59,130,246,0.2)' : 'transparent',
                color: selectedScenario === s ? '#3b82f6' : 'var(--muted)',
              }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', background: 'var(--card)' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--muted)', background: 'var(--bg)', textTransform: 'uppercase', fontSize: '0.65rem' }}>
                Patrimônio
              </th>
              {gastos.map(g => (
                <th
                  key={g}
                  style={{ padding: '8px', textAlign: 'center', fontWeight: 600, color: 'var(--muted)', background: 'var(--bg)', textTransform: 'uppercase', fontSize: '0.65rem' }}
                >
                  {privacyMode ? '••••' : fmtBrl(g / 1000).replace('R$', '')}k
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {patrimonios.map((pat, patIdx) => (
              <tr key={pat} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text)', background: patIdx % 2 === 0 ? 'transparent' : 'var(--bg)' }}>
                  {privacyMode ? '••••' : fmtBrl(pat)}
                </td>
                {gastos.map(gasto => {
                  const pfire = getPfire(pat, gasto);
                  return (
                    <td
                      key={`${pat}_${gasto}`}
                      style={{
                        padding: '8px', textAlign: 'center', fontWeight: 600,
                        backgroundColor: getColor(pfire),
                        color: getTextColor(pfire),
                      }}
                      title={`P(FIRE) = ${pfire.toFixed(1)}% com patrimônio ${fmtBrl(pat)} e gasto ${fmtBrl(gasto)}`}
                    >
                      {privacyMode ? '••' : fmtPct(pfire / 100, 0)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '12px', fontSize: '0.75rem' }}>
        {[
          { label: '≥90%', color: '#22c55e' },
          { label: '70-90%', color: '#eab308' },
          { label: '50-70%', color: '#f59e0b' },
          { label: '<50%', color: '#ef4444' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '2px', backgroundColor: l.color, flexShrink: 0 }} />
            <span style={{ color: 'var(--muted)' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
