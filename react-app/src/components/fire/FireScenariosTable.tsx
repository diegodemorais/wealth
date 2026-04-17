'use client';

import { useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { useUiStore } from '@/store/uiStore';

export function FireScenariosTable() {
  const privacyMode = useUiStore(s => s.privacyMode);
  const data = useDashboardStore(s => s.data);

  const scenarios = useMemo(() => {
    if (!data?.scenario_comparison) return null;
    const sc = data.scenario_comparison;
    return {
      base: {
        name: 'Cenário Base',
        age: sc.base?.idade || 53,
        pfire: sc.base?.base || 0,
        pat_mediano: sc.base?.pat_mediano || 0,
        gasto: sc.base?.gasto_anual || 0,
        swr: sc.base?.swr || 0,
      },
      aspiracional: {
        name: 'Aspiracional',
        age: sc.aspiracional?.idade || 49,
        pfire: sc.aspiracional?.base || 0,
        pat_mediano: sc.aspiracional?.pat_mediano || 0,
        gasto: sc.aspiracional?.gasto_anual || 0,
        swr: sc.aspiracional?.swr || 0,
      },
    };
  }, [data?.scenario_comparison]);

  const fmtBrl = (v: number) => {
    if (privacyMode) return '••••';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(v);
  };

  const fmtPct = (v: number) => privacyMode ? '••' : `${v.toFixed(1)}%`;

  const pfireColor = (v: number) => {
    if (v >= 90) return 'var(--green)';
    if (v >= 75) return 'var(--accent)';
    if (v >= 60) return 'var(--orange)';
    return 'var(--red)';
  };

  if (!scenarios) {
    return (
      <div className="bg-card border border-border rounded-md p-5">
        <h3 className="text-sm font-semibold mb-2">Comparativo de Cenários FIRE</h3>
        <p className="text-xs" style={{ color: 'var(--muted)' }}>Dados de cenário indisponíveis</p>
      </div>
    );
  }

  const { base, aspiracional } = scenarios;

  const rows = [
    {
      label: 'P(FIRE) — mercado base',
      base: <span style={{ fontWeight: 700, color: pfireColor(base.pfire) }}>{fmtPct(base.pfire)}</span>,
      asp: <span style={{ fontWeight: 700, color: pfireColor(aspiracional.pfire) }}>{fmtPct(aspiracional.pfire)}</span>,
    },
    {
      label: 'Patrimônio mediano',
      base: <span style={{ fontWeight: 600 }}>{fmtBrl(base.pat_mediano)}</span>,
      asp: <span style={{ fontWeight: 600 }}>{fmtBrl(aspiracional.pat_mediano)}</span>,
    },
    {
      label: 'Gasto anual',
      base: <span>{fmtBrl(base.gasto)}</span>,
      asp: <span>{fmtBrl(aspiracional.gasto)}</span>,
    },
    {
      label: 'Taxa de retirada (SWR)',
      base: <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{fmtPct(base.swr)}</span>,
      asp: <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{fmtPct(aspiracional.swr)}</span>,
    },
  ];

  const thStyle: React.CSSProperties = {
    padding: '8px 12px',
    textAlign: 'center',
    fontSize: 'var(--text-xs)',
    fontWeight: 600,
    color: 'var(--muted)',
    textTransform: 'uppercase',
    letterSpacing: '.4px',
    borderBottom: '1px solid var(--border)',
  };

  const tdStyle: React.CSSProperties = {
    padding: '9px 12px',
    textAlign: 'center',
    fontSize: 'var(--text-sm)',
    borderBottom: '1px solid var(--border)',
  };

  return (
    <div className="bg-card border border-border rounded-md p-5">
      <h3 className="text-sm font-semibold mb-4">Comparativo de Cenários FIRE</h3>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg)' }}>
              <th style={{ ...thStyle, textAlign: 'left', width: '40%' }}></th>
              <th style={thStyle}>
                <div>{base.name}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)', marginTop: 2 }}>
                  {base.age} anos
                </div>
              </th>
              <th style={thStyle}>
                <div>{aspiracional.name}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)', marginTop: 2 }}>
                  {aspiracional.age} anos
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? 'var(--bg)' : 'var(--card2)' }}>
                <td style={{ ...tdStyle, textAlign: 'left', color: 'var(--muted)' }}>{row.label}</td>
                <td style={tdStyle}>{row.base}</td>
                <td style={tdStyle}>{row.asp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 10, fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
        10.000 simulações Monte Carlo · Guardrails aprovados 2026-04-07
      </div>
    </div>
  );
}
