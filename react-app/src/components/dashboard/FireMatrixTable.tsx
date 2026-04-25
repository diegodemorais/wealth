'use client';

import React, { useState } from 'react';
import { useUiStore } from '@/store/uiStore';
import { fmtPct } from '@/utils/formatters';
import { pfireColor } from '@/utils/fire';
import { fmtPrivacy } from '@/utils/privacyTransform';
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
  /** Patrimônio atual em R$ — usado para highlight da linha mais próxima */
  currentPatrimonio?: number;
  /** Custo de vida atual em R$/ano — usado para highlight da coluna mais próxima */
  currentSpending?: number;
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

export function FireMatrixTable({ data, idades, currentPatrimonio, currentSpending }: FireMatrixTableProps) {
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

  const getTextColor = pfireColor;

  const hasIdades = idades && idades.length === patrimonios.length;

  // Find closest row (patrimônio) and column (gasto) to current situation
  const currentPatIdx: number | null = currentPatrimonio != null && patrimonios.length > 0
    ? patrimonios.reduce((bestIdx, pat, idx) =>
        Math.abs(pat - currentPatrimonio) < Math.abs(patrimonios[bestIdx] - currentPatrimonio) ? idx : bestIdx
      , 0)
    : null;
  const currentGastoIdx: number | null = currentSpending != null && gastos.length > 0
    ? gastos.reduce((bestIdx, g, idx) =>
        Math.abs(g - currentSpending) < Math.abs(gastos[bestIdx] - currentSpending) ? idx : bestIdx
      , 0)
    : null;

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
      <div className="rounded-md border border-border overflow-x-auto">
        <Table className="text-xs bg-card" style={{ minWidth: '420px' }}>
          <TableHeader>
            {/* Super-header: "Retirada Anual" spanning gasto columns */}
            <TableRow className="border-b border-border/40 hover:bg-transparent">
              {hasIdades && <TableHead className="bg-secondary/50 h-auto" style={{ width: 48, padding: '4px 8px' }} />}
              <TableHead className="bg-secondary/50 h-auto" style={{ width: 56, padding: '4px 8px' }} />
              <TableHead
                colSpan={gastos.length}
                className="px-2 py-1 text-center text-xs font-semibold text-muted-foreground bg-secondary/50 uppercase tracking-wide h-auto"
              >
                Retirada Anual <span style={{ textTransform: 'none', fontWeight: 400, opacity: 0.7 }}>(P% sucesso até 90a)</span>
              </TableHead>
            </TableRow>
            <TableRow className="border-b-2 border-border hover:bg-transparent">
              {hasIdades && (
                <TableHead className="py-2 text-center font-semibold text-muted-foreground bg-secondary/50 uppercase text-xs h-auto" style={{ width: 48, minWidth: 48, padding: '6px 8px' }}>
                  Idade
                </TableHead>
              )}
              <TableHead className="py-2 text-center font-semibold text-muted-foreground bg-secondary/50 uppercase text-xs h-auto" style={{ width: 56, minWidth: 48, padding: '6px 8px' }}>
                Pat.
              </TableHead>
              {gastos.map(g => (
                <TableHead
                  key={g}
                  className="px-2 py-2 text-center font-semibold text-muted-foreground bg-secondary/50 uppercase text-xs h-auto"
                  style={{ minWidth: 44 }}
                >
                  {fmtPrivacy(g, privacyMode)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {patrimonios.map((pat, patIdx) => (
              <TableRow key={pat} className="border-b border-border hover:bg-transparent">
                {hasIdades && (
                  <TableCell className={`py-2 text-center font-semibold text-muted-foreground ${patIdx % 2 === 0 ? 'bg-transparent' : 'bg-secondary/20'}`} style={{ width: 48, padding: '6px 8px' }}>
                    {idades![patIdx] ?? '—'}
                  </TableCell>
                )}
                <TableCell className={`py-2 text-center font-semibold text-foreground ${patIdx % 2 === 0 ? 'bg-transparent' : 'bg-secondary/20'}`} style={{ width: 56, padding: '6px 8px' }}>
                  {fmtPrivacy(pat, privacyMode)}
                </TableCell>
                {gastos.map((gasto, gastoIdx) => {
                  const pfire = getPfire(pat, gasto);
                  const isCurrentCell = currentPatIdx === patIdx && currentGastoIdx === gastoIdx;
                  return (
                    <TableCell
                      key={`${pat}_${gasto}`}
                      className="px-2 py-2 text-center font-semibold"
                      style={{
                        backgroundColor: getColor(pfire),
                        color: getTextColor(pfire),
                        outline: isCurrentCell ? '2px solid var(--accent)' : undefined,
                        outlineOffset: isCurrentCell ? '-2px' : undefined,
                        position: isCurrentCell ? 'relative' : undefined,
                      }}
                      title={privacyMode
                        ? `P(FIRE) = ${pfire.toFixed(1)}%`
                        : isCurrentCell
                        ? `← você aqui · P(FIRE) = ${pfire.toFixed(1)}% · patrimônio ${fmtCompact(pat)} · gasto ${fmtCompact(gasto)}`
                        : `P(FIRE) = ${pfire.toFixed(1)}% com patrimônio ${fmtCompact(pat)} e gasto ${fmtCompact(gasto)}`}
                    >
                      {fmtPct(pfire / 100, 0)}
                      {isCurrentCell && (
                        <span style={{ position: 'absolute', top: -8, right: 1, fontSize: 8, color: 'var(--accent)', fontWeight: 700, whiteSpace: 'nowrap', pointerEvents: 'none' }}>
                          ★
                        </span>
                      )}
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
