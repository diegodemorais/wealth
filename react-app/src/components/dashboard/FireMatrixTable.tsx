'use client';

import React, { useState } from 'react';
import { useUiStore } from '@/store/uiStore';
import { fmtPct } from '@/utils/formatters';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

interface FireMatrixData {
  perfis: Record<string, { label: string; gasto_anual: number; descricao: string }>;
  patrimonios: number[];
  gastos: number[];
  cenarios: Record<string, Record<string, number>>;
  retornos_equity?: { base: number; fav: number; stress: number };
}

interface FireMatrixTableProps {
  data: FireMatrixData;
  idades?: (number | null)[];
}

function fmtCompact(v: number): string {
  if (v >= 1_000_000) return `${Math.round(v / 1_000_000)}M`;
  return `${Math.round(v / 1_000)}k`;
}

const SCENARIO_LABELS: Record<string, string> = {
  base: 'Base',
  fav: 'Otimista',
  stress: 'Stress',
};

export function FireMatrixTable({ data, idades }: FireMatrixTableProps) {
  const privacyMode = useUiStore(s => s.privacyMode);
  const [selectedScenario, setSelectedScenario] = useState<'base' | 'fav' | 'stress'>('base');

  if (!data || !data.patrimonios || !data.gastos || !data.cenarios) {
    return <div style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>FIRE Matrix data unavailable</div>;
  }

  const patrimonios = data.patrimonios;
  const gastos = data.gastos;
  const scenario = data.cenarios[selectedScenario] || {};
  const retornos = data.retornos_equity;

  const getPfire = (pat: number, gasto: number): number => {
    const key = `${pat}_${gasto}`;
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

  const hasIdades = idades && idades.length === patrimonios.length;

  return (
    <div className="flex flex-col gap-4">
      {/* Title & Scenario Selector */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h3 className="text-sm font-semibold text-foreground m-0">
          FIRE Matrix — P(FIRE) by Patrimônio × Gasto
        </h3>
        <div className="flex gap-2">
          {(['stress', 'base', 'fav'] as const).map(s => {
            const ret = retornos?.[s];
            return (
              <button
                key={s}
                onClick={() => setSelectedScenario(s)}
                className={`px-3 py-1 text-xs font-semibold rounded border transition-colors ${
                  selectedScenario === s
                    ? 'border-primary bg-primary/20 text-primary'
                    : 'border-border bg-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {SCENARIO_LABELS[s]}{ret != null ? ` ${(ret * 100).toFixed(1)}%` : ''}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border border-border">
        <Table className="text-xs bg-card">
          <TableHeader>
            {/* Super-header: "Retirada Anual" spanning gasto columns */}
            <TableRow className="border-b border-border/40 hover:bg-transparent">
              {hasIdades && <TableHead className="px-2 py-1 bg-secondary/50 h-auto" />}
              <TableHead className="px-3 py-1 bg-secondary/50 h-auto" />
              <TableHead
                colSpan={gastos.length}
                className="px-2 py-1 text-center text-xs font-semibold text-muted-foreground bg-secondary/50 uppercase tracking-wide h-auto"
              >
                Retirada Anual
              </TableHead>
            </TableRow>
            <TableRow className="border-b-2 border-border hover:bg-transparent">
              {hasIdades && (
                <TableHead className="px-2 py-2 text-left font-semibold text-muted-foreground bg-secondary/50 uppercase text-xs h-auto">
                  Idade
                </TableHead>
              )}
              <TableHead className="px-3 py-2 text-left font-semibold text-muted-foreground bg-secondary/50 uppercase text-xs h-auto">
                Patrimônio
              </TableHead>
              {gastos.map(g => (
                <TableHead
                  key={g}
                  className="px-2 py-2 text-center font-semibold text-muted-foreground bg-secondary/50 uppercase text-xs h-auto"
                >
                  {privacyMode ? '••••' : fmtCompact(g)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {patrimonios.map((pat, patIdx) => (
              <TableRow key={pat} className="border-b border-border hover:bg-transparent">
                {hasIdades && (
                  <TableCell className={`px-2 py-2 text-center font-semibold text-muted-foreground ${patIdx % 2 === 0 ? 'bg-transparent' : 'bg-secondary/20'}`}>
                    {idades![patIdx] ?? '—'}
                  </TableCell>
                )}
                <TableCell className={`px-3 py-2 font-semibold text-foreground ${patIdx % 2 === 0 ? 'bg-transparent' : 'bg-secondary/20'}`}>
                  {privacyMode ? '••••' : fmtCompact(pat)}
                </TableCell>
                {gastos.map(gasto => {
                  const pfire = getPfire(pat, gasto);
                  return (
                    <TableCell
                      key={`${pat}_${gasto}`}
                      className="px-2 py-2 text-center font-semibold"
                      style={{
                        backgroundColor: getColor(pfire),
                        color: getTextColor(pfire),
                      }}
                      title={`P(FIRE) = ${pfire.toFixed(1)}% com patrimônio ${fmtCompact(pat)} e gasto ${fmtCompact(gasto)}`}
                    >
                      {privacyMode ? '••' : fmtPct(pfire / 100, 0)}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
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
