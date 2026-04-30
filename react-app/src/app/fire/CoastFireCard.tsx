'use client';

import React from 'react';
import { CoastFireData } from '@/types/dashboard';
import { fmtPrivacy } from '@/utils/privacyTransform';

interface CoastFireCardProps {
  coast: CoastFireData;
  patrimonioAtual: number;
  privacyMode: boolean;
}

type Scenario = {
  label: string;
  r_real: number;
  coast_number: number;
  gap: number;
  ano: number;
};

function buildScenarios(coast: CoastFireData, patrimonioAtual: number): Scenario[] {
  const ano = (cn: number, r: number): number => {
    if (patrimonioAtual >= cn) return new Date().getFullYear();
    // binary search same logic as pipeline
    for (let yr = 0; yr <= 20; yr++) {
      const proj =
        patrimonioAtual * (1 + r) ** yr +
        (300_000 * ((1 + r) ** yr - 1)) / r;
      if (proj >= cn) return new Date().getFullYear() + yr;
    }
    return new Date().getFullYear() + 20;
  };

  return [
    {
      label: 'Base',
      r_real: coast.r_real_base,
      coast_number: coast.coast_number_base,
      gap: coast.gap_base,
      ano: coast.ano_projetado_base,
    },
    {
      label: 'Favorável',
      r_real: coast.r_real_fav,
      coast_number: coast.coast_number_fav,
      gap: coast.coast_number_fav - patrimonioAtual,
      ano: ano(coast.coast_number_fav, coast.r_real_fav),
    },
    {
      label: 'Conservador',
      r_real: coast.r_real_stress,
      coast_number: coast.coast_number_stress,
      gap: coast.coast_number_stress - patrimonioAtual,
      ano: ano(coast.coast_number_stress, coast.r_real_stress),
    },
  ];
}

export function CoastFireCard({ coast, patrimonioAtual, privacyMode }: CoastFireCardProps) {
  const progressPct = Math.min(100, (patrimonioAtual / coast.coast_number_base) * 100);
  const progressColor = coast.passou_base
    ? 'var(--green)'
    : progressPct >= 70
      ? 'var(--yellow)'
      : 'var(--red)';

  const scenarios = buildScenarios(coast, patrimonioAtual);

  return (
    <div
      data-testid="coast-fire-card"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 18px',
      }}
    >
      {/* Header: referencia badge + status badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <span
          style={{
            padding: '2px 8px',
            borderRadius: 6,
            background: 'color-mix(in srgb, var(--muted) 12%, transparent)',
            border: '1px solid color-mix(in srgb, var(--muted) 30%, transparent)',
            color: 'var(--muted)',
            fontWeight: 700,
            fontSize: 10,
            letterSpacing: '.8px',
            textTransform: 'uppercase',
          }}
        >
          Referência
        </span>
        <span
          data-testid="coast-fire-status"
          style={{
            padding: '3px 12px',
            borderRadius: 20,
            background: `color-mix(in srgb, ${progressColor} 14%, transparent)`,
            border: `1px solid color-mix(in srgb, ${progressColor} 40%, transparent)`,
            color: progressColor,
            fontWeight: 700,
            fontSize: 'var(--text-xs)',
            letterSpacing: '.5px',
            textTransform: 'uppercase',
          }}
        >
          {coast.passou_base
            ? 'COAST ACHIEVED'
            : `ON TRACK — Coast in ${coast.ano_projetado_base}`}
        </span>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
          {coast.n_anos}a até FIRE · r_real base {(coast.r_real_base * 100).toFixed(2)}%
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
            Patrimônio atual vs Coast Number (base)
          </span>
          <span style={{ fontSize: 'var(--text-xs)', color: progressColor, fontWeight: 700 }}>
            {privacyMode ? '••%' : `${progressPct.toFixed(1)}%`}
          </span>
        </div>
        <div
          style={{
            height: 10,
            background: 'var(--border)',
            borderRadius: 5,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progressPct}%`,
              background: progressColor,
              borderRadius: 5,
              transition: 'width 0.4s',
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 4,
            fontSize: 'var(--text-xs)',
            color: 'var(--muted)',
          }}
        >
          <span>{fmtPrivacy(patrimonioAtual, privacyMode)}</span>
          <span>Meta: {fmtPrivacy(coast.coast_number_base, privacyMode)}</span>
        </div>
      </div>

      {/* 3-scenario table */}
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 'var(--text-sm)',
          }}
        >
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>
                Cenário
              </th>
              <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>
                r_real
              </th>
              <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>
                Coast Number
              </th>
              <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>
                Gap
              </th>
              <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>
                Ano
              </th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((s) => {
              const gapColor = s.gap <= 0 ? 'var(--green)' : 'var(--text)';
              return (
                <tr key={s.label} style={{ borderBottom: '1px solid var(--card2)' }}>
                  <td style={{ padding: '6px 8px', fontWeight: 600 }}>{s.label}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--muted)' }}>
                    {(s.r_real * 100).toFixed(2)}%
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'right' }}>
                    {fmtPrivacy(s.coast_number, privacyMode)}
                  </td>
                  <td
                    data-testid={s.label === 'Base' ? 'coast-fire-gap-base' : undefined}
                    style={{ padding: '6px 8px', textAlign: 'right', color: gapColor, fontWeight: 600 }}
                  >
                    {s.gap <= 0
                      ? privacyMode ? '✓ ••' : '✓ Atingido'
                      : fmtPrivacy(s.gap, privacyMode)}
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'right' }}>
                    {s.gap <= 0 ? '—' : s.ano}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footnote */}
      <div
        style={{
          marginTop: 10,
          fontSize: 'var(--text-xs)',
          color: 'var(--muted)',
          fontStyle: 'italic',
          borderTop: '1px solid var(--border)',
          paddingTop: 8,
          lineHeight: 1.5,
        }}
      >
        Coast FIRE uses portfolio real return ({(coast.r_real_base * 100).toFixed(2)}% base), not fixed SWR.
        FIRE Number alvo: {fmtPrivacy(coast.fire_number, privacyMode)}.{' '}
        Assume <strong>zero aportes após atingir o Coast Number</strong> — com aportes contínuos,
        o patrimônio necessário é menor.{' '}
        O cenário "Conservador" reduz o retorno anual em {((coast.r_real_base - coast.r_real_stress) * 100).toFixed(1)}pp —
        não captura sequências adversas de retorno nos primeiros anos.{' '}
        Não modela spending smile (Blanchett 2014) nem escalada de custos de saúde na velhice.
      </div>
    </div>
  );
}
