'use client';

import { useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { useUiStore } from '@/store/uiStore';
import { fmtPrivacy } from '@/utils/privacyTransform';
import { pfireColor } from '@/utils/fire';
import { runCanonicalMC } from '@/utils/montecarlo';
import { canonicalizePFire } from '@/utils/pfire-canonical';

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

  // P(FIRE) com Câmbio Dinâmico (DEV-mc-regime-switching-fx)
  // r_anual = retorno_equity_base (USD puro, sem dep_BRL embutida)
  // fxRegime=true adiciona dep_BRL dinâmica via Markov switching
  const pfireCambioBase = useMemo(() => {
    if (!data?.premissas) return null;
    const prem = data.premissas as any;
    const carteira = (data as any).carteira_params;
    const P0 = prem.patrimonio_atual ?? 0;
    const metaFireVal = carteira?.patrimonio_gatilho ?? prem.meta_fire ?? 8_333_333;
    const idadeAtual = carteira?.idade_atual ?? prem.idade_atual ?? 39;
    const idadeFire = carteira?.idade_cenario_base ?? prem.idade_cenario_base ?? 53;
    const aporte = carteira?.aporte_cenario_base ?? prem.aporte_mensal ?? 25_000;
    const r_USD = carteira?.retorno_equity_base ?? 0.0485;
    const sigma = carteira?.volatilidade_equity ?? 0.168;
    const meses = (idadeFire - idadeAtual) * 12;
    if (P0 <= 0 || meses <= 0) return null;
    const result = runCanonicalMC({
      P0, r_anual: r_USD, sigma_anual: sigma,
      aporte_mensal: aporte, meses, N: 2_000, seed: 42,
      metaFire: metaFireVal, fxRegime: true,
    });
    return result.pFire;  // Return 0-1, canonicalize at display time
  }, [data?.premissas]);  // eslint-disable-line react-hooks/exhaustive-deps

  const fmtBrl = (v: number) => fmtPrivacy(v, privacyMode);

  const fmtPct = (v: number) => `${v.toFixed(1)}%`;

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
      // DEV-mc-regime-switching-fx: dep_BRL via Markov Switching (Hamilton 1989)
      // r_USD sem dep embutida + crises cambiais episódicas (17% freq, 35%/yr em crise)
      label: '↳ Câmbio Dinâmico ★',
      base: pfireCambioBase != null
        ? (() => {
            const canonical = canonicalizePFire(pfireCambioBase, 'mc');
            return <span style={{ fontWeight: 700, color: pfireColor(canonical.percentage) }}>{canonical.percentStr}</span>;
          })()
        : <span style={{ color: 'var(--muted)' }}>—</span>,
      asp: <span style={{ color: 'var(--muted)', fontSize: 'var(--text-xs)' }}>base apenas</span>,
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

      <div style={{ marginTop: 10, fontSize: 'var(--text-xs)', color: 'var(--muted)', lineHeight: 1.5 }}>
        <strong>Base e Aspiracional:</strong> 10.000 simulações Monte Carlo · Guardrails 2026-04-07<br />
        <strong>★ Câmbio Dinâmico:</strong> Estimativa rápida (N=2.000, SE ±1.6%) · Hamilton Markov Switching (1989) · 2 regimes
      </div>
    </div>
  );
}
