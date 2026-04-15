'use client';

import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
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

  // Validate data
  if (!data || !data.patrimonios || !data.gastos || !data.cenarios) {
    return <div className="text-sm text-muted-foreground">FIRE Matrix data unavailable</div>;
  }

  const patrimonios = data.patrimonios;
  const gastos = data.gastos;
  const scenario = data.cenarios[selectedScenario] || {};

  // Get P(FIRE) value for patrimonio + gasto combination
  const getPfire = (pat: number, gasto: number): number => {
    const key = `${pat}_${gasto}`;
    return scenario[key] ?? 0;
  };

  // Color based on P(FIRE) value
  const getColor = (pfire: number): string => {
    if (pfire >= 90) return 'rgba(34, 197, 94, 0.15)'; // green
    if (pfire >= 70) return 'rgba(234, 179, 8, 0.15)'; // yellow
    if (pfire >= 50) return 'rgba(249, 158, 11, 0.15)'; // orange
    return 'rgba(239, 68, 68, 0.15)'; // red
  };

  const getTextColor = (pfire: number): string => {
    if (pfire >= 90) return '#22c55e';
    if (pfire >= 70) return '#eab308';
    if (pfire >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Title & Scenario Selector */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
      }}>
        <h3 style={{
          fontSize: '0.95rem',
          fontWeight: '600',
          margin: 0,
          color: '#cbd5e1',
        }}>
          FIRE Matrix — P(FIRE) by Patrimônio × Gasto
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['base', 'fav', 'stress'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSelectedScenario(s)}
              style={{
                padding: '6px 12px',
                fontSize: '0.75rem',
                fontWeight: 500,
                border: '1px solid',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: selectedScenario === s ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                borderColor: selectedScenario === s ? '#3b82f6' : '#4b5563',
                color: selectedScenario === s ? '#3b82f6' : '#9ca3af',
                transition: 'all 0.2s',
              }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{
        overflowX: 'auto',
        borderRadius: '8px',
        border: '1px solid rgba(71, 85, 105, 0.25)',
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.75rem',
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
        }}>
          <thead>
            <tr style={{ borderBottom: '2px solid rgba(71, 85, 105, 0.3)' }}>
              <th style={{
                padding: '10px 12px',
                textAlign: 'left',
                fontWeight: 600,
                color: '#94a3b8',
                backgroundColor: 'rgba(30, 41, 59, 0.4)',
                textTransform: 'uppercase',
                fontSize: '0.7rem',
              }}>
                Patrimônio
              </th>
              {gastos.map(g => (
                <th
                  key={g}
                  style={{
                    padding: '10px 8px',
                    textAlign: 'center',
                    fontWeight: 600,
                    color: '#94a3b8',
                    backgroundColor: 'rgba(30, 41, 59, 0.4)',
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                  }}
                >
                  {privacyMode ? '••••' : fmtBrl(g / 1000).replace('R$', '')}k
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {patrimonios.map((pat, patIdx) => (
              <tr key={pat} style={{
                borderBottom: '1px solid rgba(71, 85, 105, 0.15)',
              }}>
                <td style={{
                  padding: '10px 12px',
                  fontWeight: 500,
                  color: '#cbd5e1',
                  backgroundColor: patIdx % 2 === 0 ? 'transparent' : 'rgba(30, 41, 59, 0.2)',
                }}>
                  {privacyMode ? '••••' : fmtBrl(pat)}
                </td>
                {gastos.map(gasto => {
                  const pfire = getPfire(pat, gasto);
                  return (
                    <td
                      key={`${pat}_${gasto}`}
                      style={{
                        padding: '8px 6px',
                        textAlign: 'center',
                        backgroundColor: getColor(pfire),
                        color: getTextColor(pfire),
                        fontWeight: 600,
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
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px',
        marginTop: '12px',
        fontSize: '0.7rem',
      }}>
        {[
          { label: '≥90%', color: '#22c55e' },
          { label: '70-90%', color: '#eab308' },
          { label: '50-70%', color: '#f59e0b' },
          { label: '<50%', color: '#ef4444' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '14px',
              height: '14px',
              borderRadius: '3px',
              backgroundColor: l.color,
            }} />
            <span style={{ color: '#94a3b8' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
