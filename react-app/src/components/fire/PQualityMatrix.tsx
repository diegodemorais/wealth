// PQualityMatrix — Matriz de critérios de qualidade go-go window × perfis familiares
// FR-pquality-matrix 2026-04-29

'use client';

import React, { useState } from 'react';

interface Criterio {
  id: string;
  label: string;
  descricao: string;
  default?: boolean;
}

interface PQualityMatrixData {
  criterios: Criterio[];
  perfis: string[];
  cenarios: string[];
  values: Record<string, Record<string, Record<string, number>>>;
  gogowindow: number;
  min_frac_anos: number;
}

interface PQualityMatrixProps {
  matrix: PQualityMatrixData;
  privacyMode: boolean;
}

const PERFIL_LABELS: Record<string, string> = {
  atual:  'Solteiro',
  casado: 'Casado',
  filho:  'C+Filho',
};

const CENARIO_LABELS: Record<string, string> = {
  base:      'Base',
  favoravel: 'Favorável',
  stress:    'Stress',
};

// Color coding: vermelho <50%, amarelo 50-70%, verde >70%
function cellColor(val: number): string {
  if (val >= 70) return 'var(--green)';
  if (val >= 50) return 'var(--yellow)';
  return 'var(--red)';
}

function cellBg(val: number): string {
  if (val >= 70) return 'color-mix(in srgb, var(--green) 12%, transparent)';
  if (val >= 50) return 'color-mix(in srgb, var(--yellow) 10%, transparent)';
  return 'color-mix(in srgb, var(--red) 10%, transparent)';
}

export function PQualityMatrix({ matrix, privacyMode }: PQualityMatrixProps) {
  const [cenarioAtivo, setCenarioAtivo] = useState<string>('base');

  if (!matrix?.values || !matrix.criterios) return null;

  const perfis = matrix.perfis ?? ['atual', 'casado', 'filho'];

  return (
    <div style={{ padding: '0 16px 16px' }}>
      {/* Título + Toggle de cenário */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 2 }}>
            go-go window: {matrix.gogowindow} anos · min {Math.round(matrix.min_frac_anos * 100)}% anos acima do piso
          </div>
        </div>
        {/* Cenário toggle */}
        <div style={{ display: 'flex', gap: 4 }}>
          {matrix.cenarios.map(c => (
            <button
              key={c}
              onClick={() => setCenarioAtivo(c)}
              style={{
                padding: '3px 10px',
                borderRadius: 6,
                border: cenarioAtivo === c ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                background: cenarioAtivo === c ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'var(--card2)',
                color: cenarioAtivo === c ? 'var(--accent)' : 'var(--muted)',
                fontWeight: cenarioAtivo === c ? 700 : 400,
                fontSize: 'var(--text-xs)',
                cursor: 'pointer',
              }}
            >
              {CENARIO_LABELS[c] ?? c}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela 5 critérios × 3 perfis */}
      <div
        data-testid="pquality-matrix-table"
        style={{ overflowX: 'auto' }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-xs)' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>
                Critério
              </th>
              <th style={{ textAlign: 'center', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600, borderBottom: '1px solid var(--border)', fontSize: '10px' }}>
                Descrição
              </th>
              {perfis.map(p => (
                <th key={p} style={{ textAlign: 'center', padding: '6px 8px', color: 'var(--text)', fontWeight: 700, borderBottom: '1px solid var(--border)', minWidth: 72 }}>
                  {PERFIL_LABELS[p] ?? p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.criterios.map((crit, idx) => {
              const isDefault = !!crit.default;
              const rowStyle: React.CSSProperties = isDefault
                ? { background: 'color-mix(in srgb, var(--accent) 5%, transparent)', fontWeight: 700 }
                : {};

              return (
                <tr key={crit.id} style={rowStyle}>
                  {/* Critério ID + badge padrão */}
                  <td style={{ padding: '7px 8px', borderBottom: idx < matrix.criterios.length - 1 ? '1px solid var(--border)' : 'none', whiteSpace: 'nowrap' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text)', marginRight: 4 }}>{crit.id}</span>
                    <span style={{ color: 'var(--muted)' }}>{crit.label}</span>
                    {isDefault && (
                      <span style={{
                        marginLeft: 6, padding: '1px 5px', borderRadius: 4,
                        background: 'color-mix(in srgb, var(--accent) 20%, transparent)',
                        border: '1px solid var(--accent)',
                        color: 'var(--accent)', fontWeight: 700, fontSize: '9px',
                      }}>
                        Padrão
                      </span>
                    )}
                  </td>
                  {/* Descrição */}
                  <td style={{ padding: '7px 8px', color: 'var(--muted)', borderBottom: idx < matrix.criterios.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    {crit.descricao}
                  </td>
                  {/* Células de valor por perfil */}
                  {perfis.map(perfil => {
                    const val = matrix.values[crit.id]?.[perfil]?.[cenarioAtivo];
                    const testId = crit.id === 'B' && perfil === 'atual' && cenarioAtivo === 'base'
                      ? 'pquality-matrix-B-atual-base'
                      : undefined;

                    return (
                      <td
                        key={perfil}
                        data-testid={testId}
                        style={{
                          textAlign: 'center',
                          padding: '7px 8px',
                          borderBottom: idx < matrix.criterios.length - 1 ? '1px solid var(--border)' : 'none',
                        }}
                      >
                        {val != null ? (
                          <span style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: 6,
                            background: cellBg(val),
                            color: cellColor(val),
                            fontWeight: isDefault ? 800 : 600,
                            fontSize: isDefault ? '0.85rem' : 'var(--text-xs)',
                          }}>
                            {privacyMode ? '••%' : `${val.toFixed(1)}%`}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--muted)' }}>—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 8, fontSize: '10px', color: 'var(--muted)' }}>
        Verde &gt;70% · Amarelo 50–70% · Vermelho &lt;50% · Critério B é o default (≤1 ano ruim no go-go)
      </div>
    </div>
  );
}
