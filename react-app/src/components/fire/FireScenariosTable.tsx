'use client';

import { useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { useUiStore } from '@/store/uiStore';

export function FireScenariosTable() {
  const privacyMode = useUiStore(s => s.privacyMode);
  const data = useDashboardStore(s => s.data);

  const scenarios = useMemo(() => {
    if (!data?.scenario_comparison) return [];
    const sc = data.scenario_comparison;
    return [
      {
        name: 'Cenário Base',
        age: sc.base?.idade || 53,
        base: sc.base?.base || 0,
        fav: sc.base?.fav || 0,
        stress: sc.base?.stress || 0,
        pat_mediano: sc.base?.pat_mediano || 0,
        pat_p10: sc.base?.pat_p10 || 0,
        pat_p90: sc.base?.pat_p90 || 0,
        gasto: sc.base?.gasto_anual || 0,
        swr: sc.base?.swr || 0,
      },
      {
        name: 'Cenário Aspiracional',
        age: sc.aspiracional?.idade || 49,
        base: sc.aspiracional?.base || 0,
        fav: sc.aspiracional?.fav || 0,
        stress: sc.aspiracional?.stress || 0,
        pat_mediano: sc.aspiracional?.pat_mediano || 0,
        pat_p10: sc.aspiracional?.pat_p10 || 0,
        pat_p90: sc.aspiracional?.pat_p90 || 0,
        gasto: sc.aspiracional?.gasto_anual || 0,
        swr: sc.aspiracional?.swr || 0,
      },
    ];
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

  const fmtPct = (v: number) => privacyMode ? '••••' : `${v.toFixed(1)}%`;

  const getSuccessColor = (value: number) => {
    if (value >= 90) return 'var(--green)';
    if (value >= 75) return 'var(--accent)';
    if (value >= 60) return 'var(--orange)';
    return 'var(--red)';
  };

  if (scenarios.length === 0) {
    return (
      <div className="bg-card border border-border rounded-md p-5">
        <h3 className="text-sm font-semibold mb-4">Comparativo de Cenários FIRE</h3>
        <p className="text-xs" style={{ color: 'var(--muted)' }}>Dados de cenário indisponíveis</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-md p-5">
      <h3 className="text-sm font-semibold mb-4">Comparativo de Cenários FIRE</h3>

      {scenarios.map((scenario, idx) => (
        <div
          key={idx}
          style={{
            border: '1px solid var(--border)',
            borderRadius: 6,
            padding: '14px 16px',
            marginBottom: idx < scenarios.length - 1 ? 14 : 0,
            background: 'var(--bg)',
          }}
        >
          {/* Cabeçalho: nome + idade alvo */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
              paddingBottom: 10,
              borderBottom: '1px solid var(--border)',
            }}
          >
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>
              {scenario.name}
            </span>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '6px 10px',
                background: 'var(--card)',
                borderRadius: 4,
                border: '1px solid var(--border)',
              }}
            >
              <span style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 500, marginBottom: 1 }}>
                Idade alvo
              </span>
              <span style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--accent)' }}>
                {scenario.age}
              </span>
            </div>
          </div>

          {/* Probabilidade de Sucesso */}
          <div style={{ marginBottom: 10 }}>
            <div
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                color: 'var(--muted)',
                textTransform: 'uppercase',
                letterSpacing: '.4px',
                marginBottom: 6,
              }}
            >
              Probabilidade de Sucesso
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                { label: 'Mercado base', value: scenario.base },
                { label: 'Mercado favorável', value: scenario.fav },
                { label: 'Stress test', value: scenario.stress },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}
                >
                  <span style={{ color: 'var(--muted)' }}>{label}</span>
                  <span style={{ fontWeight: 600, color: getSuccessColor(value) }}>{fmtPct(value)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Divisor */}
          <div style={{ borderTop: '1px solid var(--border)', margin: '10px 0' }} />

          {/* Métricas financeiras */}
          {[
            { label: 'Gasto anual', value: fmtBrl(scenario.gasto), color: undefined },
            { label: 'Taxa de retirada (SWR)', value: fmtPct(scenario.swr), color: 'var(--accent)' },
            { label: 'Patrimônio mediano', value: fmtBrl(scenario.pat_mediano), color: undefined },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 'var(--text-sm)',
                marginBottom: 4,
              }}
            >
              <span style={{ color: 'var(--muted)' }}>{label}</span>
              <span style={{ fontWeight: 600, color: color ?? 'var(--text)' }}>{value}</span>
            </div>
          ))}

          {/* Range P10–P90 */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 'var(--text-sm)',
              marginTop: 2,
            }}
          >
            <span style={{ color: 'var(--muted)' }}>Range P10–P90</span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
              {fmtBrl(scenario.pat_p10)} — {fmtBrl(scenario.pat_p90)}
            </span>
          </div>
        </div>
      ))}

      <div style={{ marginTop: 10, fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
        10.000 simulações Monte Carlo. Guardrails aprovados 2026-04-07.
      </div>
    </div>
  );
}
