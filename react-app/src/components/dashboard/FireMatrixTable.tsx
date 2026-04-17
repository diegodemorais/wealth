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
    // cenarios values are fractions 0-1 (e.g. 0.9736 = 97.36%)
    return (scenario[key] ?? 0) * 100;
  };

  const getColor = (pfire: number): string => {
    if (pfire >= 90) return 'rgba(34, 197, 94, 0.15)';
    if (pfire >= 70) return 'rgba(234, 179, 8, 0.15)';
    if (pfire >= 50) return 'rgba(249, 158, 11, 0.15)';
    return 'rgba(239, 68, 68, 0.15)';
  };

  const getTextColor = (pfire: number): string => {
    if (pfire >= 90) return 'var(--green)';
    if (pfire >= 70) return 'var(--yellow)';
    if (pfire >= 50) return 'var(--yellow)';
    return 'var(--red)';
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Title & Scenario Selector */}
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-foreground m-0">
          FIRE Matrix — P(FIRE) by Patrimônio × Gasto
        </h3>
        <div className="flex gap-2">
          {(['base', 'fav', 'stress'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSelectedScenario(s)}
              className={`px-3 py-1 text-xs font-semibold rounded border transition-colors ${
                selectedScenario === s
                  ? 'border-primary bg-primary/20 text-primary'
                  : 'border-border bg-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full border-collapse text-xs bg-card">
          <thead>
            <tr className="border-b-2 border-border">
              <th className="px-3 py-2 text-left font-semibold text-muted-foreground bg-secondary/50 uppercase text-xs">
                Patrimônio
              </th>
              {gastos.map(g => (
                <th
                  key={g}
                  className="px-2 py-2 text-center font-semibold text-muted-foreground bg-secondary/50 uppercase text-xs"
                >
                  {privacyMode ? '••••' : fmtBrl(g / 1000).replace('R$', '')}k
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {patrimonios.map((pat, patIdx) => (
              <tr key={pat} className="border-b border-border">
                <td className={`px-3 py-2 font-semibold text-foreground ${patIdx % 2 === 0 ? 'bg-transparent' : 'bg-secondary/20'}`}>
                  {privacyMode ? '••••' : fmtBrl(pat)}
                </td>
                {gastos.map(gasto => {
                  const pfire = getPfire(pat, gasto);
                  return (
                    <td
                      key={`${pat}_${gasto}`}
                      className="px-2 py-2 text-center font-semibold"
                      style={{
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
      <div className="grid grid-cols-4 gap-3 text-xs">
        {[
          { label: '≥90%', color: 'var(--green)' },
          { label: '70-90%', color: 'var(--yellow)' },
          { label: '50-70%', color: 'var(--yellow)' },
          { label: '<50%', color: 'var(--red)' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded flex-shrink-0" style={{ backgroundColor: l.color }} />
            <span className="text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
