'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div className="space-y-4">
      {/* Title & Scenario Selector */}
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-slate-200 m-0">
          FIRE Matrix — P(FIRE) by Patrimônio × Gasto
        </h3>
        <div className="flex gap-2">
          {(['base', 'fav', 'stress'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSelectedScenario(s)}
              className={`px-3 py-1 text-xs font-semibold border rounded transition ${
                selectedScenario === s
                  ? 'border-blue-500 bg-blue-500/20 text-blue-500'
                  : 'border-slate-600 bg-transparent text-slate-400'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-700/25">
        <table className="w-full border-collapse text-xs bg-slate-900/50">
          <thead>
            <tr className="border-b-2 border-slate-700/30">
              <th className="px-3 py-2 text-left font-semibold text-slate-400 bg-slate-900/40 uppercase text-xs">
                Patrimônio
              </th>
              {gastos.map(g => (
                <th
                  key={g}
                  className="px-2 py-2 text-center font-semibold text-slate-400 bg-slate-900/40 uppercase text-xs"
                >
                  {privacyMode ? '••••' : fmtBrl(g / 1000).replace('R$', '')}k
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {patrimonios.map((pat, patIdx) => (
              <tr key={pat} className="border-b border-slate-700/15">
                <td className={`px-3 py-2 font-semibold text-slate-200 ${patIdx % 2 === 0 ? 'bg-transparent' : 'bg-slate-900/20'}`}>
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-xs">
        {[
          { label: '≥90%', color: '#22c55e' },
          { label: '70-90%', color: '#eab308' },
          { label: '50-70%', color: '#f59e0b' },
          { label: '<50%', color: '#ef4444' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-2">
            <div
              className="w-3.5 h-3.5 rounded"
              style={{ backgroundColor: l.color }}
            />
            <span className="text-slate-400">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
